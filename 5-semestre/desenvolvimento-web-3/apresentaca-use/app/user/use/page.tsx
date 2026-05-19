import { Suspense } from "react";
import UserPage from "@/components/pages/user/withUse"
import Loading from "@/components/pages/loading";

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
            <Suspense fallback={<Loading   />}>
                <UserPage id={id} />
            </Suspense>
    );
}