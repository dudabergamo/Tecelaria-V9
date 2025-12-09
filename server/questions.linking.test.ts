import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";
import { 
  createMemory, 
  getRandomQuestion, 
  getQuestionsWithAnsweredStatus 
} from "./db";
import { users, memories, questionBoxes } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Question Linking System", () => {
  let testUserId: number;
  let testCategoryId: number = 1; // Infância

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create or get test user
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      testUserId = existingUsers[0].id;
    } else {
      const result = await db.insert(users).values({
        openId: "test-user-questions",
        name: "Test User",
        email: "test@example.com",
      });
      testUserId = Number((result as any)[0]?.insertId || (result as any).insertId);
    }
  });

  it("should classify all 150 questions with categories", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const allQuestions = await db.select().from(questionBoxes);
    
    expect(allQuestions.length).toBe(150);
    
    // Check that all questions have categoryId
    const questionsWithCategory = allQuestions.filter(q => q.categoryId !== null);
    expect(questionsWithCategory.length).toBe(150);
  });

  it("should exclude answered questions from random selection", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get a random question
    const question1 = await getRandomQuestion(testUserId);
    expect(question1).not.toBeNull();
    
    if (!question1) return;

    // Answer the question by creating a memory
    await createMemory({
      userId: testUserId,
      categoryId: question1.categoryId || testCategoryId,
      questionId: question1.id,
      title: "Test memory for question " + question1.id,
    });

    // Try to get another random question - should not return the answered one
    const question2 = await getRandomQuestion(testUserId);
    
    if (question2) {
      expect(question2.id).not.toBe(question1.id);
    }
  });

  it("should mark questions as answered in status list", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get questions with status
    const questionsWithStatus = await getQuestionsWithAnsweredStatus(testUserId);
    
    expect(questionsWithStatus.length).toBeGreaterThan(0);
    
    // Check that some questions are marked as answered
    const answeredQuestions = questionsWithStatus.filter(q => q.answered);
    expect(answeredQuestions.length).toBeGreaterThan(0);
  });

  it("should reactivate question when memory is deleted", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get a random question
    const question = await getRandomQuestion(testUserId);
    if (!question) {
      console.log("No unanswered questions available for test");
      return;
    }

    // Answer the question
    const memory = await createMemory({
      userId: testUserId,
      categoryId: question.categoryId || testCategoryId,
      questionId: question.id,
      title: "Test memory to be deleted",
    });

    // Verify question is marked as answered
    let questionsWithStatus = await getQuestionsWithAnsweredStatus(testUserId);
    let answeredQuestion = questionsWithStatus.find(q => q.id === question.id);
    expect(answeredQuestion?.answered).toBe(true);

    // Delete the memory
    await db.delete(memories).where(eq(memories.id, memory.id));

    // Verify question is no longer marked as answered
    questionsWithStatus = await getQuestionsWithAnsweredStatus(testUserId);
    answeredQuestion = questionsWithStatus.find(q => q.id === question.id);
    expect(answeredQuestion?.answered).toBe(false);
  });

  it("should link memory to specific question", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get a random question
    const question = await getRandomQuestion(testUserId);
    if (!question) {
      console.log("No unanswered questions available for test");
      return;
    }

    // Create memory linked to question
    const memory = await createMemory({
      userId: testUserId,
      categoryId: question.categoryId || testCategoryId,
      questionId: question.id,
      title: "Memory linked to question " + question.number,
    });

    // Verify the link
    expect(memory.questionId).toBe(question.id);
    expect(memory.categoryId).toBe(question.categoryId || testCategoryId);
  });
});
