import { Suspense } from "react";
import UserPage from "@/components/pages/user/withUse"
import Loading from "@/components/pages/loading";



export default async function Page() {
    const promiseUsers = fetch(`http://localhost:3000/api/user`).then((res) => res.json()) as Promise<User[]>;
    const promiseError = fetch(`http://localhost:3000/api/error`).then((res) => res.json()) as Promise<User[]>;
    return (
        <Suspense fallback={<Loading />}>
            <UserPage promiseError={promiseError} promiseUsers={promiseUsers} />
        </Suspense>
    );
}