# grocery-list

## Summary and Feature List

The purpose of this app is to make shopping for me and my girlfriend easier. The list of expected features are

- [ ] authentication
  - [ ] users can log in with social accounts
    - TODO: add protected routes, add sign out, get session info in request
  - [ ] users can add "shopping buddies" to send/share shopping lists
- [ ] creating/editing a shopping list
  - [ ] items include name, quantity description, image, and link. Only name and quantity are required
  - [ ] lists can be tied to a specific grocery store
  - [ ] items can have substitutes when the item is not available
  - [ ] users can send lists to other users
  - [ ] lists can be collaborative
  - [ ] items can be grouped
- [ ] executing a shopping list
  - [ ] a user can enter an interactive ui execute the list
  - [ ] mark items as complete
  - [ ] skip items
  - [ ] replace items
  - [ ] user can still edit/add to the list during execution

## Local Setup

This app is built using Node.js, SvelteKit, Drizzle ORM, and PostgreSQL.

1. [Install Docker Desktop](https://docs.docker.com/get-docker/) and run Docker Desktop (needed for local db).
2. Spin up Docker DB in background using Docker Compose `docker compose up -d`
3. Copy `env.example` to `.env` - `cp .env.example .env` and fill in values as needed
4. Install LTS version of [Node.js](https://nodejs.org/en).
5. Install node dependencies `npm i`
6. Setup db schema by running `npm run db:generate && npm run db:migrate`
7. Run application using `npm run dev`