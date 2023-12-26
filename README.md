# Extremely opinionated t3 style boilerplate

Featuring
- App dir
- Drizzle
- Planetscale
- Tailwind
- Nextauth
- tRPC

### Setup

1. Get your drizzle db environment variables from planetscale
2. Get your discord client id and secret from the discord developer portal
3. `pnpm i && pnpm dev`

### General flow

- Any data that should be displayed on page load should be fetched via a server component, and passed as props to a client component.
- Data that changes from user interactions that do not require a mutation should be trpc queries (look at isClaimed in this example).
- Mutations are always tRPC
- Refresh page load data via router.refresh()
- Track router.refresh() progress via useTransition

### Goodies

- Pretty toaster library
- Custom nextauth provider layer that is easy to modify

Look for `@@NOTE` for more details on what is going on in the boilerplate.



