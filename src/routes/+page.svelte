<script lang="ts">
    import userProfileSvg from '$lib/assets/user-profile.svg';
    import logoutSvg from '$lib/assets/logout.svg';

    const {data} = $props()
    let profileMenuOn = $state(false)

    // todo: these will eventually link to subpaths, and this html will be in a layout (or at least the navbar will)
    // todo nav elements will also need to show as selected depending on path
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

<!-- todo this entire nav should be a component -->
<nav>
    <div id="nav-container">
        <ul id="nav-list">
            {#each navLinks as {href, name}}
                <li>
                    <a class="nav-link" href={href}>{name}</a>
                </li>
            {/each}
        </ul>
    </div>

    <div id="profile-menu">
        <button onclick={() =>  profileMenuOn = !profileMenuOn} id="profile-btn">
            <img id="profile-pic" alt={`${data.user.firstName} ${data.user.lastName}`}
                 src={data.user.profilePicUrl ? data.user.profilePicUrl : userProfileSvg}
            />
        </button>

        {#if profileMenuOn}
            <ul class="profile-menu-group">
                {#each profileMenuLinks as {href, name, icon}}
                    <a class="profile-menu-link" href={href}>
                        <img class="profile-menu-icon" alt="logout" src={icon}>
                        <span>{name}</span>
                    </a>
                {/each}
            </ul>
        {/if}
    </div>
</nav>

<h1>Welcome {data.user.firstName}!</h1>

<style>
    :global(body) {
        margin: 0;
    }

    nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid black;
        padding: 8px;
    }

    #nav-container {
        display: flex;
        flex-grow: 1;
        justify-content: center;
    }

    #nav-list {
        display: flex;
        list-style: none;
        gap: 8px;
        padding: 0;
    }

    .nav-link {
        color: inherit;
        text-decoration: inherit;
        padding: 8px;
        border: 1px solid black;
        border-radius: 8px;
    }

    .nav-link:hover, .nav-link:focus {
        border: 1px solid black;
        background: gold;
        outline: none;
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
        border: 2px solid white;
        border-radius: 32px;
        height: 32px;
        width: 32px;
    }

    #profile-pic:hover, #profile-btn:focus-within #profile-pic {
        border: 2px solid black;
    }

    .profile-menu-group {
        position: absolute;
        margin-left: -48px;
        margin-top: -4px;
        background: white;
        border: 1px solid black;
        padding: 0;
        display: flex;
        flex-direction: column;
        border-radius: 8px;
    }

    .profile-menu-link {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        padding: 8px;
        border-radius: 8px;
        color: inherit;
        text-decoration: inherit;
    }

    .profile-menu-link:hover, .profile-menu-link:focus {
        background: gold;
        outline: none;
    }

    .profile-menu-icon {
        width: 16px;
        height: 16px;
    }
</style>