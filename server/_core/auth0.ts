import type { Request } from "express";
import { ENV } from "./env";
import * as db from "../db";
import type { User } from "../../drizzle/schema";

// Simple JWT decode (without verification)
function decodeJWT(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token format");
    }

    const payload = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf-8")
    );

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
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[Auth0] No authorization header");
      return null;
    }

    const token = authHeader.substring(7);

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
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      console.warn("[Auth0] Token expired");
      return null;
    }

    // Get or create user
    const sub = decoded.sub; // Auth0 unique identifier
    const email = decoded.email || null;
    const name = decoded.name || decoded.nickname || null;

    console.log("[Auth0] Processing user:", sub);

    let user = await db.getUserByOpenId(sub);

    if (!user) {
      // Create new user
      console.log("[Auth0] Creating new user:", sub);
      await db.upsertUser({
        openId: sub,
        name,
        email,
        loginMethod: "auth0",
        lastSignedIn: new Date(),
      });
      user = await db.getUserByOpenId(sub);
    } else {
      // Update last signed in
      console.log("[Auth0] Updating existing user:", sub);
      await db.upsertUser({
        openId: sub,
        lastSignedIn: new Date(),
      });
    }

    if (!user) {
      console.error("[Auth0] Failed to create or find user:", sub);
      return null;
    }

    console.log("[Auth0] User authenticated successfully:", user.id);
    return user;
  } catch (error) {
    console.error("[Auth0] Authentication error:", error);
    return null;
  }
}
