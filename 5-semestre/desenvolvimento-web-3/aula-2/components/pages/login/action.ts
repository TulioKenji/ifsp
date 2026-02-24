'use server';
import { LoginRequestBody } from "@/common/interfaces";
import { cookies } from 'next/headers';


export default async function loginAction({username, password}: LoginRequestBody) {
    const cookieStore = await cookies();

    if(!password || !username) {
        throw new Error('Username e password são obrigatórios');
    }
    try{
        const res = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if(data.authToken) {
            cookieStore.set('authToken', data.authToken, { path: '/' });
        }
        if(data.username){
            cookieStore.set('username', data.username, { path: '/' });
        }
        return data;
    } catch (error) {
        throw new Error('Erro ao fazer login', { cause: error });
    }
}