'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';

const promise = fetch("http://localhost:3000/api/user").then((res) => res.json())

export default function UserPage({ userPromise }: { userPromise: Promise<any> }) {
    const router = useRouter();
    const user = use(promise);
    console.log('renderizou')
    return (
        <div>
            <h1>{user.name}</h1>
            <p>{user.email}</p>
            <div className='flex h-64 justify-center gap-10'>
                <button onClick={() => router.push('/user/use?id=1')}>SetID</button>
                <button onClick={() => router.push('/user/use')}>ClearID</button>
                <button onClick={() => router.push('/user/use?id=2')}>Error</button>
            </div>
            <button onClick={() => router.push('/user/stateAndEffect')}>Go to withStateAndEffect</button>
        </div>
    );
}