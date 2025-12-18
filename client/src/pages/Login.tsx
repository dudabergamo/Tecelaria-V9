import { Button } from "@/components/ui/button";

export default function Login() {
  const handleLogin = () => {
    window.location.href = "/api/auth/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-muted">
      <div className="max-w-md w-full mx-auto px-4 py-8 text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="/images/logo-transparent.png" 
            alt="Tecelaria" 
            className="h-32 w-auto"
          />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Bem-vindo à Tecelaria</h1>
          <p className="text-muted-foreground">
            Transforme suas memórias em um livro em 105 dias
          </p>
        </div>
        
        <div className="space-y-3">
          <Button 
            size="lg" 
            className="w-full text-lg"
            onClick={handleLogin}
          >
            Fazer Login
          </Button>
          
          <Button 
            size="lg" 
            variant="outline"
            className="w-full text-lg"
            onClick={handleLogin}
          >
            Criar Conta
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Você pode fazer login com Google, GitHub ou email
        </p>
      </div>
    </div>
  );
}
