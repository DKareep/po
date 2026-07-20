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
      className="group flex w-full cursor-pointer items-center gap-5 rounded-2xl border border-border/80 bg-surface p-6 text-left transition-all duration-300 hover:border-primary hover:shadow-md hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary transition-transform duration-300 group-hover:scale-105">
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors duration-200">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-relaxed text-text-muted">
          {subtitle}
        </p>
      </div>

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface group-hover:border-primary group-hover:bg-primary-soft transition-all duration-300">
        <ArrowRight
          className="text-text-secondary group-hover:text-primary transition-transform duration-300 group-hover:translate-x-0.5"
          size={18}
        />
      </div>
    </button>
  )
}
