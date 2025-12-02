import { authService } from "./authService";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export interface Usuario {
  id: number;
  name: string;
  cpf: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface UsuarioInput {
  name: string;
  cpf: string;
  email: string;
  password?: string;
}

export const usuarioService = {
  async getAll(): Promise<Usuario[]> {
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      headers: {
        "Accept": "application/json",
        ...authService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao carregar usuários");
    }

    return response.json();
  },

  async getById(id: number): Promise<Usuario> {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      headers: {
        "Accept": "application/json",
        ...authService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error("Usuário não encontrado");
    }

    return response.json();
  },

  async create(data: UsuarioInput): Promise<Usuario> {
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...authService.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao criar usuário" }));
      throw new Error(error.message || "Erro ao criar usuário");
    }

    return response.json();
  },

  async update(id: number, data: UsuarioInput): Promise<Usuario> {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...authService.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao atualizar usuário" }));
      throw new Error(error.message || "Erro ao atualizar usuário");
    }

    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: "DELETE",
      headers: {
        "Accept": "application/json",
        ...authService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao excluir usuário" }));
      throw new Error(error.message || "Erro ao excluir usuário");
    }
  },
};
