import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface ProcessoResult {
  protocolo: string;
  assunto: string;
  data: string;
  status: "em_analise" | "deferido" | "indeferido" | "pendente" | "aberto";
  tem_anexos?: boolean;
  etapas: { titulo: string; data: string; observacao: string; concluida: boolean }[];
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

  const getStatusBadge = (status: ProcessoResult["status"]) => {
    const styles = {
      aberto: "bg-blue-500/20 text-blue-600",
      em_analise: "bg-accent/20 text-accent-foreground",
      deferido: "bg-success/20 text-success",
      indeferido: "bg-destructive/20 text-destructive",
      pendente: "bg-muted text-muted-foreground",
    };
    const labels = {
      aberto: "Aberto",
      em_analise: "Em Análise",
      deferido: "Deferido",
      indeferido: "Indeferido",
      pendente: "Pendente",
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <Layout>
      {/* Header */}
      <section className="hero-gradient py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center text-header-foreground animate-fade-in">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-header-foreground/10">
              <Search className="h-7 w-7" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mb-2">
              Consultar Processo
            </h1>
            <p className="opacity-80">
              Acompanhe o andamento do seu processo administrativo.
            </p>
          </div>
        </div>
      </section>

      {/* Search Form */}
      <section className="py-10 md:py-14 -mt-6">
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
                </div>

                <h3 className="font-semibold mb-4">Andamento do Processo</h3>
                <div className="space-y-0 relative before:absolute before:inset-0 before:ml-2.5 before:h-full before:w-0.5 before:bg-muted">
                  {resultado.etapas.map((etapa, index) => (
                    <div key={index} className="relative flex gap-6 pb-8 last:pb-0">
                      <div
                        className={`absolute left-0 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-4 ring-card ${etapa.concluida
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                          }`}
                      >
                        {etapa.concluida ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <span className="text-xs">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 pl-8">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                          <p className={`font-medium ${!etapa.concluida && "text-muted-foreground"}`}>
                            {etapa.titulo}
                          </p>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {etapa.data}
                          </span>
                        </div>
                        {etapa.observacao && (
                          <div className="mt-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                            <p className="whitespace-pre-wrap">{etapa.observacao}</p>
                          </div>
                        )}
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
