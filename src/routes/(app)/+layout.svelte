<script lang="ts">
    import logoutSvg from '$lib/assets/logout.svg';
    import Navbar from "$lib/components/navbar.svelte";

    let {data, children} = $props()

    const navLinks = [
        {
            href: "/",
            name: "Dashboard",
        },
        {
            href: "/lists",
            name: "My Lists"
        },
        {
            href: "/friends",
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

<Navbar user={data.user} {navLinks} {profileMenuLinks} pathname={data.pathname}/>

<main>
    {@render children()}
</main>

<style>
    main {
        margin: 0;
        padding: 0 16px;
    }
</style>