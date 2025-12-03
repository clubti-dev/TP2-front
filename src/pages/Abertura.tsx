import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, Upload, CheckCircle, Search, Loader2 } from "lucide-react";
import { publicService, CreatePublicProtocoloData } from "@/services/publicService";
import { Secretaria } from "@/services/secretariaService";

const Abertura = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [protocolo, setProtocolo] = useState("");
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);

  // Form State
  const [formData, setFormData] = useState<CreatePublicProtocoloData>({
    nome: "",
    cpf_cnpj: "",
    email: "",
    fone: "",
    logradouro_nome: "",
    numero: "",
    bairro: "",
    cidade: "",
    uf: "",
    cep: "",
    solicitacao_id: 0,
    secretaria_id: 0,
    descricao: "",
  });

  const [solicitacoes, setSolicitacoes] = useState<any[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [secretariasData, solicitacoesData] = await Promise.all([
        publicService.getSecretarias(),
        publicService.getSolicitacoes(),
      ]);
      setSecretarias(secretariasData);
      setSolicitacoes(solicitacoesData);
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: parseInt(value) }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSearchSolicitante = async () => {
    if (!formData.cpf_cnpj) {
      toast({
        title: "Atenção",
        description: "Digite um CPF ou CNPJ para buscar",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const solicitante = await publicService.checkSolicitante(formData.cpf_cnpj);
      if (solicitante) {
        setFormData((prev) => ({
          ...prev,
          nome: solicitante.nome,
          email: solicitante.email,
          fone: solicitante.fone,
          logradouro_nome: solicitante.logradouro_nome || "",
          numero: solicitante.numero || "",
          bairro: solicitante.bairro || "",
          cidade: solicitante.cidade || "",
          uf: solicitante.uf || "",
          cep: solicitante.cep || "",
        }));
        toast({
          title: "Encontrado",
          description: "Dados do solicitante preenchidos automaticamente.",
        });
      } else {
        toast({
          title: "Não encontrado",
          description: "Solicitante não encontrado. Preencha os dados para cadastro.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao buscar solicitante.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      // Append all text fields
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value.toString());
      });

      // Append files
      files.forEach((file) => {
        data.append("anexos[]", file);
      });

      const result = await publicService.createProtocolo(data);
      setProtocolo(result.protocolo);
      setSubmitted(true);
      toast({
        title: "Processo aberto com sucesso!",
        description: `Seu número de protocolo é: ${result.protocolo}`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao abrir processo",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto text-center animate-scale-in">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10 text-success">
                <CheckCircle className="h-10 w-10" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-4">
                Solicitação Enviada!
              </h1>
              <p className="text-muted-foreground mb-6">
                Seu processo foi registrado com sucesso. Guarde o número do protocolo para acompanhamento.
              </p>
              <div className="bg-muted rounded-xl p-6 mb-8">
                <p className="text-sm text-muted-foreground mb-2">Número do Protocolo</p>
                <p className="text-3xl font-bold text-primary">{protocolo}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    nome: "",
                    cpf_cnpj: "",
                    email: "",
                    fone: "",
                    logradouro_nome: "",
                    numero: "",
                    bairro: "",
                    cidade: "",
                    uf: "",
                    cep: "",
                    solicitacao_id: 0,
                    secretaria_id: 0,
                    descricao: "",
                  });
                  setFiles([]);
                }}>
                  Nova Solicitação
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/consulta">Consultar Processo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <section className="hero-gradient py-6 md:py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-header-foreground animate-fade-in">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-header-foreground/10">
              <FileText className="h-7 w-7" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mb-2">
              Abertura de Processo
            </h1>
            <p className="opacity-80 text-sm">
              Aqui você pode iniciar a solicitação de um processo administrativo, preenchendo os campos abaixo.
              <br />
              Este procedimento resultará na geração de um pré-cadastro de Processo que será avaliado por sua Prefeitura.
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-10 md:py-14 -mt-6">
        <div className="container mx-auto px-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl p-6 md:p-8 card-shadow animate-slide-up">
              <h2 className="text-lg font-semibold mb-6 pb-4 border-b">
                Dados do Solicitante
              </h2>

              <div className="grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cpf_cnpj">CPF / CNPJ *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cpf_cnpj"
                        placeholder="000.000.000-00"
                        required
                        value={formData.cpf_cnpj}
                        onChange={handleInputChange}
                      />
                      <Button type="button" variant="outline" size="icon" onClick={handleSearchSolicitante} disabled={isSearching}>
                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      placeholder="Seu nome completo"
                      required
                      value={formData.nome}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fone">Telefone *</Label>
                    <Input
                      id="fone"
                      placeholder="(00) 00000-0000"
                      required
                      value={formData.fone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="logradouro_nome">Endereço</Label>
                    <Input
                      id="logradouro_nome"
                      placeholder="Rua, Avenida, etc"
                      value={formData.logradouro_nome}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numero">Número</Label>
                    <Input
                      id="numero"
                      placeholder="123"
                      value={formData.numero}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      placeholder="Bairro"
                      value={formData.bairro}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      placeholder="Cidade"
                      value={formData.cidade}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="uf">UF</Label>
                    <Input
                      id="uf"
                      placeholder="UF"
                      maxLength={2}
                      value={formData.uf}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    placeholder="00000-000"
                    value={formData.cep}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <h2 className="text-lg font-semibold mt-8 mb-6 pb-4 border-b">
                Dados da Solicitação
              </h2>

              <div className="grid gap-5">
                <div className="space-y-2">
                  <Label htmlFor="solicitacao_id">Tipo de Solicitação *</Label>
                  <Select required onValueChange={(value) => {
                    const selectedSolicitacaoId = parseInt(value);
                    const selectedSolicitacao = solicitacoes.find(s => s.id === selectedSolicitacaoId);
                    setFormData(prev => ({
                      ...prev,
                      solicitacao_id: selectedSolicitacaoId,
                      secretaria_id: selectedSolicitacao?.secretaria_id || 0
                    }));
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de solicitação" />
                    </SelectTrigger>
                    <SelectContent>
                      {solicitacoes.map((solicitacao) => (
                        <SelectItem key={solicitacao.id} value={solicitacao.id.toString()}>
                          {solicitacao.secretaria?.sigla} - {solicitacao.descricao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.solicitacao_id > 0 && (
                  <div className="animate-fade-in">
                    {(() => {
                      const selected = solicitacoes.find(s => s.id === formData.solicitacao_id);
                      if (selected?.documentos?.length > 0) {
                        return (
                          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mt-2">
                            <p className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Documentos Necessários
                            </p>
                            <ul className="grid sm:grid-cols-2 gap-2">
                              {selected.documentos.map((doc: any) => (
                                <li key={doc.id} className="text-sm text-blue-700 flex items-start gap-2">
                                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                  {doc.descricao}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição da Solicitação *</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Descreva detalhadamente sua solicitação..."
                    rows={5}
                    required
                    value={formData.descricao}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="anexos">Anexar Documentos (opcional)</Label>
                  <div className="border-2 border-dashed rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer relative">
                    <Input
                      type="file"
                      id="anexos"
                      multiple
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {files.length > 0
                        ? `${files.length} arquivo(s) selecionado(s)`
                        : "Arraste arquivos ou clique para selecionar"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, JPG ou PNG até 10MB
                    </p>
                    {files.length > 0 && (
                      <ul className="mt-2 text-xs text-left">
                        {files.map((f, i) => (
                          <li key={i} className="text-primary truncate">• {f.name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Solicitação"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default Abertura;
