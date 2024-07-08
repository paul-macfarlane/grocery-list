<script lang="ts">
  import logoutSvg from "$lib/assets/logout.svg";
  import userProfileSvg from "$lib/assets/user-profile.svg";
  import Navbar from "$lib/components/navbar.svelte";

  let { data, children } = $props();

  const navLinks = [
    {
      href: "/",
      name: "Dashboard",
    },
    {
      href: "/lists",
      name: "My Lists",
    },
    {
      href: "/friends",
      name: "My Friends",
    },
  ];

  const profileMenuLinks = [
    {
      href: "/profile",
      name: "Profile",
      icon: userProfileSvg,
    },
    {
      href: "/auth/logout",
      name: "Logout",
      icon: logoutSvg,
    },
  ];
</script>

<Navbar
  user={data.user}
  {navLinks}
  {profileMenuLinks}
  pathname={data.pathname}
/>

<main>
  {@render children()}
</main>

<style>
  main {
    margin: 0;
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
</style>
