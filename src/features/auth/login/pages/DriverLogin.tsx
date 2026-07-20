import { useNavigate } from 'react-router-dom'

import truckConvoy from '@/assets/truck.webp'

import { LoginForm } from '../components/LoginForm'
import { useLogin } from '../hooks/useLogin'
import type { LoginFormValues } from '../schemas/login.schema'

export default function DriverLogin() {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useLogin()

  async function handleLogin(values: LoginFormValues) {
    await mutateAsync({
      username: values.username,
      password: values.password,
    })

    navigate('/driver')
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_480px]">
      <section className="hidden bg-primary-soft lg:flex lg:items-center lg:justify-center">
        <img
          src={truckConvoy}
          alt=""
          aria-hidden="true"
          className="w-3/4 max-w-lg"
        />
      </section>

      <section className="flex items-center justify-center bg-bg p-6">
        <LoginForm
          title="Driver Login"
          description="Sign in to access your deliveries and shift."
          submitLabel="Start Shift"
          loading={isPending}
          defaultValues={{ username: 'john_driver', password: 'driver123' }}
          onSubmit={handleLogin}
        />
      </section>
    </main>
  )
}
