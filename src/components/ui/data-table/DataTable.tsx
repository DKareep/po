import { useEffect, useRef } from 'react'

import { flexRender } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'

import { Spinner } from '../Spinner'

import type { DataTableProps } from './types'

export function DataTable<TData>({
  table,
  className,
  emptyMessage = 'No records found.',
  estimateRowHeight = 56,
  overscan = 10,
  isLoading = false,
  isFetching = false,
  infiniteScroll,
}: DataTableProps<TData>) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const rows = table.getRowModel().rows

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateRowHeight,
    overscan,
    measureElement: (element) => element.getBoundingClientRect().height,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()
  const lastVirtualIndex = virtualRows.at(-1)?.index ?? -1

  useEffect(() => {
    if (!infiniteScroll) return
    if (!infiniteScroll.hasNextPage) return
    if (infiniteScroll.isFetchingNextPage) return

    if (lastVirtualIndex < rows.length - 1) return

    infiniteScroll.fetchNextPage?.()
  }, [
    lastVirtualIndex,
    rows.length,
    infiniteScroll?.hasNextPage,
    infiniteScroll?.isFetchingNextPage,
    infiniteScroll?.fetchNextPage,
  ])

  const showEmpty = !isLoading && rows.length === 0
  const columnCount = table.getVisibleLeafColumns().length

  return (
    <div
      className={
        className ??
        'flex h-[650px] flex-col overflow-hidden rounded-md border border-border bg-surface shadow-sm'
      }
    >
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <table
          className="w-full border-separate border-spacing-0 text-sm text-text"
          style={{ display: 'grid' }}
        >
          <thead
            className="sticky top-0 z-20 bg-bg-secondary/95 backdrop-blur supports-[backdrop-filter]:bg-bg-secondary/80"
            style={{ display: 'grid' }}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="flex w-full border-b border-border"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="flex flex-1 items-center px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted"
                    style={{ flexBasis: 0, minWidth: 0 }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody
            style={{
              display: 'grid',
              height:
                isLoading || showEmpty ? '100%' : rowVirtualizer.getTotalSize(),
              position: 'relative',
            }}
          >
            {isLoading ? (
              <tr className="flex w-full">
                <td
                  colSpan={columnCount}
                  className="flex w-full items-center justify-center py-16"
                >
                  <Spinner
                    size="md"
                    color="primary"
                    label="Loading records..."
                  />
                </td>
              </tr>
            ) : showEmpty ? (
              <tr className="flex w-full">
                <td
                  colSpan={columnCount}
                  className="flex w-full flex-col items-center justify-center gap-1 py-16 text-center"
                >
                  <p className="text-sm font-medium text-text-secondary">
                    {emptyMessage}
                  </p>
                  <p className="text-xs text-text-muted">
                    Try adjusting your filters or search.
                  </p>
                </td>
              </tr>
            ) : (
              virtualRows.map((virtualRow) => {
                const row = rows[virtualRow.index]

                return (
                  <tr
                    key={row.id}
                    data-index={virtualRow.index}
                    ref={(node) => {
                      if (node) {
                        rowVirtualizer.measureElement(node)
                      }
                    }}
                    className="absolute flex w-full border-b border-border-light bg-surface transition-colors duration-150 hover:bg-surface-hover"
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="flex flex-1 items-center px-4 py-3 text-sm text-text"
                        style={{ flexBasis: 0, minWidth: 0 }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {isFetching && !isLoading && (
        <div className="flex items-center justify-center gap-2 border-t border-border-light bg-bg-secondary/60 px-4 py-2 text-xs text-text-muted">
          <Spinner size="xs" color="primary" />
          <span>Loading more…</span>
        </div>
      )}
    </div>
  )
}
