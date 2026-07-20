import { Droplet, Flame, ShieldAlert, Award } from 'lucide-react'
import type { InventoryAggregates } from '../types'

interface InventorySummaryProps {
  aggregates: InventoryAggregates
}

export function InventorySummary({ aggregates }: InventorySummaryProps) {
  const cards = [
    {
      title: 'Total Diesel',
      value: `${aggregates.totalDiesel.toLocaleString()} L`,
      icon: Droplet,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Petrol',
      value: `${aggregates.totalPetrol.toLocaleString()} L`,
      icon: Flame,
      iconColor: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Total Jet A-1',
      value: `${aggregates.totalJetA1.toLocaleString()} L`,
      icon: Award,
      iconColor: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
    },
    {
      title: 'Critical Alerts',
      value: aggregates.criticalCount,
      icon: ShieldAlert,
      iconColor:
        aggregates.criticalCount > 0
          ? 'text-red-400 animate-pulse'
          : 'text-text-muted',
      bgColor:
        aggregates.criticalCount > 0 ? 'bg-red-500/10' : 'bg-bg-secondary',
      borderStyle:
        aggregates.criticalCount > 0 ? 'border-red-500/20' : 'border-border',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <div
            key={idx}
            className={`rounded-xl border ${card.borderStyle || 'border-border'} bg-surface p-5 shadow-sm transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  {card.title}
                </p>
                <p className="mt-2 text-2xl font-bold text-text">
                  {card.value}
                </p>
              </div>
              <div className={`rounded-lg p-2.5 ${card.bgColor}`}>
                <Icon size={22} className={card.iconColor} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
