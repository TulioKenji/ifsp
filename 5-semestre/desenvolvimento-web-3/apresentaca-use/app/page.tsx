import Root from "@/components/pages/root";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {


  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 font-sans dark:bg-black p-8 text-zinc-800 dark:text-zinc-200">
      <main className="grid grid-cols-2 gap-8 w-full max-w-6xl">

        <div className="flex flex-col items-center gap-6 p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800">
          <h1 className="text-4xl font-bold text-center text-blue-600 dark:text-blue-400">
            Suspense
          </h1>
          <div className="flex flex-col items-center text-center gap-2 font-medium w-full">
            <div className="w-full px-6 py-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">Tempo de renderização da página</div>
            <span className="text-zinc-400 text-2xl leading-none">↓</span>
            <div className="w-full px-6 py-3 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-300 dark:border-amber-800/50">
              Pendente: Exibe o componente Fallback (Loading)
            </div>
            <span className="text-zinc-400 text-2xl leading-none">↓</span>
            <div className="w-full px-6 py-3 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border border-green-300 dark:border-green-800/50">
              Resolvido: Renderiza o componente normalmente
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800">
          <h1 className="text-4xl font-bold text-center text-red-600 dark:text-red-400">
            Error Boundary
          </h1>
          <div className="flex flex-col items-center text-center gap-2 font-medium w-full">
            <div className="w-full px-6 py-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">Funciona como um catch</div>
            <span className="text-zinc-400 text-2xl leading-none">↓</span>
            <div className="w-full px-6 py-3 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border border-red-300 dark:border-red-800/50">
              Exception lançada em runtime (ocorreu um erro)
            </div>
            <span className="text-zinc-400 text-2xl leading-none">↓</span>
            <div className="w-full px-6 py-3 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border border-blue-300 dark:border-blue-800/50">
              Exibe página error.tsx: Isola a falha (A aplicação não quebra)
            </div>
          </div>
        </div>

        <div className="col-span-2 flex flex-col items-center gap-6 p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 mt-4">
          <h1 className="text-4xl font-bold text-center text-purple-600 dark:text-purple-400">
            Hook `use`
          </h1>
          <div className="flex flex-col items-center text-center gap-4 font-medium w-full max-w-3xl">
            <div className="px-6 py-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 w-full text-lg">
              Consome uma promise [const dados = use(promise)]
            </div>
            <span className="text-zinc-400 text-2xl leading-none">↓</span>

            <div className="px-8 py-4 rounded-xl bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-2 border-purple-400 dark:border-purple-600 w-full text-xl shadow-inner font-mono">
              Pode ser usado em condicionais ou laços de repetição (loops)
            </div>

            <span className="text-zinc-400 text-2xl leading-none">↓</span>

            <div className="px-8 py-4 rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-2 border-blue-400 dark:border-blue-600 w-full text-xl shadow-inner font-mono">
              Integração nativa com Suspense e Error Boundary (sem necessidade de componentes ou lógica adicionais)
            </div>

            <span className="text-zinc-400 text-2xl leading-none">↓</span>

            <div className="flex w-full gap-8">
              <div className="flex-1 flex flex-col justify-center p-4 rounded-lg border-2 border-dashed border-amber-400 bg-amber-50 dark:bg-amber-900/10">
                <span className="text-amber-600 dark:text-amber-400 font-bold mb-1">Se estiver Pendente</span>
                <span className="text-sm">Informa o React para ativar o <br /><strong>Suspense</strong></span>
              </div>

              <div className="flex-1 flex flex-col justify-center p-4 rounded-lg border-2 border-dashed border-red-400 bg-red-50 dark:bg-red-900/10">
                <span className="text-red-600 dark:text-red-400 font-bold mb-1">Se ocorrer um erro</span>
                <span className="text-sm">Informa o React para ativar o <br /><b>Error Boundary</b></span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-2 flex justify-around gap-10 px-25 mt-4">
          <Link
            href="/user/stateAndEffect"
            className="w-full text-2xl font-bold p-5 flex items-center justify-center rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors">
            Sem Use (useState + useEffect)
          </Link>
          <Link
            href="/user/use"
            className="w-full text-2xl font-bold p-5 flex items-center justify-center rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors">
            Com Use
          </Link>
        </div>
      </main>
    </div>
  );
}
