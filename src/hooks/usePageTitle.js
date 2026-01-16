import { useEffect } from 'react';

export function usePageTitle(title) {
    useEffect(() => {
        document.title = `Portal Animes | ${title}`;
    }, [title]);
}
