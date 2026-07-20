import type { Order } from '../../operations/orders/types'

interface RecentOrdersTableProps {
  orders: Order[]
  destinationsMap: Record<string, string>
}

export function RecentOrdersTable({
  orders,
  destinationsMap,
}: RecentOrdersTableProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <h3 className="text-base font-bold text-text mb-4">Recent Deliveries</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-semibold uppercase tracking-wider text-text-muted">
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Destination</th>
              <th className="py-3 px-4">Details</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-text-muted italic"
                >
                  No recent orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const prodName =
                  order.product === 'jet_a1'
                    ? 'Jet A-1'
                    : order.product.charAt(0).toUpperCase() +
                      order.product.slice(1)
                const destName =
                  destinationsMap[order.destinationId] || order.destinationId

                let badgeColor =
                  'bg-bg-secondary text-text-secondary border-border'
                if (order.status === 'assigned') {
                  badgeColor = 'bg-info-soft text-info border-info-border'
                }
                if (order.status === 'completed') {
                  badgeColor =
                    'bg-success-soft text-success border-success-border'
                }
                if (order.status === 'failed') {
                  badgeColor = 'bg-danger-soft text-danger border-danger-border'
                }
                if (order.status === 'pending') {
                  badgeColor =
                    'bg-warning-soft text-warning border-warning-border'
                }

                return (
                  <tr key={order.id} className="hover:bg-surface-hover">
                    <td className="py-3 px-4 font-medium  text-xs text-text">
                      {order.id}
                    </td>
                    <td className="py-3 px-4 text-text font-medium">
                      {destName}
                    </td>
                    <td className="py-3 px-4 text-text-secondary text-xs">
                      {order.quantity.toLocaleString()} L of {prodName}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badgeColor}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-text-muted text-xs font-semibold">
                      {order.deliveryDate}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
