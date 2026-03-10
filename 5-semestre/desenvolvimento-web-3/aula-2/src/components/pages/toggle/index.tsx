'use client';
import { useRouter } from "next/navigation";
    
export default function Toggle(){
    const router = useRouter();


    return (
        <div className="h-dvh flex flex-col justify-center gap-4 items-center">
            <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
                Toggle Page
            </h1>
            <div className="flex items-center justify-center gap-4">
                <button
                onClick={() => router.push("/home")}
                className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
                Go to Home
            </button>
            <button
                onClick={() => router.push("/admin/home")}
                className="mt-4 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
            >
                Go to Admin Home
            </button>
            </div>
        </div>
    );
}