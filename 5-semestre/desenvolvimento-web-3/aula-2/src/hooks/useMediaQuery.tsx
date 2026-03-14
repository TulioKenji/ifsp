'use client';

import React from 'react';


export default function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = React.useState<boolean>(() => {
        return window.matchMedia(query).matches;
    });

    React.useEffect(() => {

        setMatches(window.matchMedia(query).matches);

    }, [query, window.matchMedia]);
    return matches;
}