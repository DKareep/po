import type { Table } from '@tanstack/react-table'

interface InfiniteScrollProps {
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  fetchNextPage?: () => Promise<unknown>
}

export interface DataTableProps<TData> {
  table: Table<TData>

  className?: string

  emptyMessage?: string

  estimateRowHeight?: number

  overscan?: number

  isLoading?: boolean

  isFetching?: boolean

  infiniteScroll?: InfiniteScrollProps
}
