import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, FileText, Clock, AlertCircle, MapPin, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { publicService } from "@/services/publicService";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ProcessoResult {
  protocolo: string;
  assunto: string;
  secretaria: string;
  data: string;
  status: "em_analise" | "deferido" | "indeferido" | "pendente" | "aberto";
  tem_anexos?: boolean;
  setor_atual?: string;
  etapas: { titulo: string; status_anterior?: string; responsavel?: string; data: string; observacao: string; concluida: boolean }[];
}

const Consulta = () => {
  const [searching, setSearching] = useState(false);
  const [resultados, setResultados] = useState<ProcessoResult[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<ProcessoResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Form State
  const [searchType, setSearchType] = useState<"protocolo" | "cpf">("protocolo");
  const [termo, setTermo] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termo) return;

    setSearching(true);
    setNotFound(false);
    setResultados([]);
    setSelectedProtocol(null);

    try {
      const result = await publicService.consultarProtocolo(termo, searchType);

      if (result) {
        const list = Array.isArray(result) ? result : [result];
        setResultados(list);

        if (list.length === 1) {
          setSelectedProtocol(list[0]);
        }
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error("Erro na consulta", error);
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  };

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("aberto") || s.includes("novo")) return "text-blue-600 bg-blue-50 border-blue-100";
    if (s.includes("análise") || s.includes("andamento")) return "text-amber-600 bg-amber-50 border-amber-100";
    if (s.includes("concluído") || s.includes("deferido")) return "text-green-600 bg-green-50 border-green-100";
    if (s.includes("indeferido") || s.includes("cancelado")) return "text-red-600 bg-red-50 border-red-100";
    if (s.includes("transferido")) return "text-purple-600 bg-purple-50 border-purple-100";
    return "text-gray-600 bg-gray-50 border-gray-100";
  };

  const getStatusBadge = (status: ProcessoResult["status"]) => {
    const labels = {
      aberto: "Aberto",
      em_analise: "Em Análise",
      deferido: "Deferido",
      indeferido: "Indeferido",
      pendente: "Pendente",
    };
    const styleClass = getStatusStyle(labels[status] || status);

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${styleClass}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <Layout>
      {/* Header */}
      <section className="hero-gradient py-12 text-center text-header-foreground">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Consultar Processo
          </h1>
          <p className="opacity-80 max-w-2xl mx-auto">
            Acompanhe o andamento digital do seu processo administrativo.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 mt-4 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">

            {/* SEARCH BOX */}
            {!selectedProtocol && (
              <div className="bg-card rounded-2xl p-6 md:p-8 card-shadow animate-slide-up mb-8 border transition-all hover:shadow-lg">
                <form onSubmit={handleSearch}>
                  <div className="flex flex-col gap-6">

                    {/* Search Type Selection */}
                    <div className="bg-muted/30 p-1 rounded-xl flex w-fit border">
                      <button
                        type="button"
                        onClick={() => { setSearchType("protocolo"); setTermo(""); }}
                        className={`
                             px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2
                             ${searchType === "protocolo" ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted/50'}
                          `}
                      >
                        <FileText className="h-4 w-4" />
                        Protocolo
                      </button>
                      <button
                        type="button"
                        onClick={() => { setSearchType("cpf"); setTermo(""); }}
                        className={`
                             px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2
                             ${searchType === "cpf" ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted/50'}
                          `}
                      >
                        <Search className="h-4 w-4" />
                        CPF / CNPJ
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          id="termo"
                          value={termo}
                          onChange={(e) => {
                            let val = e.target.value;
                            if (searchType === 'cpf') {
                              val = val.replace(/\D/g, "");
                              if (val.length > 11) val = val.substring(0, 11);
                              val = val.replace(/(\d{3})(\d)/, "$1.$2");
                              val = val.replace(/(\d{3})(\d)/, "$1.$2");
                              val = val.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                            }
                            setTermo(val);
                          }}
                          placeholder={searchType === "protocolo" ? "Ex: 2026-0001" : "Digite o CPF..."}
                          className="h-14 text-lg px-4 bg-background"
                          autoFocus
                          required
                          maxLength={searchType === 'cpf' ? 14 : undefined}
                        />
                      </div>
                      <Button type="submit" size="lg" className="h-14 px-8 text-base shrink-0" disabled={searching}>
                        {searching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                        <span className="hidden md:inline ml-2">Consultar</span>
                      </Button>
                    </div>

                    <p className="text-sm text-muted-foreground ml-1">
                      {searchType === "protocolo"
                        ? "Informe o número gerado na abertura do processo."
                        : "Informe o documento do solicitante titular do processo."}
                    </p>
                  </div>
                </form>
              </div>
            )}

            {/* Not Found */}
            {notFound && (
              <div className="mt-6 bg-card rounded-2xl p-8 card-shadow text-center animate-scale-in border-2 border-dashed">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <AlertCircle className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Não encontramos nada</h3>
                <p className="text-muted-foreground text-sm">
                  Verifique se o número foi digitado corretamente e tente novamente.
                </p>
              </div>
            )}

            {/* RESULTS LIST VIEW */}
            {!selectedProtocol && resultados.length > 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Processos Encontrados ({resultados.length})</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {resultados.map((proc, idx) => (
                    <div key={idx} className="bg-card border rounded-xl p-5 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer flex flex-col justify-between group" onClick={() => setSelectedProtocol(proc)}>
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="font-mono font-bold text-lg text-primary bg-primary/5 px-2 py-1 rounded-md">{proc.protocolo}</span>
                          {getStatusBadge(proc.status)}
                        </div>
                        <h3 className="font-semibold mb-2 line-clamp-2">{proc.assunto}</h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {proc.secretaria}
                        </p>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2 bg-muted/30 p-2 rounded-lg w-fit">
                          <Clock className="h-4 w-4" />
                          <span>Aberto em: <strong>{proc.data}</strong></span>
                        </div>
                      </div>

                      <div className="pt-4 border-t mt-2 flex justify-end">
                        <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:underline">
                          Ver detalhes <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SELECTED PROTOCOL DETAIL VIEW */}
            {selectedProtocol && (
              <div className="bg-card rounded-2xl p-6 md:p-8 card-shadow animate-scale-in relative border">

                {resultados.length > 1 ? (
                  <Button variant="ghost" className="mb-6 gap-2 pl-0 hover:pl-2 transition-all -ml-2 text-muted-foreground" onClick={() => setSelectedProtocol(null)}>
                    <ArrowLeft className="h-4 w-4" /> Voltar para lista
                  </Button>
                ) : (
                  <Button variant="ghost" className="mb-6 gap-2 pl-0 hover:pl-2 transition-all -ml-2 text-muted-foreground" onClick={() => { setSelectedProtocol(null); setResultados([]); setTermo(""); }}>
                    <ArrowLeft className="h-4 w-4" /> Nova Consulta
                  </Button>
                )}

                <div className="flex flex-wrap items-start justify-between gap-4 mb-8 pb-6 border-b">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Número do Protocolo</p>
                    <p className="text-3xl md:text-4xl font-bold text-primary font-mono tracking-tight">{selectedProtocol.protocolo}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => publicService.downloadComprovante(selectedProtocol.protocolo)}
                      className="hidden sm:flex"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Imprimir Comprovante
                    </Button>
                    {getStatusBadge(selectedProtocol.status)}
                  </div>
                </div>

                <div className="sm:hidden mb-6">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => publicService.downloadComprovante(selectedProtocol.protocolo)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Imprimir Comprovante
                  </Button>
                </div>

                <div className="grid gap-6 sm:grid-cols-3 mb-10 bg-muted/10 p-6 rounded-xl border">
                  <div className="flex items-start gap-4 sm:col-span-3 lg:col-span-1">
                    <div className="bg-background p-2 rounded-lg border shadow-sm">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Assunto</p>
                      <p className="font-semibold text-lg">{selectedProtocol.assunto}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-background p-2 rounded-lg border shadow-sm">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Data de Abertura</p>
                      <p className="font-semibold text-lg">{selectedProtocol.data}</p>
                    </div>
                  </div>
                  {selectedProtocol.setor_atual && (
                    <div className="flex items-start gap-4 sm:col-span-3 lg:col-span-1">
                      <div className="bg-background p-2 rounded-lg border shadow-sm">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">Setor Atual</p>
                        <p className="font-semibold text-lg">{selectedProtocol.setor_atual}</p>
                      </div>
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Histórico de Movimentações
                </h3>

                <div className="relative space-y-8 pl-2 before:absolute before:inset-0 before:ml-6 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent pb-8">
                  {selectedProtocol.etapas.map((etapa, index) => (
                    <div key={index} className="relative flex gap-6 group">
                      <div className={`
                         absolute left-0 top-1 z-10 flex h-8 w-8 items-center justify-center rounded-full border ring-4 ring-background font-bold text-xs transition-colors
                         ${index === 0 ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground'}
                      `}>
                        {selectedProtocol.etapas.length - index}
                      </div>

                      <div className="flex flex-col gap-2 pl-10 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <span className="text-sm font-medium text-muted-foreground bg-muted/40 px-2 py-0.5 rounded">
                            {etapa.data}
                          </span>
                        </div>

                        <div className="rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md group-hover:border-primary/30">
                          <div className="flex items-center justify-between mb-3 border-b pb-3 border-dashed">
                            <div className="flex items-center gap-3">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-md text-sm font-bold border ${getStatusStyle(etapa.titulo)}`}>
                                {etapa.titulo}
                              </span>
                            </div>
                          </div>

                          <table className="w-full text-sm">
                            <tbody>
                              <tr>
                                <td className="w-24 font-medium text-muted-foreground align-top py-1">Setor:</td>
                                <td className="font-medium align-top py-1">
                                  {/* If observacao indicates transfer, show it. Otherwise show current sector for latest, or dash */}
                                  {etapa.observacao && etapa.observacao.startsWith("Processo transferido") ? (
                                    <span className="text-xs text-muted-foreground">{etapa.observacao}</span>
                                  ) : (
                                    index === 0 ? selectedProtocol.setor_atual : <span className="text-muted-foreground">-</span>
                                  )}
                                </td>
                              </tr>

                              {etapa.responsavel && (
                                <tr>
                                  <td className="w-24 font-medium text-muted-foreground align-top py-1">Responsável:</td>
                                  <td className="font-medium align-top py-1 text-foreground">
                                    {etapa.responsavel}
                                  </td>
                                </tr>
                              )}

                              {etapa.observacao && !etapa.titulo.startsWith("Transferido") && !etapa.observacao.startsWith("Processo transferido") && (
                                <tr>
                                  <td className="w-24 font-medium text-muted-foreground align-top py-3">Despacho:</td>
                                  <td className="align-top py-3">
                                    <div className="bg-muted/30 p-3 rounded-lg text-sm italic border-l-2 border-primary/50 text-muted-foreground">
                                      "{etapa.observacao}"
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Consulta;
