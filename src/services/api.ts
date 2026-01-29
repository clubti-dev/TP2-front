
import { authService } from "./authService";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api-tp.clubti.com.br/api";

type RequestOptions = Omit<RequestInit, 'headers'> & {
    headers?: Record<string, string>;
};

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        // Default headers
        const headers: Record<string, string> = {
            "Accept": "application/json",
            ...options.headers,
        };

        // Inject token if not explicitly excluded (could add a flag for public endpoints if needed)
        // For now, we mix in the auth header from authService
        const authHeader = authService.getAuthHeader();
        Object.assign(headers, authHeader);

        // If body is an object (and not FormData), stringify it and set Content-Type
        if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
            headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(options.body);
        }

        const config: RequestInit = {
            ...options,
            headers,
        };

        const response = await fetch(url, config);

        // Handle 401 Unauthorized globally
        if (response.status === 401) {
            // Optional: Trigger logout or redirect to login
            // authService.logout(); 
            // window.location.href = "/login"; // Or use a cleaner routing event logic
        }

        if (!response.ok) {
            let errorMessage = "Erro na requisição";
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch {
                // response was not JSON
            }
            throw new Error(errorMessage);
        }

        // Handle empty responses (like 204 No Content)
        if (response.status === 204) {
            return {} as T;
        }

        // Try to parse JSON, fall back to text/blob if needed or just return null
        try {
            return await response.json();
        } catch {
            // If response is not JSON (e.g. blob download handled separately usually, but good to be safe)
            return {} as T;
        }
    }

    public get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: "GET" });
    }

    public post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: "POST", body });
    }

    public put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: "PUT", body });
    }

    public delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: "DELETE" });
    }

    // Specific method for Blob downloads to avoid JSON parsing attempts
    public async download(endpoint: string, options?: RequestOptions): Promise<Blob> {
        const url = `${this.baseUrl}${endpoint}`;
        const headers: Record<string, string> = {
            ...options?.headers,
            ...authService.getAuthHeader(),
        };

        const response = await fetch(url, { ...options, headers });

        if (!response.ok) {
            throw new Error("Erro ao baixar arquivo");
        }
        return response.blob();
    }
}

export const api = new ApiClient(API_BASE_URL);
