import { eq } from "drizzle-orm";
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
        ssl: {},
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

export async function upsertUser(user: Partial<InsertUser>): Promise<void> {
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
      // Fazer UPDATE com apenas os campos fornecidos
      const updateData: any = { updatedAt: new Date() };
      
      // Adicionar apenas os campos que foram fornecidos
      if (user.email !== undefined) updateData.email = user.email;
      if (user.name !== undefined) updateData.name = user.name;
      if (user.role !== undefined) updateData.role = user.role;
      if (user.lastSignedIn !== undefined) updateData.lastSignedIn = user.lastSignedIn;
      if (user.phone !== undefined) updateData.phone = user.phone;
      if (user.city !== undefined) updateData.city = user.city;
      if (user.state !== undefined) updateData.state = user.state;
      if (user.cpf !== undefined) updateData.cpf = user.cpf;
      if (user.birthDate !== undefined) updateData.birthDate = user.birthDate;
      if (user.howHeardAboutTecelaria !== undefined) updateData.howHeardAboutTecelaria = user.howHeardAboutTecelaria;
      
      await db
        .update(users)
        .set(updateData)
        .where(eq(users.openId, user.openId));
    } else {
      // Fazer INSERT com todos os campos fornecidos
      await db.insert(users).values({
        ...user,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as InsertUser);
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
    const [memory] = await db
      .select()
      .from(memories)
      .where(eq(memories.userId, userId))
      .limit(1);

    const memoryId = memory?.id || `memory_${Date.now()}`;

    await db.insert(memoryRecords).values({
      id: `record_${Date.now()}`,
      memoryId,
      recordType,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("[Database] Error inserting memory:", error);
    throw error;
  }
}

export async function getMemoriesByUserId(userId: string): Promise<Memory[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    return await db
      .select()
      .from(memories)
      .where(eq(memories.userId, userId));
  } catch (error) {
    console.error("[Database] Error getting memories:", error);
    throw error;
  }
}
