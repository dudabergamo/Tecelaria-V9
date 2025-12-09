import React, { useEffect } from "react";
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

// Store current token globally
let currentToken: string | null = null;

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
          headers: {
            ...(init?.headers ?? {}),
            ...(currentToken && { Authorization: `Bearer ${currentToken}` }),
          },
        });
      },
    }),
  ],
});

// Component that updates the token
function TokenUpdater() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (!isAuthenticated) {
      currentToken = null;
      return;
    }

    const updateToken = async () => {
      try {
        const token = await getAccessTokenSilently();
        currentToken = token;
      } catch (error) {
        console.error("Failed to get token:", error);
        currentToken = null;
      }
    };

    updateToken();
  }, [isAuthenticated, getAccessTokenSilently]);

  return null;
}

function AppWithTokenUpdater() {
  return (
    <>
      <TokenUpdater />
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
      audience: auth0Domain,
    }}
  >
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AppWithTokenUpdater />
      </QueryClientProvider>
    </trpc.Provider>
  </Auth0Provider>
);
