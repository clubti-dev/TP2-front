import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Abertura from "./pages/Abertura";
import Consulta from "./pages/Consulta";
import Contatos from "./pages/Contatos";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import Secretarias from "./pages/Secretarias";
import Assuntos from "./pages/Assuntos";
import Usuarios from "./pages/Usuarios";
import Protocolos from "./pages/Protocolos";
import ProtocoloDetalhes from "./pages/ProtocoloDetalhes";
import Configuracoes from "./pages/Configuracoes";
import Movimentacoes from "./pages/Movimentacoes";
import NotFound from "./pages/NotFound";
import Solicitantes from "./pages/Solicitantes";
import Perfil from "./pages/Perfil";
import EsqueciSenha from "./pages/EsqueciSenha";
import RedefinirSenha from "./pages/RedefinirSenha";

import Solicitacoes from "./pages/Solicitacoes";
import DocumentosNecessarios from "./pages/DocumentosNecessarios";
import Setores from "./pages/Setores";
import { useEffect } from "react";
import { municipioService } from "./services/municipioService";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const applyColors = async () => {
      try {
        const municipio = await municipioService.get();
        if (municipio) {
          const root = document.documentElement;
          if (municipio.cor_primaria) {
            root.style.setProperty('--primary', hexToHsl(municipio.cor_primaria));
          }
          if (municipio.cor_secundaria) {
            root.style.setProperty('--secondary', hexToHsl(municipio.cor_secundaria));
          }
          if (municipio.cor_terciaria) {
            root.style.setProperty('--accent', hexToHsl(municipio.cor_terciaria));
          }
        }
      } catch (error) {
        console.error("Erro ao aplicar cores:", error);
      }
    };
    applyColors();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <HashRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/abertura" element={<Abertura />} />
              <Route path="/consulta" element={<Consulta />} />
              <Route path="/contatos" element={<Contatos />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/esqueci-senha" element={<EsqueciSenha />} />
              <Route path="/redefinir-senha" element={<RedefinirSenha />} />
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/protocolos" element={<Protocolos />} />
                <Route path="/admin/protocolos/:id" element={<ProtocoloDetalhes />} />
                <Route path="/admin/perfil" element={<Perfil />} />
                <Route path="/admin/movimentacoes" element={<Movimentacoes />} />
              </Route>

              {/* Management Routes (Master & Admin) */}
              <Route element={<ProtectedRoute allowedRoles={['Master', 'Admin']} />}>
                <Route path="/admin/usuarios" element={<Usuarios />} />
                <Route path="/admin/solicitantes" element={<Solicitantes />} />
                <Route path="/admin/secretarias" element={<Secretarias />} />
                <Route path="/admin/setores" element={<Setores />} />
                <Route path="/admin/solicitacoes" element={<Solicitacoes />} />
                <Route path="/admin/documentos-necessarios" element={<DocumentosNecessarios />} />
              </Route>

              {/* Configuration Routes (Master Only) */}
              <Route element={<ProtectedRoute allowedRoles={['Master']} />}>
                <Route path="/admin/configuracoes" element={<Configuracoes />} />
              </Route>

              {/* Legacy routes - redirect or keep for compatibility if needed */}
              <Route path="/cadastro/assuntos" element={<Assuntos />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

// Helper to convert Hex to HSL (shadcn uses HSL space-separated values)
function hexToHsl(hex: string) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt("0x" + hex[1] + hex[1]);
    g = parseInt("0x" + hex[2] + hex[2]);
    b = parseInt("0x" + hex[3] + hex[3]);
  } else if (hex.length === 7) {
    r = parseInt("0x" + hex[1] + hex[2]);
    g = parseInt("0x" + hex[3] + hex[4]);
    b = parseInt("0x" + hex[5] + hex[6]);
  }
  r /= 255;
  g /= 255;
  b /= 255;
  const cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin;
  let h = 0, s = 0, l = 0;

  if (delta === 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return `${h} ${s}% ${l}%`;
}

export default App;
