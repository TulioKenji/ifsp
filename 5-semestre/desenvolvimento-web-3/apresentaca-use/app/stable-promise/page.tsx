export default async function Page() {
    return (
        <div
            className="flex flex-col flex-1 items-center justify-center min-h-screen bg-black p-20 gap-10"
        >
                <h1 className="text-3xl font-bold text-center text-orange-600 dark:text-orange-400">
                    O componente é uma função, a renderização é a execução dessa função.
                </h1>
            <div className="w-full flex flex-col items-center gap-6 p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800">
                <h1 className="text-4xl font-bold text-center text-blue-600 dark:text-blue-400">
                    Fetch dentro do client component
                </h1>
                <div className="flex flex-col items-center text-center gap-2 font-medium w-full">
                    <div className="w-full px-6 py-3 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border border-green-300 dark:border-green-800/50">
                        Renderiza o componente (executa função)
                    </div>
                    <span className="text-zinc-400 text-2xl leading-none">↓</span>
                    <div className="w-full px-6 py-3 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border border-green-300 dark:border-green-800/50">
                        Cai no use e começa o fetch
                    </div>
                    <span className="text-zinc-400 text-2xl leading-none">↓</span>
                    <div className="w-full px-6 py-3 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border border-green-300 dark:border-green-800/50">
                        Retorna suspense
                    </div>
                    <span className="text-zinc-400 text-2xl leading-none">↓</span>
                    <div className="w-full px-6 py-3 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border border-green-300 dark:border-green-800/50">
                        Termina o fetch
                    </div>
                    <span className="text-zinc-400 text-2xl leading-none">↓</span>
                    <div className="w-full px-6 py-3 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border border-green-300 dark:border-green-800/50">
                        Renderiza novamente o componente (fetch antigo não tem referência na memória)
                    </div>
                    <span className="text-zinc-400 text-2xl leading-none">↓</span>
                    <div className="w-full px-6 py-3 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border border-green-300 dark:border-green-800/50">
                        Cai novamente no use, começa outro fetch
                    </div>
                    <span className="text-zinc-400 text-2xl leading-none">↓</span>
                    <div className="w-full px-6 py-3 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border border-green-300 dark:border-green-800/50">
                        Entra em loop infinito de renderização
                    </div>
                </div>
            </div>
            <div className="w-full flex flex-col items-center gap-6 p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800">
                <h1 className="text-4xl font-bold text-center text-blue-600 dark:text-blue-400">
                    Fetch passado por props<br/> (Streaming de dados do servidor para o cliente)
                </h1>
                
                <div className="flex flex-col items-center text-center gap-2 font-medium w-full">
                    <div className="w-full px-6 py-3 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border border-green-300 dark:border-green-800/50">
                        Renderiza o componente (executa função)
                    </div>
                    <span className="text-zinc-400 text-2xl leading-none">↓</span>
                    <div className="w-full px-6 py-3 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border border-green-300 dark:border-green-800/50">
                        Cai no use e começa o fetch
                    </div>
                   <span className="text-zinc-400 text-2xl leading-none">↓</span>
                   <div className="w-full px-6 py-3 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border border-green-300 dark:border-green-800/50">
                        Retorna suspense
                    </div>
                    <span className="text-zinc-400 text-2xl leading-none">↓</span>
                    <div className="w-full px-6 py-3 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border border-green-300 dark:border-green-800/50">
                        Termina o fetch
                    </div>
                    <span className="text-zinc-400 text-2xl leading-none">↓</span>
                    <div className="w-full px-6 py-3 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border border-green-300 dark:border-green-800/50">
                        Renderiza novamente o componente (fetch antigo tem referência na memória, nas props, fora do escopo do componente)
                    </div>
                    <span className="text-zinc-400 text-2xl leading-none">↓</span>
                    <div className="w-full px-6 py-3 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border border-green-300 dark:border-green-800/50">
                        Retorna lista de usuários
                    </div>
                </div>
            </div>
        </div>
    );
}