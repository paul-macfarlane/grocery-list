# grocery-list

## Summary

The purpose of this app is to make grocery for me and my girlfriend easier. The list of expected features are

## Feature List

- [x] authentication
  - [x] users can log in with social accounts
    - [x] add protected routes, add sign out, get session info in request
    - [x] add cleaner styling for login and root page
- [ ] profile management (needed for sharing functionality)
  - [ ] users start of with automatically generated usernames
  - [ ] users can edit their usernames
- [x] creating/editing a grocery list
  - [x] items can be created, edited, and deleted and include name, quantity, notes, and link. Only name is required
  - [x] lists can have budgets
- [ ] advanced grocery lists
  - [x] items can be grouped
  - [ ] items can have substitutes when the item is not available
  - [ ] lists can be recurring
  - [ ] they can also be copied/duplicated to a new list
- [ ] executing a grocery list
  - [ ] a user can enter an interactive ui execute the list
  - [ ] mark items as complete
  - [ ] skip items
  - [ ] replace items
  - [ ] user can still edit/add to the list during execution
- [ ] sharing grocery lists
  - [ ] users can send lists to other users
  - [ ] lists can be collaborative, meaning that users can edit other users lists. this will probably need some thought in design
  - [ ] users can add "grocery buddies" to send/share grocery lists
- [ ] non-functional related work
  - [x] migrate from PostgreSQL to Turso for cheaper db hosting in the future
  - [ ] dark mode
  - [ ] automated testing
  - [ ] host the application on the web

## Local Setup

This app is built using [Node.js](https://nodejs.org/en), [SvelteKit](https://kit.svelte.dev/) (with release candidate for [Svelte 5](https://svelte.dev/blog/svelte-5-release-candidate)), [Drizzle ORM](https://orm.drizzle.team/), and [Turso](https://turso.tech/).

1. [Install Turso CLI](https://docs.turso.tech/cli/introduction)
2. Create a local db file using `turso dev --db-file local.db` (keep the process running)
3. Copy `env.example` to `.env` - `cp .env.example .env` and fill in values as needed
4. Install LTS version of [Node.js](https://nodejs.org/en).
5. Install node dependencies `npm i`
6. Setup db schema by running `npm run db:generate && npm run db:migrate`
7. Run application using `npm run dev`

If you plan on contributing also make sure to run `npm run prepare` to setup the husky commit hook.
