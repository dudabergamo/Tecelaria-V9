import { Auth0Provider } from "@auth0/auth0-react";
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

// Create TRPC client that will be updated with token
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

// Component to update token from Auth0
function TokenUpdater() {
  const { getAccessTokenSilently, isAuthenticated } = require("@auth0/auth0-react").useAuth0();

  React.useEffect(() => {
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

import React from "react";

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
