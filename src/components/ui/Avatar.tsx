import { useState } from 'react'
import { cn } from '../../lib/utils'

interface AvatarProps {
  name: string
  seed: number
  size?: number
  className?: string
}

const GRADIENTS = [
  'from-sky-400 to-blue-600',
  'from-indigo-400 to-blue-700',
  'from-amber-400 to-orange-600',
  'from-pink-400 to-rose-600',
  'from-violet-400 to-purple-600',
]

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

/**
 * Photo avatar from pravatar with a graceful gradient-initials fallback
 * if the image fails to load (e.g. offline).
 */
export function Avatar({ name, seed, size = 36, className }: AvatarProps) {
  const [failed, setFailed] = useState(false)
  const gradient = GRADIENTS[seed % GRADIENTS.length]

  if (failed) {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white',
          gradient,
          className,
        )}
        style={{ width: size, height: size, fontSize: size * 0.36 }}
        aria-label={name}
      >
        {initials(name)}
      </div>
    )
  }

  return (
    <img
      src={`https://i.pravatar.cc/96?img=${seed}`}
      alt={name}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className={cn('shrink-0 rounded-full object-cover ring-2 ring-border', className)}
      style={{ width: size, height: size }}
    />
  )
}
