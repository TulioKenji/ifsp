import {cookies} from "next/headers";
import {redirect} from "next/navigation";

export default async function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('adminAuthToken')?.value;

    if (!authToken || authToken === 'undefined') {
        redirect('/');
    }

    return (
        <div className="flex flex-col">
            {children}
        </div>
    );
}