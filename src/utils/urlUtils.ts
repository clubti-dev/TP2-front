export const getStorageUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;

    const apiUrl = import.meta.env.VITE_API_URL || "https://api-tp.clubti.com.br/api";
    // Remove /api suffix if present to get the base URL
    const baseUrl = apiUrl.replace(/\/api\/?$/, '');

    // Ensure path doesn't start with / since we'll add it
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;

    return `${baseUrl}/storage/${cleanPath}`;
};
