import { authService } from "./authService";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api-tp.clubti.com.br/api";

export interface DashboardStats {
    aberto: number;
    em_andamento: number;
    concluido: number;
    transferidos: number;
    total_secretarias: number;
    distribuicao_setores: Array<{
        id: number;
        descricao: string;
        setores_count: number;
    }>;
    distribuicao_usuarios: Array<{
        id: number;
        descricao: string;
        users_count: number;
        setores: Array<{
            id: number;
            descricao: string;
            users_count: number;
        }>;
    }>;
}

export const dashboardService = {
    getStats: async (): Promise<DashboardStats> => {
        const token = authService.getToken();

        const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        if (!response.ok) {
            throw new Error("Erro ao buscar estatísticas");
        }

        return response.json();
    },
};
