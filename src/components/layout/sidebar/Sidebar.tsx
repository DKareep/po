import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ChevronDown, Menu, X } from 'lucide-react'

import {
  adminNavigation,
  driverNavigation,
  type NavigationItem,
} from './sidebar.config'

interface Props {
  variant: 'admin' | 'driver'
}

const Sidebar = ({ variant }: Props) => {
  const items: NavigationItem[] =
    variant === 'admin' ? adminNavigation : driverNavigation
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  return (
    <>
      {!open && (
        <button
          type="button"
          aria-label="Open navigation"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="fixed top-3 left-3 z-50 inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-text shadow-sm lg:hidden"
        >
          <Menu size={20} />
        </button>
      )}

      {open && (
        <div
          onClick={close}
          aria-hidden
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-border bg-surface transition-transform duration-200 ease-out lg:static lg:z-auto lg:h-full lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Primary navigation"
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-border px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-text-inverse font-bold"
            >
              F
            </span>
            <span className="truncate text-base font-semibold text-text sm:text-lg">
              Fleeter
            </span>
          </div>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={close}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-text-secondary hover:bg-surface-hover lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {items.map((item) => (
            <NavEntry key={item.title} item={item} onNavigate={close} />
          ))}
        </nav>
      </aside>
    </>
  )
}

interface EntryProps {
  item: NavigationItem
  onNavigate: () => void
}

function NavEntry({ item, onNavigate }: EntryProps) {
  const [expanded, setExpanded] = useState(true)

  if (item.children && item.children.length > 0) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-semibold tracking-wide text-text-muted uppercase hover:bg-surface-hover"
        >
          <span>{item.title}</span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-150 ${
              expanded ? '' : '-rotate-90'
            }`}
          />
        </button>
        {expanded && (
          <div className="mt-1 space-y-1">
            {item.children.map((child) => (
              <NavLeaf key={child.title} item={child} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return <NavLeaf item={item} onNavigate={onNavigate} />
}

function NavLeaf({ item, onNavigate }: EntryProps) {
  if (!item.to) return null
  const Icon = item.icon

  return (
    <NavLink
      to={item.to}
      end
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
          isActive
            ? 'bg-primary-soft font-medium text-primary'
            : 'text-text-secondary hover:bg-surface-hover hover:text-text'
        }`
      }
    >
      {Icon && <Icon size={18} className="shrink-0" aria-hidden />}
      <span className="truncate">{item.title}</span>
    </NavLink>
  )
}

export default Sidebar
