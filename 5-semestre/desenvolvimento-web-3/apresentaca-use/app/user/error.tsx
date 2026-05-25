'use client';

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
    return (
        <div className="flex flex-col flex-1 items-center justify-center min-h-[calc(100vh-100px)] font-sans text-zinc-800 dark:text-zinc-200 p-4">
            <div className="flex flex-col items-center gap-6 p-10 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-red-200 dark:border-red-900/50 max-w-md w-full text-center">
                <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center mb-2">
                    <span className="text-red-600 dark:text-red-400 text-5xl font-bold font-serif">!</span>
                </div>
                <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">Ocorreu um erro</h1>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 font-medium tracking-wide">
                    Algo deu errado ao buscar os dados da aplicação.
                </p>
                <p 
                className="text-zinc-500 dark:text-zinc-400 p-3 rounded border-2 border-dashed border-red-300 dark:border-red-700/50 bg-red-100 dark:bg-red-900/10 text-sm font-mono">
                    {error.message}
                </p>
                <div className="flex flex-col gap-4 w-full mt-4">
                    <button 
                        onClick={() => reset()}
                        className="w-full text-xl font-bold p-4 flex items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all active:scale-95"
                    >
                        Tentar novamente
                    </button>
                    <Link 
                        href="/" 
                        className="w-full text-xl font-bold p-4 flex items-center justify-center rounded-lg bg-zinc-200 text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95"
                    >
                        Voltar para a Home
                    </Link>
                </div>
            </div>
        </div>
    );
}