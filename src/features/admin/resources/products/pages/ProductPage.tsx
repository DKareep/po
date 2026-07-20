import { useMemo, useState } from 'react'

import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { getProductColumns } from '../components/Columns'
import { DataTable } from '@/components/ui/data-table'
import { useTableFilters } from '@/hooks/useTableFilters'

import { ProductFilters } from '../components/ProductFilters'
import { useProducts } from '../hooks/useProducts'
import { Button } from '@/components/ui'
import { CreateProductModal } from '@/features/admin/resources/products/components/CreateProductModal.tsx'
import { EditProductModal } from '@/features/admin/resources/products/components/EditProductModal.tsx'
import { DeleteProductModal } from '@/features/admin/resources/products/components/DeleteProductModal.tsx'

import type { Product } from '../types'

export default function ProductPage() {
  const filters = useTableFilters()
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)

  const columns = useMemo(
    () =>
      getProductColumns({
        onEdit: setEditProduct,
        onDelete: setDeleteProduct,
      }),
    [],
  )

  const query = useProducts({
    pageSize: 10,
    search: filters.get('search'),
  })

  const products = useMemo(
    () => query.data?.pages.flatMap((page) => page.data) ?? [],
    [query.data],
  )

  const table = useReactTable({
    data: products,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setCreateModalOpen(true)}>Create Product</Button>
      </div>
      <ProductFilters />

      <DataTable
        table={table}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        infiniteScroll={{
          hasNextPage: query.hasNextPage,
          isFetchingNextPage: query.isFetchingNextPage,
          fetchNextPage: query.fetchNextPage,
        }}
      />

      <CreateProductModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      <EditProductModal
        product={editProduct}
        open={!!editProduct}
        onClose={() => setEditProduct(null)}
      />

      <DeleteProductModal
        product={deleteProduct}
        open={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
      />
    </div>
  )
}
