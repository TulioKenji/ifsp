import { SlideWrapper, SlideTitle, CodeBlock, FeatureCard } from '../components/shared';

export function ExpoSecureStoreSlide() {
  return (
    <SlideWrapper>
      <SlideTitle
        badge="Armazenamento Seguro"
        title="Expo SecureStore"
        subtitle="Armazenamento criptografado para dados sensíveis. Usa Keychain no iOS e Keystore no Android."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Quando usar
          </h3>
          <div className="space-y-3">
            <FeatureCard
              icon={<span className="text-xl">🔑</span>}
              title="Tokens de Autenticação"
              description="JWT, refresh tokens, API keys que precisam de proteção extra"
              color="emerald"
            />
            <FeatureCard
              icon={<span className="text-xl">💳</span>}
              title="Dados do Usuário"
              description="Informações pessoais, credenciais, dados de pagamento"
              color="indigo"
            />
            <FeatureCard
              icon={<span className="text-xl">🛡️</span>}
              title="Segredos da App"
              description="Chaves de criptografia, certificados, configurações sensíveis"
              color="amber"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            Segurança por Plataforma
          </h3>
          
          <div className="rounded-xl border border-white/10 bg-slate-900/50 p-5 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
              <span className="text-2xl">🍎</span>
              <div>
                <p className="text-sm font-medium text-white">iOS - Keychain</p>
                <p className="text-xs text-slate-400">Hardware-backed encryption, proteção nativa do sistema</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
              <span className="text-2xl">🤖</span>
              <div>
                <p className="text-sm font-medium text-white">Android - Keystore</p>
                <p className="text-xs text-slate-400">AndroidKeyStore com AES-256-GCM, hardware-backed quando disponível</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
              <span className="text-2xl">🌐</span>
              <div>
                <p className="text-sm font-medium text-white">Web - crypto.subtle</p>
                <p className="text-xs text-slate-400">Web Crypto API com fallback para localStorage</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        Exemplo de Uso
      </h3>
      <CodeBlock
        title="secure-storage.ts"
        code={`import * as SecureStore from 'expo-secure-store';

// Salvar token de forma segura
async function saveToken(token: string) {
  await SecureStore.setItemAsync('auth_token', token, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED,
    // WHEN_UNLOCKED (iOS) - acessível quando desbloqueado
    // AFTER_FIRST_UNLOCK - acessível após primeiro unlock
    // WHEN_PASSCODE_SET - requer passcode configurado
  });
}

// Recuperar token
async function getToken(): Promise<string | null> {
  return await SecureStore.getItemAsync('auth_token');
}

// Deletar token (logout)
async function deleteToken() {
  await SecureStore.deleteItemAsync('auth_token');
}

// Verificar se existe
async function hasToken(): Promise<boolean> {
  const token = await SecureStore.getItemAsync('auth_token');
  return token !== null;
}`}
      />

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
          <p className="text-emerald-400 font-bold text-lg">AES-256</p>
          <p className="text-xs text-slate-400">Criptografia</p>
        </div>
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
          <p className="text-emerald-400 font-bold text-lg">Async</p>
          <p className="text-xs text-slate-400">API Assíncrona</p>
        </div>
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
          <p className="text-emerald-400 font-bold text-lg">~4KB</p>
          <p className="text-xs text-slate-400">Limite por item (Android)</p>
        </div>
      </div>
    </SlideWrapper>
  );
}
