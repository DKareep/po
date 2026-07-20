import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'

import { Input } from '@/components/ui/Input'

type Props = Omit<React.ComponentProps<typeof Input>, 'type' | 'leftIcon'>

export function PasswordInput(props: Props) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <Input
        {...props}
        type={showPassword ? 'text' : 'password'}
        leftIcon={<Lock size={18} />}
      />

      <button
        type="button"
        onClick={() => setShowPassword((v) => !v)}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        aria-pressed={showPassword}
        className="
          absolute
          right-3
          top-1/2
          -translate-y-1/2
          text-text-muted
          transition-colors
          hover:text-text
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-primary
          rounded
        "
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}
