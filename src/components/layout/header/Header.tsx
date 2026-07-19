import { useTheme } from '@/context/theme/ThemeContext.ts'
import { Button } from '@/components/ui'

function ThemeButton() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      onClick={toggleTheme}
      className="rounded-md bg-primary px-4 py-2 text-text"
    >
      {theme === 'light' ? 'Dark' : 'Light'}
    </Button>
  )
}

const Header = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-red">
      Header
      <ThemeButton />
    </header>
  )
}
export default Header
