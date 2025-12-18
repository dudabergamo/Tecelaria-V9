import { router, publicProcedure, protectedProcedure } from "./trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const appRouter = router({
  auth: router({
    signup: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(8),
      }))
      .mutation(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

          const { users } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");
          const bcrypt = await import("bcrypt");
          const crypto = await import("crypto");

          console.log("[Auth] Signup attempt for email:", input.email);

          // Verificar se email já existe
          const [existingUser] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, input.email))
            .limit(1);
          
          if (existingUser) {
            console.log("[Auth] Email already exists:", input.email);
            throw new TRPCError({ code: "CONFLICT", message: "Email ja cadastrado" });
          }

          const hashedPassword = await bcrypt.hash(input.password, 10);
          const confirmationCode = crypto.randomBytes(3).toString("hex").toUpperCase();
          const confirmationCodeExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

          const userId = crypto.randomUUID();
          console.log("[Auth] Creating user with ID:", userId);
          
          await db.insert(users).values({
            id: userId,
            email: input.email,
            password: hashedPassword,
            emailConfirmed: false,
            emailConfirmationCode: confirmationCode,
            emailConfirmationCodeExpiresAt: confirmationCodeExpiresAt,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          console.log("[Auth] User created successfully:", userId);
          return { success: true, userId };
        } catch (error) {
          console.error("[Auth] Signup error:", error);
          throw error;
        }
      }),

    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

          const { users } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");
          const bcrypt = await import("bcrypt");

          console.log("[Auth] Login attempt for email:", input.email);

          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, input.email))
            .limit(1);

          if (!user) {
            console.log("[Auth] User not found:", input.email);
            throw new TRPCError({ code: "UNAUTHORIZED", message: "Email ou senha inválidos" });
          }

          if (!user.password) {
            console.log("[Auth] User has no password (OAuth only):", input.email);
            throw new TRPCError({ code: "UNAUTHORIZED", message: "Use OAuth para fazer login" });
          }

          const passwordMatch = await bcrypt.compare(input.password, user.password);
          if (!passwordMatch) {
            console.log("[Auth] Password mismatch for:", input.email);
            throw new TRPCError({ code: "UNAUTHORIZED", message: "Email ou senha inválidos" });
          }

          console.log("[Auth] Login successful for:", input.email);
          return { success: true, userId: user.id };
        } catch (error) {
          console.error("[Auth] Login error:", error);
          throw error;
        }
      }),

    getSession: publicProcedure
      .query(async ({ ctx }) => {
        console.log("[Auth] getSession called, user:", ctx.user?.email);
        if (!ctx.user) {
          return null;
        }
        return ctx.user;
      }),

    logout: protectedProcedure
      .mutation(async ({ ctx }) => {
        console.log("[Auth] Logout for user:", ctx.user?.email);
        return { success: true };
      }),
  }),

  user: router({
    getProfile: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

          const { users } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");

          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, ctx.user!.id))
            .limit(1);

          if (!user) {
            throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
          }

          return user;
        } catch (error) {
          console.error("[User] getProfile error:", error);
          throw error;
        }
      }),

    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        cpf: z.string().optional(),
        birthDate: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        cep: z.string().optional(),
        identityDocument: z.string().optional(),
        profilePictureUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

          const { users } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");

          console.log("[User] Updating profile for:", ctx.user!.id);

          await db
            .update(users)
            .set({
              ...input,
              updatedAt: new Date(),
            })
            .where(eq(users.id, ctx.user!.id));

          return { success: true };
        } catch (error) {
          console.error("[User] updateProfile error:", error);
          throw error;
        }
      }),

    activateKit: protectedProcedure
      .mutation(async ({ ctx }) => {
        try {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

          const { users } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");

          console.log("[User] Activating kit for:", ctx.user!.id);

          await db
            .update(users)
            .set({
              kitActivatedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(users.id, ctx.user!.id));

          return { success: true };
        } catch (error) {
          console.error("[User] activateKit error:", error);
          throw error;
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;

// Helper function to get database connection
async function getDb() {
  try {
    const { db } = await import("../drizzle/db");
    return db;
  } catch (error) {
    console.error("[DB] Failed to get database connection:", error);
    return null;
  }
}
