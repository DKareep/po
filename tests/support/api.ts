/**
 * Small shared shape-builders for the paginated list responses the backend
 * returns (`{ data, pagination }`). Kept here purely to avoid repeating the
 * pagination boilerplate in every spec - the actual `page.route` mocking is
 * done per-spec, next to the flow it supports, following the project's
 * preferred pattern of inline `page.route` handlers per test file.
 */
export function paginated<T>(data: T[]) {
  return {
    data,
    pagination: {
      page: 1,
      pageSize: Math.max(data.length, 10),
      totalItems: data.length,
      totalPages: 1,
    },
  }
}
