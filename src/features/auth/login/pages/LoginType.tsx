import { Truck, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import truckConvoy from '@/assets/truck.webp'

import { LoginCard } from '../components/LoginCard'

export default function LoginType() {
  const navigate = useNavigate()

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg p-6">
      <section className="grid w-full max-w-7xl overflow-hidden rounded-3xl border border-border bg-surface shadow-xl lg:grid-cols-[480px_1fr]">
        <aside className="hidden flex-col justify-between bg-primary-soft p-12 lg:flex">
          <div>
            <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-text-inverse">
              FL
            </div>

            <h1 className="text-5xl font-bold leading-tight text-text">
              Fleet
              <br />
              Management
            </h1>

            <p className="mt-6 max-w-sm text-lg leading-8 text-text-muted">
              Monitor vehicles, manage deliveries, allocate drivers and track
              operations in real time.
            </p>
          </div>

          <img
            src={truckConvoy}
            alt=""
            aria-hidden="true"
            className="mx-auto mt-12 w-full max-w-md object-contain"
          />
        </aside>

        <section className="flex items-center justify-center p-8 md:p-14">
          <div className="w-full max-w-lg">
            <header>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                Welcome
              </p>

              <h2 className="mt-2 text-4xl font-bold text-text">
                Choose your login
              </h2>

              <p className="mt-4 leading-7 text-text-muted">
                Select the type of account you want to sign in with.
              </p>
            </header>

            <div className="mt-10 space-y-5">
              <LoginCard
                title="Administrator"
                subtitle="Manage fleet, inventory, orders and resources."
                icon={<ShieldCheck size={28} />}
                onClick={() => navigate('/login/admin')}
              />

              <LoginCard
                title="Driver"
                subtitle="Access your shift, deliveries and GPS updates."
                icon={<Truck size={28} />}
                onClick={() => navigate('/login/driver')}
              />
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}
