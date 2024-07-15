<script lang="ts">
  import ListForm from "$lib/components/listForm.svelte";
  import type {
    GroceryListFormData,
    GroceryListFormItem,
  } from "$lib/types/groceryList";

  const { data } = $props();

  let items: GroceryListFormItem[] = data.groceryList.items.map((i) => ({
    ...i,
    listKey: crypto.randomUUID(),
    groupName: i.group?.name ?? null,
    substituteForItemListKey: null,
  }));

  items = items.map((i) => ({
    ...i,
    substituteForItemListKey: i.substituteForItemId
      ? items.find((i2) => i2.id === i.substituteForItemId)?.listKey ?? null
      : null,
  }));

  const initialList: GroceryListFormData = {
    id: data.groceryList.id,
    title: data.groceryList.title,
    budget: data.groceryList.budget,
    items,
  };
</script>

<h2>Edit List</h2>

<ListForm {initialList} />
