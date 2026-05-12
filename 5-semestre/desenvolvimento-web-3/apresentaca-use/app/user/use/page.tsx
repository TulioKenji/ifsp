import { Suspense } from "react";
import UserPage from "@/components/user/withUse"
import { ErrorBoundary } from "@/components/boundary";

interface Props {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}



export default async function Page({ searchParams }: Props) {
    const params = await searchParams;
    const userPromise = async () => {
        const res = await fetch(`http://localhost:3000/api/user/${params?.id ? `${params.id}` : ''}`);
        const promiseTime = new Promise((resolve) => setTimeout(resolve, 2000));
        await promiseTime;


        return res.json();
    }
    const id = params?.id ? `${params.id}` : '';

    return (
            <Suspense key={id} fallback={<p>waiting for user data...</p>}>
                <UserPage userPromise={userPromise()} />
            </Suspense>
    );
}