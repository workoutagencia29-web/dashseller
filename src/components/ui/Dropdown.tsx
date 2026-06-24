import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '../../lib/utils'

interface DropdownProps {
  value: string
  options: string[]
  onChange: (value: string) => void
  className?: string
  /** Visual style: filter pills (full width) vs compact selector. */
  variant?: 'filter' | 'compact'
  align?: 'left' | 'right'
  icon?: React.ReactNode
}

export function Dropdown({
  value,
  options,
  onChange,
  className,
  variant = 'filter',
  align = 'left',
  icon,
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className={cn('relative', variant === 'filter' && 'w-full', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-2 rounded-xl border border-border bg-input/60 text-sm font-medium text-foreground transition-colors hover:bg-input',
          variant === 'filter' ? 'w-full justify-between px-4 py-2.5' : 'px-3 py-2',
        )}
      >
        <span className="flex items-center gap-2 truncate">
          {icon}
          <span className="truncate">{value}</span>
        </span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-muted transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          className={cn(
            'absolute z-30 mt-2 min-w-[11rem] origin-top overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-xl shadow-black/20 animate-fade-in',
            variant === 'filter' && 'w-full',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {options.map((opt) => {
            const selected = opt === value
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  selected
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-foreground hover:bg-card-muted',
                )}
              >
                <span className="truncate">{opt}</span>
                {selected && <Check className="h-4 w-4 shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
