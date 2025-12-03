import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Configuracoes from "./pages/Configuracoes";
import Movimentacoes from "./pages/Movimentacoes";
import NotFound from "./pages/NotFound";
import Solicitantes from "./pages/Solicitantes";
import Perfil from "./pages/Perfil";

import Solicitacoes from "./pages/Solicitacoes";
import DocumentosNecessarios from "./pages/DocumentosNecessarios";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/abertura" element={<Abertura />} />
            <Route path="/consulta" element={<Consulta />} />
            <Route path="/contatos" element={<Contatos />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/protocolos" element={<Protocolos />} />
            <Route path="/admin/usuarios" element={<Usuarios />} />
            <Route path="/admin/perfil" element={<Perfil />} />
            <Route path="/admin/solicitantes" element={<Solicitantes />} />
            <Route path="/admin/configuracoes" element={<Configuracoes />} />
            <Route path="/admin/movimentacoes" element={<Movimentacoes />} />
            <Route path="/admin/secretarias" element={<Secretarias />} />
            <Route path="/admin/solicitacoes" element={<Solicitacoes />} />
            <Route path="/admin/documentos-necessarios" element={<DocumentosNecessarios />} />

            {/* Legacy routes - redirect or keep for compatibility if needed */}
            <Route path="/cadastro/assuntos" element={<Assuntos />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
