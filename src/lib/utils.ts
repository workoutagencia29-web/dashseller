/** Join truthy class names. Tiny local replacement for `clsx`. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

/** Formata um número com separador de milhar pt-BR (ex: 3540 -> "3.540"). */
export function formatNumber(value: number): string {
  return value.toLocaleString('pt-BR')
}

/** Formata um valor monetário em Reais (ex: 500 -> "R$ 500,00"). */
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
