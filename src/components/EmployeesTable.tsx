import { useMemo, useState } from 'react'
import { Search, ChevronsUpDown, ChevronUp, ChevronDown, Check } from 'lucide-react'
import { employees, offices, jobTitles, statuses } from '../data/mockData'
import { Avatar } from './ui/Avatar'
import { Dropdown } from './ui/Dropdown'
import { cn } from '../lib/utils'

type SortKey = 'name' | 'jobTitle' | 'lineManager' | 'department' | 'office'
type SortDir = 'asc' | 'desc'

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'Nome' },
  { key: 'jobTitle', label: 'Cargo' },
  { key: 'lineManager', label: 'Gestor' },
  { key: 'department', label: 'Departamento' },
  { key: 'office', label: 'Escritório' },
]

function Checkbox({
  checked,
  onChange,
  indeterminate,
}: {
  checked: boolean
  onChange: () => void
  indeterminate?: boolean
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        'flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border transition-colors',
        checked || indeterminate
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-transparent hover:border-primary/60',
      )}
    >
      {checked && <Check className="h-3 w-3" strokeWidth={3} />}
      {!checked && indeterminate && <span className="h-0.5 w-2.5 rounded bg-primary-foreground" />}
    </button>
  )
}

export function EmployeesTable() {
  const [query, setQuery] = useState('')
  const [office, setOffice] = useState(offices[0])
  const [title, setTitle] = useState(jobTitles[0])
  const [status, setStatus] = useState(statuses[0])
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir } | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const rows = employees.filter((e) => {
      const matchesQuery =
        !q || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q)
      const matchesOffice = office === offices[0] || e.office === office
      const matchesTitle = title === jobTitles[0] || e.jobTitle === title
      const matchesStatus = status === statuses[0] || e.status === status
      return matchesQuery && matchesOffice && matchesTitle && matchesStatus
    })

    if (!sort) return rows
    const sorted = [...rows].sort((a, b) => {
      const av = a[sort.key].toLowerCase()
      const bv = b[sort.key].toLowerCase()
      const cmp = av.localeCompare(bv)
      return sort.dir === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [query, office, title, status, sort])

  function toggleSort(key: SortKey) {
    setSort((s) =>
      s && s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' },
    )
  }

  function toggleRow(id: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const allVisibleSelected = filtered.length > 0 && filtered.every((e) => selected.has(e.id))
  const someVisibleSelected = filtered.some((e) => selected.has(e.id))

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allVisibleSelected) {
        filtered.forEach((e) => next.delete(e.id))
      } else {
        filtered.forEach((e) => next.add(e.id))
      }
      return next
    })
  }

  return (
    <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-5 sm:p-6">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-foreground">Funcionários</h2>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar funcionário"
            className="w-full rounded-xl border border-border bg-input/60 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-faint focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* filters */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Dropdown value={office} options={offices} onChange={setOffice} />
        <Dropdown value={title} options={jobTitles} onChange={setTitle} />
        <Dropdown value={status} options={statuses} onChange={setStatus} />
      </div>

      {/* table */}
      <div className="scrollbar-thin -mx-1 mt-4 flex-1 overflow-x-auto px-1">
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="w-10 py-3 pl-2 pr-0 text-left">
                <Checkbox
                  checked={allVisibleSelected}
                  indeterminate={!allVisibleSelected && someVisibleSelected}
                  onChange={toggleAll}
                />
              </th>
              {COLUMNS.map((col) => {
                const active = sort?.key === col.key
                return (
                  <th key={col.key} className="px-2.5 py-3 text-left">
                    <button
                      onClick={() => toggleSort(col.key)}
                      className="group inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted transition-colors hover:text-foreground"
                    >
                      {col.label}
                      {active ? (
                        sort?.dir === 'asc' ? (
                          <ChevronUp className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-primary" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3.5 w-3.5 text-faint group-hover:text-muted" />
                      )}
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp) => {
              const isSelected = selected.has(emp.id)
              return (
                <tr
                  key={emp.id}
                  className={cn(
                    'border-b border-border/60 transition-colors last:border-0 hover:bg-card-muted/50',
                    isSelected && 'bg-primary/[0.04]',
                  )}
                >
                  <td className="py-3.5 pl-2 pr-0">
                    <Checkbox checked={isSelected} onChange={() => toggleRow(emp.id)} />
                  </td>
                  <td className="px-2.5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={emp.name} seed={emp.avatarSeed} size={36} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{emp.name}</p>
                        <p className="truncate text-xs text-muted">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-2.5 py-3.5 text-sm text-muted">{emp.jobTitle}</td>
                  <td className="whitespace-nowrap px-2.5 py-3.5 text-sm text-muted">{emp.lineManager}</td>
                  <td className="whitespace-nowrap px-2.5 py-3.5 text-sm text-muted">{emp.department}</td>
                  <td className="whitespace-nowrap px-2.5 py-3.5 text-sm text-muted">{emp.office}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-muted">
            Nenhum funcionário corresponde aos filtros.
          </div>
        )}
      </div>

      {/* footer */}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm text-muted">
        <span>
          Exibindo <span className="font-semibold text-foreground">{filtered.length}</span> de{' '}
          {employees.length} funcionários
        </span>
        {selected.size > 0 && (
          <span className="font-medium text-primary">
            {selected.size} selecionado{selected.size > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  )
}
