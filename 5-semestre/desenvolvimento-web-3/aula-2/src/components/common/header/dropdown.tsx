'use client';

import { DropdownMenu } from "radix-ui";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/authContext";
import { useRouter } from "next/navigation";

interface HeaderDropdownComponentProps {
    username: string;
}

export default function HeaderDropdownComponent({ username }: HeaderDropdownComponentProps) {
    const { logout } = useAuth();
    const router = useRouter();

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger className="p-2 flex items-center justify-center gap-2 hover:text-slate-400 cursor-pointer active:scale-95 focus:outline-none transition-all duration-200" >
                <UserCircleIcon className="h-10 w-10" />
                <p className="font-semibold">{username?.toLocaleUpperCase() || "Usuário"}</p>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="border border-slate-50 rounded shadow-md p-2 transition-all duration-500 bg-black">
                <DropdownMenu.Item className="p-2 hover:text-slate-400 cursor-pointer transition-all duration-500 outline-none active:scale-95" onClick={() => router.push("/my-account")}>
                    My Account
                </DropdownMenu.Item>
                <DropdownMenu.Item className="p-2 hover:text-slate-400 cursor-pointer transition-all duration-500 outline-none active:scale-95" onClick={logout}>
                    Logout
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    );
}