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
  let activeList: GroceryListFormData = $state(groceryList);
  let form: HTMLFormElement; // todo can use this to programmatically submit via form.requestSubmit() when debouncing

  function onAddItem() {
    activeList.items.push({
      listKey: crypto.randomUUID(),
      id: null,
      name: "",
      quantity: null,
      notes: null,
      link: null,
    });
  }

  function onRemoveItem(itemListKey: string) {
    activeList.items = activeList.items.filter(
      ({ listKey }) => itemListKey !== listKey,
    );
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
</script>

<form
  bind:this={form}
  method="POST"
  action="/lists/save"
  use:enhance={() => {
    return async ({ result }) => {
      if (result.status === 400) {
        // console.error(result);
        // todo display validation errors
      } else if (result.status === 204) {
        void goto("/lists");
      } else {
        // console.error(result);
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
        class="title-section-input"
        required
        name="title"
        type="text"
        value={groceryList.title}
        placeholder="Title"
      />
    </div>

    <div class="title-section-item">
      <label for="budget"> Budget </label>
      <input
        class="title-section-input"
        name="budget"
        type="number"
        step="0.01"
        placeholder="0.00"
        value={groceryList.budget}
        min="0.00"
      />
    </div>
  </div>

  <div id="items-list">
    <div id="items-header">
      <p>Items</p>
      <IconButton
        onclick={onAddItem}
        type="button"
        alt="add item"
        src={addSvg}
      />
    </div>
    <input type="hidden" name="count" value={activeList.items.length} />

    <ul>
      {#if !activeList.items.length}
        No items in list
      {/if}

      {#each activeList.items as { listKey }, i (listKey)}
        <li class="list-item">
          <input
            type="hidden"
            name={`itemId${i}`}
            value={activeList.items[i].id}
          />

          <div class="list-item-attribute">
            <label for={`name${i}`}> Name </label>
            <input
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
              class="list-item-input"
              value={activeList.items[i].link}
              name={`link${i}`}
              type="text"
              oninput={(e) => onLinkChange(e, i)}
              placeholder="https://google.com"
            />
          </div>

          <IconButton
            onclick={() => onRemoveItem(listKey)}
            type="button"
            buttonClass="remove-btn"
            alt="remove item"
            src={removeSvg}
          />
        </li>
      {/each}
    </ul>
  </div>

  <Button type="submit" color="primary">Save</Button>
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
    align-items: center;
    gap: 16px;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
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
    margin: 16px 0;
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
