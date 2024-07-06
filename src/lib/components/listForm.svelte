<script lang="ts">
  import { enhance } from "$app/forms";
  import type { GroceryListFormData } from "$lib/types/groceryList";
  import Button from "./button.svelte";
  import IconButton from "./iconButton.svelte";
  import addSvg from "$lib/assets/add.svg";
  import removeSvg from "$lib/assets/remove.svg";
  import { goto } from "$app/navigation";

  type ListFormProps = {
    groceryList: GroceryListFormData;
  };

  const { groceryList }: ListFormProps = $props();
  let activeList: GroceryListFormData = $state({ ...groceryList });
  let newItemName = $state("");
  let groupUserIsTyping = $state("");
  let activeGroups = $derived.by(() => {
    const uniqueGroupNames = new Set<string>();
    return activeList.items
      .filter(({ groupName }) => {
        if (
          !groupName ||
          uniqueGroupNames.has(groupName) ||
          groupUserIsTyping === groupName
        ) {
          return false;
        }

        uniqueGroupNames.add(groupName);

        return true;
      })
      .map(({ groupName }) => groupName!);
  });
  let form: HTMLFormElement; // todo can use this to programmatically submit via form.requestSubmit() when debouncing
  // todo it is kinda annoying how hitting enter submits (even though that is technically how forms are supposed to work)
  // user might not expect that, think about how ot prevent this form-wide but also allow save button to work
  // easiest way to fix this is just trigger an api call when the save button is hit,
  // only downside there is that I'll have to rewrite the backend validation to take in json

  function onNewItemKeyDown(e: {
    preventDefault: () => void;
    key: string;
    currentTarget: HTMLInputElement;
  }) {
    if (e.key === "Enter") {
      e.preventDefault();

      if (e.currentTarget.value.trim().length) {
        addItem(e.currentTarget.value);
        e.currentTarget.value = "";
      }
    }
  }

  function onNewItemClick() {
    if (newItemName.trim().length) {
      addItem(newItemName.trim());
    }
  }

  function onNewItemChange(e: { currentTarget: HTMLInputElement }) {
    newItemName = e.currentTarget.value;
  }

  function addItem(name: string) {
    const newItem = {
      listKey: crypto.randomUUID(),
      id: null,
      name,
      quantity: null,
      notes: null,
      link: null,
      groupName: null,
    };

    activeList.items.unshift(newItem);
    newItemName = "";
  }

  function onTitleChange(e: { currentTarget: HTMLInputElement }) {
    activeList.title = e.currentTarget.value;
    // todo debounce submission, maybe validation
  }

  function onBudgetChange(e: { currentTarget: HTMLInputElement }) {
    activeList.budget = parseFloat(e.currentTarget.value);
    // todo debounce submission, maybe validation
  }

  function onRemoveItem(itemListKey: string) {
    activeList.items = activeList.items.filter(
      ({ listKey }) => itemListKey !== listKey,
    );
    // todo debounce submission, maybe validation
  }

  function onNameChange(e: { currentTarget: HTMLInputElement }, i: number) {
    activeList.items[i].name = e.currentTarget.value;
    // todo debounce submission, maybe validation
  }

  function onQuantityChange(e: { currentTarget: HTMLInputElement }, i: number) {
    activeList.items[i].quantity = +e.currentTarget.value;
    // todo debounce submission, maybe validation
  }

  function onNotesChange(e: { currentTarget: HTMLInputElement }, i: number) {
    activeList.items[i].notes = e.currentTarget.value;
    // todo debounce submission, maybe validation
  }

  function onLinkChange(e: { currentTarget: HTMLInputElement }, i: number) {
    activeList.items[i].link = e.currentTarget.value;
    // todo debounce submission, maybe validation
  }

  function onGroupChange(e: { currentTarget: HTMLInputElement }, i: number) {
    groupUserIsTyping = e.currentTarget.value;
    activeList.items[i].groupName = e.currentTarget.value;
    // todo debounce submission, maybe validation
  }
</script>

<form
  bind:this={form}
  method="POST"
  action="/lists/save"
  use:enhance={() => {
    return async ({ result }) => {
      if (result.status === 400) {
        console.error(result);
        // todo display validation errors
      } else if (result.status === 204) {
        void goto("/lists");
      } else {
        console.error(result);
        // todo display error
      }
    };
  }}
>
  <input type="hidden" name="id" value={groceryList.id} />

  <div id="title-section">
    <div class="title-section-item">
      <label for="title"> Title </label>
      <input
        id="title"
        class="title-section-input"
        required
        name="title"
        type="text"
        value={groceryList.title}
        placeholder="Title"
        onchange={onTitleChange}
      />
    </div>

    <div class="title-section-item">
      <label for="budget"> Budget </label>
      <input
        id="budget"
        class="title-section-input"
        name="budget"
        type="number"
        step="0.01"
        placeholder="0.00"
        value={groceryList.budget}
        min="0.00"
        onchange={onBudgetChange}
      />
    </div>
  </div>

  <div id="items-header">
    <div id="save-section">
      <p id="items-p">Items</p>
      <Button buttonClass="save" type="submit" color="primary">Save</Button>
    </div>

    <div id="new-item-section">
      <input
        class="list-item-input"
        onkeydown={onNewItemKeyDown}
        onchange={onNewItemChange}
        name="new-item"
        type="text"
        placeholder="add new item"
        value={newItemName}
      />
      <IconButton
        onclick={onNewItemClick}
        type="button"
        alt="add item"
        src={addSvg}
      />
    </div>
  </div>

  <div id="items-list">
    <input type="hidden" name="count" value={activeList.items.length} />

    <ul>
      {#if !activeList.items.length}
        No items in list
      {/if}

      {#each activeList.items as item, i (item.listKey)}
        <li class="list-item">
          <input
            type="hidden"
            name={`itemId${i}`}
            value={activeList.items[i].id}
          />

          <div class="list-item-attribute">
            <label for={`name${i}`}> Name </label>
            <input
              id={`name${i}`}
              class="list-item-input"
              value={activeList.items[i].name}
              required
              name={`name${i}`}
              type="text"
              oninput={(e) => onNameChange(e, i)}
              placeholder="name"
            />
          </div>

          <div class="list-item-attribute">
            <label for={`quantity${i}`}> Quantity </label>
            <input
              id={`quantity${i}`}
              class="list-item-input"
              value={activeList.items[i].quantity}
              name={`quantity${i}`}
              type="number"
              min={1}
              oninput={(e) => onQuantityChange(e, i)}
              placeholder="1"
            />
          </div>

          <div class="list-item-attribute">
            <label for={`notes${i}`}> Notes </label>
            <input
              id={`notes${i}`}
              class="list-item-input"
              value={activeList.items[i].notes}
              name={`notes${i}`}
              type="text"
              oninput={(e) => onNotesChange(e, i)}
              placeholder="notes"
            />
          </div>

          <div class="list-item-attribute">
            <label for={`link${i}`}> Link </label>
            <input
              id={`link${i}`}
              class="list-item-input"
              value={activeList.items[i].link}
              name={`link${i}`}
              type="text"
              oninput={(e) => onLinkChange(e, i)}
              placeholder="https://google.com"
            />
          </div>

          <div class="list-item-attribute">
            <label for={`groupInput${i}`}> Group </label>
            <input
              id={`groupInput${i}`}
              class="list-item-input"
              list={`groupList${i}`}
              name={`groupName${i}`}
              value={item.groupName}
              placeholder="group"
              oninput={(e) => onGroupChange(e, i)}
            />

            <datalist id={`groupList${i}`}>
              {#each activeGroups as group (group)}
                <option value={group}> </option>
              {/each}
            </datalist>
          </div>

          <div class="remove-btn">
            <IconButton
              onclick={() => onRemoveItem(item.listKey)}
              type="button"
              alt="remove item"
              src={removeSvg}
              buttonClass="remove-btn"
            />
          </div>
        </li>
      {/each}
    </ul>
  </div>
</form>

<style>
  #title-section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: baseline;
    gap: 8px;
  }

  .title-section-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
    gap: 8px;
  }

  .title-section-input {
    padding: 8px;
    font-size: 16px;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    justify-content: center;
    align-items: center;
  }

  #items-list {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  #items-header {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  :global {
    .save {
      padding: 8px !important;
      height: min-content !important;
    }

    .save:hover,
    .save:focus {
      padding: 7px !important;
    }
  }

  #items-p {
    font-size: 20px;
  }

  #save-section {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    font-size: 18px;
  }

  #new-item-section {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* todo use different number of columns based on screen  */
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: [first] auto;
    gap: 16px;
  }

  @media only screen and (min-width: 640px) {
    ul {
      grid-template-columns: [first] auto [second] auto;
    }
  }

  @media only screen and (min-width: 1024px) {
    ul {
      grid-template-columns: [first] auto [second] auto [third] auto;
    }
  }

  .list-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: baseline;
    gap: 16px;
    border: 1px solid black;
    border-radius: 8px;
    padding: 16px;
  }

  :global {
    .remove-btn {
      width: min-content !important;
      align-self: end !important;
    }
  }

  .list-item-attribute {
    display: flex;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
    gap: 8px;
  }

  .list-item-input {
    padding: 4px;
    font-size: 14px;
  }
</style>
