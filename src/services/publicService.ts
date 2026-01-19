const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api-tp.clubti.com.br/api";

export interface PublicSolicitante {
    id?: number;
    nome: string;
    cpf_cnpj: string;
    email: string;
    fone: string;
    logradouro_nome?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    cep?: string;
}

export interface CreatePublicProtocoloData {
    // Solicitante data
    nome: string;
    cpf_cnpj: string;
    email: string;
    fone: string;
    logradouro_nome?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    cep?: string;

    // Protocolo data
    solicitacao_id: number;
    secretaria_id: number;
    descricao: string;
}

export const publicService = {
    getSecretarias: async (): Promise<any[]> => {
        const response = await fetch(`${API_BASE_URL}/public/secretarias`, {
            headers: {
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Erro ao carregar secretarias");
        }

        return response.json();
    },

    getSolicitacoes: async (): Promise<any[]> => {
        const response = await fetch(`${API_BASE_URL}/public/solicitacoes`, {
            headers: {
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Erro ao carregar solicitações");
        }

        return response.json();
    },

    getAssuntos: async (): Promise<any[]> => {
        const response = await fetch(`${API_BASE_URL}/public/assuntos`, {
            headers: {
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Erro ao carregar assuntos");
        }

        return response.json();
    },

    async checkSolicitante(cpf_cnpj: string): Promise<PublicSolicitante | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/public/solicitantes/check`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({ cpf_cnpj: cpf_cnpj }), // key matches controller expectation
            });

            if (response.status === 404) {
                return null;
            }

            if (!response.ok) {
                throw new Error("Erro ao verificar solicitante");
            }

            return response.json();
        } catch (error) {
            console.error("Erro ao verificar solicitante:", error);
            return null;
        }
    },

    downloadComprovante(numero: string): void {
        const url = `${API_BASE_URL}/public/protocolos/${numero}/comprovante`;
        window.open(url, '_blank');
    },

    createProtocolo: async (data: FormData): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/public/protocolos`, {
            method: "POST",
            body: data,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Erro ao abrir processo");
        }

        return response.json();
    },

    consultarProtocolo: async (termo: string, tipo: 'protocolo' | 'cpf'): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/public/protocolos/consultar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({ termo, tipo }),
        });

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            throw new Error("Erro ao consultar processo");
        }

        return response.json();
    },
};
