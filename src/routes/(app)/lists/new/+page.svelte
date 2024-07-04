<script lang="ts">
    import ListForm from "\$lib/components/listForm.svelte";
    import type {GroceryListFormData} from "$lib/types/groceryList";

    const groceryList: GroceryListFormData = {
        id: null,
        title: "Test",
        items: [
            {
                listKey: crypto.randomUUID(),
                id: null,
                name: "",
                quantity: null,
                notes: null,
                link: null,
            }
        ],
    }

</script>

<h2>Create List</h2>

<ListForm {groceryList} />

<style>
</style>