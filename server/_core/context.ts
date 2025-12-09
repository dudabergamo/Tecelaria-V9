import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { authenticateAuth0Request } from "./auth0";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    console.log("[Context] Creating context for request:", opts.req.path);
    
    // Authenticate using Auth0
    user = await authenticateAuth0Request(opts.req);
    
    if (user) {
      console.log("[Context] ✅ User authenticated:", user.id);
    } else {
      console.log("[Context] ⚠️  No authenticated user");
    }
  } catch (error) {
    console.error("[Context] ❌ Error during authentication:", error);
    // Authentication is optional for public procedures
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
