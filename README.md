# grocery-list

NOTE: This repo has been replaced with https://github.com/paul-macfarlane/grocer-ease. This was working fine but I wanted to stop rolling my own UI components and decided to
re-architect the app a bit to better support collaboration on lists and make the code for the main grocery list form easier to maintain.

## Summary

The purpose of this app is to make grocery shopping for me and my girlfriend easier.

## Feature List

- [x] authentication
  - [x] users can log in with social accounts
    - [x] add protected routes, add sign out, get session info in request
    - [x] add cleaner styling for login and root page
- [x] profile management
  - [x] users start of with automatically generated usernames
  - [x] users can edit their usernames
- [x] creating/editing a grocery list
  - [x] items can be created, edited, and deleted and include name, quantity, notes, and link. Only name is required
  - [x] lists can have budgets
- [ ] advanced grocery lists
  - [x] items can be grouped
  - [x] they can also be copied/duplicated to a new list
  - [x] items can have substitutes when the item is not available
  - [x] list form validation (server side errors and client side handling)
  - [ ] autosave/debouncing
- [ ] executing a grocery list
  - [ ] a user can enter an interactive ui execute the list
  - [ ] mark items as complete
  - [ ] skip items
  - [ ] replace items
  - [ ] user can still edit/add to the list during execution
  - [ ] lists can be recurring
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

1. Set up Google OAuth 2.0 https://developers.google.com/identity/protocols/oauth, and obtain credentials
2. [Install Turso CLI](https://docs.turso.tech/cli/introduction)
3. Create a local db file using `turso dev --db-file local.db` (keep the process running)
4. Copy `env.example` to `.env` - `cp .env.example .env` and fill in values as needed
5. Install LTS version of [Node.js](https://nodejs.org/en).
6. Install node dependencies `npm i`
7. Setup db schema by running `npm run db:generate && npm run db:migrate`
   8Run application using `npm run dev`
