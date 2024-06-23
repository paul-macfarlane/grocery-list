<script lang="ts">
    import LinkButton from "\$lib/components/linkButton.svelte";
</script>

<main>
    <h1>Login to Grocery List</h1>
    <LinkButton href="/auth/google" text="Sign in with Google" color="primary"/>
</main>


<style>
    :global(body) {
        width: 100vw;
        height: 100vh;
    }

    main {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
</style>