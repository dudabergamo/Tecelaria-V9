import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "wouter";

export default function Callback() {
  const { isLoading, error } = useAuth0();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (error) {
      console.error("Auth0 error:", error);
      setLocation("/");
      return;
    }

    // Redirect to dashboard after successful login
    setLocation("/dashboard");
  }, [isLoading, error, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Processando login...</p>
      </div>
    </div>
  );
}
