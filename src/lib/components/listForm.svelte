<script lang="ts">
  import { enhance } from "$app/forms";
  import type { GroceryListFormData } from "$lib/types/groceryList";
  import Button from "./button.svelte";
  import IconButton from "./iconButton.svelte";
  import Modal from "./modal.svelte";
  import addSvg from "$lib/assets/add.svg";
  import removeSvg from "$lib/assets/remove.svg";
  import substituteSvg from "$lib/assets/substitute.svg";
  import { goto } from "$app/navigation";
  import type { SubmitFunction } from "../../../.svelte-kit/types/src/routes/(app)/lists/upsert/$types";
  import { safeParseUpsertGroceryListItem } from "$lib/validators/groceryList";

  type ListFormProps = {
    initialList: GroceryListFormData;
  };

  const { initialList }: ListFormProps = $props();

  let groceryList = $state({
    id: initialList.id,
    title: initialList.title,
    budget: initialList.budget,
  });
  let mainItems = $state(
    initialList.items.filter((item) => !item.substituteForItemListKey),
  );
  let substituteItems = $state(
    initialList.items.filter((item) => item.substituteForItemListKey),
  );

  let newItemName = $state("");
  let groupUserIsTyping = $state("");
  let substituteItemListKey = $state("");
  let newSubstituteName = $state("");
  let formErrorMap = $state(new Map<string, string>());
  let subFormErrorMap = $state(new Map<string, string>());

  let selectedListGroups = $derived.by(() => {
    const uniqueGroupNames = new Set<string>();

    return mainItems
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
  let selectedSubstituteItems = $derived.by(() =>
    substituteItems.filter(
      (sub) => sub.substituteForItemListKey === substituteItemListKey,
    ),
  );

  let form: HTMLFormElement; // todo can use this to programmatically submit via form.requestSubmit() when debouncing
  // todo it is kinda annoying how hitting enter submits (even though that is technically how forms are supposed to work)
  // user might not expect that, think about how ot prevent this form-wide but also allow upsert button to work
  // easiest way to fix this is just trigger an api call when the upsert button is hit,
  // only downside there is that I'll have to rewrite the backend validation to take in json

  function onNewItemKeyDown(e: {
    preventDefault: () => void;
    key: string;
    currentTarget: HTMLInputElement;
  }) {
    if (e.key === "Enter") {
      e.preventDefault();

      addItem(e.currentTarget.value);
      e.currentTarget.value = "";
    }
  }

  function onNewItemClick() {
    addItem(newItemName.trim());
  }

  function onNewItemChange(e: { currentTarget: HTMLInputElement }) {
    newItemName = e.currentTarget.value;
  }

  function addItem(name: string) {
    const newItem = {
      listKey: crypto.randomUUID(),
      id: null,
      substituteForItemId: null,
      name,
      quantity: null,
      notes: null,
      link: null,
      groupName: null,
      substituteForItemListKey: null,
    };

    mainItems.unshift(newItem);
    newItemName = "";
  }

  function onTitleChange(e: { currentTarget: HTMLInputElement }) {
    groceryList.title = e.currentTarget.value;
    // todo debounce submission, maybe validation
  }

  function onBudgetChange(e: { currentTarget: HTMLInputElement }) {
    groceryList.budget = parseFloat(e.currentTarget.value);
    // todo debounce submission, maybe validation
  }

  function onRemoveItem(itemListKey: string) {
    mainItems = mainItems.filter(({ listKey }) => itemListKey !== listKey);
    substituteItems = substituteItems.filter(
      (sub) => sub.substituteForItemListKey !== itemListKey,
    );
    // todo debounce submission
  }

  function onItemNameChange(e: { currentTarget: HTMLInputElement }, i: number) {
    mainItems[i].name = e.currentTarget.value;
    // todo debounce submission
  }

  function onItemQuantityChange(
    e: { currentTarget: HTMLInputElement },
    i: number,
  ) {
    mainItems[i].quantity = +e.currentTarget.value;
    // todo debounce submission
  }

  function onItemNotesChange(
    e: { currentTarget: HTMLInputElement },
    i: number,
  ) {
    mainItems[i].notes = e.currentTarget.value;
    // todo debounce submission
  }

  function onItemLinkChange(e: { currentTarget: HTMLInputElement }, i: number) {
    mainItems[i].link = e.currentTarget.value;
    // todo debounce submission
  }

  function onItemGroupChange(
    e: { currentTarget: HTMLInputElement },
    i: number,
  ) {
    groupUserIsTyping = e.currentTarget.value;
    mainItems[i].groupName = e.currentTarget.value;
    // todo debounce submission
  }

  function onSubstituteNameChange(
    e: { currentTarget: HTMLInputElement },
    listKey: string,
  ) {
    const indexOfSub = substituteItems.findIndex(
      (sub) => sub.listKey === listKey,
    );
    if (indexOfSub !== -1) {
      substituteItems[indexOfSub].name = e.currentTarget.value;
    }
    // todo debounce submission
  }

  function onSubstituteQuantityChange(
    e: { currentTarget: HTMLInputElement },
    listKey: string,
  ) {
    const indexOfSub = substituteItems.findIndex(
      (sub) => sub.listKey === listKey,
    );
    if (indexOfSub !== -1) {
      substituteItems[indexOfSub].quantity = +e.currentTarget.value;
    }
    // todo debounce submission
  }

  function onSubstituteNotesChange(
    e: { currentTarget: HTMLInputElement },
    listKey: string,
  ) {
    const indexOfSub = substituteItems.findIndex(
      (sub) => sub.listKey === listKey,
    );
    if (indexOfSub !== -1) {
      substituteItems[indexOfSub].notes = e.currentTarget.value;
    }
    // todo debounce submission
  }

  function onSubstituteLinkChange(
    e: { currentTarget: HTMLInputElement },
    listKey: string,
  ) {
    const indexOfSub = substituteItems.findIndex(
      (sub) => sub.listKey === listKey,
    );
    if (indexOfSub !== -1) {
      substituteItems[indexOfSub].link = e.currentTarget.value;
    }
    // todo debounce submission
  }

  function onRemoveSubstitute(listKey: string) {
    substituteItems = substituteItems.filter((sub) => sub.listKey !== listKey);
    // todo debounce submission
  }

  function onNewSubstituteKeyDown(e: {
    preventDefault: () => void;
    key: string;
    currentTarget: HTMLInputElement;
  }) {
    if (e.key === "Enter") {
      e.preventDefault();

      const substituteForItemId =
        mainItems.find((item) => item.listKey === substituteItemListKey)?.id ??
        null;
      addSubstitute(
        e.currentTarget.value.trim(),
        substituteForItemId,
        substituteItemListKey,
      );
      e.currentTarget.value = "";
    }
  }

  function addSubstitute(
    name: string,
    substituteForItemId: number | null,
    substituteForItemListKey: string,
  ) {
    const newSubstitute = {
      listKey: crypto.randomUUID(),
      id: null,
      substituteForItemId,
      name,
      quantity: null,
      notes: null,
      link: null,
      groupName: null,
      substituteForItemListKey,
    };

    substituteItems.unshift(newSubstitute);
    newSubstituteName = "";
  }

  function onNewSubstituteClick() {
    const substituteForItemId =
      mainItems.find((item) => item.listKey === substituteItemListKey)?.id ??
      null;
    addSubstitute(
      newSubstituteName.trim(),
      substituteForItemId,
      substituteItemListKey,
    );
  }

  function onNewSubstituteChange(e: { currentTarget: HTMLInputElement }) {
    newSubstituteName = e.currentTarget.value;
  }

  function onToggleSubstituteModal(itemListKey: string) {
    substituteItemListKey = itemListKey;
  }

  const submitFunction: SubmitFunction = ({ formData }) => {
    if (substituteItems.length) {
      let index = mainItems.length;

      substituteItems.forEach((sub) => {
        const itemSubbedFor = mainItems.find(
          (item) => item.listKey === sub.substituteForItemListKey,
        );

        formData.set(`itemId${sub.listKey}`, sub.id?.toString() ?? "");
        formData.set(
          `itemSubstituteForItemId${sub.listKey}`,
          itemSubbedFor?.id?.toString() ?? "",
        );
        formData.set(
          `itemSubstituteForItemListKey${sub.listKey}`,
          sub.substituteForItemListKey ?? "",
        );
        formData.set(`itemListKey${index}`, sub.listKey);
        formData.set(`itemName${sub.listKey}`, sub.name);
        formData.set(
          `itemQuantity${sub.listKey}`,
          sub.quantity?.toString() ?? "",
        );
        formData.set(`itemNotes${sub.listKey}`, sub.notes ?? "");
        formData.set(`itemLink${sub.listKey}`, sub.link ?? "");
        formData.set(
          `itemGroupName${sub.listKey}`,
          itemSubbedFor?.groupName ?? "",
        );
        index++;
      });

      formData.set("count", `${mainItems.length + substituteItems.length}`);
    }

    return async ({ result }) => {
      switch (result.type) {
        case "success":
          formErrorMap = new Map<string, string>();
          void goto("/lists");
          break;
        case "failure":
          if (result.data && result.data.errorMap.size > 0) {
            // todo if there is an error for hidden inputs handle that as a form error
            // todo technically this is not handling server validation errors for substitutes, which might be okay since we validate substitutes client side when the modal is attempted to be closed
            formErrorMap = result.data.errorMap;
          } else {
            formErrorMap = new Map<string, string>().set(
              "form",
              "An unexpected error occurred",
            );
          }

          break;
        case "error":
          formErrorMap = new Map<string, string>().set(
            "form",
            "An unexpected error occurred",
          );

          break;
      }
    };
  };

  function onCloseSubstituteModal() {
    let newErrorMap = new Map<string, string>();
    selectedSubstituteItems.forEach((item) => {
      const listItemRes = safeParseUpsertGroceryListItem({
        ...item,
        errorMapSuffix: item.listKey,
      });
      if (listItemRes.errorMap.size > 0) {
        newErrorMap = new Map([...newErrorMap, ...listItemRes.errorMap]);
      }
    });

    subFormErrorMap = newErrorMap;
    if (newErrorMap.size === 0) {
      substituteItemListKey = "";
    }
  }
</script>

<form
  bind:this={form}
  method="POST"
  action="/lists/upsert"
  use:enhance={submitFunction}
>
  <input type="hidden" name="id" value={groceryList.id} />

  <div class="title-section">
    {#if !!formErrorMap.get("form")?.length}
      <div class="title-section-error">{formErrorMap.get("form")}</div>
    {/if}

    {#if !!formErrorMap.get("title")?.length}
      <div class="title-section-error">Title {formErrorMap.get("title")}</div>
    {/if}
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
        minlength={1}
        maxlength={256}
      />
    </div>

    {#if !!formErrorMap.get("budget")?.length}
      <div class="title-section-error">Budget {formErrorMap.get("budget")}</div>
    {/if}
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

  <div class="items-header">
    <div class="save-section">
      <p class="items-p">Items</p>
      <Button buttonClass="save" type="submit" color="primary">Save</Button>
    </div>

    <div class="new-item-section">
      <input
        class="list-item-input"
        onkeydown={onNewItemKeyDown}
        onchange={onNewItemChange}
        name="new-item"
        type="text"
        placeholder="add new item"
        value={newItemName}
        minlength={1}
        maxlength={256}
      />
      <IconButton
        onclick={onNewItemClick}
        type="button"
        alt="add item"
        src={addSvg}
      />
    </div>
  </div>

  <div class="items-list">
    <input type="hidden" name="count" value={mainItems.length} />

    <ul class="items-ul">
      {#if !mainItems.length}
        No items in list
      {/if}

      {#each mainItems as item, i (item.listKey)}
        <li class="list-item">
          <input
            type="hidden"
            name={`itemId${item.listKey}`}
            value={mainItems[i].id}
          />
          <input
            type="hidden"
            name={`itemSubstituteForItemId${item.listKey}`}
            value={null}
          />
          <input
            type="hidden"
            name={`itemSubstituteForItemListKey${item.listKey}`}
            value={null}
          />
          <input type="hidden" name={`itemListKey${i}`} value={item.listKey} />

          {#if !!formErrorMap.get(`itemName${item.listKey}`)?.length}
            <div class="error">
              Name {formErrorMap.get(`itemName${item.listKey}`)}
            </div>
          {/if}
          <div class="list-item-attribute">
            <label for={`itemName${item.listKey}`}> Name </label>
            <input
              id={`itemName${item.listKey}`}
              class="list-item-input"
              value={mainItems[i].name}
              name={`itemName${item.listKey}`}
              type="text"
              oninput={(e) => onItemNameChange(e, i)}
              placeholder="name"
              required
              minlength={1}
              maxlength={256}
            />
          </div>

          {#if !!formErrorMap.get(`itemQuantity${item.listKey}`)?.length}
            <div class="error">
              Quantity {formErrorMap.get(`itemQuantity${item.listKey}`)}
            </div>
          {/if}
          <div class="list-item-attribute">
            <label for={`itemQuantity${item.listKey}`}> Quantity </label>
            <input
              id={`itemQuantity${item.listKey}`}
              class="list-item-input"
              value={mainItems[i].quantity}
              name={`itemQuantity${item.listKey}`}
              type="number"
              min={1}
              oninput={(e) => onItemQuantityChange(e, i)}
              placeholder="1"
            />
          </div>

          {#if !!formErrorMap.get(`itemNotes${item.listKey}`)?.length}
            <div class="error">
              Notes {formErrorMap.get(`itemNotes${item.listKey}`)}
            </div>
          {/if}
          <div class="list-item-attribute">
            <label for={`itemNotes${item.listKey}`}> Notes </label>
            <input
              id={`itemNotes${item.listKey}`}
              class="list-item-input"
              value={mainItems[i].notes}
              name={`itemNotes${item.listKey}`}
              type="text"
              oninput={(e) => onItemNotesChange(e, i)}
              placeholder="notes"
              minlength={1}
              maxlength={256}
            />
          </div>

          {#if !!formErrorMap.get(`itemLink${item.listKey}`)?.length}
            <div class="error">
              Link {formErrorMap.get(`itemLink${item.listKey}`)}
            </div>
          {/if}
          <div class="list-item-attribute">
            <label for={`itemLink${item.listKey}`}> Link </label>
            <input
              id={`itemLink${item.listKey}`}
              class="list-item-input"
              value={mainItems[i].link}
              name={`itemLink${item.listKey}`}
              type="text"
              oninput={(e) => onItemLinkChange(e, i)}
              placeholder="https://google.com"
              minlength={1}
              maxlength={256}
            />
          </div>

          {#if !!formErrorMap.get(`itemGroupName${item.listKey}`)?.length}
            <div class="error">
              Group {formErrorMap.get(`itemGroupName${item.listKey}`)}
            </div>
          {/if}
          <div class="list-item-attribute">
            <label for={`itemGroupInput${item.listKey}`}> Group </label>
            <input
              id={`itemGroupInput${item.listKey}`}
              class="list-item-input"
              list={`itemGroupList${item.listKey}`}
              name={`itemGroupName${item.listKey}`}
              value={item.groupName}
              placeholder="group"
              oninput={(e) => onItemGroupChange(e, i)}
              onblur={() => {
                groupUserIsTyping = "";
              }}
              minlength={1}
              maxlength={256}
            />

            <datalist id={`itemGroupList${item.listKey}`}>
              {#each selectedListGroups as group (group)}
                <option value={group}> </option>
              {/each}
            </datalist>
          </div>

          <div class="bottom-row">
            <IconButton
              onclick={() => onToggleSubstituteModal(item.listKey)}
              src={substituteSvg}
              type="button"
              alt="substitute item"
            />

            <IconButton
              onclick={() => onRemoveItem(item.listKey)}
              type="button"
              alt="remove item"
              src={removeSvg}
            />
          </div>
        </li>
      {/each}
    </ul>
  </div>
</form>

<Modal open={!!substituteItemListKey}>
  <div class="substitute-modal">
    <h2>
      {mainItems.find((item) => item.listKey === substituteItemListKey)?.name} substitutes
    </h2>

    <div class="new-item-section">
      <input
        class="list-item-input"
        onkeydown={onNewSubstituteKeyDown}
        onchange={onNewSubstituteChange}
        name="new-sub"
        type="text"
        placeholder="add new substitute"
        value={newSubstituteName}
        minlength={1}
        maxlength={256}
      />
      <IconButton
        onclick={onNewSubstituteClick}
        type="button"
        alt="add substitute"
        src={addSvg}
      />
    </div>

    <ul class="substitute-list">
      {#if !selectedSubstituteItems.length}
        No substitutes
      {/if}

      {#each selectedSubstituteItems as sub, i (sub.listKey)}
        <li class="list-item">
          {#if !!subFormErrorMap.get(`Name${sub.listKey}`)?.length}
            <div class="error">
              Name {subFormErrorMap.get(`Name${sub.listKey}`)}
            </div>
          {/if}
          <div class="list-item-attribute">
            <label for={`subName${i}`}> Name </label>
            <input
              id={`subName${i}`}
              class="list-item-input"
              value={sub.name}
              required
              name={`subName${i}`}
              type="text"
              oninput={(e) => onSubstituteNameChange(e, sub.listKey)}
              placeholder="name"
              minlength={1}
              maxlength={256}
            />
          </div>

          {#if !!subFormErrorMap.get(`Quantity${sub.listKey}`)?.length}
            <div class="error">
              Quantity {subFormErrorMap.get(`Quantity${sub.listKey}`)}
            </div>
          {/if}
          <div class="list-item-attribute">
            <label for={`subQuantity${i}`}> Quantity </label>
            <input
              id={`subQuantity${i}`}
              class="list-item-input"
              value={sub.quantity}
              name={`subQuantity${i}`}
              type="number"
              min={1}
              oninput={(e) => onSubstituteQuantityChange(e, sub.listKey)}
              placeholder="1"
            />
          </div>

          {#if !!subFormErrorMap.get(`Notes${sub.listKey}`)?.length}
            <div class="error">
              Notes {subFormErrorMap.get(`Notes${sub.listKey}`)}
            </div>
          {/if}
          <div class="list-item-attribute">
            <label for={`subNotes${i}`}> Notes </label>
            <input
              id={`subNotes${i}`}
              class="list-item-input"
              value={sub.notes}
              name={`subNotes${i}`}
              type="text"
              oninput={(e) => onSubstituteNotesChange(e, sub.listKey)}
              placeholder="notes"
              minlength={1}
              maxlength={256}
            />
          </div>

          {#if !!subFormErrorMap.get(`Link${sub.listKey}`)?.length}
            <div class="error">
              Link {subFormErrorMap.get(`Link${sub.listKey}`)}
            </div>
          {/if}
          <div class="list-item-attribute">
            <label for={`subLink${i}`}> Link </label>
            <input
              id={`subLink${i}`}
              class="list-item-input"
              value={sub.link}
              name={`subLink${i}`}
              type="text"
              oninput={(e) => onSubstituteLinkChange(e, sub.listKey)}
              placeholder="https://google.com"
              minlength={1}
              maxlength={256}
            />
          </div>

          <div class="sub-bottom-row">
            <IconButton
              onclick={() => onRemoveSubstitute(sub.listKey)}
              type="button"
              alt="remove substitute"
              src={removeSvg}
            />
          </div>
        </li>
      {/each}
    </ul>

    <Button
      onclick={onCloseSubstituteModal}
      buttonClass="close-substitute"
      color="secondary">Close</Button
    >
  </div>
</Modal>

<style>
  .title-section {
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

  .items-list {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .items-header {
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

  .items-p {
    font-size: 20px;
  }

  .save-section {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    font-size: 18px;
  }

  .new-item-section {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .substitute-list,
  .items-ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: [first] auto;
    gap: 16px;
  }

  @media only screen and (min-width: 640px) {
    .items-ul {
      grid-template-columns: [first] auto [second] auto;
    }
  }

  @media only screen and (min-width: 1024px) {
    .items-ul {
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

  .bottom-row {
    display: flex;
    width: 100%;
    justify-content: space-between;
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

  :global {
    .substitute-modal {
      padding: 16px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 16px;
    }
  }

  .sub-bottom-row {
    display: flex;
    width: 100%;
    justify-content: end;
  }

  :global {
    .close-substitute {
      align-self: end;
    }
  }

  .error {
    color: red;
    font-size: 14px;
  }

  .title-section-error {
    color: red;
    font-size: 16px;
    align-self: center;
  }
</style>
