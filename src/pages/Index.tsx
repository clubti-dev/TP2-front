import { FileText, Search, Info, Clock, Shield, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";
import ActionCard from "@/components/ActionCard";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-gradient py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-header-foreground animate-fade-in">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              TP Web
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-2">
              Sistema de Tramitação de Processos
            </p>
            <p className="text-sm md:text-base opacity-75 max-w-2xl mx-auto">
              Visando à agilidade no atendimento aos contribuintes, o TP Web permite efetuar consulta e abertura de processos administrativos junto à Prefeitura de forma online e segura.
            </p>
          </div>
        </div>
      </section>

      {/* Action Cards */}
      <section className="py-12 md:py-16 -mt-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            <ActionCard
              to="/abertura"
              icon={FileText}
              title="Iniciar Processo"
              description="Faça a abertura de um novo processo administrativo online de forma rápida e segura."
              color="primary"
              delay={100}
            />
            <ActionCard
              to="/consulta"
              icon={Search}
              title="Consultar Processo"
              description="Acompanhe o andamento do seu processo usando o número do protocolo ou CPF."
              color="secondary"
              delay={200}
            />
            <ActionCard
              to="/contatos"
              icon={Info}
              title="Informações e Contatos"
              description="Dúvidas? Entre em contato com nossa equipe de atendimento."
              color="primary"
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 animate-fade-in">
            Por que usar o TP Web?
          </h2>
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            <div className="text-center animate-slide-up" style={{ animationDelay: "100ms" }}>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Clock className="h-7 w-7" />
              </div>
              <h3 className="font-semibold mb-2">Agilidade</h3>
              <p className="text-sm text-muted-foreground">
                Realize solicitações sem sair de casa, 24 horas por dia, 7 dias por semana.
              </p>
            </div>
            <div className="text-center animate-slide-up" style={{ animationDelay: "200ms" }}>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <Shield className="h-7 w-7" />
              </div>
              <h3 className="font-semibold mb-2">Segurança</h3>
              <p className="text-sm text-muted-foreground">
                Seus dados são protegidos com os mais altos padrões de segurança digital.
              </p>
            </div>
            <div className="text-center animate-slide-up" style={{ animationDelay: "300ms" }}>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle className="h-7 w-7" />
              </div>
              <h3 className="font-semibold mb-2">Transparência</h3>
              <p className="text-sm text-muted-foreground">
                Acompanhe todas as etapas do seu processo em tempo real.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center bg-card rounded-2xl p-8 card-shadow animate-scale-in">
            <h2 className="text-xl md:text-2xl font-bold mb-3">
              Precisa de ajuda?
            </h2>
            <p className="text-muted-foreground mb-6">
              Nossa equipe está pronta para auxiliar você em qualquer dúvida sobre o sistema ou seus processos.
            </p>
            <Link
              to="/contatos"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg"
            >
              Fale Conosco
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
