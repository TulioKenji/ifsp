'use client';

import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import UserList from '@/components/ui/userList';
import { Button } from '@/components/ui/button';

// const promiseUsers = fetch(`http://localhost:3000/api/user`).then((res) => res.json()) as Promise<User[]>;
// const promiseError = fetch(`http://localhost:3000/api/error`).then((res) => res.json()) as Promise<User[]>;


export default function UserPage({promiseUsers, promiseError}: PageUser) {
    const error = useSearchParams().get('error');
    const router = useRouter();
    const user = error? use(promiseError) : use(promiseUsers);
    console.log('renderizou')

    return (
        <div className='flex flex-col gap-10 p-32'>
            <div className='flex justify-center gap-20 items-center'>
                {/* <Button colorType='success' onClick={()=>{router.refresh()}}>Voltar para a página inicial</Button> */}
                <Button colorType='error' onClick={()=>{router.push('/user/use?error=1')}}>Gerar Erro</Button>
            </div>
           <UserList users={user} />
           
        </div>
    );
}