'use client';

import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface HomeProps {
    message: string;
}

export default function Home({ message }: HomeProps) {
    const [loading, setLoading] = useState(true);
    const [cookies, setCookies] = useState<{ [key: string]: string }>({});


useEffect(() => {
    const timeout = setTimeout(() => {
        setLoading(false);
    }, 2000);
    const cookieString = document.cookie;
    const cookieArray = cookieString.split(";").map(cookie => cookie.trim());
    const cookieObject: { [key: string]: string } = {};
    cookieArray.forEach(cookie => {
        const [key, value] = cookie.split("=");
        cookieObject[key] = value;
    });
    setCookies(cookieObject);
    document.cookie="testCookie=HelloWorld; username=admin"; // Exemplo de como definir um cookie
    return () => clearTimeout(timeout);
}, [])

    if(loading) {
        return (
            <main className="flex h-full w-full items-center justify-center">
            <ArrowPathIcon className="h-10 w-10 text-zinc-50 animate-spin" />
            <h1 className="text-center text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
                Carregando...
            </h1>
        </main>
        );
    }

    return (
        <main className="flex h-full w-full flex-col items-center justify-center">
            <h1 className="text-center text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
                {message}
            </h1>
            <p>{JSON.stringify(cookies)}</p>
        </main>
    )
}