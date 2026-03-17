'use client';

import { DropdownMenu } from "radix-ui";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/authContext";

interface HeaderDropdownComponentProps {
    username: string;
}

export default function HeaderDropdownComponent({ username }: HeaderDropdownComponentProps) {
    const { logout } = useAuth();

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger className="p-2 flex items-center justify-center gap-2 hover:text-slate-400 cursor-pointer action:scale-95 transition-colors duration-200">
                <UserCircleIcon className="h-10 w-10" />
                <p className="font-semibold">{username?.toLocaleUpperCase() || "Usuário"}</p>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="border border-slate-50 rounded shadow-md p-2">
                <DropdownMenu.Item className="p-2 hover:text-slate-400 cursor-pointer transition-colors duration-200 outline-none">
                    My Account
                </DropdownMenu.Item>
                <DropdownMenu.Item className="p-2 hover:text-slate-400 cursor-pointer transition-colors duration-200 outline-none" onClick={logout}>
                    Logout
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    );
}