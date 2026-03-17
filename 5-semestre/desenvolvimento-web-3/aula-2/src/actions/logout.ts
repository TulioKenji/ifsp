'use server';

import { cookies } from 'next/headers';

export default async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete('authToken');
    cookieStore.delete('username');
}