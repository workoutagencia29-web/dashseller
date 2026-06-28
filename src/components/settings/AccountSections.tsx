import { useState, type ReactNode } from 'react'
import {
  Loader2,
  Landmark,
  Plus,
  Star,
  Trash2,
  Send,
  CheckCircle2,
  UserPlus,
  Check,
  X,
  Wallet,
  AlertTriangle,
  Mails,
  Gavel,
} from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import {
  SettingsCard,
  SubBlock,
  Field,
  Input,
  Select,
  Button,
  Switch,
  Badge,
  ToggleRow,
  maskCNPJ,
  maskCEP,
} from './primitives'
import { cn } from '../../lib/utils'
import {
  bankAccounts as initialBankAccounts,
  type BankAccount,
  webhookEvents,
  teamMembers as initialMembers,
  roles,
  permissions,
  auditLog,
} from '../../data/settingsData'

/* ------------------------------- Modal ------------------------------- */

function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl animate-fade-in">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-muted hover:bg-card-muted hover:text-foreground" aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* -------------------------- Dados da Empresa -------------------------- */

export function CompanySection() {
  const [cnpj, setCnpj] = useState('12.345.678/0001-90')
  const [cep, setCep] = useState('')
  const [loadingCep, setLoadingCep] = useState(false)
  const [addr, setAddr] = useState({ street: '', neighborhood: '', city: '', state: '' })

  async function lookupCep(value: string) {
    const clean = value.replace(/\D/g, '')
    if (clean.length !== 8) return
    setLoadingCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setAddr({ street: data.logradouro ?? '', neighborhood: data.bairro ?? '', city: data.localidade ?? '', state: data.uf ?? '' })
      }
    } catch {
      /* offline / cep inválido — ignora */
    } finally {
      setLoadingCep(false)
    }
  }

  return (
    <SettingsCard
      id="empresa"
      title="Dados da Empresa"
      description="Informações cadastrais do seller."
      action={<Button size="sm">Salvar alterações</Button>}
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Razão social">
          <Input defaultValue="Nummo Pagamentos LTDA" />
        </Field>
        <Field label="Nome fantasia">
          <Input defaultValue="Nummo" />
        </Field>
        <Field label="CNPJ" hint="Validado pelo KYC — não editável.">
          <div className="relative">
            <Input value={cnpj} onChange={(e) => setCnpj(maskCNPJ(e.target.value))} disabled className="pr-24" />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <Badge tone="success">
                <CheckCircle2 className="h-3 w-3" /> Validado
              </Badge>
            </span>
          </div>
        </Field>
        <Field label="Site">
          <Input defaultValue="https://nummo.com" />
        </Field>
        <Field label="Segmento de atuação" className="sm:col-span-2">
          <Select defaultValue="fintech">
            <option value="fintech">Fintech / Pagamentos</option>
            <option value="ecommerce">E-commerce</option>
            <option value="education">Educação / Infoprodutos</option>
            <option value="saas">SaaS / Software</option>
            <option value="services">Serviços</option>
          </Select>
        </Field>
      </div>

      <SubBlock title="Endereço">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-6">
          <Field label="CEP" className="sm:col-span-2">
            <div className="relative">
              <Input
                value={cep}
                onChange={(e) => setCep(maskCEP(e.target.value))}
                onBlur={(e) => lookupCep(e.target.value)}
                placeholder="00000-000"
                inputMode="numeric"
                className="pr-9"
              />
              {loadingCep && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />}
            </div>
          </Field>
          <Field label="Logradouro" className="sm:col-span-4">
            <Input value={addr.street} onChange={(e) => setAddr({ ...addr, street: e.target.value })} placeholder="Preenchido pelo CEP" />
          </Field>
          <Field label="Número" className="sm:col-span-2">
            <Input placeholder="Nº" />
          </Field>
          <Field label="Complemento" className="sm:col-span-4">
            <Input placeholder="Sala, andar…" />
          </Field>
          <Field label="Bairro" className="sm:col-span-2">
            <Input value={addr.neighborhood} onChange={(e) => setAddr({ ...addr, neighborhood: e.target.value })} />
          </Field>
          <Field label="Cidade" className="sm:col-span-3">
            <Input value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} />
          </Field>
          <Field label="UF" className="sm:col-span-1">
            <Input value={addr.state} onChange={(e) => setAddr({ ...addr, state: e.target.value })} maxLength={2} />
          </Field>
        </div>
      </SubBlock>
    </SettingsCard>
  )
}

/* ----------------------- Dados Bancários ------------------------------ */

const MAX_ACCOUNTS = 3

export function BankSection() {
  const [accounts, setAccounts] = useState<BankAccount[]>(initialBankAccounts)
  const [open, setOpen] = useState(false)
  const atLimit = accounts.length >= MAX_ACCOUNTS

  function setPrimary(id: number) {
    setAccounts((list) => list.map((a) => ({ ...a, primary: a.id === id })))
  }
  function remove(id: number) {
    setAccounts((list) => list.filter((a) => a.id !== id))
  }
  function addAccount() {
    if (accounts.length >= MAX_ACCOUNTS) return
    const id = Math.max(0, ...accounts.map((a) => a.id)) + 1
    setAccounts((list) => [
      ...list,
      { id, bank: 'Banco do Brasil (001)', agency: '1234', account: '00000-0', type: 'Corrente', pixType: 'CNPJ', pixKey: '12.345.678/0001-90', primary: false, status: 'Em validação' },
    ])
    setOpen(false)
  }

  return (
    <SettingsCard
      id="bancario"
      title="Dados Bancários"
      description="Contas para liquidação. Ao adicionar uma conta, enviamos R$ 0,01 (ou micro-Pix) para confirmar a titularidade."
      action={
        <Button
          size="sm"
          onClick={() => setOpen(true)}
          disabled={atLimit}
          title={atLimit ? `Limite de ${MAX_ACCOUNTS} contas atingido` : undefined}
        >
          <Plus className="h-4 w-4" /> Adicionar conta
        </Button>
      }
    >
      <div className="space-y-3">
        {accounts.map((a) => (
          <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card-muted/30 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card-muted text-muted">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{a.bank}</p>
                  {a.primary && <Badge tone="info"><Star className="h-3 w-3" /> Principal</Badge>}
                  {a.status === 'Em validação' ? (
                    <Badge tone="warning">Em validação</Badge>
                  ) : (
                    <Badge tone="success">Validada</Badge>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  Ag. {a.agency} · Conta {a.account} · {a.type} · Pix ({a.pixType}): {a.pixKey}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {!a.primary && a.status === 'Validada' && (
                <Button size="sm" variant="outline" onClick={() => setPrimary(a.id)}>
                  Definir principal
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => remove(a.id)} aria-label="Remover conta">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {accounts.length === 0 && (
          <p className="py-6 text-center text-sm text-muted">Nenhuma conta cadastrada.</p>
        )}
      </div>

      <p className="mt-3 text-xs text-faint">
        <span className="font-medium text-muted">{accounts.length} de {MAX_ACCOUNTS}</span> contas cadastradas.
        {atLimit && ' Remova uma conta para adicionar outra.'}
      </p>

      <Modal open={open} title="Adicionar conta bancária" onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <Field label="Banco">
            <Select defaultValue="">
              <option value="" disabled>Selecione o banco</option>
              <option>Banco do Brasil (001)</option>
              <option>Itaú (341)</option>
              <option>Bradesco (237)</option>
              <option>Nubank (260)</option>
              <option>Inter (077)</option>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Agência"><Input placeholder="0000" /></Field>
            <Field label="Conta"><Input placeholder="00000-0" /></Field>
          </div>
          <Field label="Tipo de conta">
            <div className="flex gap-2">
              <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input type="radio" name="acctype" defaultChecked className="accent-[rgb(var(--primary))]" /> Corrente
              </label>
              <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input type="radio" name="acctype" className="accent-[rgb(var(--primary))]" /> Poupança
              </label>
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tipo de chave Pix">
              <Select defaultValue="cnpj">
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
                <option value="email">E-mail</option>
                <option value="phone">Telefone</option>
                <option value="random">Aleatória</option>
              </Select>
            </Field>
            <Field label="Chave Pix"><Input placeholder="Sua chave" /></Field>
          </div>
          <p className="rounded-xl bg-card-muted/50 px-3 py-2.5 text-xs text-muted">
            Vamos enviar <span className="font-medium text-foreground">R$ 0,01</span> via Pix para confirmar a titularidade antes de liberar a conta.
          </p>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button size="sm" onClick={addAccount}>Adicionar conta</Button>
          </div>
        </div>
      </Modal>
    </SettingsCard>
  )
}

/* ------------------------------ Webhooks ------------------------------ */

export function WebhooksSection() {
  const [active, setActive] = useState(true)
  const [selected, setSelected] = useState<string[]>(['payment.approved', 'balance.settled'])

  function toggleEvent(ev: string) {
    setSelected((s) => (s.includes(ev) ? s.filter((e) => e !== ev) : [...s, ev]))
  }

  return (
    <SettingsCard
      id="webhooks"
      title="Webhooks"
      description="Receba eventos em tempo real no seu endpoint."
      action={
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted">{active ? 'Ativo' : 'Inativo'}</span>
          <Switch checked={active} onChange={setActive} />
        </div>
      }
    >
      <div className="space-y-6">
        <SubBlock>
          <Field label="URL do endpoint">
            <div className="flex flex-wrap gap-2">
              <Input defaultValue="https://api.seusite.com/webhooks/nummo" className="flex-1" />
              <Button variant="outline" size="sm">
                <Send className="h-4 w-4" /> Testar
              </Button>
            </div>
          </Field>
        </SubBlock>

        <SubBlock title="Eventos">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {webhookEvents.map((ev) => {
              const on = selected.includes(ev.id)
              return (
                <button
                  key={ev.id}
                  onClick={() => toggleEvent(ev.id)}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition-colors',
                    on ? 'border-primary bg-primary/5 text-foreground' : 'border-border text-muted hover:bg-card-muted/50',
                  )}
                >
                  {ev.label}
                  <span className={cn('flex h-4 w-4 items-center justify-center rounded border', on ? 'border-primary bg-primary text-primary-foreground' : 'border-border')}>
                    {on && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                </button>
              )
            })}
          </div>
        </SubBlock>
      </div>
    </SettingsCard>
  )
}

/* ------------------------------- Equipe ------------------------------- */

export function TeamSection() {
  const [members, setMembers] = useState(initialMembers)

  return (
    <SettingsCard id="equipe" title="Equipe" description="Convide membros e defina o que cada um pode fazer.">
      <div className="space-y-6">
        {/* convidar */}
        <SubBlock>
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Convidar por e-mail" className="min-w-[200px] flex-1">
              <Input type="email" placeholder="nome@email.com" />
            </Field>
            <Field label="Papel" className="w-40">
              <Select defaultValue="Financeiro">
                {roles.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </Select>
            </Field>
            <Button>
              <UserPlus className="h-4 w-4" /> Enviar convite
            </Button>
          </div>
        </SubBlock>

        {/* membros */}
        <SubBlock title="Membros">
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card-muted/30 p-3.5">
                <div className="flex items-center gap-3">
                  {m.status === 'Ativo' ? (
                    <Avatar name={m.name} seed={m.avatarSeed} size={38} />
                  ) : (
                    <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-card-muted text-muted">
                      <Mails className="h-4 w-4" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">{m.status === 'Ativo' ? m.name : m.email}</p>
                    <p className="text-xs text-muted">{m.status === 'Ativo' ? m.email : 'Convite pendente'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={m.role === 'Administrador' ? 'info' : 'neutral'}>{m.role}</Badge>
                  {m.status === 'Convite pendente' && (
                    <Button size="sm" variant="outline">Reenviar</Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setMembers((l) => l.filter((x) => x.id !== m.id))} aria-label="Remover membro">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </SubBlock>

        {/* permissões */}
        <SubBlock title="Permissões por papel">
          <div className="scrollbar-thin overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-border bg-card-muted/30 text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Permissão</th>
                  {roles.map((r) => (
                    <th key={r} className="px-3 py-3 text-center text-xs font-semibold text-muted">{r}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.map((p) => (
                  <tr key={p.capability} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3 text-foreground">{p.capability}</td>
                    {roles.map((r) => (
                      <td key={r} className="px-3 py-3 text-center">
                        {p.access[r] ? (
                          <Check className="mx-auto h-4 w-4 text-positive" strokeWidth={2.5} />
                        ) : (
                          <X className="mx-auto h-4 w-4 text-faint" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SubBlock>

        {/* auditoria */}
        <SubBlock title="Log de ações (auditoria)">
          <div className="space-y-2">
            {auditLog.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-2.5 text-sm">
                <div>
                  <span className="font-medium text-foreground">{a.member}</span>
                  <span className="text-muted"> — {a.action}</span>
                </div>
                <span className="shrink-0 text-xs text-muted">{a.datetime}</span>
              </div>
            ))}
          </div>
        </SubBlock>
      </div>
    </SettingsCard>
  )
}

/* --------------------- Notificações da Conta -------------------------- */

export function AccountNotificationsSection() {
  const [lowBalance, setLowBalance] = useState(true)
  const [chargeback, setChargeback] = useState(true)
  const [dispute, setDispute] = useState(false)

  return (
    <SettingsCard id="notif-conta" title="Notificações da Conta" description="Alertas operacionais e financeiros do seller.">
      <div className="-mb-3 divide-y divide-border">
        <ToggleRow
          icon={<Wallet className="h-5 w-5" />}
          label="Alerta de saldo baixo"
          description="Avisar quando o saldo ficar abaixo de um valor."
          checked={lowBalance}
          onChange={setLowBalance}
        />

        <ToggleRow
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Aviso de chargeback aberto"
          description="Receba um alerta assim que um chargeback for aberto."
          checked={chargeback}
          onChange={setChargeback}
        />

        <ToggleRow
          icon={<Gavel className="h-5 w-5" />}
          label="Notificação de nova disputa"
          description="Seja avisado quando uma nova disputa for registrada."
          checked={dispute}
          onChange={setDispute}
        />
      </div>
    </SettingsCard>
  )
}
