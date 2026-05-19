'use client';

import { useEffect, useRef } from "react";
import { styleText } from "util";


export default function Root(){
    const div = useRef<HTMLButtonElement>(null); ;

    useEffect(() => {
        const timeout = setTimeout(() => {
            div.current = document.getElementById('maluco')! as HTMLButtonElement;
            div.current.addEventListener('click', () => {
                div.current?.style.setProperty('height', '500px', 'important');
                div.current?.style.setProperty('width', '500px', 'important');
                // alert('clicou');
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