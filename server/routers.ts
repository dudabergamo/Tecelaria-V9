import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb, getUserByOpenId } from "./db";

export const appRouter = router({
  auth: router({
    signup: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().optional(),
        cpf: z.string().optional(),
        birthDate: z.date().optional(),
        address: z.string().optional(),
        howHeardAboutTecelaria: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

          const { users } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");
          const bcrypt = await import("bcrypt");
          const { randomUUID } = await import("crypto");

          console.log("[Auth] Signup attempt for email:", input.email);

          // Verificar se usuário já existe
          const [existingUser] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, input.email))
            .limit(1);

          if (existingUser) {
            throw new TRPCError({ code: "CONFLICT", message: "Email ja cadastrado" });
          }

          const userId = randomUUID();
          const hashedPassword = await bcrypt.hash(input.password, 10);
          const emailConfirmationCode = Math.floor(100000 + Math.random() * 900000).toString();

          await db.insert(users).values({
            id: userId,
            email: input.email,
            password: hashedPassword,
            name: input.name || "",
            cpf: input.cpf || "",
            birthDate: input.birthDate || null,
            emailConfirmed: false,
            emailConfirmationCode: emailConfirmationCode,
            emailConfirmationCodeExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          console.log("[Auth] Creating user with ID:", userId);
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
      .mutation(async ({ input, ctx }) => {
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
          
          // Criar sessão do Passport
          return new Promise((resolve, reject) => {
            ctx.req.login({ id: user.id }, (err: any) => {
              if (err) {
                console.error("[Auth] Error creating session:", err);
                reject(err);
              } else {
                console.log("[Auth] Session created for:", input.email);
                resolve({ success: true, userId: user.id });
              }
            });
          });
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

    me: publicProcedure
      .query(async ({ ctx }) => {
        console.log("[Auth] me called, user:", ctx.user?.email);
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
            throw new TRPCError({ code: "NOT_FOUND", message: "Usuario nao encontrado" });
          }

          if (user.emailConfirmationCode !== input.code) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "Codigo invalido" });
          }

          if (user.emailConfirmationCodeExpiresAt && user.emailConfirmationCodeExpiresAt < new Date()) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "Codigo expirado" });
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
        name: z.string(),
        cpf: z.string(),
        birthDate: z.date(),
        city: z.string(),
        state: z.string(),
        phone: z.string().optional(),
        howHeardAboutTecelaria: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
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
            throw new TRPCError({ code: "NOT_FOUND", message: "Email não encontrado. Por favor, faça signup novamente." });
          }

          await db
            .update(users)
            .set({
              name: input.name,
              cpf: input.cpf,
              birthDate: input.birthDate,
              city: input.city,
              state: input.state,
              phone: input.phone || "",
              howHeardAboutTecelaria: input.howHeardAboutTecelaria || "",
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

    autoLogin: publicProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

          const { users } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");

          console.log("[Auth] Auto-login attempt for email:", input.email);

          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, input.email))
            .limit(1);

          if (!user) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Usuario nao encontrado" });
          }

          console.log("[Auth] Auto-login successful for:", input.email);

          return new Promise((resolve, reject) => {
            ctx.req.login({ id: user.id }, (err: any) => {
              if (err) {
                console.error("[Auth] Error during auto-login:", err);
                reject(err);
              } else {
                console.log("[Auth] Session created for:", input.email);
                resolve({ success: true, userId: user.id });
              }
            });
          });
        } catch (error) {
          console.error("[Auth] Auto-login error:", error);
          throw error;
        }
      }),

    forgotPassword: publicProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        try {
          console.log("[Auth] Forgot password for:", input.email);
          return { success: true };
        } catch (error) {
          console.error("[Auth] Forgot password error:", error);
          throw error;
        }
      }),

    me: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          console.log("[Auth] me query called for user:", ctx.user?.id);
          if (!ctx.user) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
          }
          return ctx.user;
        } catch (error) {
          console.error("[Auth] me query error:", error);
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

    activateKit: protectedProcedure
      .mutation(async ({ ctx }) => {
        try {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

          const { users } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");

          console.log("[User] Activating kit for user:", ctx.user!.id);

          // Atualizar o usuário para marcar que o kit foi ativado
          await db
            .update(users)
            .set({
              kitActivatedAt: new Date(),
              memoryPeriodEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 dias
              updatedAt: new Date(),
            })
            .where(eq(users.id, ctx.user!.id));

          console.log("[User] Kit activated for user:", ctx.user!.id);
          return { success: true, message: "Kit ativado com sucesso!" };
        } catch (error) {
          console.error("[User] Activate kit error:", error);
          throw error;
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
