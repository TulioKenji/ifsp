import * as v from 'valibot';

export const userPayloadSchema = v.object({
    user: v.pipe(v.string(),
        v.trim(),
        v.minLength(6, 'O nome de usuário deve ter pelo menos 6 caracteres')
    ),
    password: v.pipe(
        v.string(),
        v.minLength(8, 'Your password is too short.'),
        v.maxLength(30, 'Your password is too long.'),
        // v.regex(/[a-z]/, 'Your password must contain a lowercase letter.'),
        // v.regex(/[A-Z]/, 'Your password must contain a uppercase letter.'),
        // v.regex(/[0-9]/, 'Your password must contain a number.')
    )
});

export type UserPayload = v.InferOutput<typeof userPayloadSchema>;

export const userSchema = v.object({
    id: v.string(),
    user: v.string(),
    password: v.string()
});
export type User = v.InferOutput<typeof userSchema>;


