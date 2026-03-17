import Home from "@/components/pages/home";
import fetchApi from "@/services/fetchApi";

export default async function HomePage() {
    return (
        <Home message="Hello, World!" />
    );

}