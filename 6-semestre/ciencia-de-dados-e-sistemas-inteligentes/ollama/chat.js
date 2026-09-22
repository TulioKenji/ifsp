const schema = `
model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  photo     String?
  aikey     String?
  preferenceaimodel String?

  brainstorms Brainstorm[]
}

model Brainstorm {
  id          String  @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  context     String
  date        DateTime @default(now())
  userId      String  @db.ObjectId

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  pool        PoolType
}

type PoolType {
  nodes    NodeType[]
  edges    EdgeType[]
  viewport ViewportType
}

type NodeType {
  id        String   @map("_id") @db.ObjectId
  word      String
  range     Int
  position  PositionType
  category  String
  proximity String
}

type PositionType {
  x Float
  y Float
}

type EdgeType {
  id           String @map("_id") @db.ObjectId
  sourceNodeId String @db.ObjectId
  targetNodeId String @db.ObjectId
  label        String
}

type ViewportType {
  x    Float @default(0)
  y    Float @default(0)
  zoom Float @default(1)
}

model ErrorLog {
  id      String   @id @default(auto()) @map("_id") @db.ObjectId
  message Json
  date    DateTime @default(now())
}
`;

const promptstr = `
Convert the following Prisma MongoDB schema into a normalized PostgreSQL database schema.

Generate ONLY PostgreSQL SQL.

Do not explain anything.
Do not use Markdown.
Do not use code fences.
Do not output <|im_end|> or any other special tokens.

Requirements:

1. Use PostgreSQL CREATE TABLE statements.
2. Convert MongoDB ObjectId String fields into UUID.
3. Use gen_random_uuid() for generated UUID primary keys.
4. Convert DateTime into TIMESTAMPTZ.
5. Convert Json into JSONB.
6. Convert optional fields into nullable columns.
7. Create foreign keys for all relationships.
8. Preserve ON DELETE CASCADE.
9. Use snake_case names.
10. Normalize the embedded PoolType, NodeType, EdgeType,
    PositionType and ViewportType structures into relational tables.
11. Every Node and Edge must belong to a Brainstorm.
12. An Edge must reference its source and target Node.
13. Viewport must belong to a Brainstorm.
14. Include:

CREATE EXTENSION IF NOT EXISTS pgcrypto;

Schema:

${schema}

PostgreSQL SQL:
`;

const qwenprompt = 'Convert the following Prisma MongoDB schema into a normalized MySQL database schema. '+schema;

async function teste() {
    const start = performance.now();
    const res = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'qwen3:8b',
            stream: true,

            messages: [
                {
                    role: 'system',
                    content: 'olá, me faça um resumo sobre o qwen3:8b, e me explique como ele funciona, e me dê exemplos de uso',
                },
            ],
        }),
    });

    if (!res.ok) {
        throw new Error(
            `Ollama error ${res.status}: ${await res.text()}`
        );
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let buffer = '';
    let result = '';
    let stats = null;

    while (true) {
        const { value, done } = await reader.read();

        if (done) {
            break;
        }

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');

        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
            if (!line.trim()) continue;

            const data = JSON.parse(line);

            const text = data.message?.content ?? '';

            result += text;

            // Streaming output
            process.stdout?.write?.(text);

            if (data.done) {
                stats = data;
            }
        }

    }

    const elapsed = performance.now() - start;


    // Process any remaining data
    if (buffer.trim()) {
        const data = JSON.parse(buffer);
        const text = data.message?.content ?? '';

        result += text;
    }

    console.log('\n\n--- FINAL RESULT ---');
    console.log(result);

    console.log('\n\n========== STATS ==========');

    if (stats) {
        const promptTokens = stats.prompt_eval_count ?? 0;
        const generatedTokens = stats.eval_count ?? 0;

        const promptTime = (stats.prompt_eval_duration ?? 0) / 1e9;
        const generationTime = (stats.eval_duration ?? 0) / 1e9;
        const totalTime = (stats.total_duration ?? 0) / 1e9;
        const loadTime = (stats.load_duration ?? 0) / 1e9;

        const promptTokensPerSecond =
            promptTime > 0
                ? promptTokens / promptTime
                : 0;

        const generationTokensPerSecond =
            generationTime > 0
                ? generatedTokens / generationTime
                : 0;

        console.log(`Prompt tokens:       ${promptTokens}`);
        console.log(`Generated tokens:    ${generatedTokens}`);
        console.log(`Total tokens:        ${promptTokens + generatedTokens}`);

        console.log(`Prompt processing:   ${promptTime.toFixed(2)} s`);
        console.log(`Generation time:     ${generationTime.toFixed(2)} s`);
        console.log(`Model load time:     ${loadTime.toFixed(2)} s`);
        console.log(`Ollama total time:   ${totalTime.toFixed(2)} s`);

        console.log(
            `Prompt tokens/sec:   ${promptTokensPerSecond.toFixed(2)}`
        );

        console.log(
            `Generation tokens/s: ${generationTokensPerSecond.toFixed(2)}`
        );
    }

    console.log(`Client elapsed:      ${(elapsed / 1000).toFixed(2)} s`);


    return result;
}

teste();
