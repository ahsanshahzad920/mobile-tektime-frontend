import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        const { hash } = window.location;
        if (!hash) {
            window.scrollTo(0, 0);
        } else {
            // Optional: slight delay or check to ensure element exists could go here,
            // but usually smooth scroll handles it if element is present.
            // For now, we trust the browser's native behavior or component-specific logic.
            const element = document.getElementById(hash.substring(1));
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [pathname]);

    return null;
}
