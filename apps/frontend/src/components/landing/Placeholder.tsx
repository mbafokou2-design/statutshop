import { ImageIcon } from 'lucide-react'

type PlaceholderProps = {
  label: string
  hint?: string
  ratio?: string
  className?: string
  compact?: boolean
  imageUrl?: string
}

/**
 * Neutral, clearly-labelled slot where the client will drop a real screenshot.
 * Intentionally not a fake UI — it reads as an empty frame, not as content.
 */
export function Placeholder({
  label,
  hint,
  ratio = '16 / 10',
  className = '',
  compact = false,
  imageUrl,
}: PlaceholderProps) {
  if (imageUrl) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950 ${className}`}
        style={{ aspectRatio: ratio }}
      >
        <img
          src={imageUrl}
          alt={label}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/40 ${className}`}
      style={{ aspectRatio: ratio }}
      role="img"
      aria-label={label}
    >
      <div className="dotted-grid absolute inset-0 opacity-60" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-950/70">
          <ImageIcon className="h-4 w-4 text-slate-500" aria-hidden="true" />
        </span>
        <p
          className={`font-mono uppercase tracking-[0.18em] text-slate-400 ${
            compact ? 'text-[10px]' : 'text-[11px]'
          }`}
        >
          {label}
        </p>
        {hint ? (
          <p className="max-w-[26ch] text-xs leading-relaxed text-slate-600">
            {hint}
          </p>
        ) : null}
      </div>
      {/* corner ticks */}
      <span className="absolute left-3 top-3 h-3 w-3 border-l border-t border-slate-700/80" />
      <span className="absolute right-3 top-3 h-3 w-3 border-r border-t border-slate-700/80" />
      <span className="absolute bottom-3 left-3 h-3 w-3 border-b border-l border-slate-700/80" />
      <span className="absolute bottom-3 right-3 h-3 w-3 border-b border-r border-slate-700/80" />
    </div>
  )
}
