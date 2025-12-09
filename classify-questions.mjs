import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./drizzle/schema.ts";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

// Mapeamento: número da pergunta → categoryId
// Baseado nas 15 categorias predefinidas:
// 1=Infância, 2=Família, 3=Escola, 4=Faculdade, 5=Primeiro Trabalho
// 6=Carreira, 7=Casamento, 8=Filhos, 9=Viagens, 10=Amizades
// 11=Hobbies e Paixões, 12=Desafios e Superações, 13=Realizações
// 14=Amor e Relacionamentos, 15=Memórias Aleatórias

const questionCategoryMap = {
  // CAIXINHA 1: "Comece Por Aqui" (15 perguntas cadastrais)
  1: 2,   // Nome completo → Família
  2: 2,   // Data nascimento → Família
  3: 1,   // Onde nasceu → Infância
  4: 2,   // Nome dos pais → Família
  5: 2,   // Irmãos → Família
  6: 6,   // Profissão principal → Carreira
  7: 7,   // Casado/cônjuge → Casamento
  8: 8,   // Filhos → Filhos
  9: 8,   // Netos → Filhos
  10: 15, // Cidade atual → Memórias Aleatórias
  11: 15, // Religião → Memórias Aleatórias
  12: 15, // Tempo na cidade → Memórias Aleatórias
  13: 7,  // Estado civil → Casamento
  14: 2,  // Apelido → Família
  15: 2,  // História do nome → Família

  // CAIXINHA 2: "Siga Por Aqui" (45 perguntas sobre gostos)
  16: 11,  // Time de futebol → Hobbies
  17: 11,  // Esporte favorito → Hobbies
  18: 15,  // Copa do Mundo → Memórias Aleatórias
  19: 15,  // Olimpíadas → Memórias Aleatórias
  20: 13,  // Grande sonho → Realizações
  21: 11,  // Programa TV → Hobbies
  22: 11,  // Livro favorito → Hobbies
  23: 11,  // Filme marcante → Hobbies
  24: 11,  // Música/cantor → Hobbies
  25: 11,  // Hobby/passatempo → Hobbies
  26: 11,  // Comida favorita → Hobbies
  27: 1,   // Doce de infância → Infância
  28: 11,  // Sorvete → Hobbies
  29: 2,   // Receitas especiais → Família
  30: 11,  // Cor favorita → Hobbies
  31: 2,   // Tradição familiar → Família
  32: 11,  // Feriado favorito → Hobbies
  33: 11,  // Dia ou noite → Hobbies
  34: 11,  // Animal favorito → Hobbies
  35: 11,  // Animal de estimação → Hobbies
  36: 9,   // Lugar favorito → Viagens
  37: 9,   // Praia ou montanha → Viagens
  38: 11,  // Estação do ano → Hobbies
  39: 11,  // Talento especial → Hobbies
  40: 13,  // Maior orgulho → Realizações
  41: 11,  // Esporte quando jovem → Hobbies
  42: 11,  // Instrumento musical → Hobbies
  43: 11,  // Tipo de música → Hobbies
  44: 11,  // Dançar → Hobbies
  45: 11,  // Prato típico → Hobbies
  46: 15,  // Superstição → Memórias Aleatórias
  47: 11,  // Cheiro favorito → Hobbies
  48: 11,  // Coleção → Hobbies
  49: 11,  // Roupa favorita → Hobbies
  50: 11,  // Acessório especial → Hobbies
  51: 11,  // Perfume → Hobbies
  52: 11,  // Cozinhar → Hobbies
  53: 11,  // Jardinagem → Hobbies
  54: 11,  // Clima favorito → Hobbies
  55: 11,  // Cidade ou campo → Hobbies
  56: 11,  // Transporte favorito → Hobbies
  57: 11,  // Ler/gênero → Hobbies
  58: 11,  // Novelas → Hobbies
  59: 11,  // Tipo de filme → Hobbies
  60: 11,  // Artista/ator → Hobbies

  // CAIXINHA 3: "Lembranças Profundas" (45 perguntas reflexivas)
  61: 13,  // Memória de gratidão → Realizações
  62: 12,  // Arrependimento → Desafios
  63: 15,  // Conselho para si aos 18 → Memórias Aleatórias
  64: 13,  // Momento mais feliz → Realizações
  65: 12,  // Momento difícil → Desafios
  66: 13,  // Melhor decisão → Realizações
  67: 12,  // Pior decisão → Desafios
  68: 2,   // Pessoa mais importante → Família
  69: 12,  // Maior desafio → Desafios
  70: 13,  // Maior conquista → Realizações
  71: 15,  // O que valoriza → Memórias Aleatórias
  72: 15,  // Conselho gerações → Memórias Aleatórias
  73: 12,  // Aprendizado com erros → Desafios
  74: 14,  // Maior amor → Amor
  75: 13,  // Realização → Realizações
  76: 13,  // Orgulho → Realizações
  77: 12,  // Fazer diferente → Desafios
  78: 12,  // Maior lição → Desafios
  79: 13,  // Legado → Realizações
  80: 14,  // Sentir amado → Amor
  81: 15,  // Paz → Memórias Aleatórias
  82: 12,  // Maior mudança → Desafios
  83: 15,  // Voltar no tempo → Memórias Aleatórias
  84: 13,  // Momento emocionante → Realizações
  85: 10,  // Admira nas pessoas → Amizades
  86: 12,  // Maior sacrifício → Desafios
  87: 15,  // Motivação → Memórias Aleatórias
  88: 15,  // Maior surpresa → Memórias Aleatórias
  89: 15,  // Aprender mais cedo → Memórias Aleatórias
  90: 12,  // Corajoso → Desafios
  91: 13,  // Sucesso → Realizações
  92: 12,  // Transformação → Desafios
  93: 15,  // Sentir vivo → Memórias Aleatórias
  94: 12,  // Vulnerável → Desafios
  95: 12,  // Maior medo → Desafios
  96: 13,  // Maior alegria → Realizações
  97: 15,  // Sem medo → Memórias Aleatórias
  98: 13,  // Sentir livre → Realizações
  99: 13,  // Admira em si → Realizações
  100: 12, // Maior dor → Desafios
  101: 13, // Sentir completo → Realizações
  102: 12, // Sentir forte → Desafios
  103: 13, // Legado → Realizações
  104: 13, // Gratidão → Realizações
  105: 15, // Eu do futuro → Memórias Aleatórias

  // CAIXINHA 4: "Detalhes que Contam" (45 perguntas específicas)
  106: 3,  // Primeira escola → Escola
  107: 3,  // Primeiro professor → Escola
  108: 14, // Primeiro amor → Amor
  109: 1,  // Endereço infância → Infância
  110: 10, // Melhor amigo infância → Amizades
  111: 1,  // Brinquedo favorito → Infância
  112: 1,  // Brincadeira favorita → Infância
  113: 5,  // Primeiro emprego → Primeiro Trabalho
  114: 5,  // Salário primeiro emprego → Primeiro Trabalho
  115: 15, // Primeiro carro → Memórias Aleatórias
  116: 1,  // Nome da rua → Infância
  117: 2,  // Avô paterno → Família
  118: 2,  // Avó paterna → Família
  119: 2,  // Avô materno → Família
  120: 2,  // Avó materna → Família
  121: 2,  // Profissão pai → Família
  122: 2,  // Profissão mãe → Família
  123: 15, // Igreja → Memórias Aleatórias
  124: 1,  // Bairro infância → Infância
  125: 3,  // Matéria favorita → Escola
  126: 3,  // Matéria menos favorita → Escola
  127: 11, // Time infância → Hobbies
  128: 1,  // Cinema → Infância
  129: 1,  // Padaria → Infância
  130: 1,  // Mercado → Infância
  131: 15, // Preço pão → Memórias Aleatórias
  132: 15, // Preço ônibus → Memórias Aleatórias
  133: 15, // Presidente nascimento → Memórias Aleatórias
  134: 1,  // Primeiro pet → Infância
  135: 1,  // Cor da casa → Infância
  136: 1,  // Cômodos casa → Infância
  137: 1,  // Praça bairro → Infância
  138: 1,  // Parque → Infância
  139: 15, // Marca rádio/TV → Memórias Aleatórias
  140: 15, // Jornal → Memórias Aleatórias
  141: 15, // Revista → Memórias Aleatórias
  142: 11, // Clube → Hobbies
  143: 3,  // Distância escola → Escola
  144: 3,  // Como ia escola → Escola
  145: 3,  // Horário escola → Escola
  146: 2,  // Comida da mãe → Família
  147: 2,  // Doce da avó → Família
  148: 2,  // Cheiro casa avó → Família
  149: 15, // Música rádio → Memórias Aleatórias
  150: 15, // Programa rádio → Memórias Aleatórias
};

async function classifyQuestions() {
  console.log("🏷️  Classificando perguntas por categoria...");
  
  try {
    // Buscar todas as perguntas
    const questions = await db.select().from(schema.questionBoxes);
    console.log(`Encontradas ${questions.length} perguntas no banco.`);
    
    let updated = 0;
    for (const question of questions) {
      // Calcular o índice global da pergunta (1-150)
      let globalIndex;
      if (question.box === 1) {
        globalIndex = question.number;
      } else if (question.box === 2) {
        globalIndex = 15 + question.number;
      } else if (question.box === 3) {
        globalIndex = 60 + question.number;
      } else if (question.box === 4) {
        globalIndex = 105 + question.number;
      }
      
      const categoryId = questionCategoryMap[globalIndex];
      
      if (categoryId) {
        await db.update(schema.questionBoxes)
          .set({ categoryId })
          .where(eq(schema.questionBoxes.id, question.id));
        updated++;
      }
    }
    
    console.log(`✅ ${updated} perguntas classificadas com sucesso!`);
    console.log("\nDistribuição por categoria:");
    console.log("1=Infância, 2=Família, 3=Escola, 4=Faculdade, 5=Primeiro Trabalho");
    console.log("6=Carreira, 7=Casamento, 8=Filhos, 9=Viagens, 10=Amizades");
    console.log("11=Hobbies, 12=Desafios, 13=Realizações, 14=Amor, 15=Memórias Aleatórias");
  } catch (error) {
    console.error("❌ Erro ao classificar perguntas:", error);
    process.exit(1);
  }
}

classifyQuestions().then(() => {
  console.log("\n🎉 Classificação concluída!");
  process.exit(0);
});
