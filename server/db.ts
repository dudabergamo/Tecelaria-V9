import { eq, desc, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
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
      console.log("[Database] Initializing connection pool...");
      const pool = createPool({
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        ssl: true,
      });
      _db = drizzle(pool);
      console.log("[Database] Connection pool initialized successfully");
    } catch (error) {
      console.error("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== USER HELPERS ====================

export async function getUserByOpenId(openId: string): Promise<typeof users.$inferSelect | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.openId, openId))
      .limit(1);

    return user || null;
  } catch (error) {
    console.error("[Database] Error getting user by openId:", error);
    throw error;
  }
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.openId, user.openId))
      .limit(1);

    if (existingUser.length > 0) {
      await db
        .update(users)
        .set({
          ...user,
          updatedAt: new Date(),
        })
        .where(eq(users.openId, user.openId));
    } else {
      await db.insert(users).values({
        ...user,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error("[Database] Error upserting user:", error);
    throw error;
  }
}

// ==================== MEMORY HELPERS ====================

export async function insertMemory(
  userId: string,
  categoryId: string,
  content: string,
  recordType: "audio" | "text" | "image" | "document"
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const memoryId = crypto.randomUUID();
    
    await db.insert(memories).values({
      id: memoryId,
      userId,
      categoryId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await db.insert(memoryRecords).values({
      id: crypto.randomUUID(),
      memoryId,
      type: recordType,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("[Database] Error inserting memory:", error);
    throw error;
  }
}

// ==================== BOOK HELPERS ====================

export async function createBook(
  userId: string,
  title: string,
  description: string
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const bookId = crypto.randomUUID();
    
    await db.insert(bookMetadata).values({
      id: bookId,
      userId,
      title,
      description,
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return bookId;
  } catch (error) {
    console.error("[Database] Error creating book:", error);
    throw error;
  }
}

export async function addBookChapter(
  bookId: string,
  title: string,
  content: string,
  order: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.insert(bookChapters).values({
      id: crypto.randomUUID(),
      bookId,
      title,
      content,
      order,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("[Database] Error adding book chapter:", error);
    throw error;
  }
}

// ==================== KIT HELPERS ====================

export async function createKit(
  userId: string,
  kitType: "digital" | "physical"
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const kitId = crypto.randomUUID();
    
    await db.insert(kits).values({
      id: kitId,
      userId,
      type: kitType,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return kitId;
  } catch (error) {
    console.error("[Database] Error creating kit:", error);
    throw error;
  }
}

export async function addKitMember(
  kitId: string,
  memberId: string,
  role: "owner" | "editor" | "viewer"
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.insert(kitMembers).values({
      id: crypto.randomUUID(),
      kitId,
      userId: memberId,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("[Database] Error adding kit member:", error);
    throw error;
  }
}

// ==================== QUESTION BOX HELPERS ====================

export async function getQuestionBoxes(
  kitId?: string
): Promise<typeof questionBoxes.$inferSelect[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    if (kitId) {
      return await db
        .select()
        .from(questionBoxes)
        .where(eq(questionBoxes.kitId, kitId));
    }
    return await db.select().from(questionBoxes);
  } catch (error) {
    console.error("[Database] Error getting question boxes:", error);
    throw error;
  }
}

// ==================== DAILY INSPIRATION HELPERS ====================

export async function getDailyInspiration(): Promise<typeof dailyInspirations.$inferSelect | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [inspiration] = await db
      .select()
      .from(dailyInspirations)
      .where(
        and(
          gte(dailyInspirations.createdAt, today),
          lte(dailyInspirations.createdAt, tomorrow)
        )
      )
      .limit(1);

    return inspiration || null;
  } catch (error) {
    console.error("[Database] Error getting daily inspiration:", error);
    throw error;
  }
}

// ==================== UTILITY HELPERS ====================

export async function getUserMemories(
  userId: string
): Promise<typeof memories.$inferSelect[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    return await db
      .select()
      .from(memories)
      .where(eq(memories.userId, userId))
      .orderBy(desc(memories.createdAt));
  } catch (error) {
    console.error("[Database] Error getting user memories:", error);
    throw error;
  }
}

export async function getUserBooks(
  userId: string
): Promise<typeof bookMetadata.$inferSelect[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    return await db
      .select()
      .from(bookMetadata)
      .where(eq(bookMetadata.userId, userId))
      .orderBy(desc(bookMetadata.createdAt));
  } catch (error) {
    console.error("[Database] Error getting user books:", error);
    throw error;
  }
}

export async function getUserKits(
  userId: string
): Promise<typeof kits.$inferSelect[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    return await db
      .select()
      .from(kits)
      .where(eq(kits.userId, userId))
      .orderBy(desc(kits.createdAt));
  } catch (error) {
    console.error("[Database] Error getting user kits:", error);
    throw error;
  }
}
