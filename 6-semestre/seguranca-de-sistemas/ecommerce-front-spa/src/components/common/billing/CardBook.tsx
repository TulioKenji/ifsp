import { useId, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CreditCard as CardIcon, Plus, Trash2 } from 'lucide-react'
import { useSession } from '../../../hooks/useSession'
import { useForm } from '../../../hooks/useForm'
import { addCard, listCards, removeCard } from '../../../service/billing'
import { CardFormSchema, PasswordSchema, type CardFormValues, type CreditCard } from '../../../schemas/billing'
import { cardExpired } from '../../../utils/personal'
import { Modal } from '../Modal'
import { Button } from '../Button'
import { Field, Form } from '../forms/Form'
import { ErrorMessage } from '../feedback'

export function CardBook({ value, onSelect, error }: { value?: string; onSelect?: (id: string) => void; error?: string }) {
  const session = useSession(), client = useQueryClient(), group = useId()
  const [adding, setAdding] = useState(false), [removing, setRemoving] = useState<CreditCard | null>(null), [busy, setBusy] = useState(false)
  const query = useQuery({ queryKey: ['cards', session.data?.id], queryFn: listCards, enabled: !!session.data, gcTime: 0, retry: false })
  const refresh = () => client.invalidateQueries({ queryKey: ['cards', session.data?.id] })
  return <section className="rounded-2xl border border-border bg-surface p-6"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-xl font-bold"><CardIcon className="text-primary-700" size={20} />{onSelect ? 'Cartão da compra' : 'Meus cartões'}{onSelect && <span className="text-danger-dark">*</span>}</h2><Button tone="info" disabled={query.isPending || (query.data?.length ?? 0) >= 10} onClick={() => setAdding(true)}><Plus size={16} />Adicionar cartão</Button></div>
    <p className="mb-5 text-sm text-text-muted">Até 10 cartões. Ambiente acadêmico: use cartões de teste. Nenhuma cobrança é realizada.</p>
    {query.isPending && <p role="status">Carregando cartões…</p>}<ErrorMessage error={query.error} />{query.isError && <Button tone="info" onClick={() => query.refetch()}>Tentar novamente</Button>}
    {query.data?.length === 0 && <p className="rounded-xl border border-dashed border-border-strong p-6 text-center text-text-muted">Cadastre um cartão para concluir a compra.</p>}
    <div role={onSelect ? 'radiogroup' : undefined} aria-label="Cartões salvos" aria-describedby={error ? `${group}-error` : undefined} className="grid gap-3 sm:grid-cols-2">{query.data?.map((card) => {
      const expired = cardExpired(card.exp_month, card.exp_year)
      return <article key={card.id} className={`rounded-xl border p-4 transition ${value === card.id ? 'border-primary-600 bg-primary-50' : 'border-border hover:border-primary-400'}`}><label className={`flex items-start gap-3 ${onSelect && !expired ? 'cursor-pointer' : ''}`}>
        {onSelect && <input type="radio" className="mt-1 accent-primary-700" name={group} checked={value === card.id} disabled={expired} onChange={() => onSelect(card.id)} aria-invalid={!!error} />}
        <span><strong className="block">{card.brand} •••• {card.last4}</strong><span className="mt-1 block text-sm text-text-muted">Validade {String(card.exp_month).padStart(2, '0')}/{card.exp_year}</span>{expired && <span className="mt-1 block text-sm text-danger-dark">Cartão expirado</span>}</span></label>
        <div className="mt-4 flex justify-end border-t border-border pt-3"><Button tone="neutral" className="hover:border-danger hover:bg-danger-light hover:text-danger-dark" aria-label={`Excluir ${card.brand} final ${card.last4}`} onClick={() => setRemoving(card)}><Trash2 size={16} />Excluir</Button></div></article>
    })}</div>
    {error && <p id={`${group}-error`} role="alert" className="mt-2 text-sm font-medium text-danger-dark">{error}</p>}
    {adding && <Modal closeOnBackdrop={false} busy={busy} title="Adicionar cartão" onClose={() => { if (!busy) setAdding(false) }}><CardEditor setBusy={setBusy} onSaved={async (card) => { await refresh(); onSelect?.(card.id); setAdding(false) }} /></Modal>}
    {removing && <Modal closeOnBackdrop={false} busy={busy} title={`Excluir cartão final ${removing.last4}?`} onClose={() => { if (!busy) setRemoving(null) }}><p className="mb-5 text-text-secondary">Pedidos anteriores mantêm a referência mascarada. Confirme sua senha para excluir este cartão.</p><RemoveCardForm id={removing.id} setBusy={setBusy} onSaved={async () => { await refresh(); if (value === removing.id) onSelect?.(''); setRemoving(null) }} /></Modal>}
  </section>
}
function CardEditor({ onSaved, setBusy }: { onSaved: (card: CreditCard) => Promise<void>; setBusy: (busy: boolean) => void }) {
  const form = useForm({ initial: { number: '', holder_name: '', exp_month: '', exp_year: '', current_password: '' }, schema: CardFormSchema })
  const save = useMutation({ mutationFn: (values: CardFormValues) => addCard(values), gcTime: 0, retry: false, onMutate: () => setBusy(true), onSettled: () => setBusy(false), onSuccess: onSaved })
  return <Form onSubmit={form.submit((data) => { if (!save.isPending) save.mutate(data) })}><p className="mb-5 text-sm text-text-muted">Use apenas dados de teste. Não solicitamos CVV. Campos com * são obrigatórios.</p><fieldset disabled={save.isPending} className="space-y-5"><Field {...form.field('number')} label="Número do cartão" mask="card" required inputMode="numeric" maxLength={24} autoComplete="off" placeholder="4242 4242 4242 4242" /><Field {...form.field('holder_name')} label="Nome do titular" required maxLength={150} autoComplete="off" /><div className="grid grid-cols-2 gap-4"><Field {...form.field('exp_month')} label="Mês" mask="month" required inputMode="numeric" maxLength={2} placeholder="MM" /><Field {...form.field('exp_year')} label="Ano" mask="year" required inputMode="numeric" maxLength={4} placeholder="AAAA" /></div><Field {...form.field('current_password')} label="Sua senha atual" required type="password" autoComplete="current-password" /><ErrorMessage error={save.error} /><Button type="submit" className="w-full" disabled={save.isPending}>{save.isPending ? 'Salvando…' : 'Adicionar cartão'}</Button></fieldset></Form>
}
function RemoveCardForm({ id, onSaved, setBusy }: { id: string; onSaved: () => Promise<void>; setBusy: (busy: boolean) => void }) {
  const form = useForm({ initial: { current_password: '' }, schema: PasswordSchema })
  const remove = useMutation({ mutationFn: (password: string) => removeCard(id, password), gcTime: 0, retry: false, onMutate: () => setBusy(true), onSettled: () => setBusy(false), onSuccess: onSaved })
  return <Form onSubmit={form.submit((data) => { if (!remove.isPending) remove.mutate(data.current_password) })}><Field {...form.field('current_password')} label="Senha atual" required disabled={remove.isPending} type="password" autoComplete="current-password" /><ErrorMessage error={remove.error} /><Button className="mt-5 w-full" tone="danger" type="submit" disabled={remove.isPending}>{remove.isPending ? 'Excluindo…' : 'Confirmar exclusão'}</Button></Form>
}
