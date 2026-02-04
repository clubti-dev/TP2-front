import { api } from "./api";

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
    documentos?: {
      id: number;
      descricao: string;
    }[];
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
    nome_original?: string;
    tipo?: string;
    created_at: string;
    documento_necessario_id?: number | null;
  }[];
  movimentacoes?: Movimentacao[];
  created_at?: string;
  updated_at?: string;
}

export interface ProtocoloInput {
  numero?: string;
  data_solicitacao: string;
  solicitante_id: number;
  solicitacao_id: number;
  status_id: number;
  setor_id?: number;
}

export const statusColors: Record<string, string> = {
  "Aberto": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  "Em Análise": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  "Concluído": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  "Indeferido": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export interface Movimentacao {
  id: number;
  protocolo_id: number;
  responsavel_id: number;
  status_id: number;
  observacao: string;
  created_at: string;
  responsavel?: { // Renamed from usuario
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  status?: {
    id: number;
    descricao: string;
    cor: string;
  };
  setor_id?: number;
  setor?: {
    id: number;
    descricao: string;
    secretaria?: {
      id: number;
      descricao: string;
    };
  };
}

export const protocoloService = {
  async getAll(): Promise<Protocolo[]> {
    return api.get<Protocolo[]>("/protocolos");
  },

  async getById(id: number): Promise<Protocolo> {
    return api.get<Protocolo>(`/protocolos/${id}`);
  },

  async getMovimentacoes(protocoloId: number): Promise<Movimentacao[]> {
    return api.get<Movimentacao[]>(`/protocolos/${protocoloId}/movimentacoes`);
  },

  async create(data: ProtocoloInput): Promise<Protocolo> {
    return api.post<Protocolo>("/protocolos", data);
  },

  async update(id: number, data: ProtocoloInput): Promise<Protocolo> {
    return api.put<Protocolo>(`/protocolos/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return api.delete<void>(`/protocolos/${id}`);
  },

  async uploadAnexo(id: number, file: File): Promise<void> {
    const formData = new FormData();
    formData.append("anexo", file);
    // api client handles FormData content-type automatically (letting browser set it with boundary)
    return api.post<void>(`/protocolos/${id}/anexos`, formData);
  },

  async downloadTimelinePdf(protocoloId: number): Promise<Blob> {
    return api.download(`/protocolos/${protocoloId}/timeline-pdf`, {
      headers: { "Accept": "application/pdf" }
    });
  },

  async downloadCompletoPdf(protocoloId: number): Promise<Blob> {
    return api.download(`/protocolos/${protocoloId}/pdf-completo`, {
      headers: { "Accept": "application/pdf" }
    });
  },
};
