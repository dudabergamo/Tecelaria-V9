import { Auth0Provider } from "@auth0/auth0-react";
import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { Auth0TokenProvider } from "./contexts/Auth0Context";
import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  // Redirect to Auth0 login
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

// Create TRPC client with Auth0 token support
function createTrpcClient(getToken: () => string | null) {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: "/api/trpc",
        transformer: superjson,
        fetch(input, init) {
          const token = getToken();
          return globalThis.fetch(input, {
            ...(init ?? {}),
            credentials: "include",
            headers: {
              ...(init?.headers ?? {}),
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          });
        },
      }),
    ],
  });
}

const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const auth0RedirectUri = `${window.location.origin}/callback`;

// Initialize TRPC client with a placeholder token getter
let currentToken: string | null = null;
const trpcClient = createTrpcClient(() => currentToken);

function AppWrapper() {
  return (
    <Auth0TokenProvider>
      <TrpcClientUpdater setToken={(token) => { currentToken = token; }} />
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </trpc.Provider>
    </Auth0TokenProvider>
  );
}

function TrpcClientUpdater({ setToken }: { setToken: (token: string | null) => void }) {
  const { token } = require("./contexts/Auth0Context").useAuth0TokenContext();
  
  React.useEffect(() => {
    setToken(token);
  }, [token, setToken]);

  return null;
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
    <AppWrapper />
  </Auth0Provider>
);
