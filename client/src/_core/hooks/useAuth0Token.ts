import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

export function useAuth0Token() {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();
  const [token, setToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [tokenError, setTokenError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isAuthenticated || isLoading) {
      setTokenLoading(false);
      return;
    }

    const getToken = async () => {
      try {
        setTokenLoading(true);
        const accessToken = await getAccessTokenSilently();
        setToken(accessToken);
        setTokenError(null);
      } catch (error) {
        console.error("Failed to get Auth0 token:", error);
        setTokenError(error instanceof Error ? error : new Error("Unknown error"));
        setToken(null);
      } finally {
        setTokenLoading(false);
      }
    };

    getToken();
  }, [isAuthenticated, isLoading, getAccessTokenSilently]);

  return { token, tokenLoading, tokenError, isAuthenticated };
}
