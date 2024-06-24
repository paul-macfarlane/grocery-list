<script lang="ts">
    import ListForm from "\$lib/components/listForm.svelte";

    // todo this probably doesn't need to be its own page and can instead embed the form in the normal lists page, TBD

    const initialList = {
        title: "Test",
        items: [
            {
                name: "",
                quantity: null,
                notes: null,
                link: null,
            }
        ]
    }

</script>

<ListForm {initialList} />

<style>
</style>