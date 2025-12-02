import { authService } from "./authService";
import { DocumentoNecessario } from "./documentoNecessarioService";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export interface Solicitacao {
    id: number;
    descricao: string;
    secretaria_id: number;
    secretaria?: {
        id: number;
        descricao: string;
        sigla: string;
    };
    documentos?: DocumentoNecessario[];
    created_at: string;
    updated_at: string;
}

export interface CreateSolicitacaoData {
    descricao: string;
    secretaria_id: number;
    documentos_ids?: number[];
}

export const solicitacaoService = {
    getAll: async (): Promise<Solicitacao[]> => {
        const response = await fetch(`${API_BASE_URL}/solicitacoes`, {
            headers: {
                "Accept": "application/json",
                ...authService.getAuthHeader(),
            },
        });

        if (!response.ok) {
            throw new Error("Erro ao carregar solicitações");
        }

        return response.json();
    },

    getById: async (id: number): Promise<Solicitacao> => {
        const response = await fetch(`${API_BASE_URL}/solicitacoes/${id}`, {
            headers: {
                "Accept": "application/json",
                ...authService.getAuthHeader(),
            },
        });

        if (!response.ok) {
            throw new Error("Solicitação não encontrada");
        }

        return response.json();
    },

    create: async (data: CreateSolicitacaoData): Promise<Solicitacao> => {
        const response = await fetch(`${API_BASE_URL}/solicitacoes`, {
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
            throw new Error(errorData.message || "Erro ao criar solicitação");
        }

        return response.json();
    },

    update: async (id: number, data: CreateSolicitacaoData): Promise<Solicitacao> => {
        const response = await fetch(`${API_BASE_URL}/solicitacoes/${id}`, {
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
            throw new Error(errorData.message || "Erro ao atualizar solicitação");
        }

        return response.json();
    },

    delete: async (id: number): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/solicitacoes/${id}`, {
            method: "DELETE",
            headers: {
                "Accept": "application/json",
                ...authService.getAuthHeader(),
            },
        });

        if (!response.ok) {
            throw new Error("Erro ao excluir solicitação");
        }
    },
};
