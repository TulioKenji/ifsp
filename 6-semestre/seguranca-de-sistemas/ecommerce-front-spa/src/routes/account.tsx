import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { authenticate, logout } from '../service/auth'
import { CredentialsSchema, RegistrationCredentialsSchema } from '../schemas/auth'
import { useForm } from '../hooks/useForm'
import { useSession } from '../hooks/useSession'
import { useCart } from '../stores/cart'
import { useCartModal } from '../stores/cart-modal'
import { ErrorMessage } from '../components/common/feedback'
import { Field, Form } from '../components/common/forms/Form'
import { Button } from '../components/common/Button'
import { AddressBook } from '../components/common/addresses/AddressBook'
import { ProfilePanel } from '../components/common/billing/ProfilePanel'
import { CardBook } from '../components/common/billing/CardBook'

export function AccountPage() {
  const client = useQueryClient(), session = useSession(), cart = useCart()
  const closeModal = useCartModal((s) => s.close)
  const [register, setRegister] = useState(false)
  const schema = register ? RegistrationCredentialsSchema : CredentialsSchema
  const form = useForm({ initial: { email: '', password: '', name: '' }, schema })
  const login = useMutation({ mutationFn: (values: typeof form.values) => authenticate(values, register), onSuccess: async (data) => {
    await Promise.all(['orders', 'addresses', 'cards', 'profile'].map((key) => client.cancelQueries({ queryKey: [key] })))
    for (const key of ['orders', 'addresses', 'cards', 'profile']) client.removeQueries({ queryKey: [key] })
    client.setQueryData(['session'], data); form.setValue('password', '')
  } })
  const exit = useMutation({ mutationFn: logout, onSuccess: async () => {
    await Promise.all(['orders', 'addresses', 'cards', 'profile'].map((key) => client.cancelQueries({ queryKey: [key] })))
    for (const key of ['orders', 'addresses', 'cards', 'profile']) client.removeQueries({ queryKey: [key] })
    client.setQueryData(['session'], null); closeModal(); cart.clear()
  } })
  return <div className="mx-auto w-full max-w-4xl px-5 py-12"><h1 className="mb-6 text-3xl font-bold">Minha conta</h1>
    {session.isPending ? <p role="status">Carregando…</p> : session.data ? <div className="space-y-6"><section className="rounded-2xl border border-border bg-surface p-6"><h2 className="text-xl font-bold">Olá, {session.data.name}</h2><p className="my-3 text-text-secondary">{session.data.email}</p><div className="flex flex-wrap items-center gap-5"><Link to="/pedidos" className="action-link">Meus pedidos →</Link><Link to="/cart" className="action-link">Meu carrinho →</Link><Button tone="neutral" onClick={() => exit.mutate()} disabled={exit.isPending}>{exit.isPending ? 'Saindo…' : 'Sair da conta'}</Button></div><ErrorMessage error={exit.error} /></section><ProfilePanel /><AddressBook /><CardBook /></div> : <div className="mx-auto max-w-lg"><ErrorMessage error={session.error} /><Form onSubmit={form.submit((data) => login.mutate(data))} className="rounded-2xl border border-border bg-surface p-6 sm:p-8"><h2 className="mb-2 text-2xl font-bold">{register ? 'Crie sua conta' : 'Bem-vindo de volta'}</h2><p className="mb-6 text-sm text-text-muted">Campos com <span className="text-danger-dark">*</span> são obrigatórios.</p><fieldset disabled={login.isPending} className="space-y-5">
      {register && <Field {...form.field('name')} label="Nome" required maxLength={150} autoComplete="name" />}
      <Field {...form.field('email')} label="Email" required type="email" autoComplete="username" maxLength={320} />
      <Field {...form.field('password')} label="Senha" required type="password" autoComplete={register ? 'new-password' : 'current-password'} />
      <p className="text-xs leading-5 text-text-muted">{register ? 'Use uma senha com pelo menos 12 caracteres.' : 'Informe a senha da sua conta.'}</p><ErrorMessage error={login.error} /><Button type="submit" className="w-full" disabled={login.isPending}>{login.isPending ? 'Aguarde…' : register ? 'Criar conta e entrar' : 'Entrar'}</Button>
    </fieldset></Form><button disabled={login.isPending} onClick={() => { setRegister(!register); login.reset() }} className="action-link mt-5">{register ? 'Já tenho conta' : 'Quero criar uma conta'}</button></div>}
  </div>
}
