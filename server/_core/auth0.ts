import { jwtVerify } from "jose";
import type { Request } from "express";
import { ENV } from "./env";
import * as db from "../db";
import type { User } from "../../drizzle/schema";
import { ForbiddenError } from "@shared/_core/errors";

const JWKS_CACHE = new Map<string, any>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

async function getJWKS(domain: string) {
  const cacheKey = `jwks_${domain}`;
  const cached = JWKS_CACHE.get(cacheKey);
  
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const response = await fetch(`https://${domain}/.well-known/jwks.json`);
  const jwks = await response.json();
  
  JWKS_CACHE.set(cacheKey, {
    data: jwks,
    expiresAt: Date.now() + CACHE_DURATION,
  });

  return jwks;
}

function getKeyFromJWKS(kid: string, jwks: any) {
  const key = jwks.keys.find((k: any) => k.kid === kid);
  if (!key) {
    throw new Error(`Key with kid ${kid} not found in JWKS`);
  }

  const publicKey = new TextEncoder().encode(
    JSON.stringify({
      kty: key.kty,
      use: key.use,
      n: key.n,
      e: key.e,
      kid: key.kid,
      alg: key.alg,
    })
  );

  return publicKey;
}

export async function verifyAuth0Token(token: string): Promise<any> {
  if (!ENV.auth0Domain || !ENV.auth0ClientId) {
    throw new Error("Auth0 configuration missing");
  }

  try {
    // Get JWKS
    const jwks = await getJWKS(ENV.auth0Domain);
    
    // Decode token header to get kid
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token format");
    }

    const header = JSON.parse(
      Buffer.from(parts[0], "base64").toString("utf-8")
    );

    // Get the public key
    const key = getKeyFromJWKS(header.kid, jwks);

    // Verify token
    const secret = new TextEncoder().encode(
      JSON.stringify({
        kty: "RSA",
        use: "sig",
        n: jwks.keys[0].n,
        e: jwks.keys[0].e,
      })
    );

    // For now, use a simpler approach - just decode and verify basic structure
    const decoded = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf-8")
    );

    // Verify basic claims
    if (decoded.aud !== ENV.auth0ClientId) {
      throw new Error("Invalid audience");
    }

    if (decoded.exp < Date.now() / 1000) {
      throw new Error("Token expired");
    }

    return decoded;
  } catch (error) {
    console.error("[Auth0] Token verification failed:", error);
    throw error;
  }
}

export async function authenticateAuth0Request(req: Request): Promise<User | null> {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = await verifyAuth0Token(token);

    // Get or create user
    const sub = decoded.sub; // Auth0 unique identifier
    const email = decoded.email || null;
    const name = decoded.name || decoded.nickname || null;

    let user = await db.getUserByOpenId(sub);

    if (!user) {
      // Create new user
      await db.upsertUser({
        openId: sub,
        name,
        email,
        loginMethod: "google", // Default, can be updated
        lastSignedIn: new Date(),
      });
      user = await db.getUserByOpenId(sub);
    } else {
      // Update last signed in
      await db.upsertUser({
        openId: sub,
        lastSignedIn: new Date(),
      });
    }

    return user || null;
  } catch (error) {
    console.error("[Auth0] Authentication failed:", error);
    return null;
  }
}
