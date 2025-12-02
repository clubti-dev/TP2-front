import { authService } from "./authService";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export interface Solicitante {
    id: number;
    cpf_cnpj: string;
    tipo_pessoa: "Física" | "Jurídica";
    nome: string;
    logradouro_tipo: string;
    logradouro_nome: string;
    numero: string;
    bairro: string;
    cep: string;
    cidade: string;
    uf: string;
    email: string;
    fone: string;
    complemento?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateSolicitanteData {
    cpf_cnpj: string;
    tipo_pessoa: "Física" | "Jurídica";
    nome: string;
    logradouro_tipo: string;
    logradouro_nome: string;
    numero: string;
    bairro: string;
    cep: string;
    cidade: string;
    uf: string;
    email: string;
    fone: string;
    complemento?: string;
}

export const solicitanteService = {
    getAll: async (): Promise<Solicitante[]> => {
        const response = await fetch(`${API_BASE_URL}/solicitantes`, {
            headers: {
                "Accept": "application/json",
                ...authService.getAuthHeader(),
            },
        });

        if (!response.ok) {
            throw new Error("Erro ao carregar solicitantes");
        }

        return response.json();
    },

    create: async (data: CreateSolicitanteData): Promise<Solicitante> => {
        const response = await fetch(`${API_BASE_URL}/solicitantes`, {
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
            throw new Error(errorData.message || "Erro ao criar solicitante");
        }

        return response.json();
    },

    update: async (id: number, data: Partial<CreateSolicitanteData>): Promise<Solicitante> => {
        const response = await fetch(`${API_BASE_URL}/solicitantes/${id}`, {
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
            throw new Error(errorData.message || "Erro ao atualizar solicitante");
        }

        return response.json();
    },

    delete: async (id: number): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/solicitantes/${id}`, {
            method: "DELETE",
            headers: {
                "Accept": "application/json",
                ...authService.getAuthHeader(),
            },
        });

        if (!response.ok) {
            throw new Error("Erro ao excluir solicitante");
        }
    },
};
