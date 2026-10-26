import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useSession } from '../../hooks/useSession'
import { Button } from './Button'

export function ErrorMessage({ error }: { error: Error | null }) {
  return error ? <p role="alert" className="my-4 rounded-xl bg-danger-light p-4 text-danger-dark">{error.message}</p> : null
}
export function SessionGate({ children }: { children: ReactNode }) {
  const session = useSession()
  if (session.isPending) return <p role="status">Verificando sua sessão…</p>
  if (session.isError) return <><ErrorMessage error={session.error} /><Button tone="info" className="self-start" onClick={() => session.refetch()}>Tentar novamente</Button></>
  if (!session.data) return <p className="rounded-xl border border-border bg-surface p-8">Para continuar, <Link to="/conta" className="action-link">entre na sua conta</Link>.</p>
  return children
}
