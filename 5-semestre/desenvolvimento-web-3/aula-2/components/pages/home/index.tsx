'use client';

import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

export default function Home() {
    const [loading, setLoading] = useState(true);


useEffect(() => {
    const timeout = setTimeout(() => {
        setLoading(false);
    }, 2000);
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
                Bem-vindo à Home
            </h1>
        </main>
    )
}