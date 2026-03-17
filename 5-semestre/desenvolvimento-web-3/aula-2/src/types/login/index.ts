import {z} from 'zod';

export const loginRequestSchema = z.object({
    username: z.string(),
    password: z.string(),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const loginResponseSchema = z.object({
    message: z.string(),
    authToken: z.string(),
    username: z.string(),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;