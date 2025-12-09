import React, { createContext, useContext } from "react";
import { useAuth0Token } from "@/_core/hooks/useAuth0Token";

type Auth0ContextType = {
  token: string | null;
  tokenLoading: boolean;
  tokenError: Error | null;
  isAuthenticated: boolean;
};

const Auth0Context = createContext<Auth0ContextType | undefined>(undefined);

export function Auth0TokenProvider({ children }: { children: React.ReactNode }) {
  const { token, tokenLoading, tokenError, isAuthenticated } = useAuth0Token();

  return (
    <Auth0Context.Provider value={{ token, tokenLoading, tokenError, isAuthenticated }}>
      {children}
    </Auth0Context.Provider>
  );
}

export function useAuth0TokenContext() {
  const context = useContext(Auth0Context);
  if (!context) {
    throw new Error("useAuth0TokenContext must be used within Auth0TokenProvider");
  }
  return context;
}
