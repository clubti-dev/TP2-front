import { NavLink } from "@/components/NavLink";
import { Building2, Lock, Menu, X, ChevronDown, Building, FileText, Users, FileStack } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { municipioService, Municipio } from "@/services/municipioService";
import { getStorageUrl } from "@/utils/urlUtils";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
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

  const navItems = [
    { to: "/", label: "Início" },
    { to: "/abertura", label: "Abertura" },
    { to: "/consulta", label: "Consultar" },
    { to: "/contatos", label: "Contatos" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-header/80 backdrop-blur-md border-b border-white/10 shadow-sm support-[backdrop-filter]:bg-header/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-3 text-header-foreground">
            {municipio?.logo_municipio ? (
              <img
                src={getStorageUrl(municipio.logo_municipio) || ''}
                alt="Logo"
                className="h-10 w-auto object-contain rounded-lg bg-white/10 backdrop-blur p-1"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-header-foreground/10 backdrop-blur">
                <Building2 className="h-6 w-6" />
              </div>
            )}
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-tight">TP Web</p>
              <p className="text-xs opacity-80">{municipio?.nome_municipio || "Prefeitura Municipal"}</p>
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="px-4 py-2 text-sm font-medium text-header-foreground/80 rounded-lg transition-all hover:bg-header-foreground/10 hover:text-header-foreground"
                activeClassName="bg-header-foreground/15 text-header-foreground"
              >
                {item.label}
              </NavLink>
            ))}



            <Button
              variant="outline"
              size="sm"
              className="ml-2 bg-orange-100 text-orange-900 border-orange-200 hover:bg-orange-200 hover:text-orange-950 hover:border-orange-300"
              onClick={() => navigate("/admin")}
            >
              <Lock className="h-4 w-4 mr-1" />
              Área Restrita
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-header-foreground hover:bg-header-foreground/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="px-4 py-3 text-sm font-medium text-header-foreground/80 rounded-lg transition-all hover:bg-header-foreground/10"
                  activeClassName="bg-header-foreground/15 text-header-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}



              <Button
                variant="outline"
                size="sm"
                className="mt-2 mx-4 bg-orange-100 text-orange-900 border-orange-200 hover:bg-orange-200 hover:text-orange-950 hover:border-orange-300"
                onClick={() => {
                  navigate("/admin");
                  setMobileMenuOpen(false);
                }}
              >
                <Lock className="h-4 w-4 mr-1" />
                Área Restrita
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
