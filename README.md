# Extremely opinionated t3 style boilerplate

Featuring
- App dir
- Drizzle
- Planetscale
- Tailwind
- Nextauth
- tRPC

### General flow

- Any data that should be displayed on page load should be fetched via a server component, and passed as props to a client component.
- Data that changes from user interactions that do not require a mutation should be trpc queries (look at isClaimed in this example).
- Mutations are always tRPC
- Refresh page load data via router.refresh()
- Track router.refresh() progress via useTransition

### Goodies

- Boilerplate for MDX components, use tailwind's prose.
- Pretty toaster library
- Custom nextauth provider layer that is easy to modify
