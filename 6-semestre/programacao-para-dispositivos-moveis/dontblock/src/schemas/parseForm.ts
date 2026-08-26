import * as v from 'valibot';




export function parseForm<T> (schema: v.ObjectSchema<any, undefined>, data: unknown): T | undefined {
    const res = v.safeParse(schema, data);

    return 

}