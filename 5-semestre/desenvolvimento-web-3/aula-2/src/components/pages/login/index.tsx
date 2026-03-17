'use client';


import { useAuth } from '@/contexts/authContext';

import { useRouter } from "next/navigation";

export default function Login() {
    const router = useRouter();
    const { login } = useAuth();


    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;
        await login(username, password);
    }

    return (
        <div className="flex flex-col items-center justify-center gap-5 p-5 bg-zinc-50 font-sans border border-zinc-200 rounded-2xl dark:bg-black">
            <h1>Login</h1>
            <form className="flex flex-col items-center justify-center gap-5" onSubmit={handleSubmit}>
                <input required type="text" name="username" placeholder="Username" className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-50" />
                <input required type="password" name="password" placeholder="Password" className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-50" />
                <span className="text-sm text-zinc-400 hover:underline hover:text-zinc-200 self-end hover:cursor-pointer"
                    onClick={() => router.push('/forgot-password')}
                >Esqueci minha senha</span>
                <button type="submit" className="bg-black text-white rounded-md px-4 py-2 border border-zinc-200 hover:bg-zinc-200 hover:text-black transition-all duration-500">Entrar</button>
            </form>
            <p className="text-sm text-zinc-400">Não tem uma conta? <span className="text-zinc-200 hover:underline hover:cursor-pointer" onClick={() => router.push('/register')}>Registrar</span></p>
        </div>
    );
}