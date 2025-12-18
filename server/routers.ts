import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "./db";

export const appRouter = router({
  auth: router({
    signup: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().optional(),
        cpf: z.string().optional(),
        birthDate: z.date().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        howHeardAboutTecelaria: z.string().optional(),
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
            name: input.name,
            cpf: input.cpf,
            birthDate: input.birthDate,
            city: input.city,
            state: input.state,
            howHeardAboutTecelaria: input.howHeardAboutTecelaria,
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
          // Check if user has completed profile (has name set)
          const firstLogin = !user.name || user.name === '';
          return { success: true, userId: user.id, firstLogin };
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

    confirmEmail: publicProcedure
      .input(z.object({
        email: z.string().email(),
        code: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

          const { users } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");

          console.log("[Auth] Confirming email for:", input.email);

          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, input.email))
            .limit(1);

          if (!user) {
            console.log("[Auth] User not found:", input.email);
            throw new TRPCError({ code: "NOT_FOUND", message: "Usuario nao encontrado" });
          }

          if (user.emailConfirmationCode !== input.code) {
            console.log("[Auth] Invalid confirmation code for:", input.email);
            throw new TRPCError({ code: "UNAUTHORIZED", message: "Codigo de confirmacao invalido" });
          }

          if (user.emailConfirmationCodeExpiresAt && user.emailConfirmationCodeExpiresAt < new Date()) {
            console.log("[Auth] Confirmation code expired for:", input.email);
            throw new TRPCError({ code: "UNAUTHORIZED", message: "Codigo de confirmacao expirado" });
          }

          await db
            .update(users)
            .set({
              emailConfirmed: true,
              emailConfirmationCode: null,
              emailConfirmationCodeExpiresAt: null,
              updatedAt: new Date(),
            })
            .where(eq(users.id, user.id));

          console.log("[Auth] Email confirmed for:", input.email);
          return { success: true };
        } catch (error) {
          console.error("[Auth] Confirm email error:", error);
          throw error;
        }
      }),

    updateProfile: publicProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().optional(),
        cpf: z.string().optional(),
        birthDate: z.date().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        phone: z.string().optional(),
        howHeardAboutTecelaria: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

          const { users } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");

          console.log("[Auth] Updating profile for:", input.email);

          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, input.email))
            .limit(1);

          if (!user) {
            console.log("[Auth] User not found:", input.email);
            throw new TRPCError({ code: "NOT_FOUND", message: "Usuario nao encontrado" });
          }

          await db
            .update(users)
            .set({
              name: input.name || user.name,
              cpf: input.cpf || user.cpf,
              birthDate: input.birthDate || user.birthDate,
              city: input.city || user.city,
              state: input.state || user.state,
              phone: input.phone || user.phone,
              howHeardAboutTecelaria: input.howHeardAboutTecelaria || user.howHeardAboutTecelaria,
              updatedAt: new Date(),
            })
            .where(eq(users.id, user.id));

          console.log("[Auth] Profile updated for:", input.email);
          return { success: true, userId: user.id };
        } catch (error) {
          console.error("[Auth] Update profile error:", error);
          throw error;
        }
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
            throw new TRPCError({ code: "NOT_FOUND", message: "Usuario nao encontrado" });
          }

          return user;
        } catch (error) {
          console.error("[User] Get profile error:", error);
          throw error;
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
