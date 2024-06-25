<script lang="ts">
    import { enhance } from '$app/forms';

    // todo will eventually be a data type defined somewhere else, then imported here
     type ListItem = {
        name: string
        quantity: number | null
        notes: string | null
        link: string | null
    }

    const EMPTY_LIST_ITEM = {
        name: "",
        quantity: null,
        notes: null,
        link: null
    }

    // todo will eventually be a data type defined somewhere else, then imported here
     type List = {
        title: string
        items: ListItem[]
    }

    type ListFormProps = {
        initialList: List
    }

    // populate an initial list based on loaded data, but then leave the state of the form to be handled by the form thereafter
    const {initialList}: ListFormProps = $props()
    let activeList: List = $state(initialList)
    let form: HTMLFormElement // todo can use this to programmatically submit via form.requestSubmit() when debouncing

    function onAddItem() {
        activeList.items.push(EMPTY_LIST_ITEM)
    }

    function onRemoveItem() {
        activeList.items.pop()
    }

    function onNameChange(e: {currentTarget: HTMLInputElement}, i: number) {
        activeList.items[i].name = e.currentTarget.value
        // todo debounce submission, maybe validation
    }

    function onQuantityChange(e: {currentTarget: HTMLInputElement}, i: number) {
        activeList.items[i].quantity = +e.currentTarget.value
        // todo debounce submission, maybe validation
    }

    function onNotesChange(e: {currentTarget: HTMLInputElement}, i: number) {
        activeList.items[i].notes = e.currentTarget.value
        // todo debounce submission, maybe validation
    }

    function onLinkChange(e: {currentTarget: HTMLInputElement}, i: number) {
        activeList.items[i].link = e.currentTarget.value
        // todo debounce submission, maybe validation
    }
</script>

<form bind:this={form} method="POST" action="/lists/new" use:enhance={() => {
    return async ({result}) => {
        // todo take result from validation and display errors if needed
        console.log(result)
    }
}}>
    <div id="title-section">
        <label for="title">
            Title
        </label>
        <input required name="title" type="text" value={initialList.title} placeholder="Title"/>

        <button type="button" onclick={onAddItem}>Add Item</button>
    </div>


    <div id="items-list">
        <h3>Items</h3>

        <input type="hidden" name="count" value={activeList.items.length}/>

        <ul>
            {#each activeList.items as _, i}
                <li class="form-line">
                    <label for={`name${i}`}>
                        Name
                    </label>
                    <input
                            value={activeList.items[i].name}
                            required
                            name={`name${i}`}
                            type="text"
                            oninput={(e) => onNameChange(e, i)}
                    />

                    <label for={`quantity${i}`}>
                        Quantity
                    </label>
                    <input
                            value={activeList.items[i].quantity}
                            name={`quantity${i}`}
                            type="number"
                            min={1}
                            oninput={(e) => onQuantityChange(e, i)}
                    />

                    <label for={`notes${i}`}>
                        Notes
                    </label>
                    <input
                            value={activeList.items[i].notes}
                            name={`notes${i}`}
                            type="text"
                            oninput={(e) => onNotesChange(e, i)}
                    />

                    <label for={`link${i}`}>
                        Link
                    </label>
                    <input
                            value={activeList.items[i].link}
                            name={`link${i}`}
                            type="text"
                            oninput={(e) => onLinkChange(e, i)}
                    />

                    <button onclick={onRemoveItem}>Remove</button>
                </li>
            {/each}
        </ul>
    </div>

    <input type="submit"/>
</form>

<style>
    /** todo add styles to make this actually look good */
    #title-section {
        display: flex;
    }

    form {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    #items-list {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    ul {
        list-style: none;
        padding: 0;
    }
</style>