import { authService } from "./authService";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api-tp.clubti.com.br/api";

export interface Perfil {
    id: number;
    descricao: string;
    created_at?: string;
    updated_at?: string;
}

export const perfilService = {
    async getAll(): Promise<Perfil[]> {
        const response = await fetch(`${API_BASE_URL}/perfils`, {
            headers: {
                "Accept": "application/json",
                ...authService.getAuthHeader(),
            },
        });

        if (!response.ok) {
            throw new Error("Erro ao carregar perfis");
        }

        return response.json();
    },

    async getById(id: number): Promise<Perfil> {
        const response = await fetch(`${API_BASE_URL}/perfils/${id}`, {
            headers: {
                "Accept": "application/json",
                ...authService.getAuthHeader(),
            },
        });

        if (!response.ok) {
            throw new Error("Perfil não encontrado");
        }

        return response.json();
    },

    async create(data: { descricao: string }): Promise<Perfil> {
        const response = await fetch(`${API_BASE_URL}/perfils`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                ...authService.getAuthHeader(),
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Erro ao criar perfil");
        }

        return response.json();
    },

    async update(id: number, data: { descricao: string }): Promise<Perfil> {
        const response = await fetch(`${API_BASE_URL}/perfils/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                ...authService.getAuthHeader(),
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Erro ao atualizar perfil");
        }

        return response.json();
    },

    async delete(id: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/perfils/${id}`, {
            method: "DELETE",
            headers: {
                "Accept": "application/json",
                ...authService.getAuthHeader(),
            },
        });

        if (!response.ok) {
            throw new Error("Erro ao excluir perfil");
        }
    },
};
