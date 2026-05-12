import { Suspense } from "react";
import UserPage from "@/components/user/withstateAndEffect"

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
    return (
            <Suspense fallback={<p>waiting for user data...</p>}>
                <UserPage userPromise={userPromise()} />
            </Suspense>
    );
}