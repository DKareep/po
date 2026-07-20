import { createColumnHelper } from '@tanstack/react-table'

import { ProductActions } from './ProductActions'

import type { Product } from '../types'

const columnHelper = createColumnHelper<Product>()

interface ProductColumnsProps {
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export function getProductColumns({ onEdit, onDelete }: ProductColumnsProps) {
  return [
    columnHelper.accessor('id', {
      id: 'id',
      header: 'ID',
      size: 150,
      cell: (info) => info.getValue(),
    }),

    columnHelper.accessor('name', {
      id: 'name',
      header: 'Name',
      size: 250,
      cell: (info) => info.getValue(),
    }),

    columnHelper.accessor('unit', {
      id: 'unit',
      header: 'Unit',
      size: 160,
      cell: (info) => info.getValue(),
    }),

    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      size: 100,

      cell: ({ row }) => (
        <ProductActions
          product={row.original}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
    }),
  ]
}
