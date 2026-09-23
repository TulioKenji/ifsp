import { SlideWrapper, SlideTitle, FeatureCard } from '../components/shared';

export function HomeSlide() {
  return (
    <SlideWrapper>
      <div className="text-center mb-12">
        <div className="animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 mb-6 shadow-2xl shadow-indigo-500/30 pulse-glow">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>
          </div>
        </div>

        <SlideTitle
          badge="Apresentação Técnica"
          title="Storages no React Native"
          subtitle="Uma análise completa das soluções de armazenamento local: AsyncStorage, MMKV, Expo SecureStore e integração com Zustand"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <FeatureCard
          icon={<span className="text-2xl">📦</span>}
          title="AsyncStorage"
          description="A base do storage no React Native"
          color="indigo"
        />
        <FeatureCard
          icon={<span className="text-2xl">⚡</span>}
          title="MMKV"
          description="Ultra rápido, criado pelo WeChat"
          color="cyan"
        />
        <FeatureCard
          icon={<span className="text-2xl">🔒</span>}
          title="SecureStore"
          description="Dados criptografados e seguros"
          color="emerald"
        />
        <FeatureCard
          icon={<span className="text-2xl">🐻</span>}
          title="Zustand"
          description="State management com persistência"
          color="amber"
        />
      </div>

      <div className="rounded-xl border border-white/10 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 p-6 animate-fade-in-delay-3">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Tópicos da apresentação</h3>
            <p className="text-sm text-slate-400">
              Vamos explorar cada solução de storage, entender quando usar cada uma, 
              comparar performance com benchmarks reais e ver como integrá-las com Zustand 
              para gerenciamento de estado persistente.
            </p>
          </div>
        </div>
      </div>
    </SlideWrapper>
  );
}
