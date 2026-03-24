import { cookies } from "next/headers";
import { z } from "zod";

interface FetchApiProps<T> extends RequestInit{
    url: string;
    data?: T;
    schema: z.ZodObject
}

export default async function fetchApi<T>(props: FetchApiProps<T>): Promise<FetchApiResponse<T>> {
    const apiURL = process.env.API_URL;
    const access = process.env.ACCESS;
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authToken")?.value;

    if(!apiURL || !access) {
        throw new Error("API_URL or ACCESS is not defined in environment variables");
    }

    const { schema, headers, url, ...requestProps } = props;

    try {
        const response = await fetch(`${apiURL}/${url}`, {
            ...requestProps,
            headers: {
                ...headers,
                "Content-Type": "application/json",
                Access: access,
                Authorization: `Bearer: ${authToken}`,
                credentials: "include",
            },
        })

        
        const status = response.status;

        if (!response.ok) {
            throw response
        }

        const rawData = await response.json();
        const data = schema.parse(rawData);
        
        return { status, data } as FetchApiResponse<T>;

    }catch (error) {
        throw error;
    }

}
