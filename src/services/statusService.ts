import { authService } from "./authService";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api-tp.clubti.com.br/api";

export interface Status {
    id: number;
    descricao: string;
    cor: string;
    created_at?: string;
    updated_at?: string;
}

export const statusService = {
    async getAll(): Promise<Status[]> {
        const response = await fetch(`${API_BASE_URL}/status`, {
            headers: {
                "Accept": "application/json",
                ...authService.getAuthHeader(),
            },
        });

        if (!response.ok) {
            throw new Error("Erro ao carregar status");
        }

        return response.json();
    },
};
