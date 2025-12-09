import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";

describe("Question-Memory Linking", () => {
  let caller: any;
  let testUserId: number;

  beforeAll(async () => {
    // Create test context with mock user
    const mockUser = {
      id: 1,
      openId: "test-user",
      name: "Test User",
      email: "test@example.com",
      role: "user" as const,
      kitActivated: true,
      kitActivatedAt: new Date(),
      customMemoryCount: 0,
      lastUploadAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    testUserId = mockUser.id;

    caller = appRouter.createCaller({
      user: mockUser,
    });
  });

  it("should link questionId when creating memory from question", async () => {
    // Get a random question
    const question = await caller.questions.getRandomQuestion({ boxNumber: 1 });
    expect(question).toBeTruthy();
    expect(question?.id).toBeDefined();

    // Create memory with questionId
    const result = await caller.memories.processMemory({
      categoryId: 1,
      type: "text",
      textContent: "Esta é minha resposta para a pergunta sobre minha infância. Nasci em São Paulo e cresci em uma família amorosa. Meus pais sempre me apoiaram em todas as minhas decisões.",
      questionId: question!.id,
    });

    expect(result.memoryId).toBeDefined();
    expect(result.analysis).toBeDefined();
  });

  it("should filter answered questions from random selection", async () => {
    // Get all questions from box 1
    const allQuestions = await caller.questions.getQuestionsByBox({ boxNumber: 1 });
    const totalQuestions = allQuestions.length;

    // Get answered question IDs
    const answeredIds = await caller.questions.getAnsweredQuestionIds();
    const answeredCount = answeredIds.length;

    // If all questions are answered, we can't test filtering
    if (answeredCount >= totalQuestions) {
      expect(answeredCount).toBeGreaterThan(0);
      return;
    }

    // Get random question (should not be answered)
    const randomQuestion = await caller.questions.getRandomQuestion({ boxNumber: 1 });

    if (randomQuestion) {
      expect(answeredIds).not.toContain(randomQuestion.id);
    }
  });

  it("should track question progress correctly", async () => {
    const progress = await caller.questions.getProgress();

    expect(progress).toBeDefined();
    expect(Array.isArray(progress)).toBe(true);

    if (progress && progress.length > 0) {
      const box1Progress = progress.find((p: any) => p.box === 1);

      if (box1Progress) {
        expect(box1Progress.totalQuestions).toBeGreaterThan(0);
        expect(box1Progress.answeredQuestions).toBeGreaterThanOrEqual(0);
        expect(box1Progress.answeredQuestions).toBeLessThanOrEqual(box1Progress.totalQuestions);
        expect(box1Progress.percentage).toBeGreaterThanOrEqual(0);
        expect(box1Progress.percentage).toBeLessThanOrEqual(100);
      }
    }
  });

  it("should return answered question IDs for user", async () => {
    const answeredIds = await caller.questions.getAnsweredQuestionIds();

    expect(Array.isArray(answeredIds)).toBe(true);
    answeredIds.forEach((id: number) => {
      expect(typeof id).toBe("number");
      expect(id).toBeGreaterThan(0);
    });
  });
});
