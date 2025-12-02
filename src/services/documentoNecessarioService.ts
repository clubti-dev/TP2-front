import { authService } from "./authService";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export interface DocumentoNecessario {
    id: number;
    descricao: string;
    created_at: string;
    updated_at: string;
}

export interface CreateDocumentoNecessarioData {
    descricao: string;
}

export const documentoNecessarioService = {
    getAll: async (): Promise<DocumentoNecessario[]> => {
        const response = await fetch(`${API_BASE_URL}/documentos-necessarios`, {
            headers: {
                "Accept": "application/json",
                ...authService.getAuthHeader(),
            },
        });

        if (!response.ok) {
            throw new Error("Erro ao carregar documentos necessários");
        }

        return response.json();
    },

    getById: async (id: number): Promise<DocumentoNecessario> => {
        const response = await fetch(`${API_BASE_URL}/documentos-necessarios/${id}`, {
            headers: {
                "Accept": "application/json",
                ...authService.getAuthHeader(),
            },
        });

        if (!response.ok) {
            throw new Error("Documento não encontrado");
        }

        return response.json();
    },

    create: async (data: CreateDocumentoNecessarioData): Promise<DocumentoNecessario> => {
        const response = await fetch(`${API_BASE_URL}/documentos-necessarios`, {
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
            throw new Error(errorData.message || "Erro ao criar documento");
        }

        return response.json();
    },

    update: async (id: number, data: CreateDocumentoNecessarioData): Promise<DocumentoNecessario> => {
        const response = await fetch(`${API_BASE_URL}/documentos-necessarios/${id}`, {
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
            throw new Error(errorData.message || "Erro ao atualizar documento");
        }

        return response.json();
    },

    delete: async (id: number): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/documentos-necessarios/${id}`, {
            method: "DELETE",
            headers: {
                "Accept": "application/json",
                ...authService.getAuthHeader(),
            },
        });

        if (!response.ok) {
            throw new Error("Erro ao excluir documento");
        }
    },
};
