import { drizzle } from "drizzle-orm/mysql2";
import { memoryCategories, dailyInspirations } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

const categories = [
  { name: "Infância", description: "Histórias da infância", isPredefined: true, order: 1 },
  { name: "Família", description: "Histórias sobre pais, avós, irmãos", isPredefined: true, order: 2 },
  { name: "Escola", description: "Histórias da época de escola", isPredefined: true, order: 3 },
  { name: "Faculdade", description: "Histórias da faculdade/educação superior", isPredefined: true, order: 4 },
  { name: "Primeiro Trabalho", description: "Histórias do primeiro emprego", isPredefined: true, order: 5 },
  { name: "Carreira", description: "Histórias de trabalho e carreira", isPredefined: true, order: 6 },
  { name: "Casamento", description: "Histórias do casamento e vida a dois", isPredefined: true, order: 7 },
  { name: "Filhos", description: "Histórias sobre filhos e maternidade/paternidade", isPredefined: true, order: 8 },
  { name: "Viagens", description: "Histórias de viagens e aventuras", isPredefined: true, order: 9 },
  { name: "Amizades", description: "Histórias sobre amigos especiais", isPredefined: true, order: 10 },
  { name: "Hobbies e Paixões", description: "Histórias sobre atividades que amava", isPredefined: true, order: 11 },
  { name: "Desafios e Superações", description: "Histórias de dificuldades superadas", isPredefined: true, order: 12 },
  { name: "Realizações", description: "Histórias de conquistas e realizações", isPredefined: true, order: 13 },
  { name: "Amor e Relacionamentos", description: "Histórias sobre relacionamentos significativos", isPredefined: true, order: 14 },
  { name: "Memórias Aleatórias", description: "Memórias que não se enquadram em lugar nenhum", isPredefined: true, order: 15 },
];

const inspirations = [
  { question: "Qual sua primeira memória de infância?", category: "Infância", order: 1 },
  { question: "Como era o cheiro da casa da sua avó?", category: "Família", order: 2 },
  { question: "Qual foi seu professor favorito e por quê?", category: "Escola", order: 3 },
  { question: "Qual foi o momento mais marcante da sua vida profissional?", category: "Carreira", order: 4 },
  { question: "Descreva uma viagem que mudou sua perspectiva de vida.", category: "Viagens", order: 5 },
  { question: "Quem foi a pessoa mais importante na sua formação?", category: "Família", order: 6 },
  { question: "Qual foi o maior desafio que você superou?", category: "Desafios e Superações", order: 7 },
  { question: "Conte sobre um momento em que você se sentiu verdadeiramente feliz.", category: "Memórias Aleatórias", order: 8 },
  { question: "Qual tradição familiar você mais valoriza?", category: "Família", order: 9 },
  { question: "Descreva o dia em que conheceu seu grande amor.", category: "Amor e Relacionamentos", order: 10 },
  { question: "Qual foi sua brincadeira favorita na infância?", category: "Infância", order: 11 },
  { question: "Conte sobre uma amizade que marcou sua vida.", category: "Amizades", order: 12 },
  { question: "Qual foi o melhor conselho que você já recebeu?", category: "Memórias Aleatórias", order: 13 },
  { question: "Descreva um momento de orgulho na sua vida.", category: "Realizações", order: 14 },
  { question: "Qual hobby ou paixão te trouxe mais alegria?", category: "Hobbies e Paixões", order: 15 },
  { question: "Como era sua rotina quando criança?", category: "Infância", order: 16 },
  { question: "Conte sobre o nascimento do seu primeiro filho.", category: "Filhos", order: 17 },
  { question: "Qual lugar você mais gostou de visitar?", category: "Viagens", order: 18 },
  { question: "Descreva um momento difícil que te fortaleceu.", category: "Desafios e Superações", order: 19 },
  { question: "Qual era seu sonho quando jovem?", category: "Memórias Aleatórias", order: 20 },
];

async function seed() {
  console.log("🌱 Seeding database...");
  
  try {
    console.log("Inserting memory categories...");
    for (const category of categories) {
      await db.insert(memoryCategories).values(category).onDuplicateKeyUpdate({ set: { name: category.name } });
    }
    
    console.log("Inserting daily inspirations...");
    for (const inspiration of inspirations) {
      await db.insert(dailyInspirations).values(inspiration).onDuplicateKeyUpdate({ set: { question: inspiration.question } });
    }
    
    console.log("✅ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();
