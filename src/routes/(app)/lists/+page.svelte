<script lang="ts">
    import LinkButton from "\$lib/components/linkButton.svelte";

    let {data} = $props()
    // todo clean up styling
</script>

<header id="lists-header">
    <h1>Lists</h1>

    <div>
        <LinkButton href="/lists/new" text="Create" color="primary"/>
    </div>
</header>

<ul>
    {#each data.groceryLists as groceryList}
        <li>
            {groceryList.title}
        </li>
    {/each}
</ul>


<style>
    #lists-header {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 16px;
    }

    ul {
        padding: 0;
    }

    li {
        list-style: none;
    }
</style>

