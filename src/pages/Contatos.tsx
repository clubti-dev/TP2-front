import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import { useState } from "react";

const Contatos = () => {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: "Mensagem enviada!",
      description: "Retornaremos seu contato em breve.",
    });

    setSending(false);
    (e.target as HTMLFormElement).reset();
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Telefone",
      content: "(00) 0000-0000",
      description: "Seg a Sex, 8h às 17h",
    },
    {
      icon: Mail,
      title: "E-mail",
      content: "protocolo@prefeitura.gov.br",
      description: "Resposta em até 48h",
    },
    {
      icon: MapPin,
      title: "Endereço",
      content: "Praça Central, 100 - Centro",
      description: "CEP: 00000-000",
    },
    {
      icon: Clock,
      title: "Horário de Atendimento",
      content: "Segunda a Sexta",
      description: "08:00 às 17:00",
    },
  ];

  return (
    <Layout>
      {/* Header */}
      <section className="hero-gradient py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center text-header-foreground animate-fade-in">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-header-foreground/10">
              <MessageCircle className="h-7 w-7" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mb-2">
              Contatos
            </h1>
            <p className="opacity-80">
              Entre em contato conosco. Estamos aqui para ajudar.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 md:py-14 -mt-6">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Contact Info */}
              <div className="animate-slide-up">
                <h2 className="text-xl font-semibold mb-6">
                  Informações de Contato
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  {contactInfo.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-card rounded-xl card-shadow"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{item.title}</p>
                        <p className="font-semibold">{item.content}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Form */}
              <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
                <h2 className="text-xl font-semibold mb-6">
                  Envie uma Mensagem
                </h2>
                <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 card-shadow">
                  <div className="grid gap-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome *</Label>
                        <Input id="nome" placeholder="Seu nome" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail *</Label>
                        <Input id="email" type="email" placeholder="seu@email.com" required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="assunto">Assunto *</Label>
                      <Input id="assunto" placeholder="Assunto da mensagem" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mensagem">Mensagem *</Label>
                      <Textarea
                        id="mensagem"
                        placeholder="Digite sua mensagem..."
                        rows={5}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={sending}>
                      {sending ? (
                        "Enviando..."
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Enviar Mensagem
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="pb-10 md:pb-14">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-muted rounded-2xl h-64 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MapPin className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Mapa da localização</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contatos;
