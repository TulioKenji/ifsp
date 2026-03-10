'use client';
import { Toaster } from "react-hot-toast";

export default function Contexts({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            {children}
            <Toaster />
        </>
    );
}