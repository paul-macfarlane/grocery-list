<script>
    let { children} = $props()
</script>

{@render children()}

<style>
    :global(body) {
        margin: 0;
    }
</style>