import { authService } from "./authService";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api-tp.clubti.com.br/api";

export interface Movimentacao {
  id: number;
  protocolo_id: number;
  status_anterior: string | null;
  status_novo: string;
  observacao: string;
  usuario_id: number;
  usuario?: {
    id: number;
    name: string;
  };
  created_at: string;
}

export interface MovimentacaoInput {
  status_novo: string;
  observacao: string;
}

export const movimentacaoService = {
  async getByProtocolo(protocoloId: number): Promise<Movimentacao[]> {
    const response = await fetch(`${API_BASE_URL}/protocolos/${protocoloId}/movimentacoes`, {
      headers: {
        "Accept": "application/json",
        ...authService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao carregar movimentações");
    }

    return response.json();
  },

  async create(protocoloId: number, data: MovimentacaoInput): Promise<Movimentacao> {
    const response = await fetch(`${API_BASE_URL}/protocolos/${protocoloId}/movimentacoes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...authService.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao registrar movimentação" }));
      throw new Error(error.message || "Erro ao registrar movimentação");
    }

    return response.json();
  },
};
