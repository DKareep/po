import { LogOut, Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui'
import { useTheme } from '@/context/theme/ThemeContext.ts'
import { useLogout } from '@/features/auth/logout/hooks/useLogout'
import { useAuthUser } from '@/stores/auth'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const nextLabel = isDark ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      aria-label={nextLabel}
      title={nextLabel}
      className="!p-2 h-9 w-9 rounded-full text-text-secondary hover:text-text"
    >
      {isDark ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
    </Button>
  )
}

function LogoutButton() {
  const { mutate, isPending } = useLogout()

  return (
    <Button
      variant="outline"
      size="sm"
      loading={isPending}
      onClick={() => mutate()}
      leftIcon={<LogOut className="h-4 w-4" aria-hidden="true" />}
      aria-label="Log out"
      className="hidden sm:inline-flex"
    >
      Logout
    </Button>
  )
}

function LogoutIconButton() {
  const { mutate, isPending } = useLogout()

  return (
    <Button
      variant="outline"
      size="sm"
      loading={isPending}
      onClick={() => mutate()}
      aria-label="Log out"
      title="Log out"
      className="sm:hidden !p-2 h-9 w-9 rounded-full"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
    </Button>
  )
}

const Header = () => {
  const user = useAuthUser()

  return (
    <header
      role="banner"
      className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur sm:px-6"
    >
      <div className="flex items-center gap-2 min-w-0 pl-12 lg:pl-0">
        {user && (
          <span className="truncate text-sm font-medium text-text-secondary sm:text-base">
            {user.name} • {user.role === 'admin' ? '(Admin)' : '(Driver)'}
          </span>
        )}
      </div>

      <nav
        aria-label="User actions"
        className="flex items-center gap-2 sm:gap-3"
      >
        <ThemeToggle />
        <LogoutButton />
        <LogoutIconButton />
      </nav>
    </header>
  )
}

export default Header
