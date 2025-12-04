import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="mb-4 flex justify-center">
                            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 mb-2">
                            Algo deu errado
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Ocorreu um erro inesperado na aplicação.
                        </p>
                        <div className="bg-gray-100 p-4 rounded text-left mb-6 overflow-auto max-h-40 text-xs font-mono text-red-600">
                            {this.state.error?.toString()}
                        </div>
                        <Button
                            onClick={() => window.location.reload()}
                            className="w-full"
                        >
                            Recarregar Página
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
