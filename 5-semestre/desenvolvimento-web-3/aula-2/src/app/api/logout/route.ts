import { redirect } from "next/navigation";
import { logout } from '@/utils/logout';

export async function GET() {
    await logout();
    redirect('/');
}