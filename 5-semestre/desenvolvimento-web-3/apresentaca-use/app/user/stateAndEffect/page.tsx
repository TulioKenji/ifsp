import { Suspense } from "react";
import UserPage from "@/components/pages/user/withstateAndEffect"
import Loading from "@/components/pages/loading";


export default async function Page() {
    return (
            <Suspense fallback={<Loading />}>
                <UserPage />
            </Suspense>
    );
}