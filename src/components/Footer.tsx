import { Building2, Mail, MapPin, Phone } from "lucide-react";
import clubtiLogo from "@/assets/clubti-logo.png";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { municipioService, Municipio } from "@/services/municipioService";
import { getStorageUrl } from "@/utils/urlUtils";

const Footer = () => {
  const [municipio, setMunicipio] = useState<Municipio | null>(null);

  useEffect(() => {
    const fetchMunicipio = async () => {
      try {
        const data = await municipioService.get();
        setMunicipio(data);
      } catch (error) {
        console.error("Erro ao carregar dados do município:", error);
      }
    };
    fetchMunicipio();
  }, []);

  return (
    <footer className="bg-header text-header-foreground mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {municipio?.logo_municipio ? (
                <img
                  src={getStorageUrl(municipio.logo_municipio) || ''}
                  alt="Logo"
                  className="h-12 w-auto object-contain rounded-lg bg-white/10 backdrop-blur p-1"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-header-foreground/10">
                  <Building2 className="h-6 w-6" />
                </div>
              )}
              <div>
                <p className="font-semibold">TP Web</p>
                <p className="text-xs opacity-80">{municipio?.nome_municipio || "Prefeitura Municipal"}</p>
              </div>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              Sistema de abertura e consulta de processos administrativos online.
              Agilidade e transparência no atendimento ao cidadão.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Links Rápidos</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <Link to="/abertura" className="hover:opacity-100 transition-opacity">
                  Abertura de Processo
                </Link>
              </li>
              <li>
                <Link to="/consulta" className="hover:opacity-100 transition-opacity">
                  Consultar Processo
                </Link>
              </li>
              <li>
                <Link to="/contatos" className="hover:opacity-100 transition-opacity">
                  Contatos
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contato</h3>
            <ul className="space-y-3 text-sm opacity-80">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{municipio?.telefone || "(00) 0000-0000"}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{municipio?.email || "contato@prefeitura.gov.br"}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>
                  {municipio ? (
                    `${municipio.logradouro}, ${municipio.numero}${municipio.complemento ? ` - ${municipio.complemento}` : ''} - ${municipio.bairro}, ${municipio.nome_municipio} - ${municipio.uf}`
                  ) : (
                    "Praça Central, 100 - Centro"
                  )}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-header-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm opacity-60">
          <p>© {new Date().getFullYear()} {municipio?.nome_municipio || "Prefeitura Municipal"}. Todos os direitos reservados.</p>
          <a
            href="https://www.clubti.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            <img src={clubtiLogo} alt="ClubTI - Soluções em Software" className="h-8" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
