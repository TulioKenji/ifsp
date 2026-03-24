'use client';

import React, { createContext, useState, useContext } from 'react';
import { useRouter } from 'next/navigation';

import logoutAction from '@/actions/logout';
import loginAction from '@/actions/login';

import toast from 'react-hot-toast';
import { User } from '@/types/user';

interface AuthContextType {
    logout: () => Promise<void>;
    user: User | null;
}



const AuthContext = createContext<AuthContextType>({
    logout: async () => {},
    user: null
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);

    const login = async (username: string, password: string) => {
        await loginAction({ username, password }).then(() => {
            toast.success('Login realizado com sucesso!');
            setUser({ username });
            router.push('/home');
        }).catch(() => {
            toast.error('Erro ao realizar login. Verifique suas credenciais e tente novamente.');
        });
    };

    const logout = async () => {
        await logoutAction().then(() => {
            toast.success('Logout realizado com sucesso!');
            router.push('/');
        }).catch(() => {
            toast.error('Erro ao realizar logout. Tente novamente.');
        });
    };

    return (
        <AuthContext.Provider value={{ logout, user }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    return context;
}