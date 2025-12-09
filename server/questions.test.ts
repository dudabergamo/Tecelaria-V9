import { describe, it, expect, beforeAll } from "vitest";
import { 
  getRandomQuestion, 
  getQuestionsByBox, 
  getAllQuestions 
} from "./db";

describe("Question Boxes System", () => {
  describe("getRandomQuestion", () => {
    it("should return a random question from all boxes when no box specified", async () => {
      const question = await getRandomQuestion();
      
      expect(question).toBeDefined();
      expect(question).toHaveProperty("id");
      expect(question).toHaveProperty("box");
      expect(question).toHaveProperty("boxName");
      expect(question).toHaveProperty("number");
      expect(question).toHaveProperty("question");
      expect(question?.box).toBeGreaterThanOrEqual(1);
      expect(question?.box).toBeLessThanOrEqual(4);
    });

    it("should return a random question from box 1", async () => {
      const question = await getRandomQuestion(1);
      
      expect(question).toBeDefined();
      expect(question?.box).toBe(1);
      expect(question?.boxName).toBe("Comece Por Aqui");
    });

    it("should return a random question from box 2", async () => {
      const question = await getRandomQuestion(2);
      
      expect(question).toBeDefined();
      expect(question?.box).toBe(2);
      expect(question?.boxName).toBe("Siga Por Aqui");
    });

    it("should return a random question from box 3", async () => {
      const question = await getRandomQuestion(3);
      
      expect(question).toBeDefined();
      expect(question?.box).toBe(3);
      expect(question?.boxName).toBe("Lembranças Profundas");
    });

    it("should return a random question from box 4", async () => {
      const question = await getRandomQuestion(4);
      
      expect(question).toBeDefined();
      expect(question?.box).toBe(4);
      expect(question?.boxName).toBe("Detalhes que Contam");
    });
  });

  describe("getQuestionsByBox", () => {
    it("should return all questions from box 1 (Comece Por Aqui)", async () => {
      const questions = await getQuestionsByBox(1);
      
      expect(questions).toBeDefined();
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBe(15);
      
      questions.forEach((q) => {
        expect(q.box).toBe(1);
        expect(q.boxName).toBe("Comece Por Aqui");
      });
    });

    it("should return all questions from box 2 (Siga Por Aqui)", async () => {
      const questions = await getQuestionsByBox(2);
      
      expect(questions).toBeDefined();
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBe(45);
      
      questions.forEach((q) => {
        expect(q.box).toBe(2);
        expect(q.boxName).toBe("Siga Por Aqui");
      });
    });

    it("should return all questions from box 3 (Lembranças Profundas)", async () => {
      const questions = await getQuestionsByBox(3);
      
      expect(questions).toBeDefined();
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBe(45);
      
      questions.forEach((q) => {
        expect(q.box).toBe(3);
        expect(q.boxName).toBe("Lembranças Profundas");
      });
    });

    it("should return all questions from box 4 (Detalhes que Contam)", async () => {
      const questions = await getQuestionsByBox(4);
      
      expect(questions).toBeDefined();
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBe(45);
      
      questions.forEach((q) => {
        expect(q.box).toBe(4);
        expect(q.boxName).toBe("Detalhes que Contam");
      });
    });

    it("should return questions in correct order by number", async () => {
      const questions = await getQuestionsByBox(1);
      
      for (let i = 0; i < questions.length - 1; i++) {
        expect(questions[i].number).toBeLessThan(questions[i + 1].number);
      }
    });
  });

  describe("getAllQuestions", () => {
    it("should return all 150 questions", async () => {
      const questions = await getAllQuestions();
      
      expect(questions).toBeDefined();
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBe(150);
    });

    it("should have correct distribution across boxes", async () => {
      const questions = await getAllQuestions();
      
      const box1 = questions.filter(q => q.box === 1);
      const box2 = questions.filter(q => q.box === 2);
      const box3 = questions.filter(q => q.box === 3);
      const box4 = questions.filter(q => q.box === 4);
      
      expect(box1.length).toBe(15);
      expect(box2.length).toBe(45);
      expect(box3.length).toBe(45);
      expect(box4.length).toBe(45);
    });

    it("should have all questions with required fields", async () => {
      const questions = await getAllQuestions();
      
      questions.forEach((q) => {
        expect(q).toHaveProperty("id");
        expect(q).toHaveProperty("box");
        expect(q).toHaveProperty("boxName");
        expect(q).toHaveProperty("number");
        expect(q).toHaveProperty("question");
        expect(q.question.length).toBeGreaterThan(0);
      });
    });

    it("should return questions ordered by box and number", async () => {
      const questions = await getAllQuestions();
      
      let currentBox = 1;
      let currentNumber = 0;
      
      questions.forEach((q) => {
        if (q.box > currentBox) {
          currentBox = q.box;
          currentNumber = 0;
        }
        expect(q.number).toBeGreaterThan(currentNumber);
        currentNumber = q.number;
      });
    });
  });
});
