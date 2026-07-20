# Technical Decisions

This document records the notable technical choices behind the frontend and the reasoning for each. It's written from the state of the code, not as a historical changelog — where a decision has an obvious tradeoff, the tradeoff is stated rather than glossed over.

## Build tooling: Vite + React Compiler

The app is built with Vite (`vite.config.ts`) rather than a metaframework like Next.js or Remix. There's no server-rendering or file-based routing requirement here — this is an authenticated dashboard behind a login wall, so SSR buys nothing, and routing is handled explicitly through `react-router-dom` instead. Vite gives fast cold starts and HMR without that extra machinery.

The React Compiler (via `@vitejs/plugin-react`'s `reactCompilerPreset` and `babel-plugin-react-compiler`) is enabled at build time. In practice this means components generally aren't hand-wrapped in `memo`/`useCallback`/`useMemo` purely for referential stability — the compiler does that class of optimization automatically, so manual memoization in this codebase is reserved for cases with real, non-trivial computation (e.g. the calendar's `events` mapping, dashboard stat aggregation), not defensive re-render prevention.

## Language: TypeScript, strict-by-default tsconfig

`tsconfig.app.json` turns on `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch`, and uses `verbatimModuleSyntax` with `moduleResolution: "bundler"`. Combined with `knip` in the toolchain (`npm run check`), the intent is that dead code and unused exports get caught in CI/local checks rather than accumulating. The `@/*` → `src/*` path alias (mirrored in both `tsconfig.app.json` and `vite.config.ts`) exists so feature code never has to reason about `../../../` depth — every import from outside the current folder is absolute from `src`.

## Server state: TanStack Query over hand-rolled fetching or Redux

Nearly every screen in this app is "fetch a paginated resource, render it, mutate it, refetch." TanStack Query was chosen over building this by hand (raw `axios` + `useEffect` + `useState`) because caching, request de-duplication, background refetch, and loading/error states are exactly what it's for, and reimplementing that per feature would mean reimplementing it wrong in a slightly different way each time. It was chosen over pulling server data into Redux/a global store because server data isn't really _app_ state — it's a cache of something the backend owns, with its own invalidation lifecycle, and Query models that directly instead of forcing it through reducers and manual `isLoading` flags.

The pagination style (`useInfiniteQuery` with numeric page cursors, driven by `DataTable`'s virtualized scroll) was picked to match the backend's existing `{ page, pageSize, totalPages }` contract (see `utils/pagination.js` on the backend) rather than switching the API to cursor-based pagination purely for the frontend's convenience.

## Client state: Zustand, scoped to auth only

Zustand is used for exactly one thing — the authenticated user — rather than as a general app-wide store. It was picked over Context for that slice because auth state needs to be read from many unrelated places (route guards, header, API interceptor indirectly via token storage) without those reads causing a full provider subtree to re-render, and because its `persist` middleware handles `localStorage` sync with a two-line config instead of a hand-written `useEffect`. It was picked over Redux/Redux Toolkit because a single small store with two actions doesn't need action creators, reducers, or a devtools-heavy setup — that ceremony isn't earned by the problem size here.

Deliberately, Zustand was _not_ reached for again as the app grew. Theme is a Context (see below), list filters are URL state, and form/modal state is local — the store stayed at one slice because most state in this app isn't actually global.

## Forms: React Hook Form + Zod

React Hook Form was chosen for its uncontrolled-input model — form fields don't cause parent re-renders on every keystroke, which matters once a form has a dozen fields with live validation. Zod pairs with it via `@hookform/resolvers/zod` and does double duty: the schema is both the runtime validator and, through `z.infer`, the source of the form's TypeScript type. That means a field's validation rule and its type can't drift apart the way they could with a hand-maintained interface plus separate validation function.

This combination is used for schema-backed domain forms (create/edit order, driver, vehicle, hub, etc.) opened in a modal. It is intentionally _not_ used for the one-off "Quick Allocate" form on the vehicle allocation page — three fields, no reuse, no need for a durable schema — where plain `useState` and a manual handler are less code and equally correct. Reaching for RHF+Zod everywhere regardless of form complexity would be process for its own sake.

## Data grids: TanStack Table + TanStack Virtual

Every list page (orders, drivers, vehicles, hubs, terminals, products, inventory) renders through one shared `DataTable` component built on `@tanstack/react-table` for column/sorting logic and `@tanstack/react-virtual` for row virtualization. Virtualization specifically because these lists are paginated from a backend that can return large result sets, and rendering every row into the DOM as pages accumulate (via infinite scroll) would degrade scroll performance well before a user reaches the end of a realistic dataset. `DataTable` itself is intentionally dumb — it takes a prebuilt table instance and knows nothing about a specific resource — so the cost of a new list page is a `Columns.tsx` definition, not a new table implementation.

## Styling: Tailwind CSS v4

Tailwind is used utility-first throughout, with no separate CSS-in-JS layer or component styling library. Design tokens (color roles like `bg-surface`, `text-text-muted`, `border-border`) are used as semantic-sounding Tailwind classes rather than raw hex values inline, which is what lets `ThemeProvider` flip the whole app between light and dark by toggling one class on `<html>` — the components themselves don't branch on theme. Tailwind v4's Vite plugin (`@tailwindcss/vite`) is used directly instead of the PostCSS pipeline, which is the currently recommended integration path for Vite projects and avoids an extra PostCSS config file.

## Custom `Select` instead of native `<select>` or a headless-UI dependency

`components/ui/select/Select.tsx` reimplements a listbox from scratch — portal-rendered dropdown, manual viewport-aware positioning, full keyboard support (arrows, Home/End, type-ahead, Escape) — rather than using the native `<select>` or pulling in Radix/Headless UI. The native element's styling limitations (can't reliably theme the dropdown panel, inconsistent cross-browser padding/affordances) ruled it out for a dashboard that needs consistent light/dark theming. No headless-UI library dependency was added for what is, in the end, one component reused everywhere through `<Controller>`; the maintenance cost of ~300 lines of well-scoped code was judged lower than adding and version-pinning another UI dependency for a single primitive.

## Domain-specific libraries: FullCalendar and Mapbox GL

`vehicle-allocation` uses `@fullcalendar/react` for the drag-and-drop scheduling calendar rather than a hand-built calendar grid — recurring UI (month/week views, event drag, date click) is exactly what FullCalendar exists to solve, and building a bespoke one would mean re-solving accessibility and cross-browser drag-and-drop that FullCalendar already handles. `live-fleet` uses `mapbox-gl` for vehicle position and hub rendering, chosen for its vector-tile rendering performance with a moderate number of live-updating markers, which is the app's actual use case (dozens of vehicles polled every 30 seconds, not thousands of static points).

## HTTP layer: a single configured axios instance

`services/api/api.client.ts` exports one `axios.create()` instance (base URL from `VITE_API_URL`, `withCredentials: true`, 30s timeout) used by every feature's `api/*.ts` file, with a request interceptor (`api.interceptors.ts`) that attaches the bearer token from `token-storage.ts`. This was chosen over the native `fetch` API mainly for axios's interceptor model — centralizing auth-header injection in one place means individual API functions stay one-liners (`api.get('/orders', { params })`) with no auth boilerplate repeated per call.

## Notifications: sonner

Toast notifications (mutation success/failure feedback) go through `sonner`, mounted once at the root in `main.tsx`. It was chosen for being a single drop-in `<Toaster />` with an imperative `toast()` API that mutation `onSuccess`/`onError` handlers can call directly, rather than routing notification state through a custom store or context.

## Quality gates: ESLint + Prettier + Husky + commitlint + knip

The `check` script (`prettier --write . && eslint --fix . && knip && tsc --noEmit`) is the single source of truth for "is this changeset clean," and `lint-staged` runs the equivalent scoped to staged files via a Husky pre-commit hook. `knip` specifically was added to catch unused exports and dependencies — a real risk in a feature-folder structure where it's easy for an old `api/` function or type to stop being imported and quietly rot. `commitlint` with the conventional-commits config keeps commit history machine-parseable, which matters less for changelog generation here and more for making `git log`/`git blame` archaeology predictable across a growing feature set.

## Testing: Jest for units, Playwright for E2E

Unit and component tests (`*.test.tsx` colocated with the components they cover, e.g. `CreateOrderModal.test.tsx`, `AllocationModal.test.tsx`) run under Jest with `jest-environment-jsdom` and Testing Library. End-to-end flows (`tests/admin`, `tests/auth`, `tests/driver`) run under Playwright against a real running instance. The split follows the standard tradeoff: Jest for fast, isolated feedback on component behavior and form validation; Playwright for the things that only break when routing, auth guards, and the real backend are wired together — role-based redirects being the clearest example of something not worth faking in a unit test.

## Feature-based folder structure over a layered (`components/`, `hooks/`, `api/`) structure

Code is organized by feature (`features/admin/resources/vehicles/{api,components,hooks,schema,types,pages}`) rather than by technical layer at the top level. This was chosen because most changes in this app are feature-scoped — "add a field to the driver form" touches one folder, not four — and because it makes a feature's blast radius, and its removal, self-contained. The acknowledged cost is duplication: every resource has its own near-identical `Columns.tsx`, `Create<X>Modal.tsx`, and CRUD hook quartet (`use<X>s`, `useCreate<X>`, `useUpdate<X>`, `useDelete<X>`). That repetition is accepted rather than abstracted into a generic "resource CRUD" factory, because a generic abstraction over six resources with slightly different field sets, validation rules, and relations (e.g. orders reference destinations and drivers; vehicles don't) tends to become harder to read than the repetition it replaces. See [COMPONENTS.md](COMPONENTS.md) for the shape this produces in practice.
