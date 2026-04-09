'use client';

import { useEffect, useState } from "react";

import { useModal } from "@/contexts/modalContext";
import { Button } from "@/components/common/button";

interface HomeProps {
    message: string;
}

export default function Home({ message }: HomeProps) {


    const { setContent, setClose, setOpen } = useModal();

    const [shouldError, setShouldError] = useState(false)

  if (shouldError) {
    throw new Error('Test Error')
  }

   

    return (
        <main className="flex h-full w-full flex-col items-center justify-center">
            <h1 className="text-center text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
                {message}
            </h1>
            <Button
                onClick={() => {
                    setContent(<div className="rounded-lg p-10 items-center bg-black justify-center">
                        <button onClick={() => setClose()} className="text-white hover:text-gray-300">
                            X
                        </button>
                        <h1 className="text-center text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
                            {message}
                        </h1>
                    </div>);
                    setOpen();
                }}
                className="bg-blue-600"
            >
                Open Modal
            </Button>
            <Button
                onClick={() => {setShouldError(true)}}
                className="bg-blue-600"
            >
               Error Boundary Test
            </Button>
        </main>
    )
}