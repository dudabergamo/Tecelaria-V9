import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Callback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // O servidor já fez o redirect, mas se por algum motivo
    // o usuário chegar aqui, redirecionar para dashboard
    // O AuthContext vai verificar se está autenticado
    console.log('[Callback] Redirecionando para /dashboard');
    setLocation("/dashboard");
  }, [setLocation]);


  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Processando login...</p>
      </div>
    </div>
  );
}
