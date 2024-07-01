<script lang="ts">
    import { enhance } from '$app/forms';
    import type {GroceryList, GroceryListItem} from "$lib/types/groceryList";
    import Button from './button.svelte';
    import addSvg from '$lib/assets/add.svg'
    import removeSvg from '$lib/assets/remove.svg'

    const EMPTY_LIST_ITEM : GroceryListItem = {
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

    type ListFormProps = {
        groceryList: GroceryList
    }

    const {groceryList}: ListFormProps = $props()
    let activeList: GroceryList = $state(groceryList)
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
        <input required name="title" type="text" value={groceryList.title} placeholder="Title"/>

        <button onclick={onAddItem} type="button" class="icon-btn"><img class="icon-btn-img" alt="add item" src={addSvg}></button>
    </div>


    <div id="items-list">
        <h3>Items</h3>

        <input type="hidden" name="count" value={activeList.items.length}/>

        <ul>
            {#if (!activeList.items.length)}
                No items in list
            {/if}

            {#each activeList.items as _, i}
                <li class="list-item">
                    <div class="list-item-attribute">
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
                    </div>

                    <div class="list-item-attribute">
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
                    </div>

                    <div class="list-item-attribute">
                        <label for={`notes${i}`}>
                            Notes
                        </label>
                        <input
                                value={activeList.items[i].notes}
                                name={`notes${i}`}
                                type="text"
                                oninput={(e) => onNotesChange(e, i)}
                        />
                    </div>

                    <div class="list-item-attribute">
                        <label for={`link${i}`}>
                            Link
                        </label>
                        <input
                                value={activeList.items[i].link}
                                name={`link${i}`}
                                type="text"
                                oninput={(e) => onLinkChange(e, i)}
                        />
                    </div>

                    <button onclick={onRemoveItem} type="button" class="icon-btn remove-btn"><img class="icon-btn-img" alt="add item" src={removeSvg}></button>
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
        align-items: center;
        gap: 8px
    }

    .icon-btn {
        background: none;
        border: none;
        cursor: pointer;
        outline: none;
    }

    /* todo making icon buttons an component might be worth it at some point */
    .icon-btn-img {
        width: 32px;
        height: 32px;
        border-radius: 16px;
        transition: transform 0.3s ease;
    }

    .icon-btn-img:hover, .icon-btn:focus-within .icon-btn-img {
        transform: scale(1.25);
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

    :global { /* todo see if there is a better way to make style apply to child */
        .remove-btn {
            width: min-content !important;
            align-self: end !important;
        }
    }

    .list-item-attribute {
        display: flex;
        justify-content: space-between;
        align-self: stretch;
        gap: 8px;
    }
</style>