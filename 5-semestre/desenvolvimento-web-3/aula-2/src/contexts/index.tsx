'use client';
import { Toaster } from "react-hot-toast";
import { ModalProvider } from "./modalContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./authContext";



export default function Contexts({ children }: Readonly<{ children: React.ReactNode }>) {
    const queryClient = new QueryClient();

    return (
        <>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                <ModalProvider>
                    {children}
                </ModalProvider>
                </AuthProvider>
                    <Toaster />
            </QueryClientProvider>
        </>
    );
}

