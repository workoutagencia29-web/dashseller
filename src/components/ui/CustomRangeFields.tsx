import { useEffect, useMemo, useRef, useState, type SelectHTMLAttributes } from 'react'
import { DayPicker } from 'react-day-picker'
import { ptBR } from 'react-day-picker/locale'
import 'react-day-picker/style.css'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '../../lib/utils'
import { startOfDay, endOfDay, formatShort, rangeDays, type DateRange } from '../../lib/date'

/**
 * Miolo do "Período personalizado": dois campos rotulados — Início e Fim — e UM
 * calendário por vez, aberto logo abaixo do campo em que se tocou.
 *
 * Não sabe onde está: o desktop monta dentro do popover do DateRangeFilter, o
 * celular monta dentro do bottom sheet ou inline no painel "Filtros". Todo o
 * estado é interno (rascunho) e só sobe pro pai no clique em "Aplicar período" —
 * as telas têm `useEffect(... setPage(1))` atrelado ao range, então um intervalo
 * pela metade não pode vazar.
 */

interface CustomRangeFieldsProps {
  /** Semeia os campos com o intervalo já aplicado (ou o último rascunho). */
  value: DateRange | null
  /** Piso navegável — o `dataStart` da tela. Sem valor, não há piso. */
  minDate?: Date
  /** Alvos de toque maiores e calendário full-width (celular). */
  touch?: boolean
  /** Única saída, já normalizada (00:00 → 23:59:59). */
  onApply: (range: DateRange) => void
}

/* Assinatura do componente `Dropdown` da lib (não é exportada da raiz do pacote,
   por isso é declarada aqui igual ao .d.ts). A lib só lê `e.target.value`. */
type CaptionDropdownProps = {
  options?: { value: number; label: string; disabled: boolean }[]
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'>

/**
 * Seletor de mês/ano do cabeçalho do calendário. Substitui o `<select>` nativo
 * da lib: a lista de opções do select é desenhada pelo sistema operacional
 * (fundo branco, fonte do sistema) e não aceita CSS — destoava do tema escuro.
 * Aqui é um popover comum, com a mesma cara dos outros menus do app.
 */
function makeCaptionDropdown(touch?: boolean) {
  return function CaptionDropdown({ options = [], value, onChange, disabled, ...rest }: CaptionDropdownProps) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLSpanElement>(null)
    const listRef = useRef<HTMLDivElement>(null)
    const atual = options.find((o) => o.value === Number(value))

    useEffect(() => {
      if (!open) return
      function onClick(e: MouseEvent) {
        if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
      }
      function onKey(e: KeyboardEvent) {
        if (e.key === 'Escape') {
          e.stopPropagation() // não deixa o Esc fechar o popover/sheet inteiro
          setOpen(false)
        }
      }
      document.addEventListener('mousedown', onClick)
      document.addEventListener('keydown', onKey, true)
      return () => {
        document.removeEventListener('mousedown', onClick)
        document.removeEventListener('keydown', onKey, true)
      }
    }, [open])

    // a lista de anos é longa: abre já mostrando o selecionado
    useEffect(() => {
      if (open) listRef.current?.querySelector<HTMLElement>('[data-sel="true"]')?.scrollIntoView({ block: 'center' })
    }, [open])

    return (
      <span ref={ref} className="relative inline-flex">
        <button
          type="button"
          disabled={disabled}
          aria-label={rest['aria-label']}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'flex items-center gap-1 rounded-lg px-1.5 text-sm font-semibold capitalize text-foreground transition-colors hover:bg-card-muted disabled:opacity-40',
            touch ? 'min-h-9' : 'py-0.5',
          )}
        >
          {atual?.label}
          <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 text-muted transition-transform', open && 'rotate-180')} />
        </button>

        {open && (
          <div
            ref={listRef}
            className="scrollbar-thin absolute left-0 top-full z-40 mt-1 max-h-56 min-w-[7.5rem] overflow-y-auto overscroll-contain rounded-xl border border-border bg-card p-1 shadow-xl shadow-black/30 animate-fade-in"
          >
            {options.map((o) => {
              const sel = o.value === Number(value)
              return (
                <button
                  key={o.value}
                  type="button"
                  disabled={o.disabled}
                  data-sel={sel}
                  onClick={() => {
                    // a lib lê só `target.value` (Number) no seu handler
                    onChange?.({ target: { value: String(o.value) } } as never)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-lg px-2.5 text-left text-sm capitalize transition-colors disabled:opacity-30',
                    touch ? 'min-h-10' : 'py-1.5',
                    sel ? 'bg-primary/10 font-medium text-primary' : 'text-foreground hover:bg-card-muted',
                  )}
                >
                  <span className="truncate">{o.label}</span>
                  {sel && <Check className="h-3.5 w-3.5 shrink-0" />}
                </button>
              )
            })}
          </div>
        )}
      </span>
    )
  }
}

/** Um calendário de data única, tematizado. `touch` sobe as células pra 44px+. */
function SingleCalendar({
  selected,
  onSelect,
  fromDate,
  toDate,
  defaultMonth,
  touch,
}: {
  selected: Date | null
  onSelect: (d: Date) => void
  fromDate?: Date
  toDate: Date
  defaultMonth: Date
  touch?: boolean
}) {
  const disabled = [{ after: toDate }, ...(fromDate ? [{ before: fromDate }] : [])]
  // recriado só quando `touch` muda — não pode ser inline, senão o componente
  // é uma função nova a cada render e o React remonta o cabeçalho inteiro.
  const components = useMemo(() => ({ Dropdown: makeCaptionDropdown(touch) }), [touch])

  return (
    <DayPicker
      mode="single"
      components={components}
      locale={ptBR}
      selected={selected ?? undefined}
      onSelect={(d) => d && onSelect(d)}
      defaultMonth={defaultMonth}
      startMonth={fromDate}
      endMonth={toDate}
      captionLayout="dropdown"
      disabled={disabled}
      // .rdp-touch (em index.css) só sobe as alturas pra alvo de toque de 44px;
      // a largura já é fluida por padrão lá.
      className={cn('rdp-single', touch && 'rdp-touch')}
    />
  )
}

export function CustomRangeFields({ value, minDate, touch, onApply }: CustomRangeFieldsProps) {
  const [from, setFrom] = useState<Date | null>(value?.from ? startOfDay(value.from) : null)
  const [to, setTo] = useState<Date | null>(value?.to ? startOfDay(value.to) : null)
  /** Qual campo está com o calendário aberto. `null` = nenhum. */
  const [campo, setCampo] = useState<'from' | 'to' | null>(value ? null : 'from')
  const calRef = useRef<HTMLDivElement>(null)

  const hoje = useMemo(() => startOfDay(new Date()), [])
  const piso = useMemo(() => (minDate ? startOfDay(minDate) : undefined), [minDate])

  // Reabrir tem que refletir o que está aplicado — e nunca deixar rascunho sujo.
  useEffect(() => {
    setFrom(value?.from ? startOfDay(value.from) : null)
    setTo(value?.to ? startOfDay(value.to) : null)
    setCampo(value ? null : 'from')
  }, [value])

  // No celular o calendário não pode nascer abaixo da dobra do sheet.
  useEffect(() => {
    if (campo && touch) calRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [campo, touch])

  function escolher(d: Date) {
    const dia = startOfDay(d)
    if (campo === 'from') {
      setFrom(dia)
      if (!to || to < dia) {
        setTo(null)
        setCampo('to') // avança sozinho só quando o fim ficou inválido
      } else {
        setCampo(null) // fim já vale: fecha e deixa corrigir só uma ponta
      }
    } else {
      setTo(dia)
      setCampo(null)
    }
  }

  const podeAplicar = !!from && !!to
  const hint = !from
    ? 'Selecione a data de início.'
    : !to
      ? 'Agora escolha a data final.'
      : `De ${formatShort(from)} até ${formatShort(to)} · ${rangeDays({ from, to })}`

  const campoBtn = (qual: 'from' | 'to') => {
    const aberto = campo === qual
    const data = qual === 'from' ? from : to
    return (
      <button
        type="button"
        onClick={() => setCampo(aberto ? null : qual)}
        aria-expanded={aberto}
        className={cn(
          'flex w-full flex-col items-start rounded-xl border px-3 text-left transition-colors',
          touch ? 'min-h-[52px] justify-center py-2' : 'py-1.5',
          aberto
            ? 'border-primary bg-primary/5'
            : 'border-border bg-input/60 hover:bg-input',
        )}
      >
        <span className="text-[11px] font-medium text-faint">
          {qual === 'from' ? 'Início' : 'Fim'}
        </span>
        <span
          className={cn(
            'text-sm font-semibold tabular-nums',
            data ? 'text-foreground' : 'text-faint',
          )}
        >
          {data ? formatShort(data) : '--/--/--'}
        </span>
      </button>
    )
  }

  return (
    <div className={cn(touch ? 'space-y-3' : 'space-y-2.5')}>
      <div className="grid grid-cols-2 gap-2">
        {campoBtn('from')}
        {campoBtn('to')}
      </div>

      {campo && (
        <div ref={calRef} className="rounded-xl border border-border bg-card-muted/30 p-2">
          <p className="px-1 pb-1.5 text-xs font-medium text-muted">
            {campo === 'from' ? 'Escolha a data de início' : 'Escolha a data final'}
          </p>
          {/* no toque o calendário ocupa a largura toda; no desktop fica centrado */}
          <div className={cn(!touch && 'flex justify-center')}>
            <SingleCalendar
              selected={campo === 'from' ? from : to}
              onSelect={escolher}
              // o fim nunca pode ser anterior ao início — some do calendário
              fromDate={campo === 'to' ? (from ?? piso) : piso}
              toDate={hoje}
              defaultMonth={(campo === 'from' ? from : to) ?? from ?? hoje}
              touch={touch}
            />
          </div>
        </div>
      )}

      <div
        className={cn(
          'flex items-center justify-between gap-3',
          touch && 'flex-col items-stretch',
        )}
      >
        <p className={cn('text-xs tabular-nums', podeAplicar ? 'text-muted' : 'text-faint')}>
          {hint}
        </p>
        <button
          type="button"
          disabled={!podeAplicar}
          onClick={() => from && to && onApply({ from: startOfDay(from), to: endOfDay(to) })}
          className={cn(
            'shrink-0 rounded-lg bg-primary px-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40',
            touch ? 'min-h-11 w-full text-sm' : 'py-1.5 text-sm',
          )}
        >
          Aplicar período
        </button>
      </div>
    </div>
  )
}
