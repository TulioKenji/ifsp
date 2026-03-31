import Home from "@/components/pages/home";
import fetchApi from "@/services/fetchApi";
import { z } from "zod";

export default async function HomePage() {
    const res = await fetchApi<{
        message: string;
    }>({
        url: "api/home",
        method: "GET",
        schema: z.object({
            message: z.string(),
        }),
    });

    return (
        <Home message={res.data.message} />
    );

}