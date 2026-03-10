import Home from "@/components/pages/home";
import fetchApi from "@/services/fetchApi";

export default async function HomePage() {
    try {
        const response = await fetchApi<{ message: string }>({ url: "api/home", method: "GET" });
        return (
            <Home message={response.message} />
        );
    } catch (error) {
        return (<p>Error</p>);
    }

}