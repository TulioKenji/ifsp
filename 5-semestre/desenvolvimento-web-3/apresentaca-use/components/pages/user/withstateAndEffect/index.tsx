'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UserList from '@/components/ui/userList';
import { Button } from '@/components/ui/button';
import Loading from '../../loading';
import { useSearchParams } from 'next/navigation';


export default function UserPage() {
    const router = useRouter();
    const error = useSearchParams().get('error');
    
    const promiseError = ()=>fetch(`http://localhost:3000/api/error`).then((res) => res.json()) as Promise<User[]>;
    const promiseUsers = ()=>fetch(`http://localhost:3000/api/user`).then((res) => res.json()) as Promise<User[]>;
    
    const [users, setUsers] = useState<User[] | null>(null);
    
    console.log('renderizou')
    const fetchData = async () => {
        let data: User[] = [];
        if (error) {
            data = await promiseError();
        } else {
            data = await promiseUsers();
        }

        setUsers(data);
    };
    useEffect(() => {
        fetchData();
    }, []);

    if (!users) {
        return <Loading />;
    }
    return (
        <div className='flex flex-col gap-10 p-32'>
            <div className='flex justify-center gap-20 items-center'>
                <Button colorType='error' onClick={() => { router.push('/user/use?error=1') }}>Gerar Erro</Button>
            </div>
            <UserList users={users} />

        </div>
    );
}