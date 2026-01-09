import { useEffect } from 'react';

// Use a distinct key to check if script is already added
const SCRIPT_ID = 'clarity-script';

export const Clarity = () => {
    useEffect(() => {
        // Configured Project ID
        const projectId = "uyr2utv73i";

        if (!projectId) {
            console.warn("Microsoft Clarity: No Project ID configured.");
            return;
        }

        if (document.getElementById(SCRIPT_ID)) return;

        (function (c: any, l: any, a: any, r: any, i: any, t: any, y: any) {
            c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };
            t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
            y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
            t.id = SCRIPT_ID;
        })(window, document, "clarity", "script", projectId);

    }, []);

    return null;
};
