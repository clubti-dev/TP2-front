import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const { user, isAuthenticated, isLoading, logout } = useAuth();

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Carregando...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin" replace />;
    }

    // Check for stale data (authenticated but missing profile)
    if (isAuthenticated && !user?.perfil) {
        logout();
        return <Navigate to="/admin" replace />;
    }

    if (allowedRoles && user?.perfil && !allowedRoles.includes(user.perfil.descricao)) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
