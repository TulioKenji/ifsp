

interface CallApiProps extends RequestInit {
    url: string;
}

interface CallApiResponse<T> {
    status: number;
    data: T | null;
    error?: string;
}
const baseUrl = 'http://localhost:8080/';

export default async function callApi<T>({ url, ...options }: CallApiProps): Promise<CallApiResponse<T>> {
    const finalUrl = baseUrl + (url.startsWith('/') ? url.slice(1) : url);
    try {
        const response = await fetch(finalUrl, options);
        if (!response.ok) {
            return {
                data: null,
                status: response.status,
                error: `Erro na requisição: ${response.statusText}`,
            };
        }
        const data = await response.json();
        return {
            data,
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