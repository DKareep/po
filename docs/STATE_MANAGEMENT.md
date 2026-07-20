# State Management

State in this app is deliberately split by _what kind_ of state it is, rather than funneled through one general-purpose store. Each kind lives in the tool best suited to it:

| Kind of state                                       | Tool                               | Where                                 |
| --------------------------------------------------- | ---------------------------------- | ------------------------------------- |
| Server data (fetched, cached, mutated)              | TanStack Query                     | `features/**/hooks`                   |
| Global client state (who's logged in)               | Zustand                            | `stores/auth`                         |
| Form state                                          | React Hook Form + Zod              | `features/**/schema`, form components |
| List/table filters                                  | URL search params                  | `hooks/useTableFilters.ts`            |
| Everything else (open/closed, selected row, drafts) | Local component state (`useState`) | wherever it's used                    |
| Cross-cutting UI preference (theme)                 | React Context                      | `context/theme`                       |

The rule of thumb followed throughout the codebase: state that the server owns goes in Query; state that must survive navigation or a refresh goes in the URL or a persisted store; state that only one component tree cares about stays as `useState` in that tree. Nothing is lifted higher than the component that needs it unless something else concretely needs to read it too.

## Server state — TanStack Query

Every network read is a `useQuery` (or `useInfiniteQuery`) hook, and every write is a `useMutation` hook. These live one per file under each feature's `hooks/` folder (`useOrders.ts`, `useCreateOrder.ts`, `useUpdateOrder.ts`, `useDeleteOrder.ts`), each wrapping exactly one `api/*.ts` call.

```ts
// features/admin/operations/orders/hooks/useCreateOrder.ts
export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
  })
}
```

A few conventions hold across all of these:

- **Query keys are centralized.** `src/constants/keys.ts` exports one `{ all: [...] }` object per resource (`orderKeys`, `vehicleKeys`, `driverKeys`, etc.). Mutations invalidate through these constants instead of retyping key arrays, so a rename or a key-shape change happens in one file.
- **Mutations invalidate, they don't manually patch the cache.** After a create/update/delete succeeds, the owning list query is invalidated and refetched rather than optimistically spliced. Given the data volumes here (paginated admin lists, not a high-frequency feed) this is simpler and less error-prone than hand-rolled cache surgery, at the cost of one extra round trip.
- **Pagination is `useInfiniteQuery` with page-number cursors.** `useOrders` requests page 1 by default and computes the next `pageParam` from the response's `{ page, totalPages }`, which `DataTable`'s built-in infinite-scroll trigger drives.
- **Polling is a `refetchInterval`, not a manual `setInterval`.** `useLiveFleetQuery` takes a `refetchInterval` (default 30s, or `false` to pause) and passes it straight through to `useQuery`. The live-fleet page exposes this as a user-controlled dropdown (`RefreshTimer`) rather than hardcoding the cadence, and pauses polling entirely when the value is `false`.
- **`staleTime` is set per query based on how often the underlying data actually changes**, not left at the default for everything. Hub inventory in `useLiveFleetQuery` is given `staleTime: 600000` (10 minutes) because hub metadata is close to static, while the fleet position query itself has no `staleTime` because it's the thing being polled.
- **Ad hoc lookups don't get their own hook file.** Small, page-local reference queries (e.g. the vehicle/driver dropdown lists on `VehicleAllocationPage`) are called with `useQuery` directly in the page rather than wrapped in a named hook — a dedicated hook is only extracted once a query needs to be reused or gets non-trivial logic attached to it.

The `QueryClient` itself is instantiated once in `main.tsx` with default options and provided at the root — there's no per-feature client configuration.

## Global client state — Zustand

There is exactly one global store: `src/stores/auth/auth.store.ts`, holding the authenticated `user` (or `null`) plus `setAuth`/`clear` actions. It's wrapped in Zustand's `persist` middleware, backed by `localStorage`, and `partialize`d to only persist `user` — so a page refresh doesn't force a re-login, but nothing else on the store shape leaks into storage.

Consumers never call `useAuthStore` directly outside of `stores/auth`. Instead, `auth.selectors.ts` exports narrow, purpose-built hooks:

```ts
export const useAuthUser = () => useAuthStore((s) => s.user)
export const useAuthenticated = () => useAuthStore((s) => s.user !== null)
export const useUserRole = () => useAuthStore((s) => s.user?.role ?? null)
```

Each selector subscribes to the smallest possible slice, so a component that only cares about `isAuthenticated` doesn't re-render on unrelated `user` field changes. `ProtectedRoute` and `RoleRoute` (`router/guards/index.tsx`) are built entirely on `useAuthenticated`/`useUserRole` — routing decisions never touch the store's `user` object directly.

The access token itself is _not_ kept in Zustand. It lives in a plain module-level variable in `lib/token-storage.ts`, mirrored to `localStorage` for persistence across reloads. It's deliberately outside React state because nothing renders based on the token's value — it only needs to be read synchronously by the axios request interceptor (`services/api/api.interceptors.ts`), and routing that into a store/context would just add re-renders no component needs.

## Form state — React Hook Form + Zod

Every create/edit form follows the same shape: a Zod schema in `schema/*.schema.ts` defines both the validation rules and (via `z.infer`) the TypeScript input type, and a `useForm({ resolver: zodResolver(schema) })` instance is created in the owning modal and threaded to the field layout with `FormProvider`/`useFormContext`. This means:

- Validation logic lives in exactly one place (the schema), not duplicated between a type definition and manual field checks.
- The modal (`CreateOrderModal`) is the only component that knows about `mutation.isPending`, submit handling, and reset-on-close; the form component (`OrderForm`) only renders fields and reads `formState.errors`.
- Controlled custom inputs (`Select`) go through RHF's `<Controller>`; plain inputs use `register()` directly.

Local, uncontrolled-by-a-schema forms (e.g. the "Quick Allocate" sidebar form on `VehicleAllocationPage`) are the exception — for a three-field form with no reuse and no shared validation story, plain `useState` per field plus a manual submit handler with a `toast.error` guard is simpler than standing up a schema and a form instance for it. RHF+Zod is reserved for forms opened in a modal that map to a "real" domain schema.

## List filters — URL state, not component state

Every filterable list page (orders, drivers, vehicles, hubs, terminals, products, inventory) reads and writes its filters through `useTableFilters`, a thin wrapper over `useSearchParams`:

```ts
const { get, set, reset } = useTableFilters()
```

Filters are therefore part of the URL rather than transient `useState`. This is what makes the browser's back button and page-refresh behave sensibly on a filtered list, and what makes a filtered view linkable/bookmarkable. `useDebounce` sits in front of free-text search inputs so typing doesn't push a new URL entry (and refetch) on every keystroke.

## Local and ephemeral state

Everything that doesn't need to survive a refresh or be read from more than one place stays as plain `useState`/`useRef` in the component that owns it:

- Modal open/closed flags and "which row is selected" (every `*Page.tsx`).
- Optimistic-looking drag state that needs an explicit confirm/cancel/revert step (`VehicleAllocationPage`'s `pendingDrag`).
- Derived, render-only values computed with `useMemo` from query data (calendar `events`, dashboard `stats`) — these are recomputed from the query cache rather than stored redundantly.
- Sidebar's mobile open/close state and each nav group's expand/collapse state — owned entirely inside `Sidebar.tsx`, never lifted.

## UI preference state — Context

Theme (`light`/`dark`) is the one piece of state that genuinely needs to be read from many unrelated places (`Header`'s toggle, `document.documentElement`'s class) without being "server data" or needing Zustand's store semantics. `ThemeProvider` keeps it as `useState` seeded from `localStorage`, mirrors changes back to `localStorage` and to the `<html>` class list in a `useEffect`, and exposes it via a small `useTheme()` hook that throws if called outside the provider — a deliberate fail-fast instead of silently returning a default.

Context was chosen over a Zustand store here specifically because this is single-value, provider-scoped state with no need for selectors, middleware, or persistence beyond what a four-line `useEffect` already does; introducing a second state library's worth of ceremony for one boolean would be overhead, not architecture.
