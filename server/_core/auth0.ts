import type { Request } from "express";
import * as db from "../db";
import type { User } from "../../drizzle/schema";

// Ultra-simple JWT decode (no verification, just decode the payload)
function decodeJWT(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("[Auth0] Invalid token format - expected 3 parts, got", parts.length);
      return null;
    }

    // Decode the payload (second part)
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf-8")
    );

    console.log("[Auth0] Decoded token payload:", {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      exp: payload.exp,
    });

    return payload;
  } catch (error) {
    console.error("[Auth0] Failed to decode JWT:", error);
    return null;
  }
}

export async function authenticateAuth0Request(req: Request): Promise<User | null> {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log("[Auth0] No authorization header");
      return null;
    }

    if (!authHeader.startsWith("Bearer ")) {
      console.log("[Auth0] Invalid authorization header format");
      return null;
    }

    const token = authHeader.substring(7);
    console.log("[Auth0] Processing token:", token.substring(0, 20) + "...");

    // Decode token
    const decoded = decodeJWT(token);
    if (!decoded) {
      console.warn("[Auth0] Failed to decode token");
      return null;
    }

    // Verify basic token structure
    if (!decoded.sub) {
      console.warn("[Auth0] Token missing 'sub' claim");
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

    console.log("[Auth0] User info from token:", { sub, email, name });

    // Get or create user in database
    let user = await db.getUserByOpenId(sub);

    if (!user) {
      console.log("[Auth0] User not found, creating new user:", sub);
      
      try {
        await db.upsertUser({
          openId: sub,
          name,
          email,
          loginMethod: "auth0",
          lastSignedIn: new Date(),
        });
        
        user = await db.getUserByOpenId(sub);
        console.log("[Auth0] New user created:", user?.id);
      } catch (error) {
        console.error("[Auth0] Failed to create user:", error);
        return null;
      }
    } else {
      console.log("[Auth0] User found, updating last sign in:", user.id);
      
      try {
        await db.upsertUser({
          openId: sub,
          lastSignedIn: new Date(),
        });
      } catch (error) {
        console.error("[Auth0] Failed to update user:", error);
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
