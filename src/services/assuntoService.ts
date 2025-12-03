import { authService } from "./authService";
import { Secretaria } from "./secretariaService";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api-tp.clubti.com.br/api";

export interface Assunto {
  id: number;
  descricao: string;
  secretaria_id: number;
  secretaria?: Secretaria;
  created_at?: string;
  updated_at?: string;
}

export interface AssuntoInput {
  descricao: string;
  secretaria_id: number;
}

export const assuntoService = {
  async getAll(): Promise<Assunto[]> {
    const response = await fetch(`${API_BASE_URL}/assuntos`, {
      headers: {
        "Accept": "application/json",
        ...authService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao carregar assuntos");
    }

    return response.json();
  },

  async getById(id: number): Promise<Assunto> {
    const response = await fetch(`${API_BASE_URL}/assuntos/${id}`, {
      headers: {
        "Accept": "application/json",
        ...authService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error("Assunto não encontrado");
    }

    return response.json();
  },

  async create(data: AssuntoInput): Promise<Assunto> {
    const response = await fetch(`${API_BASE_URL}/assuntos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...authService.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao criar assunto" }));
      throw new Error(error.message || "Erro ao criar assunto");
    }

    return response.json();
  },

  async update(id: number, data: AssuntoInput): Promise<Assunto> {
    const response = await fetch(`${API_BASE_URL}/assuntos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...authService.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao atualizar assunto" }));
      throw new Error(error.message || "Erro ao atualizar assunto");
    }

    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/assuntos/${id}`, {
      method: "DELETE",
      headers: {
        "Accept": "application/json",
        ...authService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao excluir assunto" }));
      throw new Error(error.message || "Erro ao excluir assunto");
    }
  },
};
