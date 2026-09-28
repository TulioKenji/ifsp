import { SlideWrapper, SlideTitle, FeatureCard } from '../components/shared';

export function ConclusionSlide() {
  return (
    <SlideWrapper>
      <SlideTitle
        badge="Resumo Final"
        title="Conclusão & Recomendações"
        subtitle="Guia prático para escolher a solução de storage ideal para cada caso de uso."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Quando usar cada um
          </h3>
          <div className="space-y-3">
            <FeatureCard
              icon={<span className="text-xl">⚡</span>}
              title="MMKV → Dados gerais do app"
              description="Preferências, cache, estado da UI, dados de sessão. Ideal como storage principal."
              color="cyan"
            />
            <FeatureCard
              icon={<span className="text-xl">🔒</span>}
              title="SecureStore → Dados sensíveis"
              description="Tokens, senhas, chaves de API, dados pessoais. Use para qualquer dado que não pode ser lido em plaintext."
              color="emerald"
            />
            <FeatureCard
              icon={<span className="text-xl">📦</span>}
              title="AsyncStorage → Fallback / Compatibilidade"
              description="Quando não pode usar native modules, ou como fallback para web. Evite em produção quando possível."
              color="amber"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            Estratégia Recomendada
          </h3>
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 p-5">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <span className="text-cyan-400 font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">MMKV como storage principal</p>
                  <p className="text-xs text-slate-400 mt-0.5">Para a maioria dos dados da aplicação</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-emerald-400 font-bold text-sm">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">SecureStore para auth</p>
                  <p className="text-xs text-slate-400 mt-0.5">Tokens e dados sensíveis separadamente</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <span className="text-amber-400 font-bold text-sm">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Zustand como camada de state</p>
                  <p className="text-xs text-slate-400 mt-0.5">Abstraindo o storage e gerenciando reatividade</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <span className="text-indigo-400 font-bold text-sm">4</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">partialize no Zustand</p>
                  <p className="text-xs text-slate-400 mt-0.5">Persistir apenas o necessário, manter o resto em memória</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

     

      {/* Thank you */}
      <div className="text-center mt-12 animate-fade-in-delay-5">
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10">
          <span className="text-lg">🎉</span>
          <span className="text-sm text-slate-300 font-medium">Obrigado! Dúvidas?</span>
          <span className="text-lg">🎉</span>
        </div>
      </div>
    </SlideWrapper>
  );
}
