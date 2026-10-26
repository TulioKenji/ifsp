import { useQuery } from '@tanstack/react-query'
import { getSession } from '../service/auth'

export function useSession() {
  return useQuery({ queryKey: ['session'], queryFn: getSession, retry: false, staleTime: 30_000 })
}
