import { useState, useEffect } from 'react'
import { Play, Pause, RefreshCw } from 'lucide-react'

interface RefreshTimerProps {
  onRefresh: () => void
  isRefetching: boolean
  autoRefreshInterval: number // in ms (e.g. 30000)
  onIntervalChange: (interval: number | false) => void
}

export function RefreshTimer({
  onRefresh,
  isRefetching,
  autoRefreshInterval,
  onIntervalChange,
}: RefreshTimerProps) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [timeLeft, setTimeLeft] = useState(autoRefreshInterval / 1000)

  useEffect(() => {
    if (!isPlaying) {
      onIntervalChange(false)
      return
    }

    onIntervalChange(autoRefreshInterval)
    // Resets the visible countdown to match the freshly (re)started interval below.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimeLeft(autoRefreshInterval / 1000)

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Trigger manual refetch and reset timer
          onRefresh()
          return autoRefreshInterval / 1000
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalId)
  }, [isPlaying, autoRefreshInterval, onRefresh, onIntervalChange])

  // Reset timer if data is refreshed manually
  useEffect(() => {
    if (isRefetching && isPlaying) {
      // Resyncs the countdown when a refetch is triggered outside the timer
      // (e.g. the manual "force refresh" button).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeLeft(autoRefreshInterval / 1000)
    }
  }, [isRefetching, autoRefreshInterval, isPlaying])

  const togglePlay = () => {
    setIsPlaying((prev) => !prev)
  }

  const progressPercent = (timeLeft / (autoRefreshInterval / 1000)) * 100

  return (
    <div className="flex items-center gap-3.5 bg-surface border border-border rounded-xl px-4 py-2.5 shadow-sm">
      {/* Progress ring or indicator */}
      <div className="relative flex items-center justify-center w-8 h-8 shrink-0">
        <svg className="w-8 h-8 transform -rotate-90">
          <circle
            cx="16"
            cy="16"
            r="12"
            className="stroke-border"
            strokeWidth="3"
            fill="transparent"
          />
          {isPlaying && (
            <circle
              cx="16"
              cy="16"
              r="12"
              className="stroke-primary transition-all duration-1000"
              strokeWidth="3"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 12}
              strokeDashoffset={2 * Math.PI * 12 * (1 - progressPercent / 100)}
            />
          )}
        </svg>
        <span className="absolute text-[10px] font-black text-text ">
          {isPlaying ? Math.ceil(timeLeft) : '--'}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-text truncate">
          {isPlaying ? 'Live Tracking' : 'Tracking Paused'}
        </div>
        <div className="text-[10px] text-text-muted">
          {isPlaying
            ? `Refreshing in ${Math.ceil(timeLeft)}s`
            : 'Auto-refresh disabled'}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={togglePlay}
          className="p-1.5 rounded-lg border border-border bg-surface hover:bg-surface-hover text-text transition-colors"
          title={isPlaying ? 'Pause Auto-Refresh' : 'Resume Auto-Refresh'}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>

        <button
          onClick={onRefresh}
          disabled={isRefetching}
          className="p-1.5 rounded-lg border border-border bg-surface hover:bg-surface-hover text-text transition-colors disabled:opacity-50"
          title="Force Refresh Data"
        >
          <RefreshCw size={14} className={isRefetching ? 'animate-spin' : ''} />
        </button>
      </div>
    </div>
  )
}
