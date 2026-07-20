import { ArrowRight } from 'lucide-react'

type Props = {
  title: string
  subtitle: string
  icon: React.ReactNode
  onClick: () => void
}

export function LoginCard({ title, subtitle, icon, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={title}
      className="group flex w-full items-center gap-5 rounded-2xl border border-border bg-surface p-6 text-left transition-all duration-300 hover:border-primary hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary transition-transform group-hover:scale-105">
        {icon}
      </div>

      <div className="flex-1">
        <h3 className="text-xl font-semibold text-text">{title}</h3>

        <p className="mt-1 leading-6 text-text-muted">{subtitle}</p>
      </div>

      <ArrowRight
        className="text-primary transition-transform group-hover:translate-x-1"
        size={22}
      />
    </button>
  )
}
