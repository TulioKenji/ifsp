import { SlideWrapper, SlideTitle, FeatureCard } from '../components/shared';

export function ReferenciasSlide() {
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
                        <span className="w-2 h-2 rounded-full bg-indigo-400" />
                        Estratégia Recomendada
                    </h3>
                    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 p-5">
                        <div className="space-y-4">
                            <p>https://docs.expo.dev/versions/latest/sdk/sqlite/</p>
                            <p>https://github.com/margelo/react-native-mmkv</p>
                            <p>https://github.com/margelo/nitro</p>
                            <p>https://reactnative.dev/blog/2018/06/14/state-of-react-native-2018#architecture</p>
                            <p>https://reactnative.dev/architecture/landing-page#fast-javascriptnative-interfacing</p>
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
