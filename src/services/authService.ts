import { z } from "zod";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api-tp.clubti.com.br";

const loginSchema = z.object({
  cpf: z.string().min(11, "CPF inválido").max(11, "CPF inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: number;
    name: string;
    cpf: string;
    email?: string;
    role?: string;
    avatar?: string;
  };
}

export interface AuthError {
  message: string;
  errors?: Record<string, string[]>;
}

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Validate input
    const validation = loginSchema.safeParse(credentials);
    if (!validation.success) {
      throw new Error(validation.error.errors[0].message);
    }

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData: AuthError = await response.json().catch(() => ({
        message: "Erro ao conectar com o servidor",
      }));

      if (response.status === 401) {
        throw new Error("CPF ou senha incorretos");
      }
      if (response.status === 422) {
        throw new Error(errorData.message || "Dados inválidos");
      }
      if (response.status === 429) {
        throw new Error("Muitas tentativas. Aguarde alguns minutos.");
      }

      throw new Error(errorData.message || "Erro ao fazer login");
    }

    const data: AuthResponse = await response.json();

    // Store token and user data
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    return data;
  },

  async logout(): Promise<void> {
    const token = this.getToken();

    if (token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
          },
        });
      } catch {
        // Ignore logout API errors
      }
    }

    this.clearAuth();
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser(): AuthResponse["user"] | null {
    const userData = localStorage.getItem(USER_KEY);
    if (!userData) return null;

    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getAuthHeader(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  async updateProfile(data: FormData): Promise<AuthResponse['user']> {
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
      },
      body: data,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao atualizar perfil");
    }

    const result = await response.json();
    localStorage.setItem(USER_KEY, JSON.stringify(result.user));
    return result.user;
  },

  async updatePassword(data: any): Promise<void> {
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/profile/password`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao alterar senha");
    }
  },

  async forgotPassword(email: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao solicitar redefinição de senha");
    }
  },

  async resetPassword(data: any): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao redefinir senha");
    }
  },
};
