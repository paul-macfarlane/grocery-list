<script lang="ts">
    const {data} = $props()
    let profileMenuOn = $state(false)

    // todo: these will eventually link to subpaths, and this html will be in a layout (or at least the navbar will)
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
            name: "Logout"
        }
    ]

    function toggleProfileMenu() {
        profileMenuOn = !profileMenuOn
    }
</script>

<nav>
    <ul id="nav-list">
        {#each navLinks as {href, name}, _}
            <li>
                <a class="nav-link" href={href}>{name}</a>
            </li>
        {/each}
    </ul>

    <div id="profile-menu">
        <!--  todo add dropdown menu and make this a button that allows user to logout. Need a fallback image too  -->
        <button onclick={toggleProfileMenu} id="profile-btn">
            <img id="profile-pic" alt={`${data.user.firstName} ${data.user.lastName}`} src={data.user.profilePicUrl}/>
        </button>

        {#if profileMenuOn}
            <ul id="profile-btn-group">
                {#each profileMenuLinks as {href, name}, _}
                    <li>
                        <a class="profile-link" href={href}>{name}</a>
                    </li>
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
        border-bottom: 1px solid;
        border-bottom-color: black;
        padding: .5em;
    }

    #nav-list {
        display: flex;
        justify-content: left;
        gap: .5em;
        padding: 0;
    }

    li {
        list-style-type: none;
    }


    .nav-link {
        color: inherit;
        text-decoration: inherit;
        background-color: greenyellow;
        padding: .5em;
        border-radius: .5em;
        border: 1px solid greenyellow;
    }

    .nav-link:hover, .nav-link:focus {
        border: 1px solid black;
        outline: none;
    }

    #profile-btn {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        outline: none;
    }

    #profile-pic {
        border: 1px solid white;
        border-radius: 1em;
        height: 2em;
        width: 2em;
    }

    #profile-pic:hover, #profile-btn:focus-within #profile-pic {
        border: 1px solid black;
    }

    #profile-btn-group {
        z-index: 10;
        position: absolute;
        margin-left: -2.5em;
        margin-top: -.25em;
        background-color: white;
        border: 1px solid black;
        padding: .5em;
        width: 3em;
        border-radius: .25em;
    }

    #profile-menu {
        position: relative;
    }

    .profile-link {
        color: inherit;
        text-decoration: inherit;
    }
</style>