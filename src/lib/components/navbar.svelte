<script lang="ts">
  import userProfileSvg from "$lib/assets/user-profile.svg";
  import type { UserInfo } from "$lib/types/users";
  import LinkButton from "$lib/components/linkButton.svelte";

  type NavLink = {
    href: string;
    name: string;
  };

  type ProfileMenuLink = {
    href: string;
    name: string;
    icon: string;
  };

  type NavbarProps = {
    user: UserInfo;
    navLinks: NavLink[];
    profileMenuLinks: ProfileMenuLink[];
    pathname: string;
  };

  const { user, navLinks, profileMenuLinks, pathname }: NavbarProps = $props();
  let profileMenuOn = $state(false);
</script>

<nav>
  <div id="nav-container">
    <ul id="nav-list">
      {#each navLinks as { href, name }}
        <LinkButton
          {href}
          text={name}
          color={(href === "/" && href === pathname) ||
          (href !== "/" && pathname.startsWith(href))
            ? "primary"
            : "secondary"}
        />
      {/each}
    </ul>
  </div>

  <div id="profile-menu">
    <button onclick={() => (profileMenuOn = !profileMenuOn)} id="profile-btn">
      <img
        id="profile-pic"
        alt={`${user.firstName} ${user.lastName}`}
        src={user.profilePicUrl ? user.profilePicUrl : userProfileSvg}
      />
    </button>

    {#if profileMenuOn}
      <ul class="profile-menu-group">
        {#each profileMenuLinks as { href, name, icon }}
          <a class="profile-menu-link" {href}>
            <img class="profile-menu-icon" alt="logout" src={icon} />
            <span>{name}</span>
          </a>
        {/each}
      </ul>
    {/if}
  </div>
</nav>

<style>
  nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid black;
    padding: 0 8px;
  }

  #nav-container {
    display: flex;
    flex-grow: 1;
    justify-content: center;
  }

  #nav-list {
    display: flex;
    list-style: none;
    gap: 16px;
    padding: 0;
  }

  @media only screen and (min-width: 640px) {
    #nav-list {
      gap: 24px;
    }
  }

  #profile-menu {
    position: relative;
    margin-left: auto;
  }

  #profile-btn {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    outline: none;
  }

  #profile-pic {
    border-radius: 32px;
    height: 32px;
    width: 32px;
    transition: transform 0.3s ease;
  }

  #profile-pic:hover,
  #profile-btn:focus-within #profile-pic {
    transform: scale(1.1);
  }

  .profile-menu-group {
    position: absolute;
    margin-left: -52px;
    margin-top: -4px;
    background: white;
    border: 1px solid black;
    padding: 0;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
  }

  .profile-menu-link {
    display: grid;
    grid-template-columns: [first] auto [second] auto;
    gap: 8px;
    padding: 8px;
    border-radius: 8px;
    color: inherit;
    text-decoration: inherit;
  }

  .profile-menu-link:hover,
  .profile-menu-link:focus {
    background: var(--color-primary);
    outline: none;
  }

  .profile-menu-icon {
    width: 16px;
    height: 16px;
  }
</style>
