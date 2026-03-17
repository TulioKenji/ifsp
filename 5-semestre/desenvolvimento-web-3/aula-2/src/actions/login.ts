'use server';
import fetchApi from "@/services/fetchApi";
import { cookies } from 'next/headers';
import { LoginRequest, LoginResponse, loginResponseSchema } from "@/types/login";


export default async function loginAction({ username, password }: LoginRequest) {
    const cookieStore = await cookies();

    if (!password || !username) {
        throw new Error('Username e password são obrigatórios');
    }
    try {
        const data = await fetchApi<LoginResponse>({
            url: 'api/login',
            method: 'POST',
            body: JSON.stringify({ username, password }),
            schema: loginResponseSchema
        });


        if (data.authToken) {
            cookieStore.set('authToken', data.authToken, { path: '/', httpOnly: true });
        }
        if (data.username) {
            cookieStore.set('username', data.username, { path: '/' });
        }
        return data;
    } catch (error) {
        throw new Error('Erro ao fazer login', { cause: error });
    }
}