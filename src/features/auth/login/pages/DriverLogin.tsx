import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ShieldCheck,
  User,
  ArrowLeft,
  Truck,
  CheckSquare,
  Map,
  History,
} from 'lucide-react'

import { Input } from '@/components/ui/Input'
import { PasswordInput } from '../components/PasswordInput'
import { useLogin } from '../hooks/useLogin'
import { loginSchema, type LoginFormValues } from '../schemas/login.schema'
import truckGraphicImg from '@/assets/truck-graphic.webp'

export default function DriverLogin() {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: 'john_driver',
      password: 'driver123',
    },
  })

  async function handleLogin(values: LoginFormValues) {
    await mutateAsync({
      username: values.username,
      password: values.password,
    })

    navigate('/driver')
  }

  return (
    <main className="flex min-h-screen flex-col lg:flex-row bg-surface">
      {/* Left Section - Access Information Panel */}
      <section className="hidden lg:flex lg:w-[42%] bg-gradient-to-b from-[#180f0a] to-[#25150d] flex-col justify-between p-16 relative overflow-hidden border-r border-neutral-800 text-white">
        {/* Back Link */}
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-sm text-neutral-400 hover:text-primary transition-colors w-fit group cursor-pointer"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-0.5"
          />
          <span>Back to login type</span>
        </button>

        {/* Info Area */}
        <div className="my-auto space-y-10">
          <div className="relative w-full max-w-[420px] mx-auto flex items-center justify-center select-none">
            {/* Base Truck Graphic */}
            <img
              src={truckGraphicImg}
              alt="Truck Graphic"
              className="w-full h-auto object-contain"
            />
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-extrabold tracking-tight">
              Driver Access
            </h1>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-sm">
              Login to view your deliveries, update status and stay on track.
            </p>
          </div>

          {/* Features Checklist */}
          <ul className="space-y-5 pt-6 border-t border-neutral-800/80">
            <li className="flex items-center gap-4 text-sm font-medium text-neutral-200">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary shadow-sm shadow-primary/5">
                <Truck size={18} />
              </div>
              <span>View Today's Deliveries</span>
            </li>
            <li className="flex items-center gap-4 text-sm font-medium text-neutral-200">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary shadow-sm shadow-primary/5">
                <CheckSquare size={18} />
              </div>
              <span>Update Delivery Status</span>
            </li>
            <li className="flex items-center gap-4 text-sm font-medium text-neutral-200">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary shadow-sm shadow-primary/5">
                <Map size={18} />
              </div>
              <span>View Routes & Maps</span>
            </li>
            <li className="flex items-center gap-4 text-sm font-medium text-neutral-200">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary shadow-sm shadow-primary/5">
                <History size={18} />
              </div>
              <span>Track Delivery History</span>
            </li>
          </ul>
        </div>

        {/* Empty placeholder for alignment */}
        <div className="h-4"></div>
      </section>

      {/* Right Section - Login Form */}
      <section className="flex-1 flex flex-col justify-between p-8 md:p-16 lg:p-24 bg-surface">
        {/* Mobile Back Header */}
        <div className="lg:hidden mb-12">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to login type</span>
          </button>
        </div>

        {/* Dummy spacer for vertical alignment */}
        <div className="hidden lg:block"></div>

        {/* Form Container */}
        <div className="w-full max-w-md mx-auto">
          <header className="mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight text-text">
              Driver Login
            </h2>
            <p className="mt-2 text-text-muted">
              Enter your credentials to continue
            </p>
          </header>

          <form
            onSubmit={handleSubmit(handleLogin)}
            className="space-y-6"
            noValidate
          >
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
              label="Password / PIN"
              autoComplete="current-password"
              placeholder="Enter password or 4-digit PIN"
              error={errors.password?.message}
              {...register('password')}
            />

            <button
              type="submit"
              disabled={isPending}
              className="
                w-full
                rounded-xl
                bg-primary
                px-4
                py-3
                font-bold
                text-text-inverse
                transition-all
                duration-200
                hover:bg-primary-hover
                hover:shadow-md
                hover:shadow-primary/10
                active:scale-[0.99]
                disabled:cursor-not-allowed
                disabled:opacity-60
                cursor-pointer
              "
            >
              {isPending ? 'Starting shift...' : 'Login as Driver'}
            </button>
          </form>
        </div>

        {/* Footer Area */}
        <div className="w-full max-w-md mx-auto mt-16 pt-6 border-t border-border/60 flex items-center justify-center gap-2 text-xs text-text-muted">
          <ShieldCheck size={16} className="text-success" />
          <span>Secure access. All activities are monitored.</span>
        </div>
      </section>
    </main>
  )
}
