import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { 
  getUserByOpenId, 
  getUserById, 
  updateUserKitActivation, 
  getUserMemories, 
  createMemory, 
  updateMemory,
  getAllCategories, 
  getCategoryById, 
  getMemoryRecords,
  getDailyInspiration,
  getBookMetadataByUserId,
  getUserUnansweredQuestions,
  getRandomQuestion,
  getQuestionsByBox,
  getAllQuestions,
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
      const memories = await getUserMemories(user.id);
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
    getMemoryRecords: protectedProcedure
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
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { transcribeMemoryAudio, analyzeMemoryContent } = await import("./aiProcessor");
        
        let analysisResult;
        let contentToAnalyze: string;
        
        if (input.type === "audio" && input.fileUrl) {
          // Process audio: transcribe + analyze
          contentToAnalyze = await transcribeMemoryAudio(input.fileUrl);
          analysisResult = await analyzeMemoryContent(contentToAnalyze);
        } else if (input.type === "text" && input.textContent) {
          // Analyze text directly
          analysisResult = await analyzeMemoryContent(input.textContent);
        } else {
          throw new Error("Invalid input: need fileUrl for audio or textContent for text");
        }
        
        // Create memory with AI-generated data
        const memoryId = await createMemory({
          userId: ctx.user.id,
          categoryId: input.categoryId,
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
  }),

  questions: router({
    getRandomQuestion: protectedProcedure
      .input(z.object({
        boxNumber: z.number().min(1).max(4).optional(),
      }).optional())
      .query(async ({ input }) => {
        return await getRandomQuestion(input?.boxNumber);
      }),

    getQuestionsByBox: protectedProcedure
      .input(z.object({
        boxNumber: z.number().min(1).max(4),
      }))
      .query(async ({ input }) => {
        return await getQuestionsByBox(input.boxNumber);
      }),

    getAllQuestions: protectedProcedure
      .query(async () => {
        return await getAllQuestions();
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
});

export type AppRouter = typeof appRouter;
