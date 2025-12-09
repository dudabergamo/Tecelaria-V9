import React, { useEffect, useState } from "react";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = "/login";
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const auth0RedirectUri = `${window.location.origin}/callback`;

// Global token store
let globalToken: string | null = null;

// Create TRPC client with dynamic token
const createTrpcClient = () => {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: "/api/trpc",
        transformer: superjson,
        fetch(input, init) {
          const headers: Record<string, string> = {
            ...(init?.headers as Record<string, string> || {}),
          };

          // Add token if available
          if (globalToken) {
            headers["Authorization"] = `Bearer ${globalToken}`;
            console.log("[TRPC] Sending token:", globalToken.substring(0, 20) + "...");
          } else {
            console.log("[TRPC] No token available");
          }

          return globalThis.fetch(input, {
            ...(init ?? {}),
            credentials: "include",
            headers,
          });
        },
      }),
    ],
  });
};

let trpcClient = createTrpcClient();

// Component that manages token updates
function TokenManager() {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();
  const [lastToken, setLastToken] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      globalToken = null;
      setLastToken(null);
      console.log("[TokenManager] User not authenticated");
      return;
    }

    const updateToken = async () => {
      try {
        console.log("[TokenManager] Getting token from Auth0...");
        const token = await getAccessTokenSilently({
          detailedResponse: false,
        });
        
        globalToken = token;
        setLastToken(token);
        console.log("[TokenManager] Token updated:", token.substring(0, 20) + "...");
      } catch (error) {
        console.error("[TokenManager] Failed to get token:", error);
        globalToken = null;
        setLastToken(null);
      }
    };

    updateToken();

    // Update token every 5 minutes
    const interval = setInterval(updateToken, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, isLoading, getAccessTokenSilently]);

  return null;
}

function AppWithTokenManager() {
  return (
    <>
      <TokenManager />
      <App />
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <Auth0Provider
    domain={auth0Domain}
    clientId={auth0ClientId}
    authorizationParams={{
      redirect_uri: auth0RedirectUri,
    }}
  >
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AppWithTokenManager />
      </QueryClientProvider>
    </trpc.Provider>
  </Auth0Provider>
);
