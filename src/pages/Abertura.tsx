import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, CheckCircle, Search, Loader2, ArrowRight, ArrowLeft, User, MapPin } from "lucide-react";
import { publicService, CreatePublicProtocoloData } from "@/services/publicService";
import { Secretaria } from "@/services/secretariaService";
import { FileUpload } from "@/components/ui/file-upload";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  { id: 1, title: "Identificação", icon: User },
  { id: 2, title: "Dados Pessoais", icon: MapPin },
  { id: 3, title: "Solicitação", icon: FileText },
  { id: 4, title: "Documentos", icon: CheckCircle },
];

const Abertura = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
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
  const [specificFiles, setSpecificFiles] = useState<Record<number, File>>({});
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
      }
    } catch (e) {
      // quiet error
    } finally {
      setIsCepLoading(false);
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
        // Optional: Auto-advance if found? No, let user verify.
      } else {
        toast({
          title: "Não encontrado",
          description: "Solicitante não encontrado. Prossiga com o preenchimento.",
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

  const validateStep = (step: number) => {
    switch (step) {
      case 1: // Identificação
        if (!formData.cpf_cnpj) return false;
        return true;
      case 2: // Dados Pessoais
        if (!formData.nome || !formData.email || !formData.fone) return false;
        return true;
      case 3: // Solicitação
        if (!formData.solicitacao_id || !formData.descricao) return false;
        return true;
      case 4: // Documentos (Optional mostly)
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      toast({
        title: "Campos Obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios antes de prosseguir.",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value.toString());
      });
      Object.entries(specificFiles).forEach(([docId, file]) => {
        data.append(`anexos[${docId}]`, file);
      });

      const result = await publicService.createProtocolo(data);
      setProtocolo(result.protocolo);
      setSubmitted(true);
      toast({
        title: "Sucesso!",
        description: `Protocolo gerado: ${result.protocolo}`,
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
        <section className="py-12 md:py-20 min-h-[60vh] flex items-center justify-center">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto text-center animate-scale-in">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-success/10 text-success ring-8 ring-success/5">
                <CheckCircle className="h-12 w-12" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Solicitação Recebida!</h1>
              <p className="text-muted-foreground mb-8 text-lg">
                Seu processo foi registrado com sucesso.
              </p>

              <div className="bg-card border rounded-2xl p-8 mb-8 shadow-sm">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Número do Protocolo</p>
                <p className="text-4xl font-mono font-bold text-primary tracking-tight">{protocolo}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => {
                    setSubmitted(false);
                    setCurrentStep(1);
                    setFormData({
                      nome: "", cpf_cnpj: "", email: "", fone: "", logradouro_nome: "", numero: "",
                      bairro: "", cidade: "", uf: "", cep: "", solicitacao_id: 0, secretaria_id: 0, descricao: "",
                    });
                    setSpecificFiles({});
                  }}
                >
                  Nova Solicitação
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => publicService.downloadComprovante(protocolo)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Comprovante
                </Button>
                <Button variant="ghost" size="lg" asChild>
                  <Link to="/consulta">Consultar Status</Link>
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
      <section className="hero-gradient py-12 text-center text-header-foreground">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Abertura de Processo</h1>
          <p className="opacity-80 max-w-2xl mx-auto">
            Siga os passos abaixo para registrar sua solicitação junto à prefeitura.
          </p>
        </div>
      </section>

      <section className="py-8 mt-4 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Stepper Header */}
          <div className="bg-card rounded-2xl shadow-lg border p-4 mb-6 hidden md:flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;

              return (
                <div key={step.id} className="flex items-center flex-1 last:flex-none">
                  <div className={`flex items-center gap-3 ${isActive ? 'text-primary' : isCompleted ? 'text-success' : 'text-muted-foreground'}`}>
                    <div className={`
                      h-10 w-10 rounded-full flex items-center justify-center border-2 font-semibold transition-all
                      ${isActive ? 'border-primary bg-primary/10' : isCompleted ? 'border-success bg-success text-success-foreground' : 'border-muted-foreground/30'}
                    `}>
                      {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <div className="hidden lg:block">
                      <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Passo {step.id}</p>
                      <p className="font-semibold text-sm">{step.title}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-1 flex-1 mx-4 rounded-full ${isCompleted ? 'bg-success' : 'bg-muted'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile Stepper */}
          <div className="md:hidden bg-card rounded-xl p-4 mb-6 shadow-sm border flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground">Passo {currentStep} de 4</span>
            <span className="font-bold text-primary">{steps[currentStep - 1].title}</span>
          </div>

          {/* Step Content */}
          <div className="bg-card rounded-2xl shadow-lg border overflow-hidden min-h-[400px] flex flex-col">
            <div className="p-6 md:p-8 flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >

                  {/* STEP 1: IDENTIFICAÇÃO */}
                  {currentStep === 1 && (
                    <div className="space-y-6 max-w-xl mx-auto py-4">
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold mb-2">Vamos começar</h2>
                        <p className="text-muted-foreground">Informe seu CPF para verificarmos se você já possui cadastro.</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cpf_cnpj" className="text-base">CPF</Label>
                        <div className="flex gap-2">
                          <Input
                            id="cpf_cnpj"
                            placeholder="000.000.000-00"
                            value={formData.cpf_cnpj}
                            onChange={(e) => {
                              let v = e.target.value.replace(/\D/g, "");
                              if (v.length > 11) v = v.substring(0, 11);
                              v = v.replace(/(\d{3})(\d)/, "$1.$2");
                              v = v.replace(/(\d{3})(\d)/, "$1.$2");
                              v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                              setFormData((prev) => ({ ...prev, cpf_cnpj: v }));
                            }}
                            className="text-lg h-12"
                            autoFocus
                            maxLength={14}
                          />
                          <Button size="lg" className="h-12 w-12 shrink-0" onClick={handleSearchSolicitante} disabled={isSearching}>
                            {isSearching ? <Loader2 className="animate-spin" /> : <Search />}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Clique na lupa para buscar seus dados automaticamente.</p>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: DADOS PESSOAIS */}
                  {currentStep === 2 && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="md:col-span-2 mb-4 border-b pb-2">
                        <h2 className="text-lg font-semibold">Dados de Contato</h2>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="nome">Nome Completo <span className="text-destructive">*</span></Label>
                        <Input id="nome" required value={formData.nome} onChange={handleInputChange} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail <span className="text-destructive">*</span></Label>
                        <Input id="email" type="email" required value={formData.email} onChange={handleInputChange} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fone">Telefone / WhatsApp <span className="text-destructive">*</span></Label>
                        <Input id="fone" required value={formData.fone} onChange={handleInputChange} />
                      </div>

                      <div className="md:col-span-2 mt-4 mb-2 border-b pb-2">
                        <h2 className="text-lg font-semibold">Endereço</h2>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cep">CEP {isCepLoading && <Loader2 className="inline h-3 w-3 animate-spin" />}</Label>
                        <Input id="cep" value={formData.cep} onChange={handleInputChange} onBlur={handleCepBlur} maxLength={9} />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="logradouro_nome">Logradouro</Label>
                        <Input id="logradouro_nome" value={formData.logradouro_nome} onChange={handleInputChange} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="numero">Número</Label>
                        <Input id="numero" value={formData.numero} onChange={handleInputChange} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bairro">Bairro</Label>
                        <Input id="bairro" value={formData.bairro} onChange={handleInputChange} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cidade">Cidade</Label>
                        <Input id="cidade" value={formData.cidade} onChange={handleInputChange} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="uf">UF</Label>
                        <Input id="uf" value={formData.uf} onChange={handleInputChange} maxLength={2} />
                      </div>
                    </div>
                  )}

                  {/* STEP 3: SOLICITAÇÃO */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="solicitacao_id" className="text-base">O que você precisa?</Label>
                        <Select onValueChange={(value) => {
                          const id = parseInt(value);
                          const selected = solicitacoes.find(s => s.id === id);
                          setFormData(prev => ({ ...prev, solicitacao_id: id, secretaria_id: selected?.secretaria_id || 0 }));
                          setSpecificFiles({});
                        }} value={formData.solicitacao_id ? formData.solicitacao_id.toString() : ""}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Selecione o tipo de serviço..." />
                          </SelectTrigger>
                          <SelectContent>
                            {solicitacoes.map(item => (
                              <SelectItem key={item.id} value={item.id.toString()}>
                                {item.descricao}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="descricao" className="text-base">Descreva sua solicitação</Label>
                        <Textarea
                          id="descricao"
                          rows={8}
                          placeholder="Detalhe aqui sua necessidade com o máximo de informações possível..."
                          required
                          value={formData.descricao}
                          onChange={handleInputChange}
                          className="resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 4: DOCUMENTOS */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold">Documentação Necessária</h2>
                        <p className="text-muted-foreground">Anexe os arquivos solicitados abaixo para agilizar sua análise.</p>
                      </div>

                      {formData.solicitacao_id > 0 && solicitacoes.find(s => s.id === formData.solicitacao_id)?.documentos?.length > 0 ? (
                        <div className="flex flex-col gap-3">
                          {solicitacoes.find(s => s.id === formData.solicitacao_id)?.documentos.map((doc: any) => (
                            <div key={doc.id} className="bg-muted/30 p-2 pl-4 rounded-xl border flex items-center gap-4 group hover:border-primary/30 transition-colors">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
                                  <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="font-semibold text-sm">{doc.descricao}</p>
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Obrigatório</p>
                                </div>
                              </div>

                              <div className="w-[180px] shrink-0">
                                <FileUpload
                                  onFileSelect={(file) => setSpecificFiles(prev => ({ ...prev, [doc.id]: file! }))}
                                  selectedFile={specificFiles[doc.id]}
                                  label="Anexar Arquivo"
                                  className="p-2 min-h-[50px] text-xs h-full"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="border-2 border-dashed rounded-2xl p-10 text-center text-muted-foreground bg-muted/20">
                          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                          <p className="text-lg font-medium">Nenhum documento específico obrigatório</p>
                          <p className="text-sm">Você pode prosseguir para a finalização do protocolo.</p>
                        </div>
                      )}
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer Navigation */}
            <div className="bg-muted/30 p-4 md:p-6 border-t flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={prevStep}
                disabled={currentStep === 1 || isSubmitting}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>

              {currentStep < 4 ? (
                <Button onClick={nextStep} className="gap-2 px-8">
                  Próximo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2 px-8 bg-success hover:bg-success/90 text-white">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Finalizar Protocolo
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Abertura;
