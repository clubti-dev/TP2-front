import { authService } from "./authService";
import { Secretaria } from "./secretariaService";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api-tp.clubti.com.br/api";

export interface Setor {
    id: number;
    secretaria_id: number;
    descricao: string;
    secretaria?: Secretaria;
    created_at: string;
    updated_at: string;
}

export interface CreateSetorData {
    secretaria_id: number;
    descricao: string;
}

export const setorService = {
    getAll: async (): Promise<Setor[]> => {
        const response = await fetch(`${API_BASE_URL}/setores`, {
            headers: {
                "Accept": "application/json",
                ...authService.getAuthHeader(),
            },
        });

        if (!response.ok) {
            throw new Error("Erro ao carregar setores");
        }

        return response.json();
    },

    getById: async (id: number): Promise<Setor> => {
        const response = await fetch(`${API_BASE_URL}/setores/${id}`, {
            headers: {
                "Accept": "application/json",
                ...authService.getAuthHeader(),
            },
        });

        if (!response.ok) {
            throw new Error("Setor não encontrado");
        }

        return response.json();
    },

    create: async (data: CreateSetorData): Promise<Setor> => {
        const response = await fetch(`${API_BASE_URL}/setores`, {
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
            throw new Error(errorData.message || "Erro ao criar setor");
        }

        return response.json();
    },

    update: async (id: number, data: Partial<CreateSetorData>): Promise<Setor> => {
        const response = await fetch(`${API_BASE_URL}/setores/${id}`, {
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
            throw new Error(errorData.message || "Erro ao atualizar setor");
        }

        return response.json();
    },

    delete: async (id: number): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/setores/${id}`, {
            method: "DELETE",
            headers: {
                "Accept": "application/json",
                ...authService.getAuthHeader(),
            },
        });

        if (!response.ok) {
            throw new Error("Erro ao excluir setor");
        }
    },
};
