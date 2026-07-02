import { useRef, useState } from 'react'
import {
  Camera,
  Trash2,
  ShieldCheck,
  Smartphone,
  KeyRound,
  Monitor,
  LogOut,
  Check,
  Eye,
  EyeOff,
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
  maskPhone,
} from './primitives'
import { cn } from '../../lib/utils'
import {
  activeSessions,
  personalNotifEvents,
} from '../../data/settingsData'

/* ------------------------- Dados Pessoais ----------------------------- */

export function ProfileSection() {
  const [photo, setPhoto] = useState<string | null>(null)
  const [phone, setPhone] = useState('(11) 98765-4321')
  const fileRef = useRef<HTMLInputElement>(null)

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setPhoto(URL.createObjectURL(file))
  }

  return (
    <SettingsCard
      id="perfil"
      title="Dados Pessoais"
      description="Suas informações de perfil e preferências da conta."
      action={<Button size="sm">Salvar alterações</Button>}
    >
      {/* foto */}
      <div className="mb-6 flex flex-wrap items-center gap-5 border-b border-border pb-6">
        {photo ? (
          <img src={photo} alt="Foto de perfil" className="h-20 w-20 rounded-full object-cover ring-2 ring-border" />
        ) : (
          <Avatar name="Pristia Candra" seed={31} size={80} />
        )}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
              <Camera className="h-4 w-4" /> Enviar foto
            </Button>
            {photo && (
              <Button size="sm" variant="ghost" onClick={() => setPhoto(null)}>
                <Trash2 className="h-4 w-4" /> Remover
              </Button>
            )}
          </div>
          <p className="text-xs text-muted">JPG ou PNG, até 2MB. Recomendado 400×400px.</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPick} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Nome completo">
          <Input defaultValue="Pristia Candra" placeholder="Seu nome" />
        </Field>
        <Field label="E-mail">
          <Input type="email" defaultValue="pristia@nummo.com" />
        </Field>
        <Field label="Telefone / WhatsApp">
          <Input value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} inputMode="numeric" />
        </Field>
        <Field label="Cargo / função">
          <Input defaultValue="Administradora" />
        </Field>
        <Field label="Idioma preferido">
          <Select defaultValue="pt-BR">
            <option value="pt-BR">Português (Brasil)</option>
            <option value="en">English</option>
            <option value="es">Español</option>
          </Select>
        </Field>
        <Field label="Fuso horário">
          <Select defaultValue="brasilia">
            <option value="brasilia">(GMT-03:00) Brasília</option>
            <option value="manaus">(GMT-04:00) Manaus</option>
            <option value="noronha">(GMT-02:00) Fernando de Noronha</option>
            <option value="rio-branco">(GMT-05:00) Rio Branco</option>
            <option value="buenos-aires">(GMT-03:00) Buenos Aires</option>
            <option value="new-york">(GMT-05:00) Nova York</option>
            <option value="mexico-city">(GMT-06:00) Cidade do México</option>
            <option value="los-angeles">(GMT-08:00) Los Angeles</option>
            <option value="lisbon">(GMT+00:00) Lisboa</option>
            <option value="paris">(GMT+01:00) Paris</option>
          </Select>
        </Field>
      </div>
    </SettingsCard>
  )
}

/* ----------------------------- Segurança ------------------------------ */

function PasswordInput({ placeholder, label }: { placeholder: string; label: string }) {
  const [show, setShow] = useState(false)
  return (
    <Field label={label}>
      <div className="relative">
        <Input type={show ? 'text' : 'password'} placeholder={placeholder} className="pr-10" />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
          aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </Field>
  )
}

export function SecuritySection() {
  const [twoFA, setTwoFA] = useState(true)
  // nenhum método pré-selecionado; ao ativar o 2FA o usuário escolhe
  const [method, setMethod] = useState<'app' | 'sms' | null>(null)

  return (
    <SettingsCard id="seguranca" title="Segurança" description="Senha, verificação em duas etapas e sessões.">
      <div className="space-y-6">
        {/* senha */}
        <SubBlock title="Alterar senha">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <PasswordInput label="Senha atual" placeholder="••••••••" />
            <PasswordInput label="Nova senha" placeholder="••••••••" />
            <PasswordInput label="Confirmar nova senha" placeholder="••••••••" />
          </div>
          <div className="mt-4">
            <Button size="sm">
              <KeyRound className="h-4 w-4" /> Atualizar senha
            </Button>
          </div>
        </SubBlock>

        {/* 2FA */}
        <SubBlock title="Autenticação em dois fatores (2FA)">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card-muted/40 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Verificação em duas etapas</p>
                <p className="mt-0.5 text-xs text-muted">
                  Uma camada extra de segurança ao entrar na conta.
                </p>
              </div>
            </div>
            <Switch
              checked={twoFA}
              onChange={(v) => {
                setTwoFA(v)
                if (!v) setMethod(null) // ao desligar, esquece o método (religar começa sem seleção)
              }}
            />
          </div>

          {/* sempre visível; com o 2FA desativado fica esmaecido e sem clique */}
          <div className={cn('mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2', !twoFA && 'opacity-40')}>
            {(
              [
                { id: 'app', label: 'App autenticador', desc: 'Google Authenticator, Authy…', icon: ShieldCheck },
                { id: 'sms', label: 'SMS', desc: 'Código enviado por mensagem', icon: Smartphone },
              ] as const
            ).map((opt) => {
              // só conta como selecionado quando o 2FA está ativo
              const isSelected = twoFA && method === opt.id
              return (
                <button
                  key={opt.id}
                  onClick={() => setMethod(opt.id)}
                  disabled={!twoFA}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors disabled:cursor-not-allowed',
                    isSelected ? 'border-primary bg-primary/5' : 'border-border',
                    twoFA && !isSelected && 'hover:bg-card-muted/50',
                  )}
                >
                  <opt.icon className={cn('h-5 w-5', isSelected ? 'text-primary' : 'text-muted')} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted">{opt.desc}</p>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                </button>
              )
            })}
          </div>
        </SubBlock>

        {/* sessões */}
        <SubBlock title="Sessões ativas">
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-2.5 pr-3 font-semibold">Dispositivo</th>
                  <th className="px-3 py-2.5 font-semibold">IP / Local</th>
                  <th className="px-3 py-2.5 font-semibold">Último acesso</th>
                  <th className="py-2.5 pl-3" />
                </tr>
              </thead>
              <tbody>
                {activeSessions.map((s) => (
                  <tr key={s.id} className="border-b border-border/60 last:border-0">
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2.5">
                        <Monitor className="h-4 w-4 text-muted" />
                        <div>
                          <p className="font-medium text-foreground">{s.device}</p>
                          <p className="text-xs text-muted">{s.browser}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted">
                      <p>{s.ip}</p>
                      <p className="text-xs">{s.location}</p>
                    </td>
                    <td className="px-3 py-3 text-muted">{s.lastAccess}</td>
                    <td className="py-3 pl-3 text-right">
                      {s.current ? (
                        <Badge tone="success">Esta sessão</Badge>
                      ) : (
                        <Button size="sm" variant="danger">
                          <LogOut className="h-3.5 w-3.5" /> Encerrar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SubBlock>
      </div>
    </SettingsCard>
  )
}

/* --------------------- Notificações Pessoais -------------------------- */

const VALOR_OPTS = ['Total', 'Comissão', 'Esconder'] as const
const NOME_OPTS = ['Mostrar', 'Abreviar', 'Esconder'] as const
type ValorOpt = (typeof VALOR_OPTS)[number]
type NomeOpt = (typeof NOME_OPTS)[number]

/** Seletor segmentado (2–3 opções) no estilo do sistema. */
function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex w-full rounded-xl border border-border bg-card-muted/40 p-1 text-sm sm:w-[300px]">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            'flex-1 rounded-lg px-3 py-1.5 text-center font-medium transition-colors',
            value === opt ? 'bg-card text-foreground shadow-sm' : 'text-muted hover:text-foreground',
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

export function PersonalNotificationsSection() {
  // um liga/desliga por evento
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(personalNotifEvents.map((e) => [e.key, true] as [string, boolean])),
  )
  // configuração global — vale para todas as notificações
  const [valorVenda, setValorVenda] = useState<ValorOpt>('Total')
  const [nomeProduto, setNomeProduto] = useState<NomeOpt>('Mostrar')

  return (
    <SettingsCard
      id="notif-pessoais"
      title="Notificações Pessoais (Push)"
      description="Ative os eventos que você quer receber e defina o que aparece em cada notificação."
    >
      {/* eventos — um botão de ativar/desativar por evento */}
      <div className="divide-y divide-border">
        {personalNotifEvents.map((ev) => (
          <div key={ev.key} className="flex items-center justify-between gap-4 py-3.5 first:pt-0">
            <span className="text-sm font-medium text-foreground">{ev.label}</span>
            <Switch checked={enabled[ev.key]} onChange={(v) => setEnabled((s) => ({ ...s, [ev.key]: v }))} />
          </div>
        ))}
      </div>

      {/* conteúdo da notificação — configuração global */}
      <SubBlock title="Conteúdo da notificação">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Valor da venda</p>
              <p className="mt-0.5 text-xs text-muted">O que exibir como valor na notificação.</p>
            </div>
            <Segmented options={VALOR_OPTS} value={valorVenda} onChange={setValorVenda} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Nome do produto</p>
              <p className="mt-0.5 text-xs text-muted">Mostrar ou ocultar o nome do produto.</p>
            </div>
            <Segmented options={NOME_OPTS} value={nomeProduto} onChange={setNomeProduto} />
          </div>
        </div>
      </SubBlock>
    </SettingsCard>
  )
}
