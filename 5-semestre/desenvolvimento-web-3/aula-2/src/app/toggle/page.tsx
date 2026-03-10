import { cookies } from "next/headers";
import Toggle from "@/components/pages/toggle";
import fetchApi from "@/services/fetchApi";
import { redirect } from "next/navigation";

export default async function TogglePage() {

    const cookieStore = await cookies();
    const adminAuthToken = cookieStore.get("adminAuthToken")?.value;
    const authToken = cookieStore.get("authToken")?.value;

    if(!adminAuthToken && !authToken){
        return redirect("/");
    }

    if(adminAuthToken){
        try {
            const res = await fetchApi({ url: "/api/admin/login", method: "GET" });
            if (res.status !== 200) {
                return redirect("/");
            }
        } catch (error) {
            return redirect("/");
        }
    }
    if(authToken){
        try {
            const res = await fetchApi({ url: "/api/login", method: "GET" });
            if (res.status !== 200) {
                return redirect("/");
            }
        } catch (error) {
            return redirect("/");
        }
    }

    if(adminAuthToken && !authToken){
        return redirect("/admin/home");
    }

    if(!adminAuthToken && authToken){
        return redirect("/home");
    }

    if(adminAuthToken && authToken){
        return <Toggle />;
    }

    return redirect("/");

}