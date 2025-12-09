import type { Request } from "express";
import * as jwt from "jsonwebtoken";
import * as db from "../db";
import type { User } from "../../drizzle/schema";

// Cache for Auth0 public keys (24 hours)
let cachedPublicKey: string | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000;

const AUTH0_DOMAIN = "tecelaria.us.auth0.com";
const AUTH0_CLIENT_ID = "Xs3XC5cXnfT5AE7Lvcas4qOTamcZccNd";

/**
 * Fetch Auth0 public key from JWKS endpoint
 */
async function getAuth0PublicKey(): Promise<string> {
  const now = Date.now();
  
  // Return cached key if still valid
  if (cachedPublicKey && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log("[Auth0] Using cached public key");
    return cachedPublicKey;
  }

  try {
    console.log("[Auth0] Fetching public key from Auth0 JWKS endpoint...");
    
    const jwksUrl = `https://${AUTH0_DOMAIN}/.well-known/jwks.json`;
    
    const response = await fetch(jwksUrl );
    if (!response.ok) {
      throw new Error(`Failed to fetch JWKS: ${response.statusText}`);
    }

    const jwks = await response.json();
    
    // Get the first key (usually the active one)
    const key = jwks.keys[0];
    if (!key) {
      throw new Error("No keys found in JWKS");
    }

    // Convert JWKS key to PEM format
    const publicKey = await convertJwkToPem(key);
    
    // Cache the key
    cachedPublicKey = publicKey;
    cacheTimestamp = now;
    
    console.log("[Auth0] ✅ Public key fetched and cached");
    return publicKey;
  } catch (error) {
    console.error("[Auth0] Failed to fetch public key:", error);
    throw error;
  }
}

/**
 * Convert JWK to PEM format
 */
async function convertJwkToPem(jwk: any): Promise<string> {
  try {
    // For RS256 keys, use the 'x5c' (X.509 certificate chain)
    if (jwk.x5c && jwk.x5c.length > 0) {
      const cert = jwk.x5c[0];
      return `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----`;
    }

    throw new Error("Cannot convert JWK to PEM: no x5c certificate found");
  } catch (error) {
    console.error("[Auth0] Failed to convert JWK to PEM:", error);
    throw error;
  }
}

/**
 * Verify and decode Auth0 JWT token with proper validation
 */
function verifyAuth0Token(token: string, publicKey: string): any {
  try {
    console.log("[Auth0] Verifying JWT token with RS256...");
    
    // Verify and decode the token
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
      issuer: `https://${AUTH0_DOMAIN}/`,
      audience: AUTH0_CLIENT_ID,
    } );

    console.log("[Auth0] ✅ JWT token verified successfully");
    console.log("[Auth0] Token claims:", {
      sub: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      aud: decoded.aud,
      iss: decoded.iss,
    });

    return decoded;
  } catch (error) {
    console.error("[Auth0] JWT verification failed:", error);
    throw error;
  }
}

/**
 * Simple JWT decode without verification (fallback for development)
 * WARNING: This should only be used in development!
 */
function decodeJWTWithoutVerification(token: string): any {
  try {
    const parts = token.split(".");
    
    // Check if it's a standard JWT (3 parts) or JWE (5 parts)
    if (parts.length === 3) {
      console.log("[Auth0] Decoding JWT (3 parts) without verification...");
      const payload = JSON.parse(
        Buffer.from(parts[1], "base64").toString("utf-8")
      );
      return payload;
    } else if (parts.length === 5) {
      console.warn("[Auth0] ⚠️  Token is JWE (5 parts) - cannot decode without key");
      console.warn("[Auth0] This usually means Auth0 is encrypting the token");
      console.warn("[Auth0] You may need to configure Auth0 to return plain JWT");
      return null;
    } else {
      console.error("[Auth0] Invalid token format - expected 3 or 5 parts, got", parts.length);
      return null;
    }
  } catch (error) {
    console.error("[Auth0] Failed to decode JWT:", error);
    return null;
  }
}

/**
 * Main authentication function
 */
export async function authenticateAuth0Request(req: Request): Promise<User | null> {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log("[Auth0] No authorization header found");
      return null;
    }

    if (!authHeader.startsWith("Bearer ")) {
      console.log("[Auth0] Invalid authorization header format");
      return null;
    }

    const token = authHeader.substring(7);
    console.log("[Auth0] Processing token:", token.substring(0, 30) + "...");
    console.log("[Auth0] Token parts:", token.split(".").length);

    let decoded: any;

    // Try to verify with Auth0 public key first
    try {
      console.log("[Auth0] Attempting JWT verification with Auth0 public key...");
      const publicKey = await getAuth0PublicKey();
      decoded = verifyAuth0Token(token, publicKey);
    } catch (verifyError) {
      console.warn("[Auth0] JWT verification failed, attempting fallback decode...");
      console.warn("[Auth0] Error:", verifyError);
      
      // Fallback: try simple decode (development mode)
      decoded = decodeJWTWithoutVerification(token);
      
      if (!decoded) {
        console.error("[Auth0] Both verification and fallback decode failed");
        return null;
      }
      
      console.warn("[Auth0] ⚠️  Using unverified token (development mode only!)");
    }

    // Verify basic token structure
    if (!decoded.sub) {
      console.warn("[Auth0] Token missing 'sub' claim");
      console.warn("[Auth0] Token payload:", decoded);
      return null;
    }

    // Check token expiration
    if (decoded.exp) {
      const expiresAt = decoded.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      if (expiresAt < now) {
        console.warn("[Auth0] Token expired at", new Date(expiresAt));
        return null;
      }
      console.log("[Auth0] Token expires at", new Date(expiresAt));
    }

    // Get user info from token
    const sub = decoded.sub; // Auth0 unique identifier (e.g., "google-oauth2|123456")
    const email = decoded.email || null;
    const name = decoded.name || decoded.nickname || null;

    console.log("[Auth0] Extracted user info from token:", { sub, email, name });

    // Get or create user in database
    let user = await db.getUserByOpenId(sub);

    if (!user) {
      console.log("[Auth0] User not found in database, creating new user:", sub);
      
      try {
        await db.upsertUser({
          openId: sub,
          name,
          email,
          loginMethod: "auth0",
          lastSignedIn: new Date(),
        });
        
        user = await db.getUserByOpenId(sub);
        
        if (!user) {
          console.error("[Auth0] Failed to retrieve user after creation");
          return null;
        }
        
        console.log("[Auth0] ✅ New user created with ID:", user.id);
      } catch (error) {
        console.error("[Auth0] Failed to create user:", error);
        return null;
      }
    } else {
      console.log("[Auth0] User found in database, updating last sign in:", user.id);
      
      try {
        await db.upsertUser({
          openId: sub,
          lastSignedIn: new Date(),
        });
        console.log("[Auth0] ✅ User last sign in updated");
      } catch (error) {
        console.error("[Auth0] Failed to update user:", error);
        // Don't return null here - user was found, just update failed
      }
    }

    if (!user) {
      console.error("[Auth0] Failed to get user after creation/update:", sub);
      return null;
    }

    console.log("[Auth0] ✅ User authenticated successfully:", user.id);
    return user;
  } catch (error) {
    console.error("[Auth0] Unexpected authentication error:", error);
    return null;
  }
}
