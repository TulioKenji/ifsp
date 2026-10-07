import * as v from 'valibot';

// Adicionei Partial para que o TS não exija erros para TODOS os campos
interface ParseResponse<T> {
    success: boolean;
    errors?: Partial<Record<keyof T, string>>;
}

// Usando v.GenericSchema para compatibilidade com Valibot v1+
export function parseForm<T extends Record<string, unknown>>(
    schema: v.GenericSchema<unknown, T>, 
    data: unknown
): ParseResponse<T> {
    const res = v.safeParse(schema, data);

    if (res.success) {
        return { success: true };
    }

    const errors: Partial<Record<keyof T, string>> = {};

    // Itera sobre os problemas retornados pelo Valibot
    for (const issue of res.issues) {
        // O path contém a rota do erro. Para forms planos, pegamos a primeira chave (o nome do campo)
        const key = issue.path?.[0]?.key as keyof T | undefined;

        if (key !== undefined) {
            // Só salva o primeiro erro encontrado para cada campo
            if (!errors[key]) {
                errors[key] = issue.message;
            }
        }
    }

    return {
        success: false,
        errors
    };
}