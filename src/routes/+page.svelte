<script lang="ts">
    import logoutSvg from '$lib/assets/logout.svg';
    import Navbar from "$lib/components/navbar.svelte";

    let {data} = $props()

    // todo this html will be in a layout (or at least the navbar will)
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

<h1>Welcome {data.user.firstName}!</h1>

<style>
    :global(body) {
        margin: 0;
    }
</style>