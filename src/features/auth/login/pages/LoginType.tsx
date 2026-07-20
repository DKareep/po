import { HelpCircle, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import truckConvoy from '@/assets/truck.webp'

import { LoginCard } from '../components/LoginCard'

// Stylized Logo Component with a light variation for dark backgrounds
function FleetPandaLogo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {/* Panda inside a truck stylized icon */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-text-inverse shadow-md shadow-primary/10">
        <svg
          className="w-7 h-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Cab */}
          <path d="M14 18H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h8m0 12h6a2 2 0 0 0 2-2v-4l-3-3h-5m0 7V6" />
          {/* Wheels */}
          <circle cx="7.5" cy="18.5" r="2.5" />
          <circle cx="16.5" cy="18.5" r="2.5" />
          {/* Panda face outline inside box */}
          <circle cx="9" cy="11" r="2" />
        </svg>
      </div>
      <div className="flex flex-col">
        <div className="flex items-baseline font-extrabold tracking-tight text-xl leading-none">
          <span className={light ? 'text-white' : 'text-text'}>Fleet</span>
          <span className="text-primary ml-0.5">Panda</span>
        </div>
        <span
          className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 leading-none ${light ? 'text-neutral-400' : 'text-text-muted'}`}
        >
          Fueling Deliveries
        </span>
      </div>
    </div>
  )
}

// High fidelity steering wheel SVG icon
function SteeringWheelIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.2"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.5" className="fill-current" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v6.5M3 12h6.5M14.5 12h6.5M12 14.5l-4.5 4.5M12 14.5l4.5 4.5"
      />
    </svg>
  )
}

export default function LoginType() {
  const navigate = useNavigate()

  return (
    <main className="flex min-h-screen flex-col lg:flex-row bg-surface">
      {/* Left Section - Branding & Cover Visual */}
      <section className="hidden lg:flex lg:w-[42%] relative flex-col justify-between p-16 overflow-hidden border-r border-border/60">
        {/* Full cover background image */}
        <img
          src={truckConvoy}
          alt="Fleet truck"
          className="absolute inset-0 w-full h-full object-cover select-none"
        />

        {/* Dark gradient overlay for readability */}
        <div className="absolute inset-0 bg-neutral-950/50 bg-gradient-to-b from-neutral-950/70 via-neutral-950/40 to-neutral-950/80 z-10" />

        {/* Logo and welcome text placed over the image */}
        <div className="relative z-20 flex flex-col justify-between h-full">
          <div>
            <FleetPandaLogo light />
          </div>

          <div className="mt-auto text-white">
            <p className="text-xl text-neutral-300 font-medium tracking-tight">
              Welcome to
            </p>
            <h1 className="text-5xl font-black tracking-tight text-primary mt-1 drop-shadow-sm">
              Fleet Panda
            </h1>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-neutral-200 drop-shadow-sm">
              Smart fuel logistics and fleet management, all in one place.
            </p>
          </div>
        </div>
      </section>

      {/* Right Section - Login Type Selection */}
      <section className="flex-1 flex flex-col justify-between p-8 md:p-16 lg:p-24 bg-surface">
        {/* Mobile Logo Header */}
        <div className="lg:hidden mb-12">
          <FleetPandaLogo />
        </div>

        {/* Dummy spacer for flex layout on desktop */}
        <div className="hidden lg:block"></div>

        {/* Selection Area */}
        <div className="w-full max-w-lg mx-auto">
          <header className="mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight text-text">
              Choose your login type
            </h2>
            <p className="mt-2 text-text-muted">
              Please select how you want to continue
            </p>
          </header>

          <div className="space-y-5">
            <LoginCard
              title="Admin Login"
              subtitle="Access the admin dashboard to manage operations, fleet, inventory and more."
              icon={<ShieldCheck className="w-6 h-6" strokeWidth={2.2} />}
              onClick={() => navigate('/login/admin')}
            />

            <LoginCard
              title="Driver Login"
              subtitle="Access your deliveries, update status, view routes and more."
              icon={<SteeringWheelIcon />}
              onClick={() => navigate('/login/driver')}
            />
          </div>
        </div>

        {/* Footer Area */}
        <div className="w-full max-w-lg mx-auto mt-16 pt-8 border-t border-border/60">
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-3 text-sm">
              <HelpCircle
                className="text-text-muted shrink-0 mt-0.5"
                size={18}
              />
              <div>
                <span className="font-semibold text-text">Need help? </span>
                <span className="text-text-muted">Contact support at </span>
                <a
                  href="mailto:dijinks@gmail.com"
                  className="font-semibold text-primary hover:underline transition-colors"
                >
                  dijinks@gmail.com
                </a>
              </div>
            </div>

            <p className="text-xs text-text-muted/80">
              &copy; 2026 Fleet Panda. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
