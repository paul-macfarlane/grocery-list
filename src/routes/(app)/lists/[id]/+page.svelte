<script lang="ts">
  import ListForm from "$lib/components/listForm.svelte";
  import type { GroceryListFormData } from "$lib/types/groceryList";

  const { data } = $props();

  const groceryList: GroceryListFormData = {
    id: data.groceryList.id,
    title: data.groceryList.title,
    budget: data.groceryList.budget,
    items: data.groceryList.items.map((i) => ({
      ...i,
      listKey: crypto.randomUUID(),
      groupName: i.group?.name ?? null,
    })),
  };
</script>

<h2>Edit List</h2>

<ListForm {groceryList} />
