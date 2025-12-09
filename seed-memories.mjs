import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not found");
  process.exit(1);
}

const db = drizzle(DATABASE_URL);

// Get user ID (assuming test user exists)
const usersTable = {
  id: "id",
  openId: "openId",
  name: "name",
};

async function seedMemories() {
  try {
    console.log("🌱 Seeding example memories...");

    // Get test user
    const connection = await mysql.createConnection(DATABASE_URL);
    const [users] = await connection.execute("SELECT id FROM users WHERE openId = 'test-user' LIMIT 1");
    
    if (!users || users.length === 0) {
      console.log("⚠️  Test user not found. Please login first with the test button.");
      process.exit(0);
    }

    const userId = users[0].id;
    console.log(`✓ Found user ID: ${userId}`);

    // Get category IDs
    const [categories] = await connection.execute("SELECT id, name FROM categories LIMIT 5");
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    // Create example memories
    const memories = [
      {
        userId,
        categoryId: categoryMap["Infância"] || 1,
        title: "Minha primeira bicicleta",
        summary: "Lembro como se fosse hoje do dia em que ganhei minha primeira bicicleta. Era vermelha e brilhante.",
        periodMentioned: "Década de 1970",
        themes: JSON.stringify(["Alegria", "Conquista", "Família"]),
        peopleMentioned: JSON.stringify(["Pai", "Mãe", "Irmão João"]),
      },
      {
        userId,
        categoryId: categoryMap["Família"] || 2,
        title: "Casamento dos meus pais",
        summary: "Uma história linda de amor que começou em um baile na cidade pequena onde cresceram.",
        periodMentioned: "Anos 1960",
        themes: JSON.stringify(["Amor", "Tradição", "Família"]),
        peopleMentioned: JSON.stringify(["Maria Silva", "José Silva", "Vovó Rosa"]),
      },
      {
        userId,
        categoryId: categoryMap["Viagens"] || 3,
        title: "Primeira viagem ao exterior",
        summary: "A emoção de conhecer Paris pela primeira vez, aos 30 anos. A Torre Eiffel era mais linda do que imaginava.",
        periodMentioned: "Verão de 1995",
        themes: JSON.stringify(["Aventura", "Descoberta", "Realização"]),
        peopleMentioned: JSON.stringify(["Esposa Ana", "Filho Pedro"]),
      },
      {
        userId,
        categoryId: categoryMap["Trabalho"] || 4,
        title: "Meu primeiro emprego",
        summary: "Comecei como office boy em uma grande empresa. Foi onde aprendi o valor do trabalho duro.",
        periodMentioned: "1978",
        themes: JSON.stringify(["Trabalho", "Aprendizado", "Crescimento"]),
        peopleMentioned: JSON.stringify(["Sr. Roberto", "Dona Carmem"]),
      },
    ];

    for (const memory of memories) {
      const [result] = await connection.execute(
        `INSERT INTO memories (userId, categoryId, title, summary, periodMentioned, themes, peopleMentioned, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [memory.userId, memory.categoryId, memory.title, memory.summary, memory.periodMentioned, memory.themes, memory.peopleMentioned]
      );
      
      const memoryId = result.insertId;
      console.log(`✓ Created memory: "${memory.title}" (ID: ${memoryId})`);

      // Add some records to each memory
      const recordTypes = ["text", "audio", "photo"];
      const randomType = recordTypes[Math.floor(Math.random() * recordTypes.length)];
      
      await connection.execute(
        `INSERT INTO memory_records (memoryId, type, content, createdAt) VALUES (?, ?, ?, NOW())`,
        [memoryId, randomType, `Conteúdo de exemplo para ${memory.title}`]
      );
      console.log(`  ✓ Added ${randomType} record`);
    }

    await connection.end();
    console.log("\n✅ Example memories seeded successfully!");
    console.log("🎉 You can now view them in the timeline at /minhas-memorias");

  } catch (error) {
    console.error("❌ Error seeding memories:", error);
    process.exit(1);
  }
}

seedMemories();
