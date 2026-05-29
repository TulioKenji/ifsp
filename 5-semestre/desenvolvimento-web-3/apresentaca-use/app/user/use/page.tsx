import { Suspense } from "react";
import Link from "next/link";
import UserPage from "@/components/pages/user/withUse"
import Loading from "@/components/pages/loading";

export const dynamic = 'force-dynamic';

export default async function Page() {
    const promiseUsers = fetch(`http://localhost:3000/api/user`).then((res) => res.json()) as Promise<User[]>;
    const promiseError = fetch(`http://localhost:3000/api/error`).then((res) => res.json()) as Promise<User[]>;
    return (
        <Suspense fallback={<Loading />}>
            <div className="mt-10 flex flex-col items-center gap-4">
              <Link
                href="/stable-promise"
                className="text-lg font-medium border-2 border-dashed border-blue-400 px-4 py-2 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
              >
                Por que passar a promise como prop? (Streaming de dados do servidor para o cliente)
              </Link>
            </div>
            <UserPage promiseError={promiseError} promiseUsers={promiseUsers} />
        </Suspense>
    );
}