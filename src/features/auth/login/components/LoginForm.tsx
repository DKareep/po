import { User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Input } from '@/components/ui/Input'
import { PasswordInput } from './PasswordInput'

import { loginSchema, type LoginFormValues } from '../schemas/login.schema'

type Props = {
  title: string
  description: string
  submitLabel: string
  loading?: boolean
  defaultValues?: Partial<LoginFormValues>
  onSubmit: (values: LoginFormValues) => Promise<void> | void
}

export function LoginForm({
  title,
  description,
  submitLabel,
  loading = false,
  defaultValues,
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: defaultValues?.username ?? '',
      password: defaultValues?.password ?? '',
    },
  })

  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-sm">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-text">{title}</h1>

        <p className="mt-2 text-text-secondary">{description}</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          label="Username"
          type="text"
          autoComplete="username"
          placeholder="Enter your username"
          leftIcon={<User size={18} />}
          error={errors.username?.message}
          {...register('username')}
        />

        <PasswordInput
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          error={errors.password?.message}
          {...register('password')}
        />

        <button
          type="submit"
          disabled={loading}
          className="
            w-full
            rounded-md
            bg-primary
            px-4
            py-2.5
            font-medium
            text-text-inverse
            transition-colors
            hover:bg-primary-hover
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {loading ? 'Signing in...' : submitLabel}
        </button>
      </form>
    </div>
  )
}
