# Component Architecture

This document describes how the Fleeter frontend is composed: the shell that every screen renders inside, the shared UI primitives, and the conventions used inside feature modules. It reflects the code as it exists in `src/`, not an aspirational target.

## Layering

The app has three layers, from outermost to innermost:

1. **App shell** (`src/app`, `src/router`) — bootstraps providers and decides which route tree (admin vs. driver) is mounted.
2. **Layout** (`src/components/layout`) — the persistent chrome (sidebar, header, error boundary) that wraps every authenticated page.
3. **Feature modules** (`src/features/**`) — the actual screens and the components/hooks/API calls that belong to them.

Cutting across all three is `src/components/ui`, a small set of unstyled-logic, styled-appearance primitives (`Button`, `Input`, `Select`, `Modal`, `DataTable`, filters) that every feature composes rather than reinventing.

## App shell

`src/app/main.tsx` is the single entry point. It wires up, in order: the `QueryClientProvider` (TanStack Query), `ThemeProvider` (light/dark), `App`, and a global `Toaster` (sonner) for toast notifications. `tokenStorage.load()` runs before render so the in-memory access token is populated from `localStorage` before the first authenticated request fires.

`App.tsx` itself does nothing but hand control to `RouterProvider`. All routing logic — including which shell variant to render — lives in `src/router`.

### Routing and role separation

`src/router/index.tsx` builds a `createBrowserRouter` tree with three route groups:

- `/login`, `/login/admin`, `/login/driver` — unauthenticated, rendered without the shell.
- A protected subtree gated by `ProtectedRoute` (redirects to `/login` if unauthenticated), which nests a `RoleRoute` per role (redirects to the correct home if the authenticated user's role doesn't match the subtree).
- A catch-all that redirects to `/login`.

`src/router/role.route.ts` is the single place that maps a `Role` (`'admin' | 'driver'`) to a URL prefix, a `Shell` variant, and its route children (`admin.routes.tsx`, `driver.routes.tsx`). Adding a new role-scoped area means editing this file and the corresponding routes file — nothing else needs to know roles exist.

Each role's page components are lazy-loaded (`lazy()` + `Suspense`) and wrapped in `ErrorBoundary`, so a broken screen degrades to a fallback UI instead of taking down the whole app, and route chunks are only downloaded when visited.

## Layout (`src/components/layout`)

`Shell` (`components/layout/Shell.tsx`) is the chrome every authenticated route renders inside: a fixed `Sidebar` beside a column containing `Header` and a scrollable `<main>` that renders the active route via `<Outlet />`. It takes a single `variant: 'admin' | 'driver'` prop and does not otherwise know which page it's hosting.

- **`Sidebar`** reads its link list from `sidebar.config.ts` (a plain `NavigationItem[]` tree, admin and driver each get their own array) rather than hardcoding links in JSX. Top-level groups with `children` collapse/expand; leaves render as `NavLink`s. It also owns the mobile off-canvas open/close state internally — no parent needs to manage that.
- **`Header`** shows the signed-in user's name and role, a theme toggle, and logout. It reads the user from the auth store and doesn't receive it as a prop.
- **`ErrorBoundary`** is a class component (required, since error boundaries have no hook equivalent) used both at the route level and available for wrapping any risky subtree.

Sidebar and Header are intentionally decoupled from each other and from the pages they surround — neither takes page-specific props. A page that needs to put something in the header (a page title, an action button) renders that itself inside its own content area, not through the shell.

## UI primitives (`src/components/ui`)

These are the only components feature code should reach for before writing something bespoke:

| Component                                                                 | Responsibility                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                                                                  | Single button implementation covering variants, sizes, loading state, icons.                                                                                                                                                                                                                                                                        |
| `Input`                                                                   | Text input with label/error/helper-text slots, used via `register()` from React Hook Form.                                                                                                                                                                                                                                                          |
| `Select`                                                                  | A fully custom (non-`<select>`) listbox: keyboard navigation (arrows/Home/End/type-ahead), portal-rendered dropdown positioned against the trigger via `useLayoutEffect`, flips above/below when it would overflow the viewport. Built because native `<select>` styling and behavior aren't flexible enough for the filter/form UI this app needs. |
| `Modal`                                                                   | Portal-rendered dialog: focus trap on open, Escape-to-close, backdrop click, body scroll lock, restores focus to the previously focused element on close. Every create/edit/delete modal in the app is a thin wrapper around this.                                                                                                                  |
| `DataTable`                                                               | Renders a TanStack Table instance with row virtualization (`@tanstack/react-virtual`) and optional infinite-scroll pagination. It's generic over `TData` and takes a pre-built `table` instance — it does not fetch data or own column definitions.                                                                                                 |
| `filters/*` (`SearchInput`, `SelectFilter`, `DateFilter`, `ResetFilters`) | Controlled inputs that read/write through `useTableFilters` (URL search params) rather than local state, so every list page's filters survive a refresh and are shareable as a link.                                                                                                                                                                |

None of these primitives talk to the network or to a store. They take data and callbacks as props, which is what keeps them reusable across the driver and admin surfaces.

## Feature modules (`src/features/**`)

The app is organized by feature, not by technical layer. Under `src/features/admin` and `src/features/driver`, each feature (e.g. `orders`, `vehicle-allocation`, `hubs`, `live-fleet`) is a self-contained slice with the same internal shape:

```
features/admin/resources/vehicles/
├── api/            axios calls, one file per endpoint (createVehicle.ts, getvehicles.ts, ...)
├── components/     Columns.tsx, forms, modals, row actions — all scoped to this feature
├── hooks/          useVehicles.ts, useCreateVehicle.ts, ... — TanStack Query wrappers around api/
├── schema/         Zod schema + inferred TS type for the feature's form input
├── types/          domain types not derived from the schema
└── pages/          the routed page component that composes everything above
```

Not every feature has every folder — `live-fleet` has no `schema/` because it's read-only, `orders` has a `utils/` folder because it needs a Haversine distance helper. The shape adapts to what the feature actually needs; it isn't a template stamped out empty.

### Why this grouping

Everything a change to "orders" touches lives under `features/admin/operations/orders/`. There's no need to jump between a global `hooks/`, global `api/`, and global `components/` directory to trace one feature end to end, and deleting a feature is closer to `rm -rf` than a hunt through shared folders. The cost is some duplication (each feature defines its own `Columns.tsx`, its own modal shells) — that's accepted in exchange for locality; see [DECISIONS.md](DECISIONS.md).

### Page → Modal → Form composition

The recurring pattern for anything that creates or edits a record:

- **`<X>Page.tsx`** owns the list view: fetches data via a `use<X>s` hook, renders `DataTable` with a `Columns.tsx` definition, holds `open`/`selected<X>` state for whichever modal is currently active.
- **`Create<X>Modal.tsx` / `Edit<X>Modal.tsx`** are `Modal` wrappers that own a `useForm` instance (React Hook Form + `zodResolver`), wrap the shared `<X>Form` in `FormProvider`, and call the relevant mutation hook (`useCreate<X>`/`useUpdate<X>`) on submit.
- **`<X>Form.tsx`** is the actual field layout. It reads the form context via `useFormContext` instead of receiving `register`/`control` as props, so the same form body can be reused by both the create and edit modal without prop plumbing.
- **`<X>Actions.tsx`** is the row-level menu (edit/delete) rendered from the table's `Columns.tsx`.

`CreateOrderModal.tsx` and `OrderForm.tsx` are the clearest example of this split — the modal handles submission and lifecycle, the form only knows about fields and validation errors.

### Composite pages that don't fit the CRUD pattern

Two features deliberately break from the list/modal pattern because the underlying interaction isn't tabular:

- **`vehicle-allocation`** (`VehicleAllocationPage.tsx`) centers on a FullCalendar month/week view with drag-to-reschedule. A dragged event doesn't commit immediately — it opens `DragConfirmModal` and only calls the update mutation on explicit confirmation, calling the drag's `revert()` callback if the user cancels or the mutation fails.
- **`live-fleet`** (`LiveFleetPage.tsx`) is a split list/map view (`LiveFleetSidebar` + `LiveFleetMap`) that polls the backend on an interval rather than fetching once. See [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) for how the refresh cadence is controlled.

## Cross-cutting concerns

- **Auth** (`src/stores/auth`) and **theme** (`src/context/theme`) are the only pieces of state visible above the feature layer, and both are read via small hooks (`useAuthUser`, `useTheme`) rather than components receiving them as props.
- **API client** (`src/services/api`) is a single configured `axios` instance with a request interceptor that attaches the bearer token; every feature's `api/*.ts` file imports this instance rather than constructing its own.
- **Query keys** (`src/constants/keys.ts`) are centralized per-resource (`orderKeys.all`, `vehicleKeys.all`, ...) so invalidation after a mutation doesn't rely on hand-typed key arrays scattered across hooks.

See [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) for how these pieces hold and synchronize state, and [DECISIONS.md](DECISIONS.md) for why the libraries above were chosen.
