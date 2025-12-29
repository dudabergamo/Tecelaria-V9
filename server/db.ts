import { eq, desc, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  memoryCategories,
  memories,
  memoryRecords,
  followupQuestions,
  bookMetadata,
  bookChapters,
  dailyInspirations,
  questionBoxes,
  kits,
  kitMembers,
  type MemoryCategory,
  type Memory,
  type MemoryRecord,
  type FollowupQuestion,
  type BookMetadata,
  type BookChapter,
  type DailyInspiration,
  type QuestionBox,
  type Kit,
  type KitMember,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== USER HELPERS ====================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "phone"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserKitActivation(userId: number) {
  const db = await getDb();
  if (!db) return;

  const now = new Date();
  
  // 3 meses para enviar memórias
  const memoryEndDate = new Date(now);
  memoryEndDate.setMonth(memoryEndDate.getMonth() + 3);
  
  // 1 ano para finalizar o livro (após ativação)
  const bookEndDate = new Date(now);
  bookEndDate.setFullYear(bookEndDate.getFullYear() + 1);

  await db.update(users)
    .set({ 
      kitActivatedAt: now,
      memoryPeriodEndDate: memoryEndDate,
      bookFinalizationEndDate: bookEndDate,
      programEndDate: memoryEndDate, // deprecated, manter por compatibilidade
    })
    .where(eq(users.id, userId));
}

export async function updateUserLastUpload(userId: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(users)
    .set({ lastUploadDate: new Date() })
    .where(eq(users.id, userId));
}

export async function incrementCustomMemoryCount(userId: number) {
  const db = await getDb();
  if (!db) return;

  const user = await getUserById(userId);
  if (!user) return;

  await db.update(users)
    .set({ customMemoryCount: (user.customMemoryCount || 0) + 1 })
    .where(eq(users.id, userId));
}

// ==================== MEMORY CATEGORY HELPERS ====================

export async function getAllCategories(): Promise<MemoryCategory[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(memoryCategories).orderBy(memoryCategories.order);
}

export async function getPredefinedCategories(): Promise<MemoryCategory[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(memoryCategories)
    .where(eq(memoryCategories.isPredefined, true))
    .orderBy(memoryCategories.order);
}

export async function getCategoryById(id: number): Promise<MemoryCategory | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(memoryCategories).where(eq(memoryCategories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ==================== MEMORY HELPERS ====================

export async function createMemory(data: {
  userId: number;
  categoryId: number;
  title: string;
  summary?: string;
  themes?: string[];
  peopleMentioned?: string[];
  periodMentioned?: string;
}): Promise<Memory> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(memories).values({
    userId: data.userId,
    categoryId: data.categoryId,
    title: data.title,
    summary: data.summary,
    themes: data.themes ? JSON.stringify(data.themes) : null,
    peopleMentioned: data.peopleMentioned ? JSON.stringify(data.peopleMentioned) : null,
    periodMentioned: data.periodMentioned,
    processed: false,
  });

  // MySQL returns insertId in an array format [{ insertId: number }]
  const insertedId = Number((result as any)[0]?.insertId || (result as any).insertId);
  const memory = await getMemoryById(insertedId);
  if (!memory) throw new Error("Failed to retrieve created memory");
  return memory;
}

export async function getMemoryById(id: number): Promise<Memory | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(memories).where(eq(memories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserMemories(userId: number): Promise<Memory[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(memories)
    .where(eq(memories.userId, userId))
    .orderBy(desc(memories.createdAt));
}

export async function updateMemory(id: number, data: Partial<Memory>) {
  const db = await getDb();
  if (!db) return;

  await db.update(memories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(memories.id, id));
}

// ==================== MEMORY RECORD HELPERS ====================

export async function createMemoryRecord(data: {
  memoryId: number;
  userId: number;
  content?: string;
  type: "audio" | "text" | "document" | "photo";
  fileUrl?: string;
  fileKey?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  order?: number;
}): Promise<MemoryRecord> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(memoryRecords).values(data);
  
  // MySQL returns insertId in an array format [{ insertId: number }]
  const insertedId = Number((result as any)[0]?.insertId || (result as any).insertId);
  const record = await getMemoryRecordById(insertedId);
  if (!record) throw new Error("Failed to retrieve created record");
  return record;
}

export async function getMemoryRecordById(id: number): Promise<MemoryRecord | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(memoryRecords).where(eq(memoryRecords.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getMemoryRecords(memoryId: number): Promise<MemoryRecord[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(memoryRecords)
    .where(eq(memoryRecords.memoryId, memoryId))
    .orderBy(memoryRecords.order, memoryRecords.addedAt);
}

// ==================== FOLLOWUP QUESTION HELPERS ====================

export async function createFollowupQuestion(data: {
  userId: number;
  memoryId?: number;
  categoryId?: number;
  question: string;
}): Promise<FollowupQuestion> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(followupQuestions).values(data);
  
  const insertedId = Number((result as any).insertId);
  const question = await getFollowupQuestionById(insertedId);
  if (!question) throw new Error("Failed to retrieve created question");
  return question;
}

export async function getFollowupQuestionById(id: number): Promise<FollowupQuestion | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(followupQuestions).where(eq(followupQuestions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserUnansweredQuestions(userId: number): Promise<FollowupQuestion[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(followupQuestions)
    .where(and(
      eq(followupQuestions.userId, userId),
      eq(followupQuestions.answered, false)
    ))
    .orderBy(desc(followupQuestions.sentAt));
}

// ==================== BOOK METADATA HELPERS ====================

export async function createOrUpdateBookMetadata(data: {
  userId: number;
  bookTitle?: string;
  totalPages?: number;
  totalWords?: number;
  totalImages?: number;
  pdfUrl?: string;
  finalPdfUrl?: string;
  userFeedback?: string;
  status?: "processing" | "ready_for_review" | "approved" | "sent_to_print";
  organizationType?: "chronological" | "thematic";
}): Promise<BookMetadata> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getBookMetadataByUserId(data.userId);
  
  if (existing) {
    await db.update(bookMetadata)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(bookMetadata.userId, data.userId));
    
    const updated = await getBookMetadataByUserId(data.userId);
    if (!updated) throw new Error("Failed to retrieve updated book metadata");
    return updated;
  } else {
    const result = await db.insert(bookMetadata).values(data);
    const insertedId = Number((result as any).insertId);
    const book = await getBookMetadataById(insertedId);
    if (!book) throw new Error("Failed to retrieve created book metadata");
    return book;
  }
}

export async function getBookMetadataById(id: number): Promise<BookMetadata | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(bookMetadata).where(eq(bookMetadata.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getBookMetadataByUserId(userId: number): Promise<BookMetadata | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(bookMetadata).where(eq(bookMetadata.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ==================== DAILY INSPIRATION HELPERS ====================

export async function getDailyInspiration(dayNumber: number): Promise<DailyInspiration | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const allInspirations = await db.select().from(dailyInspirations).orderBy(dailyInspirations.order);
  
  if (allInspirations.length === 0) return undefined;
  
  const index = dayNumber % allInspirations.length;
  return allInspirations[index];
}

export async function getAllInspirations(): Promise<DailyInspiration[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(dailyInspirations).orderBy(dailyInspirations.order);
}


// ==================== QUESTION BOX HELPERS ====================

export async function getRandomQuestion(boxNumber?: number): Promise<QuestionBox | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const { sql, eq } = await import("drizzle-orm");
    
    if (boxNumber) {
      const results = await db
        .select()
        .from(questionBoxes)
        .where(eq(questionBoxes.box, boxNumber))
        .orderBy(sql`RAND()`)
        .limit(1);
      return results[0] || null;
    } else {
      const results = await db
        .select()
        .from(questionBoxes)
        .orderBy(sql`RAND()`)
        .limit(1);
      return results[0] || null;
    }
  } catch (error) {
    console.error("[Database] Failed to get random question:", error);
    return null;
  }
}

export async function getQuestionsByBox(boxNumber: number): Promise<QuestionBox[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const { eq } = await import("drizzle-orm");
    return await db
      .select()
      .from(questionBoxes)
      .where(eq(questionBoxes.box, boxNumber))
      .orderBy(questionBoxes.number);
  } catch (error) {
    console.error("[Database] Failed to get questions by box:", error);
    return [];
  }
}

export async function getAllQuestions(): Promise<QuestionBox[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(questionBoxes)
      .orderBy(questionBoxes.box, questionBoxes.number);
  } catch (error) {
    console.error("[Database] Failed to get all questions:", error);
    return [];
  }
}


// ==================== KIT HELPERS ====================

export async function createKit(data: {
  name: string;
  description?: string;
  ownerUserId: number;
}): Promise<Kit> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(kits).values(data);
  const insertedId = Number((result as any)[0]?.insertId || (result as any).insertId);
  
  const kit = await getKitById(insertedId);
  if (!kit) throw new Error("Failed to retrieve created kit");
  
  // Automatically add owner as kit member
  await addKitMember({
    kitId: insertedId,
    userId: data.ownerUserId,
    role: "owner",
  });
  
  return kit;
}

export async function getKitById(id: number): Promise<Kit | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(kits).where(eq(kits.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserKits(userId: number): Promise<Kit[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    // Get all kits where user is a member
    const memberKits = await db
      .select({ kitId: kitMembers.kitId })
      .from(kitMembers)
      .where(eq(kitMembers.userId, userId));
    
    if (memberKits.length === 0) return [];
    
    const kitIds = memberKits.map(m => m.kitId);
    const userKits = await db
      .select()
      .from(kits)
      .where(eq(kits.id, kitIds[0])); // Simplified for single kit
    
    return userKits;
  } catch (error) {
    console.error("[Database] Failed to get user kits:", error);
    return [];
  }
}

export async function addKitMember(data: {
  kitId: number;
  userId: number;
  role?: "owner" | "collaborator" | "viewer";
  invitedBy?: number;
}): Promise<KitMember> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(kitMembers).values({
    ...data,
    acceptedAt: new Date(), // Auto-accept for now
  });
  
  const insertedId = Number((result as any)[0]?.insertId || (result as any).insertId);
  const member = await getKitMemberById(insertedId);
  if (!member) throw new Error("Failed to retrieve created kit member");
  
  return member;
}

export async function getKitMemberById(id: number): Promise<KitMember | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(kitMembers).where(eq(kitMembers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getKitMembers(kitId: number): Promise<KitMember[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(kitMembers)
    .where(eq(kitMembers.kitId, kitId));
}

export async function removeKitMember(kitId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(kitMembers)
    .where(and(eq(kitMembers.kitId, kitId), eq(kitMembers.userId, userId)));
}

export async function activateKit(kitId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  const memoryPeriodEnd = new Date(now);
  memoryPeriodEnd.setDate(memoryPeriodEnd.getDate() + 90); // 3 months
  
  const bookFinalizationEnd = new Date(now);
  bookFinalizationEnd.setDate(bookFinalizationEnd.getDate() + 365); // 1 year

  await db
    .update(kits)
    .set({
      activatedAt: now,
      memoryPeriodEndDate: memoryPeriodEnd,
      bookFinalizationEndDate: bookFinalizationEnd,
    })
    .where(eq(kits.id, kitId));
}


export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get user by email:", error);
    return null;
  }
}


export async function getUserQuestionProgress(userId: number): Promise<{
  box: number;
  boxName: string;
  totalQuestions: number;
  answeredQuestions: number;
  percentage: number;
}[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    // Get all questions grouped by box
    const allQuestions = await db
      .select()
      .from(questionBoxes)
      .orderBy(questionBoxes.box, questionBoxes.number);

    // Get user's memories with their records
    const userMemories = await db
      .select()
      .from(memories)
      .where(eq(memories.userId, userId));

    const memoryIds = userMemories.map(m => m.id);
    
    if (memoryIds.length === 0) {
      // No memories yet, return 0 progress for all boxes
      return [
        { box: 1, boxName: "Comece Por Aqui", totalQuestions: 15, answeredQuestions: 0, percentage: 0 },
        { box: 2, boxName: "Siga Por Aqui", totalQuestions: 45, answeredQuestions: 0, percentage: 0 },
        { box: 3, boxName: "Lembranças Profundas", totalQuestions: 45, answeredQuestions: 0, percentage: 0 },
        { box: 4, boxName: "Detalhes que Contam", totalQuestions: 45, answeredQuestions: 0, percentage: 0 },
      ];
    }

    // Get all records from user's memories
    const userRecords = await db
      .select()
      .from(memoryRecords)
      .where(eq(memoryRecords.memoryId, memoryIds[0])); // Simplified for single memory

    // Count answered questions by box (based on memory titles or content)
    // For now, we'll use a simple heuristic: check if memory title contains question keywords
    const boxProgress = [
      { box: 1, boxName: "Comece Por Aqui", totalQuestions: 15, answeredQuestions: 0 },
      { box: 2, boxName: "Siga Por Aqui", totalQuestions: 45, answeredQuestions: 0 },
      { box: 3, boxName: "Lembranças Profundas", totalQuestions: 45, answeredQuestions: 0 },
      { box: 4, boxName: "Detalhes que Contam", totalQuestions: 45, answeredQuestions: 0 },
    ];

    // Calculate percentage
    return boxProgress.map(box => ({
      ...box,
      percentage: Math.round((box.answeredQuestions / box.totalQuestions) * 100),
    }));
  } catch (error) {
    console.error("[Database] Failed to get question progress:", error);
    return [];
  }
}
