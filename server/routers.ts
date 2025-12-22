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
        name: z.string().optional(),
        cpf: z.string().optional(),
        birthDate: z.date().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
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

          const updateData: any = {
            updatedAt: new Date(),
          };
          
          if (input.name !== undefined) updateData.name = input.name;
          if (input.cpf !== undefined) updateData.cpf = input.cpf;
          if (input.birthDate !== undefined) updateData.birthDate = input.birthDate;
          if (input.city !== undefined) updateData.city = input.city;
          if (input.state !== undefined) updateData.state = input.state;
          if (input.phone !== undefined) updateData.phone = input.phone;
          if (input.howHeardAboutTecelaria !== undefined) updateData.howHeardAboutTecelaria = input.howHeardAboutTecelaria;
          
          await db
            .update(users)
            .set(updateData)
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
  }),

  memory: router({
    getCategories: publicProcedure
      .query(async () => {
        try {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

          const { memoryCategories } = await import('../drizzle/schema');
          const { asc } = await import('drizzle-orm');

          const categories = await db
            .select()
            .from(memoryCategories)
            .orderBy(asc(memoryCategories.order));

          return categories;
        } catch (error) {
          console.error("Error fetching memory categories:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch memory categories" });
        }
      }),

    create: protectedProcedure
      .input(z.object({
        categoryId: z.string(),
        title: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

          const { memories } = await import('../drizzle/schema');
          const { randomUUID } = await import('crypto');

          const memoryId = randomUUID();

          await db.insert(memories).values({
            id: memoryId,
            userId: ctx.user!.id,
            categoryId: input.categoryId,
            title: input.title,
          });

          return { success: true, memoryId };
        } catch (error) {
          console.error("Error creating memory:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create memory" });
        }
      }),

    addRecord: protectedProcedure
      .input(z.object({
        memoryId: z.string(),
        type: z.enum(['audio', 'text', 'document', 'photo']),
        content: z.string().optional(),
        fileUrl: z.string().optional(),
        fileName: z.string().optional(),
        fileSize: z.number().optional(),
        mimeType: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

          const { memoryRecords } = await import('../drizzle/schema');
          const { randomUUID } = await import('crypto');

          const recordId = randomUUID();

          await db.insert(memoryRecords).values({
            id: recordId,
            memoryId: input.memoryId,
            userId: ctx.user!.id,
            type: input.type,
            content: input.content,
            fileUrl: input.fileUrl,
            fileName: input.fileName,
            fileSize: input.fileSize,
            mimeType: input.mimeType,
          });

          return { success: true, recordId };
        } catch (error) {
          console.error("Error adding memory record:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to add memory record" });
        }
      }),

    getMemories: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

          const { memories, memoryRecords, memoryCategories } = await import('../drizzle/schema');
          const { eq, desc } = await import('drizzle-orm');

          const userMemories = await db
            .select({
              id: memories.id,
              title: memories.title,
              createdAt: memories.createdAt,
              category: memoryCategories.name,
              recordCount: memoryRecords.id, // This is not correct, need aggregation
            })
            .from(memories)
            .leftJoin(memoryCategories, eq(memories.categoryId, memoryCategories.id))
            .leftJoin(memoryRecords, eq(memories.id, memoryRecords.memoryId))
            .where(eq(memories.userId, ctx.user!.id))
            .orderBy(desc(memories.createdAt));

          // This is a simplified query. A real implementation would need to correctly
          // count records per memory, which might require a subquery or a different approach.
          // For now, this gives us a list of memories with some associated data.

          return userMemories;
        } catch (error) {
          console.error("Error fetching memories:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch memories" });
        }
      }),

    getMemoryById: protectedProcedure
      .input(z.object({ memoryId: z.number() }))
      .query(async ({ input, ctx }) => {
        try {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

          const { memories, memoryRecords, memoryCategories } = await import('../drizzle/schema');
          const { eq, and } = await import('drizzle-orm');

          // Get memory details
          const [memory] = await db
            .select({
              id: memories.id,
              title: memories.title,
              summary: memories.summary,
              categoryId: memories.categoryId,
              categoryName: memoryCategories.name,
              themes: memories.themes,
              peopleMentioned: memories.peopleMentioned,
              periodMentioned: memories.periodMentioned,
              createdAt: memories.createdAt,
              userId: memories.userId,
            })
            .from(memories)
            .leftJoin(memoryCategories, eq(memories.categoryId, memoryCategories.id))
            .where(and(
              eq(memories.id, input.memoryId),
              eq(memories.userId, ctx.user!.id)
            ))
            .limit(1);

          if (!memory) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Memória não encontrada" });
          }

          // Get memory records
          const records = await db
            .select()
            .from(memoryRecords)
            .where(eq(memoryRecords.memoryId, input.memoryId));

          return {
            ...memory,
            records,
          };
        } catch (error) {
          console.error("Error fetching memory by ID:", error);
          if (error instanceof TRPCError) throw error;
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch memory" });
        }
      }),
  }),

  user: router({
    activateKit: protectedProcedure
      .mutation(async ({ ctx }) => {
        try {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

          const { users } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");

          console.log("[User] Activating kit for user:", ctx.user!.id);

          const now = new Date();
          const programEndDate = new Date(now);
          programEndDate.setDate(programEndDate.getDate() + 90);

          await db
            .update(users)
            .set({
              kitActivatedAt: now,
              programEndDate: programEndDate,
              updatedAt: now,
            })
            .where(eq(users.id, ctx.user!.id));

          console.log("[User] Kit activated successfully for user:", ctx.user!.id);

          return { success: true };
        } catch (error) {
          console.error("[User] Error activating kit:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to activate kit" });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
