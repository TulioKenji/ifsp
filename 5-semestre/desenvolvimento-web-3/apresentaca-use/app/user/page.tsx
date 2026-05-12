import Link from "next/link";

export default function Page() {
    return (
        <div className="h-dvh flex justify-center gap-10 items-center">
            <Link href="/user/use" className="bg-blue-500 text-white px-4 py-2 rounded">Go to withUse</Link>
            <Link href="/user/stateAndEffect" className="bg-green-500 text-white px-4 py-2 rounded">Go to withStateAndEffect</Link>
        </div>
    );
}