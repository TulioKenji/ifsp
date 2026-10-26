import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ShieldCheck } from 'lucide-react'
import { getProfile, saveProfile } from '../../../service/billing'
import { ProfileInputSchema, type ProfileInput } from '../../../schemas/billing'
import { useSession } from '../../../hooks/useSession'
import { useForm } from '../../../hooks/useForm'
import { Modal } from '../Modal'
import { Field, Form } from '../forms/Form'
import { Button } from '../Button'
import { ErrorMessage } from '../feedback'

export function ProfilePanel() {
  const session = useSession(), client = useQueryClient()
  const [editing, setEditing] = useState(false), [busy, setBusy] = useState(false)
  const query = useQuery({ queryKey: ['profile', session.data?.id], queryFn: getProfile, enabled: !!session.data, retry: false, gcTime: 0 })
  return <section className="rounded-2xl border border-border bg-surface p-6"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-xl font-bold"><ShieldCheck className="text-primary-700" size={20} />Dados pessoais</h2><Button tone="info" onClick={() => setEditing(true)}>{query.data?.complete ? 'Substituir dados' : 'Completar cadastro'}</Button></div>
    <p className="my-4 text-sm text-text-muted">CPF e telefone são necessários para comprar. Use dados fictícios no laboratório.</p>
    {query.isPending && <p role="status">Carregando dados…</p>}<ErrorMessage error={query.error} />{query.isError && <Button tone="info" onClick={() => query.refetch()}>Tentar novamente</Button>}
    {query.data?.complete ? <dl className="grid gap-4 sm:grid-cols-2"><div><dt className="text-sm text-text-muted">CPF</dt><dd className="mt-1 font-bold">{query.data.cpf_masked}</dd></div><div><dt className="text-sm text-text-muted">Telefone</dt><dd className="mt-1 font-bold">{query.data.phone_masked}</dd></div></dl> : query.data && <p className="text-warning-dark">Seu cadastro ainda não tem CPF e telefone.</p>}
    {editing && <Modal closeOnBackdrop={false} busy={busy} title="CPF e telefone" onClose={() => { if (!busy) setEditing(false) }}><ProfileEditor setBusy={setBusy} onSaved={async () => { await client.invalidateQueries({ queryKey: ['profile', session.data?.id] }); setEditing(false) }} /></Modal>}
  </section>
}
function ProfileEditor({ setBusy, onSaved }: { setBusy: (busy: boolean) => void; onSaved: () => Promise<void> }) {
  const form = useForm({ initial: { cpf: '', phone: '', current_password: '' }, schema: ProfileInputSchema })
  // gcTime 0 e desmontagem do editor evitam reter CPF/senha nas variáveis de mutation.
  const save = useMutation({ mutationFn: (values: ProfileInput) => saveProfile(values), gcTime: 0, retry: false, onMutate: () => setBusy(true), onSettled: () => setBusy(false), onSuccess: onSaved })
  return <Form onSubmit={form.submit((values) => { if (!save.isPending) save.mutate(values) })}><p className="mb-5 text-sm text-text-muted">Para cadastrar ou substituir, informe ambos os dados e confirme sua senha. Campos com * são obrigatórios.</p><fieldset disabled={save.isPending} className="space-y-5"><Field {...form.field('cpf')} label="CPF" mask="cpf" required inputMode="numeric" maxLength={14} autoComplete="off" placeholder="000.000.000-00" /><Field {...form.field('phone')} label="Telefone com DDD" mask="phone" required type="tel" maxLength={24} autoComplete="off" placeholder="(11) 99999-9999" /><Field {...form.field('current_password')} label="Senha atual" required type="password" autoComplete="current-password" /><ErrorMessage error={save.error} /><Button type="submit" className="w-full" disabled={save.isPending}>{save.isPending ? 'Salvando…' : 'Salvar dados pessoais'}</Button></fieldset></Form>
}
