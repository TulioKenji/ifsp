'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UserPage({ userPromise }: { userPromise: Promise<any> }) {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    console.log('renderizou')
    useEffect(() => {
        const fetchData = async () => {
            const data = await userPromise;
            setUser(data);
        };
        fetchData();
    }, [userPromise]);

    if (!user) {
        return <p>Loading...</p>;
    }
    return (
        <div>
            <h1>{user.name}</h1>
            <p>{user.email}</p>
            <div className='flex h-64 justify-center gap-10'>
                <button onClick={() => router.push('/user/stateAndEffect?id=1')}>SetID</button>
                <button onClick={() => router.push('/user/stateAndEffect')}>ClearID</button>
                <button onClick={() => router.push('/user/stateAndEffect?id=2')}>Error</button>
            </div>
            <button onClick={() => router.push('/user/use')}>Go to use</button>
        </div>
    );
}