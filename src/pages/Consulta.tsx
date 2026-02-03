import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FileText, Clock, CheckCircle, AlertCircle, MapPin } from "lucide-react";

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
  const [resultado, setResultado] = useState<ProcessoResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearching(true);
    setNotFound(false);
    setResultado(null);

    // Determine search type and term
    const form = e.currentTarget;
    const isProtocolo = form.querySelector('#protocolo') !== null;
    const termo = isProtocolo
      ? (form.querySelector('#protocolo') as HTMLInputElement).value
      : (form.querySelector('#cpf') as HTMLInputElement).value;
    const tipo = isProtocolo ? 'protocolo' : 'cpf';

    try {
      const result = await import("@/services/publicService").then(m => m.publicService.consultarProtocolo(termo, tipo));

      if (result) {
        setResultado(result);
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
    // Map backend keys to descriptions for display
    const labels = {
      aberto: "Aberto",
      em_analise: "Em Análise",
      deferido: "Deferido",
      indeferido: "Indeferido",
      pendente: "Pendente",
    };

    // Get style based on the label content
    const styleClass = getStatusStyle(labels[status]);

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${styleClass}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <Layout>
      {/* Header */}
      <section className="hero-gradient py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center text-header-foreground animate-fade-in">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-header-foreground/10">
              <Search className="h-5 w-5" />
            </div>
            <h1 className="text-xl md:text-3xl font-bold mb-1">
              Consultar Processo
            </h1>
            <p className="opacity-80 text-sm">
              Acompanhe o andamento do seu processo administrativo.
            </p>
          </div>
        </div>
      </section>

      {/* Search Form */}
      <section className="py-6 md:py-10 -mt-6">
        <div className="container mx-auto px-4">
          <div className="max-w-[1600px] mx-auto">
            <div className="bg-card rounded-2xl p-6 md:p-8 card-shadow animate-slide-up">
              <Tabs defaultValue="protocolo">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="protocolo">Por Protocolo</TabsTrigger>
                  <TabsTrigger value="cpf">Por CPF</TabsTrigger>
                </TabsList>

                <TabsContent value="protocolo">
                  <form onSubmit={handleSearch}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="protocolo">Número do Protocolo</Label>
                        <Input
                          id="protocolo"
                          placeholder="Ex: 2024001234"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={searching}>
                        {searching ? "Buscando..." : "Consultar"}
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="cpf">
                  <form onSubmit={handleSearch}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cpf">CPF do Solicitante</Label>
                        <Input
                          id="cpf"
                          placeholder="000.000.000-00"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={searching}>
                        {searching ? "Buscando..." : "Consultar"}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </div>

            {/* Not Found */}
            {notFound && (
              <div className="mt-6 bg-card rounded-2xl p-8 card-shadow text-center animate-scale-in">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <AlertCircle className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Processo não encontrado</h3>
                <p className="text-muted-foreground text-sm">
                  Verifique os dados informados e tente novamente.
                </p>
              </div>
            )}

            {/* Result */}
            {resultado && (
              <div className="mt-6 bg-card rounded-2xl p-4 md:p-6 card-shadow animate-scale-in">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6 pb-6 border-b">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Protocolo</p>
                    <p className="text-2xl font-bold text-primary">{resultado.protocolo}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => import("@/services/publicService").then(m => m.publicService.downloadComprovante(resultado.protocolo))}
                      className="hidden sm:flex"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Imprimir Comprovante
                    </Button>
                    {getStatusBadge(resultado.status)}
                  </div>
                </div>

                <div className="sm:hidden mb-6">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => import("@/services/publicService").then(m => m.publicService.downloadComprovante(resultado.protocolo))}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Imprimir Comprovante
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-3 mb-8">
                  <div className="flex items-start gap-3 sm:col-span-3 lg:col-span-1">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Assunto</p>
                      <p className="font-medium">{resultado.assunto}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Data de Abertura</p>
                      <p className="font-medium">{resultado.data}</p>
                    </div>
                  </div>
                  {resultado.tem_anexos !== undefined && (
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${resultado.tem_anexos ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"}`}>
                        <FileText className="h-3 w-3" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Anexos</p>
                        <p className="font-medium">{resultado.tem_anexos ? "Sim" : "Não"}</p>
                      </div>
                    </div>
                  )}
                  {resultado.setor_atual && (
                    <div className="flex items-start gap-3 sm:col-span-3 lg:col-span-1 border-t pt-4 sm:border-t-0 sm:pt-0">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Setor Atual</p>
                        <p className="font-medium">{resultado.setor_atual}</p>
                      </div>
                    </div>
                  )}
                </div>

                <h3 className="font-semibold mb-4">Andamento do Processo</h3>
                <div className="relative space-y-8 pl-2 before:absolute before:inset-0 before:ml-6 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {resultado.etapas.map((etapa, index) => (
                    <div key={index} className="relative flex gap-6">
                      <div className="absolute left-0 top-1 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background border ring-4 ring-background font-bold text-xs text-muted-foreground">
                        {index + 1}
                      </div>

                      <div className="flex flex-col gap-2 pl-10 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <span className="text-sm font-medium text-muted-foreground">
                            {etapa.data}
                          </span>
                        </div>

                        <div className="rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                          <table className="w-full text-sm">
                            <tbody>
                              {/* Status Line */}
                              <tr>
                                <td className="w-24 font-semibold text-muted-foreground align-top py-1.5">Status:</td>
                                <td className="align-top py-1">
                                  <span className={`inline-flex px-2 py-0.5 rounded text-sm font-semibold border ${getStatusStyle(
                                    etapa.titulo.startsWith("Transferido")
                                      ? etapa.status_anterior || "Aberto"
                                      : etapa.titulo
                                  )}`}>
                                    {etapa.titulo.startsWith("Transferido")
                                      ? etapa.status_anterior || "Aberto"
                                      : etapa.titulo}
                                  </span>
                                </td>
                              </tr>

                              {/* Secretaria Line */}
                              <tr>
                                <td className="w-24 font-semibold text-muted-foreground align-top py-1">Secretaria:</td>
                                <td className="font-medium align-top py-1">
                                  {resultado.secretaria}
                                </td>
                              </tr>

                              {/* Setor Line */}
                              <tr>
                                <td className="w-24 font-semibold text-muted-foreground align-top py-1">Setor:</td>
                                <td className="font-medium align-top py-1">
                                  {etapa.titulo.startsWith("Transferido") ? (
                                    <span>{etapa.titulo}</span>
                                  ) : (
                                    index === 0 ? resultado.setor_atual : "-"
                                  )}
                                </td>
                              </tr>

                              {/* Responsável Line */}
                              {etapa.responsavel && (
                                <tr>
                                  <td className="w-24 font-semibold text-muted-foreground align-top py-1">Responsável:</td>
                                  <td className="font-medium align-top py-1">
                                    {etapa.responsavel}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>

                          {/* Dispatch Indicator */}
                          {etapa.observacao && !etapa.titulo.startsWith("Transferido") && (
                            <div className="pt-1">
                              <div className="text-xs text-muted-foreground flex items-center gap-1.5 italic bg-muted/30 p-2 rounded w-fit">
                                <FileText className="h-3 w-3" />
                                <span>Possui despacho/observação interna</span>
                              </div>
                            </div>
                          )}
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
