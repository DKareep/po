import type { LucideIcon } from 'lucide-react'

import {
  CalendarDays,
  ClipboardList,
  Map,
  History,
  LayoutDashboard,
  Truck,
  Boxes,
  Warehouse,
  Building2,
  Package,
  Users,
  TruckIcon,
} from 'lucide-react'

export interface NavigationItem {
  title: string
  to?: string
  icon?: LucideIcon
  children?: NavigationItem[]
}

export const adminNavigation: NavigationItem[] = [
  {
    title: 'Dashboard',
    to: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Operations',
    children: [
      {
        title: 'Orders',
        to: '/admin/orders',
        icon: ClipboardList,
      },
      {
        title: 'Vehicle Allocation',
        to: '/admin/allocation',
        icon: Truck,
      },
      {
        title: 'Live Fleet',
        to: '/admin/fleet',
        icon: Map,
      },
    ],
  },
  {
    title: 'Inventory',
    to: '/admin/inventory',
    icon: Boxes,
  },
  {
    title: 'Resources',
    children: [
      {
        title: 'Hubs',
        to: '/admin/hubs',
        icon: Warehouse,
      },
      {
        title: 'Terminals',
        to: '/admin/terminals',
        icon: Building2,
      },
      {
        title: 'Products',
        to: '/admin/products',
        icon: Package,
      },
      {
        title: 'Drivers',
        to: '/admin/drivers',
        icon: Users,
      },
      {
        title: 'Vehicles',
        to: '/admin/vehicles',
        icon: TruckIcon,
      },
    ],
  },
]
export const driverNavigation = [
  {
    title: "Today's Shift",
    to: '/driver',
    icon: CalendarDays,
  },
  {
    title: 'Deliveries',
    to: '/driver/deliveries',
    icon: ClipboardList,
  },
  {
    title: 'Map',
    to: '/driver/map',
    icon: Map,
  },
  {
    title: 'History',
    to: '/driver/history',
    icon: History,
  },
]
