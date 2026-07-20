import { ClipboardList, AlertCircle, Truck } from 'lucide-react'

interface DashboardStatsProps {
  stats: {
    totalOrders: number
    pendingOrders: number
    completedOrders: number
    failedOrders: number
    activeDrivers: number
    activeVehicles: number
    criticalStockCount: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const completionRate = stats.totalOrders
    ? Math.round((stats.completedOrders / stats.totalOrders) * 100)
    : 0

  const items = [
    {
      title: 'Order Statuses',
      value: `${stats.completedOrders} Completed`,
      subtext: `${stats.pendingOrders} Pending / ${stats.failedOrders} Failed`,
      icon: ClipboardList,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      subtext: `Total orders processed: ${stats.totalOrders}`,
      icon: ClipboardList,
      iconColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Active Fleet',
      value: `${stats.activeDrivers} Drivers`,
      subtext: `${stats.activeVehicles} Vehicles registered`,
      icon: Truck,
      iconColor: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Critical Inventory Alerts',
      value: stats.criticalStockCount,
      subtext:
        stats.criticalStockCount > 0
          ? 'Locations need replenishment'
          : 'All locations healthy',
      icon: AlertCircle,
      iconColor:
        stats.criticalStockCount > 0
          ? 'text-red-400 animate-pulse'
          : 'text-text-muted',
      bgColor:
        stats.criticalStockCount > 0 ? 'bg-red-500/10' : 'bg-bg-secondary',
      borderStyle:
        stats.criticalStockCount > 0 ? 'border-red-500/20' : 'border-border',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, idx) => {
        const Icon = item.icon
        return (
          <div
            key={idx}
            className={`rounded-xl border ${item.borderStyle || 'border-border'} bg-surface p-5 shadow-sm transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  {item.title}
                </p>
                <p className="mt-2 text-2xl font-bold text-text">
                  {item.value}
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  {item.subtext}
                </p>
              </div>
              <div className={`rounded-lg p-2.5 ${item.bgColor}`}>
                <Icon size={22} className={item.iconColor} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
