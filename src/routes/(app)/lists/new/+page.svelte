<script lang="ts">
    import ListForm from "\$lib/components/listForm.svelte";
    import type {GroceryList} from "$lib/types/groceryList";

    // todo this probably doesn't need to be its own page and can instead embed the form in the normal lists page, TBD

    const groceryList: GroceryList = {
        id: -1,
        title: "Test",
        items: [
            {
                id: -1,
                groceryListId: -1,
                name: "",
                quantity: null,
                notes: null,
                link: null,
                createdByUserId: "",
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        ],
        createdByUserId: "",
        createdAt: new Date(),
        updatedAt: new Date(),
    }

</script>

<ListForm {groceryList} />

<style>
</style>