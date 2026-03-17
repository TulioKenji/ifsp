'use client';

import { useEffect, useState } from "react";

import { useModal } from "@/contexts/modalContext";

interface HomeProps {
    message: string;
}

export default function Home({ message }: HomeProps) {


    const { setContent, setClose, setOpen } = useModal();

   

    return (
        <main className="flex h-full w-full flex-col items-center justify-center">
            <h1 className="text-center text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
                {message}
            </h1>
            <button
                onClick={() => {
                    setContent(<div className="rounded-lg p-10 items-center bg-black justify-center">
                        <button onClick={() => setClose()} className="text-white hover:text-gray-300">
                            X
                        </button>
                        <h1 className="text-center text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
                            Hello World!
                        </h1>
                    </div>);
                    setOpen();
                }}
                className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
                Open Modal
            </button>
        </main>
    )
}