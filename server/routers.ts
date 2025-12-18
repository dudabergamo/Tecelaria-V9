import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { memories, memoryRecords } from "../drizzle/schema";
import { 
  getUserByOpenId, 
  getUserById, 
  updateUserKitActivation, 
  getUserMemories,
  getUserMemoriesWithRecordInfo, 
  createMemory, 
  updateMemory,
  getMemoryById,
  getMemoryByQuestionId,
  getAllCategories, 
  getCategoryById, 
  getMemoryRecords,
  getDailyInspiration,
  getBookMetadataByUserId,
  getUserUnansweredQuestions,
  getRandomQuestion,
  getQuestionsByBox,
  getAllQuestions,
  getQuestionById,
  getAnsweredQuestionIds,
  getQuestionsWithAnsweredStatus,
  createKit,
  getUserKits,
  addKitMember,
  getKitMembers,
  removeKitMember,
  activateKit,
  getUserQuestionProgress,
} from "./db";
import { SignJWT } from "jose";
import { ENV } from "./_core/env";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        cep: z.string().optional(),
        cpf: z.string().optional(),
        identityDocument: z.string().optional(),
        birthDate: z.string().optional(),
        profilePictureUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const { eq } = await import("drizzle-orm");
        const { users } = await import("../drizzle/schema");

        await db
          .update(users)
          .set({
            name: input.name,
            email: input.email,
            phone: input.phone,
            address: input.address,
            cep: input.cep,
            cpf: input.cpf,
            identityDocument: input.identityDocument,
            birthDate: input.birthDate ? new Date(input.birthDate) : undefined,
            profilePictureUrl: input.profilePictureUrl,
            updatedAt: new Date(),
          })
          .where(eq(users.id, ctx.user.id));

        return { success: true };
      }),

    changePassword: protectedProcedure
      .input(z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const { eq } = await import("drizzle-orm");
        const { users } = await import("../drizzle/schema");
        const bcrypt = await import("bcrypt");

        // Get current user
        const [currentUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, ctx.user.id))
          .limit(1);

        if (!currentUser) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }

        // Verify current password
        if (currentUser.password) {
          const isValid = await bcrypt.compare(input.currentPassword, currentUser.password);
          if (!isValid) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "Senha atual incorreta" });
          }
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(input.newPassword, 10);

        // Update password
        await db
          .update(users)
          .set({
            password: hashedPassword,
            updatedAt: new Date(),
          })
          .where(eq(users.id, ctx.user.id));

        return { success: true };
      }),

    signup: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string(),
        cpf: z.string(),
        birthDate: z.date(),
        address: z.string(),
        howHeardAboutTecelaria: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const { users } = await import("../drizzle/schema");
        const bcrypt = await import("bcrypt");

        // Check if user already exists
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);

        if (existingUser.length > 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Email já cadastrado" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(input.password, 10);

        // Generate confirmation code
        const confirmationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Create user
        const result = await db
          .insert(users)
          .values({
            email: input.email,
            password: hashedPassword,
            name: input.name,
            cpf: input.cpf,
            birthDate: input.birthDate,
            address: input.address,
            howHeardAboutTecelaria: input.howHeardAboutTecelaria,
            emailConfirmed: false,
            emailConfirmationCode: confirmationCode,
            emailConfirmationCodeExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        // TODO: Send confirmation email with code
        // For now, just log it
        console.log(`Confirmation code for ${input.email}: ${confirmationCode}`);

        return { success: true, message: "Cadastro realizado. Verifique seu email para confirmar." };
      }),

    confirmEmail: publicProcedure
      .input(z.object({
        code: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const { users } = await import("../drizzle/schema");

        // Find user with confirmation code
        const user = await db
          .select()
          .from(users)
          .where(eq(users.emailConfirmationCode, input.code))
          .limit(1);

        if (user.length === 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Código inválido" });
        }

        const userData = user[0];

        // Check if code is expired
        if (userData.emailConfirmationCodeExpiresAt && new Date() > userData.emailConfirmationCodeExpiresAt) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Código expirado" });
        }

        // Update user
        await db
          .update(users)
          .set({
            emailConfirmed: true,
            emailConfirmationCode: null,
            emailConfirmationCodeExpiresAt: null,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userData.id));

        return { success: true, message: "Email confirmado com sucesso!" };
      }),

    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const { users } = await import("../drizzle/schema");
        const bcrypt = await import("bcrypt");

        // Find user
        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);

        if (user.length === 0) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Email ou senha incorretos" });
        }

        const userData = user[0];

        // Check if email is confirmed
        if (!userData.emailConfirmed) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Email não confirmado. Verifique seu email." });
        }

        // Verify password
        if (!userData.password) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Email ou senha incorretos" });
        }

        const isValidPassword = await bcrypt.compare(input.password, userData.password);
        if (!isValidPassword) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Email ou senha incorretos" });
        }

        // Create JWT token
        const secret = new TextEncoder().encode(ENV.cookieSecret);
        const token = await new SignJWT({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          kitActivatedAt: userData.kitActivatedAt,
        })
          .setProtectedHeader({ alg: "HS256" })
          .setIssuedAt()
          .setExpirationTime("7d")
          .sign(secret);

        // Set cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Check if it's first login
        const firstLogin = !userData.kitActivatedAt;

        return {
          success: true,
          firstLogin,
          user: {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            kitActivatedAt: userData.kitActivatedAt,
          },
        };
      }),

    // Temporary test login for development
    testLogin: publicProcedure.mutation(async ({ ctx }) => {
      const { upsertUser } = await import("./db");
      
      const testUser = {
        openId: "test-user-123",
        name: "Maria Silva",
        email: "maria.silva@tecelaria.com",
        loginMethod: "test",
      };
      
      // Create or update user in database
      await upsertUser(testUser);
      
      // Create JWT token
      const secret = new TextEncoder().encode(ENV.cookieSecret);
      const token = await new SignJWT(testUser)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secret);
      
      // Set cookie
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      
      return { success: true, user: testUser };
    }),
  }),

  user: router({
    activateKit: protectedProcedure.mutation(async ({ ctx }) => {
      await updateUserKitActivation(ctx.user.id);
      return { success: true };
    }),
    
    getDashboardData: protectedProcedure.query(async ({ ctx }) => {
      const user = ctx.user;
      const memories = await getUserMemoriesWithRecordInfo(user.id);
      const categories = await getAllCategories();
      const bookMetadata = await getBookMetadataByUserId(user.id);
      const unansweredQuestions = await getUserUnansweredQuestions(user.id);
      
      // Calculate days remaining
      let daysRemaining = 90;
      let programDay = 0;
      if (user.kitActivatedAt && user.programEndDate) {
        const now = new Date();
        const endDate = new Date(user.programEndDate);
        const startDate = new Date(user.kitActivatedAt);
        
        const diffTime = endDate.getTime() - now.getTime();
        daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        
        const elapsedTime = now.getTime() - startDate.getTime();
        programDay = Math.floor(elapsedTime / (1000 * 60 * 60 * 24));
      }
      
      // Get daily inspiration
      const inspiration = await getDailyInspiration(programDay);
      
      // Calculate statistics
      const audioCount = memories.filter(m => {
        // Check if memory has audio records (simplified for now)
        return true; // TODO: implement proper check
      }).length;
      
      const photoCount = memories.filter(m => {
        // Check if memory has photo records (simplified for now)
        return true; // TODO: implement proper check
      }).length;
      
      // Estimate pages (rough estimate: 250 words per page)
      const estimatedWords = memories.length * 500; // Assume 500 words per memory
      const estimatedPages = Math.ceil(estimatedWords / 250);
      
      return {
        user,
        daysRemaining,
        programDay,
        memories,
        categories,
        bookMetadata,
        unansweredQuestions,
        inspiration,
        stats: {
          memoriesCount: memories.length,
          audioCount,
          photoCount,
          estimatedPages,
          estimatedImages: photoCount,
        },
      };
    }),
  }),

  memories: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserMemories(ctx.user.id);
    }),
    
    getCategories: protectedProcedure.query(async () => {
      return await getAllCategories();
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not initialized");
        const memory = await db.select().from(memories).where(eq(memories.id, input.id)).limit(1);
        
        if (!memory || memory.length === 0) {
          return null;
        }
        
        const mem = memory[0];
        const category = await getCategoryById(mem.categoryId);
        const records = await getMemoryRecords(mem.id);
        
        return {
          ...mem,
          categoryName: category?.name || "Sem categoria",
          themes: mem.themes ? JSON.parse(mem.themes as string) : null,
          peopleMentioned: mem.peopleMentioned ? JSON.parse(mem.peopleMentioned as string) : null,
          records,
        };
      }),
    
    getByQuestionId: protectedProcedure
      .input(z.object({ questionId: z.number() }))
      .query(async ({ ctx, input }) => {
        const memory = await getMemoryByQuestionId(ctx.user.id, input.questionId);
        
        if (!memory) {
          return null;
        }
        
        const category = await getCategoryById(memory.categoryId);
        const records = await getMemoryRecords(memory.id);
        
        return {
          ...memory,
          categoryName: category?.name || "Sem categoria",
          themes: memory.themes ? JSON.parse(memory.themes as string) : null,
          peopleMentioned: memory.peopleMentioned ? JSON.parse(memory.peopleMentioned as string) : null,
          records,
        };
      }),
    
    getUserMemoriesWithDetails: protectedProcedure.query(async ({ ctx }) => {
      const memories = await getUserMemories(ctx.user.id);
      
      // Enrich memories with category names and record counts
      const enrichedMemories = await Promise.all(
        memories.map(async (memory) => {
          const category = await getCategoryById(memory.categoryId);
          const records = await getMemoryRecords(memory.id);
          
          return {
            ...memory,
            categoryId: memory.categoryId,
            categoryName: category?.name || "Sem categoria",
            recordCount: records.length,
            recordTypes: Array.from(new Set(records.map((r: any) => r.type))),
            themes: memory.themes ? JSON.parse(memory.themes as string) : null,
            peopleMentioned: memory.peopleMentioned ? JSON.parse(memory.peopleMentioned as string) : null,
          };
        })
      );
      
      return {
        memories: enrichedMemories,
        totalCount: enrichedMemories.length,
      };
    }),
    getRecords: protectedProcedure
      .input(z.object({
        memoryId: z.number(),
      }))
      .query(async ({ input }) => {
        const records = await getMemoryRecords(input.memoryId);
        return records;
      }),

    extractTextFromImage: protectedProcedure
      .input(z.object({
        imageUrl: z.string().url(),
      }))
      .mutation(async ({ input }) => {
        const { extractTextFromImage } = await import("./_core/ocr");
        const text = await extractTextFromImage(input.imageUrl);
        return { text };
      }),

    extractRecipeFromImage: protectedProcedure
      .input(z.object({
        imageUrl: z.string().url(),
      }))
      .mutation(async ({ input }) => {
        const { extractRecipeFromImage } = await import("./_core/ocr");
        const recipe = await extractRecipeFromImage(input.imageUrl);
        return recipe;
      }),

    deleteMemory: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not initialized");
        
        // Verify ownership
        const memory = await db.select().from(memories).where(eq(memories.id, input.id)).limit(1);
        if (!memory || memory.length === 0 || memory[0].userId !== ctx.user.id) {
          throw new Error("Memory not found or unauthorized");
        }
        
        // Delete memory records first
        await db.delete(memoryRecords).where(eq(memoryRecords.memoryId, input.id));
        
        // Delete memory
        await db.delete(memories).where(eq(memories.id, input.id));
        
        return { success: true };
      }),

     updateMemory: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          summary: z.string().optional(),
          categoryId: z.number().optional(),
          periodMentioned: z.string().optional(),
          themes: z.array(z.string()).optional(),
          peopleMentioned: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ input }) => {
        await updateMemory(input.id, {
          title: input.title,
          summary: input.summary,
          categoryId: input.categoryId,
          periodMentioned: input.periodMentioned,
          themes: input.themes ? JSON.stringify(input.themes) : undefined,
          peopleMentioned: input.peopleMentioned ? JSON.stringify(input.peopleMentioned) : undefined,
        });
        return { success: true };
      }),

    uploadFile: protectedProcedure
      .input(
        z.object({
          fileName: z.string(),
          fileData: z.string(), // base64
          contentType: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { storagePut } = await import("./storage");
        
        // Decode base64
        const buffer = Buffer.from(input.fileData, 'base64');
        
        // Generate unique file key
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(7);
        const fileKey = `users/${ctx.user.id}/uploads/${timestamp}-${randomSuffix}-${input.fileName}`;
        
        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, input.contentType);
        
        return { url, fileKey };
      }),

    processMemory: protectedProcedure
      .input(
        z.object({
          categoryId: z.number(),
          type: z.enum(["audio", "text", "document", "photo"]),
          fileUrl: z.string().optional(),
          textContent: z.string().optional(),
          questionId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { transcribeMemoryAudio, analyzeMemoryContent } = await import("./aiProcessor");
        
        // Get question text if questionId is provided
        let questionText: string | undefined;
        if (input.questionId) {
          const question = await getQuestionById(input.questionId);
          questionText = question?.question;
        }
        
        // Get category name
        const category = await getCategoryById(input.categoryId);
        const categoryName = category?.name;
        
        let analysisResult;
        let contentToAnalyze: string;
        
        if (input.type === "audio" && input.fileUrl) {
          // Process audio: transcribe + analyze
          contentToAnalyze = await transcribeMemoryAudio(input.fileUrl);
          analysisResult = await analyzeMemoryContent(contentToAnalyze, {
            questionText,
            categoryName,
          });
        } else if (input.type === "text" && input.textContent) {
          // Analyze text directly
          analysisResult = await analyzeMemoryContent(input.textContent, {
            questionText,
            categoryName,
          });
        } else {
          throw new Error("Invalid input: need fileUrl for audio or textContent for text");
        }
        
        // Create memory with AI-generated data
        const memoryId = await createMemory({
          userId: ctx.user.id,
          categoryId: input.categoryId,
          questionId: input.questionId,
          title: analysisResult.title,
          summary: analysisResult.summary,
          themes: analysisResult.themes,
          peopleMentioned: analysisResult.peopleMentioned,
          periodMentioned: analysisResult.periodMentioned || undefined,
        });
        
        return {
          memoryId,
          analysis: analysisResult,
        };
      }),
    
    create: protectedProcedure
      .input(z.object({
        categoryId: z.number(),
        title: z.string(),
        type: z.enum(["audio", "text", "document", "photo"]),
        content: z.string().optional(),
        fileName: z.string().optional(),
        fileSize: z.number().optional(),
        mimeType: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createMemory, createMemoryRecord, updateUserLastUpload, incrementCustomMemoryCount } = await import("./db");
        
        // Create memory
        const memory = await createMemory({
          userId: ctx.user.id,
          categoryId: input.categoryId,
          title: input.title,
        });
        
        // Create memory record
        await createMemoryRecord({
          memoryId: memory.id,
          userId: ctx.user.id,
          content: input.content,
          type: input.type,
          fileName: input.fileName,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
        });
        
        // Update user last upload date
        await updateUserLastUpload(ctx.user.id);
        
        // Increment custom memory count if new custom
        // TODO: implement proper check for custom categories
        
        return memory;
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        summary: z.string().optional(),
        themes: z.array(z.string()).optional(),
        peopleMentioned: z.array(z.string()).optional(),
        periodMentioned: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { updateMemory } = await import("./db");
        
        await updateMemory(input.id, {
          title: input.title,
          summary: input.summary,
          themes: input.themes ? JSON.stringify(input.themes) : undefined,
          peopleMentioned: input.peopleMentioned ? JSON.stringify(input.peopleMentioned) : undefined,
          periodMentioned: input.periodMentioned,
        });
        
        return { success: true };
      }),
  }),

  questions: router({
    getRandomQuestion: protectedProcedure
      .input(z.object({
        boxNumber: z.number().min(1).max(4).optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return await getRandomQuestion(ctx.user.id, input?.boxNumber);
      }),

    getQuestionsByBox: protectedProcedure
      .input(z.object({
        boxNumber: z.number().min(1).max(4),
      }))
      .query(async ({ input }) => {
        return await getQuestionsByBox(input.boxNumber);
      }),
    
    getQuestionById: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .query(async ({ input }) => {
        return await getQuestionById(input.id);
      }),

    getAllQuestions: protectedProcedure
      .query(async () => {
        return await getAllQuestions();
      }),
    
    getAllQuestionsWithStatus: protectedProcedure
      .query(async ({ ctx }) => {
        return await getQuestionsWithAnsweredStatus(ctx.user.id);
      }),
    
    getAnsweredQuestionIds: protectedProcedure
      .query(async ({ ctx }) => {
        return await getAnsweredQuestionIds(ctx.user.id);
      }),

    getProgress: protectedProcedure
      .query(async ({ ctx }) => {
        return await getUserQuestionProgress(ctx.user.id);
      }),
  }),

  kits: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await createKit({
          name: input.name,
          description: input.description,
          ownerUserId: ctx.user.id,
        });
      }),

    getUserKits: protectedProcedure
      .query(async ({ ctx }) => {
        return await getUserKits(ctx.user.id);
      }),

    addMember: protectedProcedure
      .input(z.object({
        kitId: z.number(),
        userEmail: z.string().email(),
        role: z.enum(["collaborator", "viewer"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Find user by email
        const { getUserByEmail } = await import("./db");
        const targetUser = await getUserByEmail(input.userEmail);
        if (!targetUser) {
          throw new Error("Usuário não encontrado");
        }

        return await addKitMember({
          kitId: input.kitId,
          userId: targetUser.id,
          role: input.role || "collaborator",
          invitedBy: ctx.user.id,
        });
      }),

    getMembers: protectedProcedure
      .input(z.object({
        kitId: z.number(),
      }))
      .query(async ({ input }) => {
        return await getKitMembers(input.kitId);
      }),

    removeMember: protectedProcedure
      .input(z.object({
        kitId: z.number(),
        userId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await removeKitMember(input.kitId, input.userId);
        return { success: true };
      }),

    activate: protectedProcedure
      .input(z.object({
        kitId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await activateKit(input.kitId);
        return { success: true };
      }),
   }),

  memory: router({
    list: protectedProcedure
      .input(z.object({
        userId: z.string(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const { memories } = await import("../drizzle/schema");
        const result = await db
          .select()
          .from(memories)
          .where(eq(memories.userId, input.userId))
          .orderBy((t) => t.createdAt);

        return result;
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        category: z.string().optional(),
        userId: z.string(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const { memories } = await import("../drizzle/schema");
        const crypto = await import("crypto");

        const id = crypto.randomUUID();
        const now = new Date();

        await db.insert(memories).values({
          id,
          userId: input.userId,
          title: input.title,
          category: input.category,
          createdAt: now,
          updatedAt: now,
        });

        return { id, title: input.title, category: input.category, createdAt: now };
      }),

    addRecord: protectedProcedure
      .input(z.object({
        memoryId: z.string(),
        type: z.enum(["text", "audio", "image", "document"]),
        content: z.string().optional(),
        fileUrl: z.string().optional(),
        audioOriginal: z.string().optional(),
        audioTranscription: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const { memoryRecords } = await import("../drizzle/schema");
        const crypto = await import("crypto");

        const id = crypto.randomUUID();
        const now = new Date();

        await db.insert(memoryRecords).values({
          id,
          memoryId: input.memoryId,
          type: input.type,
          content: input.content,
          fileUrl: input.fileUrl,
          audioOriginal: input.audioOriginal,
          audioTranscription: input.audioTranscription,
          createdAt: now,
          updatedAt: now,
        });

        return { id, type: input.type, createdAt: now };
      }),

    getCategories: protectedProcedure
      .input(z.object({
        userId: z.string(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const { categories } = await import("../drizzle/schema");
        const result = await db
          .select()
          .from(categories)
          .where(eq(categories.userId, input.userId));

        return result;
      }),
  }),
});
export type AppRouter = typeof appRouter;
