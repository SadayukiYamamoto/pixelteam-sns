export const processHtmlContent = (htmlContent) => {
    if (!htmlContent) return "";

    // Check if running in browser environment (DOMParser availability)
    if (typeof window === 'undefined') return htmlContent;

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    const links = doc.querySelectorAll('a');
    links.forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');

        // Optional: Force external browser styles or behavior if needed
        // link.classList.add('external-link'); 
    });

    return doc.body.innerHTML;
};
export const getFullUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:")) {
        return path;
    }
    const baseUrl = "https://pixelshop-backend-237007524936.us-central1.run.app";
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${baseUrl}${normalizedPath}`;
};
