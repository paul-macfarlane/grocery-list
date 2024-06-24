<script lang="ts">
    import LinkButton from "\$lib/components/linkButton.svelte";

    // todo clean up styling
    // todo fetch real list data (in loader file)
</script>

<header id="lists-header">
    <h1>Lists</h1>

    <div>
        <LinkButton href="/lists/new" text="Create" color="primary"/>
    </div>
</header>

<ul>
    <li>
        Fake List 1
    </li>
    <li>
        Fake List 2
    </li>
    <li>
        Fake List 3
    </li>
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

