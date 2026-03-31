'use server';

import { logout } from '@/utils/logout';

export default async function logoutAction() {
    await logout();
}