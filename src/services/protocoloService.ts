import { authService } from "./authService";
import { Secretaria } from "./secretariaService";
import { Assunto } from "./assuntoService";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api-tp.clubti.com.br";

export interface Protocolo {
  id: number;
  numero: string;
  data_solicitacao: string;
  solicitante: {
    id: number;
    nome: string;
    cpf_cnpj: string;
  };
  solicitacao: {
    id: number;
    descricao: string;
    secretaria: {
      id: number;
      descricao: string;
      sigla: string;
    };
  };
  status: {
    id: number;
    descricao: string;
    cor: string;
  };
  setor?: {
    id: number;
    descricao: string;
  };
  anexos?: {
    id: number;
    caminho: string;
    created_at: string;
  }[];
  created_at?: string;
  updated_at?: string;
}

export interface ProtocoloInput {
  // Keeping this for now, but admin creation might need refactor
  numero?: string;
  data_solicitacao: string;
  solicitante_id: number;
  solicitacao_id: number;
  status_id: number;
  setor_id?: number;
}

// Helper to map backend status to frontend colors/labels if needed, 
// but backend now returns status object with description.
// We can keep these for fallback or remove if fully dynamic.
export const statusColors: Record<string, string> = {
  "Aberto": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  "Em Análise": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  "Concluído": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  "Indeferido": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export const protocoloService = {
  async getAll(): Promise<Protocolo[]> {
    const response = await fetch(`${API_BASE_URL}/protocolos`, {
      headers: {
        "Accept": "application/json",
        ...authService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao carregar protocolos");
    }

    return response.json();
  },

  async getById(id: number): Promise<Protocolo> {
    const response = await fetch(`${API_BASE_URL}/protocolos/${id}`, {
      headers: {
        "Accept": "application/json",
        ...authService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error("Protocolo não encontrado");
    }

    return response.json();
  },

  async create(data: ProtocoloInput): Promise<Protocolo> {
    const response = await fetch(`${API_BASE_URL}/protocolos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...authService.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao criar protocolo" }));
      throw new Error(error.message || "Erro ao criar protocolo");
    }

    return response.json();
  },

  async update(id: number, data: ProtocoloInput): Promise<Protocolo> {
    const response = await fetch(`${API_BASE_URL}/protocolos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...authService.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao atualizar protocolo" }));
      throw new Error(error.message || "Erro ao atualizar protocolo");
    }

    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/protocolos/${id}`, {
      method: "DELETE",
      headers: {
        "Accept": "application/json",
        ...authService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao excluir protocolo" }));
      throw new Error(error.message || "Erro ao excluir protocolo");
    }
  },

  async uploadAnexo(id: number, file: File): Promise<void> {
    const formData = new FormData();
    formData.append("anexo", file);

    const response = await fetch(`${API_BASE_URL}/protocolos/${id}/anexos`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        ...authService.getAuthHeader(),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao enviar anexo" }));
      throw new Error(error.message || "Erro ao enviar anexo");
    }
  },
};
