<main>
    <h1>Login to Grocery List</h1>
    <a href="/auth/google">Sign in with Google</a>
</main>


<style>
    :global(body) {
        margin: 0;
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

    a {
        text-decoration: inherit;
        padding: 12px;
        border: 1px solid black;
        border-radius: 8px;
        color: inherit;
        background-color: gold;
    }

    a:hover, a:focus {
        border: 3px solid black;
        padding: 10px;
        outline: none;
    }
</style>