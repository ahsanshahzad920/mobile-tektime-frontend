import { useCallback } from 'react';

const CalendlyLink = (url) => {
    const openLink = useCallback(() => {
        window.open(url, '_blank');
    }, [url]);

    return openLink;
};

export default CalendlyLink;
