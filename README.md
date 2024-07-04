# grocery-list

## Summary and Feature List

The purpose of this app is to make shopping for me and my girlfriend easier. The list of expected features are

- [x] authentication
  - [x] users can log in with social accounts
    - [x] add protected routes, add sign out, get session info in request
    - [x] add cleaner styling for login and root page
- [ ] creating/editing a shopping list
  - [x] items can be created, edited, and deleted and include name, quantity, notes, and link. Only name is required
  - [ ] items can have substitutes when the item is not available (recursive, a can have substitutes with the same or different priorities)
  - [ ] users can send lists to other users
  - [ ] lists can be collaborative, meaning that users can edit other users lists. this will probably need some thought in design
  - [ ] items can be grouped
  - [ ] users can add "shopping buddies" to send/share shopping lists
  - [ ] lists can be recurring, they can also be copied/duplicated to a new list
  - [ ] lists cam have budgets
- [ ] executing a shopping list
  - [ ] a user can enter an interactive ui execute the list
  - [ ] mark items as complete
  - [ ] skip items
  - [ ] replace items
  - [ ] user can still edit/add to the list during execution
- [ ] non-feature related work
  - [x] migrate from PostgreSQL to Turso for cheaper db hosting in the future
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
