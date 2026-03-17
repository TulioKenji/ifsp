import { UserCircleIcon } from "@heroicons/react/24/outline";
import { cookies } from "next/headers";
import Link from "next/link";
import HeaderDropdownComponent from "./dropdown";
export default async function Header() {

    const cookieStore = await cookies();
    const username = cookieStore.get('username')?.value;

    return (
        <header className="w-full h-28 flex items-center justify-between p-10 text-slate-50 shadow-md shadow-slate-950">
            <h1 className="text-xl font-bold">Meu Site</h1>
            <HeaderDropdownComponent username={username || ""} />
        </header>
    );
}