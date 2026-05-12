'use client';

import { useEffect, useRef } from "react";


export default function Root(){
    const div = useRef<HTMLButtonElement>(null); ;

    useEffect(() => {
        const timeout = setTimeout(() => {
            div.current = document.getElementById('maluco')! as HTMLButtonElement;
            div.current.addEventListener('click', () => {
                alert('clicou');
            });
        }, 500);

        return () => {
            clearTimeout(timeout);
            if (div.current) {
                div.current.removeEventListener('click', () => {
                    alert('clicou');
                });
            }
        };
    }, []);

    return (
        <></>
    );
}