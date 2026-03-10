import { cookies } from "next/headers";

interface fetchApiProps<T> extends RequestInit{
    url: string;
    data?: T;
}

export default async function fetchApi<T>(props: fetchApiProps<T>): Promise<{status: number} & T> {
    const apiURL = process.env.API_URL;
    const access = process.env.ACCESS;
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authToken")?.value;

    if(!apiURL || !access) {
        throw new Error("API_URL or ACCESS is not defined in environment variables");
    }

    try {
        const response = await fetch(`${apiURL}/${props.url}`, {
            ...props,
            headers: {
                ...props.headers,
                "Content-Type": "application/json",
                Access: access,
                Authorization: `Bearer: ${authToken}`,
                credentials: "include",
            },
        })

        if (!response.ok) {
            throw response
        }

        const data = await response.json();
        
        return { status: response.status, ...data } as {status: number} & T;

    }catch (error) {
        throw error;
    }

}
