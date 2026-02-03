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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  // Store specific files mapped by document ID
  const [specificFiles, setSpecificFiles] = useState<Record<number, File>>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [isAddressLocked, setIsAddressLocked] = useState(true);
  const [isCepLoading, setIsCepLoading] = useState(false);

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
    if (field === 'solicitacao_id') {
      // Reset specific files when solicitation changes
      setSpecificFiles({});
    }
  };

  const handleCepBlur = async () => {
    if (!formData.cep || formData.cep.length < 8) return;

    setIsCepLoading(true);
    try {
      const address = await publicService.buscaCep(formData.cep);
      if (address) {
        setFormData(prev => ({
          ...prev,
          logradouro_nome: address.logradouro,
          bairro: address.bairro,
          cidade: address.localidade,
          uf: address.uf
        }));
        toast({
          title: "Endereço Encontrado",
          description: "Os campos foram preenchidos automaticamente.",
        });
      } else {
        toast({
          title: "CEP não encontrado",
          description: "Preencha o endereço manualmente.",
          variant: "destructive"
        });
      }
    } catch (e) {
      // quiet error
    } finally {
      setIsCepLoading(false);
      setIsAddressLocked(false);
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
    setAttemptedSubmit(true);

    // Validate textual required fields
    if (!formData.cpf_cnpj || !formData.nome || !formData.email || !formData.fone || !formData.solicitacao_id || !formData.descricao) {
      toast({
        title: "Campos Obrigatórios",
        description: "Por favor, preencha todos os campos destacados em vermelho.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate required documents (REMOVED: Attachments are now optional)
      // const selectedSolicitacao = solicitacoes.find(s => s.id === formData.solicitacao_id);
      // if (selectedSolicitacao?.documentos?.length > 0) { ... }

      const data = new FormData();
      // Append all text fields
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value.toString());
      });

      // Append specific files (anexos[DOC_ID])
      Object.entries(specificFiles).forEach(([docId, file]) => {
        data.append(`anexos[${docId}]`, file);
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
                  setSpecificFiles({});
                }}>
                  Nova Solicitação
                </Button>
                <Button
                  variant="outline"
                  onClick={() => publicService.downloadComprovante(protocolo)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Imprimir Comprovante
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
      <section className="hero-gradient py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-header-foreground animate-fade-in">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-header-foreground/10">
              <FileText className="h-5 w-5" />
            </div>
            <h1 className="text-xl md:text-3xl font-bold mb-1">
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
      <section className="py-6 md:py-10 -mt-6">
        <div className="container mx-auto px-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto" noValidate>
            <div className="bg-card rounded-2xl p-6 md:p-8 card-shadow animate-slide-up">
              <h2 className="text-lg font-semibold mb-6 pb-4 border-b">
                Dados do Solicitante
              </h2>

              <div className="grid gap-3 sm:grid-cols-4">
                <div className="space-y-1 sm:col-span-1">
                  <Label htmlFor="cpf_cnpj">CPF / CNPJ <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2">
                    <Input
                      id="cpf_cnpj"
                      placeholder="Doc..."
                      required
                      value={formData.cpf_cnpj}
                      onChange={handleInputChange}
                      className={attemptedSubmit && !formData.cpf_cnpj ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={handleSearchSolicitante} disabled={isSearching}>
                      {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="nome">Nome Completo <span className="text-destructive">*</span></Label>
                  <Input
                    id="nome"
                    placeholder="Seu nome completo"
                    required
                    value={formData.nome}
                    onChange={handleInputChange}
                    className={attemptedSubmit && !formData.nome ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                </div>

                <div className="space-y-1 sm:col-span-1">
                  <Label htmlFor="fone">Telefone <span className="text-destructive">*</span></Label>
                  <Input
                    id="fone"
                    placeholder="(00) 00..."
                    required
                    value={formData.fone}
                    onChange={handleInputChange}
                    className={attemptedSubmit && !formData.fone ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                </div>

                <div className="space-y-1 sm:col-span-1">
                  <Label htmlFor="cep">
                    CEP
                    {isCepLoading && <Loader2 className="inline h-3 w-3 animate-spin ml-2" />}
                  </Label>
                  <Input
                    id="cep"
                    placeholder="00000-000"
                    value={formData.cep}
                    onChange={handleInputChange}
                    onBlur={handleCepBlur}
                    maxLength={9}
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="logradouro_nome">Endereço</Label>
                  <Input
                    id="logradouro_nome"
                    placeholder="Rua, Avenida, etc"
                    value={formData.logradouro_nome}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-1 sm:col-span-1">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    placeholder="123"
                    value={formData.numero}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    placeholder="Bairro"
                    value={formData.bairro}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-1 sm:col-span-1">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    placeholder="Cidade"
                    value={formData.cidade}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-1 sm:col-span-1">
                  <Label htmlFor="uf">UF</Label>
                  <Input
                    id="uf"
                    placeholder="UF"
                    maxLength={2}
                    value={formData.uf}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-1 sm:col-span-4">
                  <Label htmlFor="email">E-mail <span className="text-destructive">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={attemptedSubmit && !formData.email ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                </div>
              </div>

              <h2 className="text-lg font-semibold mt-8 mb-6 pb-4 border-b">
                Dados da Solicitação
              </h2>

              <div className="grid gap-5">
                <div className="space-y-2">
                  <Label htmlFor="solicitacao_id">Tipo de Solicitação <span className="text-destructive">*</span></Label>
                  <Select required onValueChange={(value) => {
                    const selectedSolicitacaoId = parseInt(value);
                    const selectedSolicitacao = solicitacoes.find(s => s.id === selectedSolicitacaoId);
                    setFormData(prev => ({
                      ...prev,
                      solicitacao_id: selectedSolicitacaoId,
                      secretaria_id: selectedSolicitacao?.secretaria_id || 0
                    }));
                  }}>
                    <SelectTrigger className={attemptedSubmit && !formData.solicitacao_id ? "border-destructive focus:ring-destructive" : ""}>
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

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição da Solicitação <span className="text-destructive">*</span></Label>
                  <Textarea
                    id="descricao"
                    placeholder="Descreva detalhadamente sua solicitação..."
                    required
                    value={formData.descricao}
                    onChange={handleInputChange}
                    className={attemptedSubmit && !formData.descricao ? "border-destructive focus-visible:ring-destructive" : ""}
                    rows={4}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Documentos Obrigatórios</Label>

                  {formData.solicitacao_id > 0 && solicitacoes.find(s => s.id === formData.solicitacao_id)?.documentos?.length > 0 ? (
                    <div className="border rounded-xl overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Documento / Declaração</TableHead>
                            <TableHead className="w-[100px]">Status</TableHead>
                            <TableHead className="w-[150px] text-right">Ação</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {solicitacoes.find(s => s.id === formData.solicitacao_id)?.documentos.map((doc: any) => (
                            <TableRow key={doc.id}>
                              <TableCell className="font-medium py-2">
                                <span className="flex items-center gap-2">
                                  {doc.descricao}
                                </span>
                              </TableCell>
                              <TableCell className="py-2">
                                {specificFiles[doc.id] ? (
                                  <span className="flex items-center text-primary text-xs font-medium">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Anexado
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground text-xs font-semibold">Pendente (Opcional)</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right py-2">
                                <div className="relative inline-block">
                                  <Input
                                    type="file"
                                    id={`doc-${doc.id}`}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        setSpecificFiles(prev => ({
                                          ...prev,
                                          [doc.id]: file
                                        }));
                                      }
                                    }}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                  />
                                  <Button
                                    variant={specificFiles[doc.id] ? "outline" : "default"}
                                    size="sm"
                                    type="button"
                                    className={`pointer-events-none h-8 ${specificFiles[doc.id] ? "border-primary text-primary hover:bg-primary/10" : ""}`}
                                  >
                                    {specificFiles[doc.id] ? <><CheckCircle className="mr-2 h-3 w-3" /> Alterar</> : <><Upload className="mr-2 h-3 w-3" /> Anexar</>}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-xl text-center">
                      Nenhum documento específico obrigatório para este tipo de solicitação.
                    </div>
                  )}
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
