import { useId, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import { useSession } from '../../../hooks/useSession'
import { deleteAddress, listAddresses, saveAddress } from '../../../service/addresses'
import type { Address, SavedAddress } from '../../../types/order'
import { AddressForm } from '../orders/AddressForm'
import { Modal } from '../Modal'
import { Button } from '../Button'
import { ErrorMessage } from '../feedback'

export function AddressBook({ value, onSelect, error }: { value?: string; onSelect?: (id: string) => void; error?: string }) {
  const session = useSession()
  const client = useQueryClient()
  const group = useId()
  const [editing, setEditing] = useState<SavedAddress | null | undefined>()
  const [removing, setRemoving] = useState<SavedAddress | null>(null)
  const query = useQuery({ queryKey: ['addresses', session.data?.id], queryFn: listAddresses, enabled: !!session.data, retry: false })
  const save = useMutation({ mutationFn: (address: Address) => saveAddress(address, editing?.id), onSuccess: async (data) => {
    await client.invalidateQueries({ queryKey: ['addresses'] }); onSelect?.(data.id); setEditing(undefined)
  } })
  const remove = useMutation({ mutationFn: (id: string) => deleteAddress(id), onSuccess: async (_, id) => {
    await client.invalidateQueries({ queryKey: ['addresses'] }); if (value === id) onSelect?.(''); setRemoving(null)
  } })
  return <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-xl font-bold"><MapPin size={20} className="text-primary-700" />{onSelect ? 'Endereço de entrega' : 'Meus endereços'}{onSelect && <span className="text-danger-dark">*</span>}</h2><Button tone="info" disabled={query.isPending || (query.data?.length ?? 0) >= 20} onClick={() => { save.reset(); setEditing(null) }}><Plus size={16} />Novo endereço</Button></div>
    <p className="mb-5 text-sm text-text-muted">Até 20 endereços na sua conta. Alterações não mudam a entrega de pedidos anteriores.</p>
    {query.isPending && <p role="status">Carregando endereços…</p>}
    <ErrorMessage error={query.error} />{query.isError && <Button tone="info" onClick={() => query.refetch()}>Tentar novamente</Button>}
    {query.data?.length === 0 && <p className="rounded-xl border border-dashed border-border-strong p-6 text-center text-text-muted">Cadastre seu primeiro endereço para continuar.</p>}
    <div className="grid gap-3 sm:grid-cols-2">{query.data?.map((address) => <article key={address.id} className={`rounded-xl border p-4 transition ${value === address.id ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-300' : 'border-border hover:border-primary-400'}`}>
      <label className={`flex items-start gap-3 ${onSelect ? 'cursor-pointer' : ''}`}>
        {onSelect && <input type="radio" name={group} value={address.id} checked={value === address.id} onChange={() => onSelect(address.id)} className="mt-1 accent-primary-700" aria-invalid={!!error} />}
        <span className="min-w-0 text-sm leading-6"><strong className="block text-text-primary">{address.recipient_name}</strong><span className="block break-words text-text-secondary">{address.street}, {address.number} {address.complement}</span><span className="block text-text-secondary">{address.neighborhood} · {address.city}/{address.state}</span><span className="block text-text-muted">{address.postal_code} · {address.country}</span></span>
      </label>
      <div className="mt-4 flex justify-end gap-2 border-t border-border pt-3"><Button tone="info" aria-label={`Editar endereço de ${address.recipient_name}`} onClick={() => { save.reset(); setEditing(address) }}><Pencil size={15} />Editar</Button><Button tone="neutral" className="hover:border-danger hover:bg-danger-light hover:text-danger-dark" aria-label={`Excluir endereço de ${address.recipient_name}`} onClick={() => { remove.reset(); setRemoving(address) }}><Trash2 size={15} /></Button></div>
    </article>)}</div>
    {error && <p role="alert" className="mt-2 text-sm font-medium text-danger-dark">{error}</p>}
    {editing !== undefined && <Modal closeOnBackdrop={false} busy={save.isPending} title={editing ? 'Editar endereço' : 'Novo endereço'} onClose={() => { if (!save.isPending) setEditing(undefined) }}><ErrorMessage error={save.error} /><AddressForm key={editing?.id ?? 'new'} initial={editing ?? undefined} pending={save.isPending} onSubmit={(address) => save.mutate(address)} submitLabel="Salvar endereço" /></Modal>}
    {removing && <Modal title="Excluir endereço?" onClose={() => { if (!remove.isPending) setRemoving(null) }}><p className="text-text-secondary">Excluir o endereço de {removing.recipient_name}? Os pedidos anteriores manterão os dados da entrega.</p><ErrorMessage error={remove.error} /><div className="mt-6 flex justify-end gap-3"><Button tone="neutral" disabled={remove.isPending} onClick={() => setRemoving(null)}>Cancelar</Button><Button tone="danger" disabled={remove.isPending} onClick={() => remove.mutate(removing.id)}>{remove.isPending ? 'Excluindo…' : 'Confirmar exclusão'}</Button></div></Modal>}
  </section>
}
