import { SlideWrapper, SlideTitle, CodeBlock, FeatureCard } from '../components/shared';

export function ExpoSQLiteSlide() {
  return (
    <SlideWrapper>
      <SlideTitle
        badge="Relacional & ACID"
        title="Expo SQLite"
        subtitle="Banco de dados relacional embutido de alta performance. Comunicação direta via JSI, suporte a SQLCipher para criptografia e integração com Hooks."
      />

      {/* Grid de Especificações e Propriedades ACID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            Fundamentos e Propriedades ACID
          </h3>
          <div className="space-y-3">
            <FeatureCard
              icon={<span className="text-xl">🛡️</span>}
              title="Garantia ACID"
              description="Assegura transações seguras: Atomicidade (tudo ou nada), Consistência (regras estruturais mantidas), Isolamento (operações concorrentes não interferem) e Durabilidade (dados persistem pós-falha)."
            />
            <FeatureCard
              icon={<span className="text-xl">⚡</span>}
              title="Eficiência (WAL Mode & Prepared Statements)"
              description="A ativação do Write-Ahead Logging (WAL) melhora drasticamente a concorrência e leitura. Prepared Statements recompilam as queries e evitam SQL Injection."
              color="emerald"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            Arquitetura: Motor C, JSI e FileSystem
          </h3>
          <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 space-y-4 h-full">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-lg shrink-0">JSI</div>
              <div>
                <p className="text-md text-white font-medium mb-1">Comunicação Direta (Sem Bridge)</p>
                <p className="text-md text-slate-300">O módulo utiliza <strong>JSI (JavaScript Interface)</strong> para se comunicar diretamente com a biblioteca C nativa do SQLite. Os dados não precisam ser serializados em JSON, permitindo APIs totalmente síncronas ou execuções em background hiper-rápidas.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-lg shrink-0">FS</div>
              <div>
                <p className="text-md text-white font-medium mb-1">Acesso ao FileSystem</p>
                <p className="text-md text-slate-300">O banco é armazenado em arquivos locais (ex: <code>.db</code>) no diretório nativo seguro do app. Acesso I/O direto é otimizado pelo sistema operacional e permite portar bases já existentes (Asset Source).</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Síncrono vs Assíncrono */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-16">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Abordagem Assíncrona (Recomendada)
          </h3>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
            <p className="text-lg text-slate-300">
              Métodos baseados em <code className="text-emerald-300 bg-emerald-500/10 px-1 py-0.5 rounded">Promise</code> ou <code className="text-emerald-300 bg-emerald-500/10 px-1 py-0.5 rounded">AsyncIterator</code>. A thread do JavaScript fica livre para processar a UI e animações enquanto aguarda o I/O no disco.
            </p>
            <ul className="list-disc list-inside text-lg text-slate-300 space-y-2">
              <li><strong><code className="text-white">runAsync(sql)</code>:</strong> Ideal para operações de escrita (INSERT, UPDATE). Retorna as linhas afetadas e o <code className="text-white">lastInsertRowId</code>.</li>
              <li><strong><code className="text-white">getAllAsync(sql)</code>:</strong> Busca todos os resultados de uma vez num Array de objetos.</li>
              <li><strong><code className="text-white">getEachAsync(sql)</code>:</strong> Otimiza o uso da RAM. Retorna um cursor para iterar milhares de registros usando o loop <code className="text-white">for await...of</code>.</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            Abordagem Síncrona (Risco de Bloqueio)
          </h3>
          <div className="rounded-xl border border-rose-500/20 bg-rose-900/5 p-4 space-y-3">
            <p className="text-lg text-slate-300">
              Executam queries de forma imperativa: <strong><code className="text-rose-300 bg-rose-500/10 px-1 py-0.5 rounded">getFirstSync()</code></strong> e <strong><code className="text-rose-300 bg-rose-500/10 px-1 py-0.5 rounded">runSync()</code></strong>. A API do Bun (<code className="text-rose-300 bg-rose-500/10 px-1 py-0.5 rounded">.allSync()</code>) também se encaixa aqui.
            </p>
            <p className="text-lg text-slate-300">
              <strong>Impacto Arquitetural:</strong> Graças ao JSI, a comunicação direta permite que o SQLite retorne os valores na hora, mas a execução pesada no C++ <span className="font-bold text-rose-400">bloqueia a thread principal do JavaScript</span>. Realizar <i>queries</i> complexas ou grandes transações nestes métodos irá congelar seu aplicativo e derrubar os frames por segundo (FPS) até que o disco termine o trabalho.
            </p>
          </div>
        </div>
      </div>

      {/* Criptografia e Configuração */}
      <div className="grid grid-cols-1 gap-6 my-12">
        <div>
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Configuração Avançada (app.json)
          </h3>
          <CodeBlock
            title="app.json (Config Plugin)"
            code={`{
  "expo": {
    "plugins": [
      [
        "expo-sqlite",
        {
          // Ativa suporte para buscas textuais rápidas (FTS3/4/5)
          "enableFTS": true,
          // Substitui o SQLite padrão pelo SQLCipher (Criptografia)
          "useSQLCipher": true,
          "ios": {
            // Flags customizadas para o compilador do SQLite
            "customBuildFlags": [
              "-DSQLITE_ENABLE_DBSTAT_VTAB=1"
            ]
          }
        }
      ]
    ]
  }
}`}
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            Criptografia e Eficiência de Conexão
          </h3>
          <CodeBlock
            title="database-setup.ts"
            code={`import * as SQLite from 'expo-sqlite';

export async function initDatabase() {
  // Abertura do banco de dados (síncrona ou assíncrona)
  const db = await SQLite.openDatabaseAsync('secure_app.db');

  // 1. Criptografia SQLCipher: Exige "useSQLCipher": true no app.json
  // Encripta páginas inteiras de memória e disco (AES-256)
  await db.execAsync(\`PRAGMA key = 'sua_senha_segura_hashada';\`);

  // 2. Eficiência: Habilita Write-Ahead Logging
  // Permite leituras e escritas simultâneas em alta performance
  await db.execAsync('PRAGMA journal_mode = WAL;');
  
  return db;
}`}
          />
        </div>
      </div>

      {/* Métodos de CRUD, Transações e UI */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Operações, Prepared Statements e Transações ACID
        </h3>
        
        <div className="grid grid-cols-1 gap-6">
          <CodeBlock
            title="crud-operations.ts"
            code={`// 1. Tagged Template Literals (Segurança contra Injections)
// Funciona como um Prepared Statement invisível. Os parâmetros 
// são escapados nativamente pela engine do SQLite.
const age = 21;
const users = await db.sql\`SELECT * FROM users WHERE age > \${age}\`;
console.log(users[0].name);

// 2. Execução de CRUD direto (Retorna meta-informações)
const result = await db.runAsync(
  'INSERT INTO logs (level, message) VALUES (?, ?)', 
  ['ERROR', 'Crash detetado']
);
console.log(result.lastInsertRowId, result.changes);

// 3. Iteração eficiente para grandes conjuntos de dados
for await (const row of db.getEachAsync('SELECT * FROM large_table')) {
  processRow(row); // Processa um por um sem sobrecarregar a RAM
}`}
          />

          <CodeBlock
            title="transactions-acid.ts"
            code={`// 4. Transação Exclusiva (Garantindo Isolamento ACID)
// Garante que outras consultas assíncronas aguardem ou falhem,
// protegendo a consistência dos dados relacionais.
await db.withExclusiveTransactionAsync(async (txn) => {
  // Passamos 'txn' (a transação ativa) para as queries
  
  await txn.runAsync(
    'UPDATE accounts SET balance = balance - 100 WHERE id = 1'
  );
  
  await txn.runAsync(
    'UPDATE accounts SET balance = balance + 100 WHERE id = 2'
  );
  
  // Se qualquer erro ocorrer aqui, há um ROLLBACK automático.
  // Se sucesso, ocorre o COMMIT garantindo a Durabilidade.
});`}
          />
        </div>
      </div>

      {/* React Hooks Integration */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          Arquitetura de UI com React Provider
        </h3>
        <p className="text-slate-300">
          A biblioteca oferece o <code className="text-cyan-300 bg-cyan-500/10 px-1 py-0.5 rounded">SQLiteProvider</code> para injetar a conexão do banco na árvore do React, com suporte integrado a <code>React.Suspense</code> para lidar elegantemente com tempos de carregamento (I/O).
        </p>
        <CodeBlock
          title="App.tsx"
          code={`import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { Suspense } from 'react';

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      {/* Garante que o DB foi criado, migrado e está pronto antes de renderizar os filhos */}
      <SQLiteProvider databaseName="main.db" onInit={runMigrations} useSuspense>
        <Dashboard />
      </SQLiteProvider>
    </Suspense>
  );
}

function Dashboard() {
  // Hook extrai a conexão síncrona diretamente do Context
  const db = useSQLiteContext();
  
  // Permite renderizar dados imediatamente usando a API síncrona
  const count = db.getFirstSync('SELECT COUNT(*) as total FROM users');
  
  return <Text>Usuários Registrados: {count.total}</Text>;
}`}
        />
      </div>
    </SlideWrapper>
  );
}