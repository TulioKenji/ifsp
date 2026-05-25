'use client';

import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import UserList from '@/components/ui/userList';
import { Button } from '@/components/ui/button';

//renderizado no server e client
//sempre executa as 2 promises quando o componente é chamado
// const userPromise = window !== undefined ? fetch(`http://localhost:3000/api/user`).then((res) => res.json()) as Promise<User[]> : Promise.resolve([]);
// const errorPromise = window !== undefined ? fetch(`http://localhost:3000/api/error`).then((res) => res.json()) as Promise<User[]> : Promise.resolve([]);

export default function UserPage({promiseUsers, promiseError}: PageUser) {
    const error = useSearchParams().get('error');
    const router = useRouter();
    let user: User[] = [];
    if(error) {
        //user = use(errorPromise);
        user = use(promiseError);
    } else {
        // user = use(userPromise);
        user = use(promiseUsers);
    }
    console.log('renderizou')

    return (
        <div className='flex flex-col gap-10 p-32'>
            <div className='flex justify-center gap-20 items-center'>
                <Button colorType='error' onClick={()=>{router.push('/user/use?error=1')}}>Gerar Erro</Button>
            </div>
           <UserList users={user} />
           
        </div>
    );
}