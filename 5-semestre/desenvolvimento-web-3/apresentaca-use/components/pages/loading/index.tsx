export default function Loading() {
  return (
    // Overlay de bloqueio da tela inteira
    <div className="fixed inset-0 z-999 flex flex-col items-center justify-center w-full h-screen bg-zinc-50/70 dark:bg-black/70 backdrop-blur-sm">
      
      {/* Container Centralizado */}
      <div className="flex flex-col items-center justify-center p-8 gap-6 w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800">
        
        {/* Spinner Círculo */}
        <div className="relative flex items-center justify-center w-16 h-16">
          {/* Anel de fundo */}
          <div className="absolute w-full h-full rounded-full border-4 border-purple-100 dark:border-purple-900/30"></div>
          {/* Anel animado (Spin) */}
          <div className="absolute w-full h-full rounded-full border-4 border-transparent border-t-purple-600 dark:border-t-purple-400 animate-spin"></div>
        </div>

        {/* Texto Bouncing */}
        <div className="flex gap-1 items-end animate-bounce">
          <span className="text-xl font-bold text-purple-600 dark:text-purple-400 tracking-wide">
            Aguardando dados
          </span>
          <span className="text-xl font-bold text-purple-600 dark:text-purple-400">...</span>
        </div>
        
      </div>
      
    </div>
  );
}