<script lang="ts">
    import logoutSvg from '$lib/assets/logout.svg';
    import Navbar from "$lib/components/navbar.svelte";

    let {data, children} = $props()

    const navLinks = [
        {
            href: "/",
            name: "Dashboard"
        },
        {
            href: "/",
            name: "My Lists"
        },
        {
            href: "/",
            name: "My Friends"
        }
    ]

    const profileMenuLinks = [
        {
            href: "/auth/logout",
            name: "Logout",
            icon: logoutSvg
        }
    ]
</script>

<Navbar user={data.user} navLinks={navLinks} profileMenuLinks={profileMenuLinks}/>

<main>
    {@render children()}
</main>

<style>
    :global(body) {
        margin: 0;
    }

    main {
        margin: 0;
        padding: 0 16px;
    }
</style>