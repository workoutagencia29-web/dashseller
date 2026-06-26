import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { entradas, clients, type Entrada } from '../data/reportsData'
import { formatCurrency, cn } from '../lib/utils'
import { Avatar } from './ui/Avatar'
import { Badge } from './settings/primitives'
import { EntradaDrawer } from './reports/EntradaDrawer'

interface FeedItem {
  key: number
  entrada: Entrada
  ts: number
  /** Marcada quando está saindo do feed (anima e some); removida do estado depois. */
  leaving?: boolean
}

const MAX_VISIBLE = 3
const EXIT_MS = 500

let counter = 0

function relTime(ts: number, now: number): string {
  const s = Math.max(0, Math.floor((now - ts) / 1000))
  if (s < 3) return 'agora'
  if (s < 60) return `há ${s}s`
  return `há ${Math.floor(s / 60)}min`
}

/**
 * Relógio relativo isolado: tem o próprio ticker de 1s, então atualizar o
 * tempo NÃO re-renderiza a lista (o que interromperia as animações de saída
 * do AnimatePresence e deixaria nós órfãos no feed).
 */
function RelTime({ ts }: { ts: number }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  return <>{relTime(ts, now)}</>
}

export function LiveSales({ className }: { className?: string }) {
  const approved = useMemo(() => entradas.filter((e) => e.status === 'Aprovado'), [])
  const clientById = useMemo(() => Object.fromEntries(clients.map((c) => [c.id, c])), [])
  const pickRef = useRef(0)

  const [feed, setFeed] = useState<FeedItem[]>(() =>
    approved.slice(0, MAX_VISIBLE).map((e, i) => ({ key: counter++, entrada: e, ts: Date.now() - i * 11000 })),
  )
  const [selected, setSelected] = useState<Entrada | null>(null)

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = []
    const add = setInterval(() => {
      // próxima venda (pseudo-aleatória, sem repetir a anterior)
      let i = pickRef.current
      i = (i + 1 + Math.floor(Math.random() * (approved.length - 1))) % approved.length
      pickRef.current = i

      setFeed((f) => {
        // marca a venda visível mais antiga como "saindo" (ela anima e some)
        const visible = f.filter((x) => !x.leaving)
        const next = f.map((x) => x)
        if (visible.length >= MAX_VISIBLE) {
          const oldest = visible[visible.length - 1]
          const idx = next.findIndex((x) => x.key === oldest.key)
          next[idx] = { ...oldest, leaving: true }
        }
        return [{ key: counter++, entrada: approved[i], ts: Date.now() }, ...next]
      })

      // remove do DOM as que terminaram de sair
      timeouts.push(
        setTimeout(() => setFeed((f) => f.filter((x) => !x.leaving)), EXIT_MS),
      )
    }, 4000)
    return () => {
      clearInterval(add)
      timeouts.forEach(clearTimeout)
    }
  }, [approved])

  return (
    <div className={cn('flex min-h-[280px] flex-col rounded-3xl border border-border bg-card p-5 sm:p-6', className)}>
      {/* header */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2.5 text-lg font-bold text-foreground">
          <span className="h-5 w-1.5 shrink-0 rounded-full bg-primary" />
          Vendas ao vivo
        </h2>
        <span className="flex items-center gap-2 rounded-full bg-positive/10 px-2.5 py-1 text-xs font-semibold text-positive">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-positive opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-positive" />
          </span>
          Ao vivo
        </span>
      </div>

      {/* feed */}
      <div className="scrollbar-thin mt-5 flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pr-1">
        {feed.map((item) => {
          const e = item.entrada
          const c = clientById[e.clientId]
          return (
            <motion.button
              key={item.key}
              layout
              initial={{ opacity: 0, y: -14, scale: 0.97 }}
              animate={
                item.leaving
                  ? { opacity: 0, y: 16, scale: 0.97 }
                  : { opacity: 1, y: 0, scale: 1 }
              }
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => !item.leaving && setSelected(e)}
              className={cn(
                'flex w-full items-center gap-3 rounded-2xl border border-border bg-card-muted/30 p-3 text-left transition-colors hover:border-primary/40 hover:bg-card-muted/50',
                item.leaving && 'pointer-events-none',
              )}
            >
              <Avatar name={c.name} seed={c.avatarSeed} size={40} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">{e.product}</p>
                  <Badge tone="success">Aprovado</Badge>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted">
                  {c.name} · <span className="font-mono">#{e.txId}</span>
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-foreground">{formatCurrency(e.value)}</p>
                <p className="text-xs text-muted"><RelTime ts={item.ts} /></p>
              </div>
            </motion.button>
          )
        })}
      </div>

      <EntradaDrawer entrada={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
