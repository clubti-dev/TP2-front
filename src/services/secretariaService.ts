import { authService } from "./authService";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export interface Secretaria {
  id: number;
  sigla: string;
  descricao: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSecretariaData {
  sigla: string;
  descricao: string;
}

export const secretariaService = {
  getAll: async (): Promise<Secretaria[]> => {
    const response = await fetch(`${API_BASE_URL}/secretarias`, {
      headers: {
        "Accept": "application/json",
        ...authService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao carregar secretarias");
    }

    return response.json();
  },

  getById: async (id: number): Promise<Secretaria> => {
    const response = await fetch(`${API_BASE_URL}/secretarias/${id}`, {
      headers: {
        "Accept": "application/json",
        ...authService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error("Secretaria não encontrada");
    }

    return response.json();
  },

  create: async (data: CreateSecretariaData): Promise<Secretaria> => {
    const response = await fetch(`${API_BASE_URL}/secretarias`, {
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
      throw new Error(errorData.message || "Erro ao criar secretaria");
    }

    return response.json();
  },

  update: async (id: number, data: Partial<CreateSecretariaData>): Promise<Secretaria> => {
    const response = await fetch(`${API_BASE_URL}/secretarias/${id}`, {
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
      throw new Error(errorData.message || "Erro ao atualizar secretaria");
    }

    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/secretarias/${id}`, {
      method: "DELETE",
      headers: {
        "Accept": "application/json",
        ...authService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao excluir secretaria");
    }
  },
};
