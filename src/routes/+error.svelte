<script lang="ts">
    import { page } from '$app/stores';
    import LinkButton from "\$lib/components/linkButton.svelte";
</script>

<main>
    {#if $page.status === 404}
        <h1>Page Not Found</h1>
    {:else}
        <h1>An Unexpected Error Occurred</h1>
    {/if}

    <LinkButton href="/" text="Return to home"/>
</main>


<style>
    main {
        padding: 8px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
</style>
