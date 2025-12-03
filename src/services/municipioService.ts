import { authService } from "./authService";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api-tp.clubti.com.br/api";

export interface Municipio {
    id: number;
    nome_municipio: string;
    uf: string;
    codigo_ibge?: string;
    cnpj_prefeitura?: string;
    telefone?: string;
    email?: string;
    site?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cep?: string;
    logo_municipio: string | null;
    cor_primaria?: string;
    cor_secundaria?: string;
    cor_terciaria?: string;
    created_at: string;
    updated_at: string;
}

export const municipioService = {
    get: async (): Promise<Municipio | null> => {
        const response = await fetch(`${API_BASE_URL}/municipio`, {
            headers: {
                "Accept": "application/json",
                ...authService.getAuthHeader(),
            },
        });

        if (!response.ok) {
            throw new Error("Erro ao carregar dados do município");
        }

        const data = await response.json();
        // API returns empty object if no record exists, handle that
        if (Object.keys(data).length === 0) return null;
        return data;
    },

    save: async (formData: FormData): Promise<Municipio> => {
        const response = await fetch(`${API_BASE_URL}/municipio`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                ...authService.getAuthHeader(),
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Erro ao salvar dados do município");
        }

        return response.json();
    },
};
