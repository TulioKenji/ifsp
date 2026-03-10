import { UserIcon } from "@heroicons/react/24/outline";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import fetchApi from "@/services/fetchApi";
import LoginAdmin from "@/components/pages/admin/login";

export default async function Home() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("authToken")?.value;

  if (authToken) {
    try {
      const res = await fetchApi({ url: "/api/login", method: "GET" });
      if (res.status === 200) {
        return redirect("/home");
      }
    } catch (error) {
      
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex h-dvh w-full flex-col items-center justify-center gap-y-14">
        <header className="flex items-center justify-center gap-5">
          <UserIcon className="h-12 w-12 text-black dark:text-zinc-50" />
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Bem Vindo
          </h1>
        </header>
        <LoginAdmin />
      </main>
    </div>
  );
}
