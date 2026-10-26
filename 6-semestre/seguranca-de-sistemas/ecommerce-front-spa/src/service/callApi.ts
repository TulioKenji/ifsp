

interface CallApiProps extends RequestInit {
    url: string;
}

interface CallApiResponse<T> {
    status: number;
    data: T | null;
    error?: string;
}
// Mesma origem em produção; o proxy do Vite encaminha /api durante o desenvolvimento.
const baseUrl = '/api/';
let csrfToken: string | undefined
export function setCSRFToken(token?: string) { csrfToken = token }

export default async function callApi<T>({ url, ...options }: CallApiProps): Promise<CallApiResponse<T>> {
    const finalUrl = baseUrl + (url.startsWith('/') ? url.slice(1) : url);
    try {
        const headers = new Headers(options.headers)
        if (options.body) headers.set('Content-Type', 'application/json')
        if (csrfToken && !['GET', 'HEAD'].includes(options.method ?? 'GET')) headers.set('X-CSRF-Token', csrfToken)
        const response = await fetch(finalUrl, { ...options, headers, credentials: 'same-origin' });
        // Cadastro (201) e logout (204) podem responder sem corpo.
        const raw = await response.text()
        const data: unknown = raw ? JSON.parse(raw) : null
        if (!response.ok) {
            return {
                data: null,
                status: response.status,
                error: typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string' ? data.error : `Erro na requisição: ${response.status}`,
            };
        }
        return {
            data: data as T | null,
            status: response.status,
            error: undefined,
        } as CallApiResponse<T>;
    } catch (error) {
        return {
            data: null,
            status: 500,
            error: `Erro na requisição: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        };
    }

}
