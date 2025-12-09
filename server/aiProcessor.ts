import { invokeLLM } from "./_core/llm";
import { transcribeAudio } from "./_core/voiceTranscription";

/**
 * Transcribe audio file and return text
 */
export async function transcribeMemoryAudio(audioUrl: string): Promise<string> {
  try {
    const result = await transcribeAudio({
      audioUrl,
      language: "pt",
      prompt: "Transcrição de memórias e histórias de vida em português brasileiro",
    });
    
    if ('error' in result) {
      throw new Error(result.error);
    }
    
    return result.text;
  } catch (error) {
    console.error("[AI] Transcription error:", error);
    throw new Error("Falha ao transcrever áudio");
  }
}

/**
 * Analyze memory content and extract metadata
 */
export async function analyzeMemoryContent(
  memoryContent: string,
  options?: {
    questionText?: string;
    categoryName?: string;
  }
): Promise<{
  title: string;
  summary: string;
  themes: string[];
  peopleMentioned: string[];
  periodMentioned?: string;
}> {
  try {
    // Build context for analysis
    let contextInfo = "";
    if (options?.questionText) {
      contextInfo = `\n\nCONTEXTO IMPORTANTE: Esta resposta foi dada para a seguinte pergunta específica:\n"${options.questionText}"\n\nPortanto, analise a resposta considerando que ela está respondendo diretamente a esta pergunta. Uma resposta curta ou direta pode ser completamente adequada dependendo da pergunta.`;
    }
    if (options?.categoryName) {
      contextInfo += `\n\nCategoria: ${options.categoryName}`;
    }

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um assistente especializado em analisar memórias e histórias de vida em português brasileiro.
Sua tarefa é extrair informações estruturadas de narrativas pessoais.

${options?.questionText ? 'IMPORTANTE: Quando uma pergunta específica for fornecida, considere que a resposta pode ser curta e direta, pois está respondendo exatamente àquela pergunta. Avalie se a resposta está completa ou incompleta CONSIDERANDO A PERGUNTA FEITA.' : ''}

Retorne SEMPRE um JSON válido com a seguinte estrutura:
{
  "title": "Título sugestivo de 5-7 palavras",
  "summary": "Resumo de 2-3 frases",
  "themes": ["tema1", "tema2", "tema3"],
  "peopleMentioned": ["pessoa1", "pessoa2"],
  "periodMentioned": "década ou período mencionado (ex: '1950s', 'infância', 'adolescência')"
}`,
        },
        {
          role: "user",
          content: `Analise esta memória e extraia as informações estruturadas:${contextInfo}\n\nRESPOSTA:\n${memoryContent}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "memory_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "Título sugestivo de 5-7 palavras",
              },
              summary: {
                type: "string",
                description: "Resumo de 2-3 frases",
              },
              themes: {
                type: "array",
                items: { type: "string" },
                description: "Temas principais identificados",
              },
              peopleMentioned: {
                type: "array",
                items: { type: "string" },
                description: "Pessoas mencionadas na memória",
              },
              periodMentioned: {
                type: "string",
                description: "Período ou década mencionada",
              },
            },
            required: ["title", "summary", "themes", "peopleMentioned"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const result = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
    return result;
  } catch (error) {
    console.error("[AI] Analysis error:", error);
    throw new Error("Falha ao analisar conteúdo");
  }
}

/**
 * Generate contextual follow-up questions based on memories
 */
export async function generateFollowupQuestions(
  memories: Array<{ title: string; summary?: string; themes?: string }>
): Promise<string[]> {
  try {
    const memoriesText = memories
      .map((m) => `- ${m.title}${m.summary ? `: ${m.summary}` : ""}`)
      .join("\n");

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um assistente gentil que ajuda pessoas a enriquecerem suas memórias fazendo perguntas contextuais.
Baseado nas memórias já registradas, gere 3-5 perguntas personalizadas que ajudem a pessoa a lembrar de mais detalhes ou histórias relacionadas.

As perguntas devem ser:
- Específicas e contextuais (baseadas no que a pessoa já contou)
- Gentis e acolhedoras
- Abertas (que estimulem narrativas, não respostas sim/não)
- Em português brasileiro

Retorne SEMPRE um JSON válido com array de perguntas.`,
        },
        {
          role: "user",
          content: `Baseado nestas memórias já registradas, gere perguntas de follow-up:\n\n${memoriesText}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "followup_questions",
          strict: true,
          schema: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: { type: "string" },
                description: "Lista de perguntas de follow-up",
              },
            },
            required: ["questions"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const result = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
    return result.questions;
  } catch (error) {
    console.error("[AI] Follow-up generation error:", error);
    return [];
  }
}

/**
 * Organize memories into book chapters
 */
export async function organizeMemoriesIntoBook(
  memories: Array<{
    id: number;
    title: string;
    summary?: string;
    themes?: string;
    periodMentioned?: string;
  }>,
  organizationType: "chronological" | "thematic"
): Promise<{
  bookTitle: string;
  chapters: Array<{
    chapterNumber: number;
    chapterTitle: string;
    memoriesIncluded: number[];
  }>;
}> {
  try {
    const memoriesText = memories
      .map(
        (m) =>
          `ID: ${m.id} | Título: ${m.title} | Período: ${m.periodMentioned || "N/A"} | Temas: ${m.themes || "N/A"}`
      )
      .join("\n");

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um editor especializado em organizar memórias em livros autobiográficos.
Sua tarefa é criar uma estrutura de capítulos coerente e envolvente.

Tipo de organização: ${organizationType === "chronological" ? "Cronológica (por períodos de vida)" : "Temática (por assuntos)"}

Retorne SEMPRE um JSON válido com a estrutura do livro.`,
        },
        {
          role: "user",
          content: `Organize estas memórias em capítulos de livro:\n\n${memoriesText}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "book_structure",
          strict: true,
          schema: {
            type: "object",
            properties: {
              bookTitle: {
                type: "string",
                description: "Título sugestivo para o livro",
              },
              chapters: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    chapterNumber: { type: "number" },
                    chapterTitle: { type: "string" },
                    memoriesIncluded: {
                      type: "array",
                      items: { type: "number" },
                    },
                  },
                  required: ["chapterNumber", "chapterTitle", "memoriesIncluded"],
                  additionalProperties: false,
                },
              },
            },
            required: ["bookTitle", "chapters"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const result = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
    return result;
  } catch (error) {
    console.error("[AI] Book organization error:", error);
    throw new Error("Falha ao organizar livro");
  }
}

/**
 * Generate chapter content from memories
 */
export async function generateChapterContent(
  chapterTitle: string,
  memories: Array<{ title: string; content?: string; summary?: string }>
): Promise<string> {
  try {
    const memoriesText = memories
      .map((m) => {
        let text = `## ${m.title}\n\n`;
        if (m.content) {
          text += m.content;
        } else if (m.summary) {
          text += m.summary;
        }
        return text;
      })
      .join("\n\n---\n\n");

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um escritor especializado em biografias e memórias.
Sua tarefa é transformar memórias individuais em um capítulo coeso e bem escrito.

Diretrizes:
- Mantenha a voz e o tom pessoal do autor
- Conecte as memórias de forma fluida e natural
- Use transições suaves entre histórias
- Preserve detalhes importantes e emoções
- Escreva em primeira pessoa
- Use português brasileiro
- Retorne o texto em formato Markdown`,
        },
        {
          role: "user",
          content: `Crie um capítulo coeso com o título "${chapterTitle}" usando estas memórias:\n\n${memoriesText}`,
        },
      ],
    });

    const content = response.choices[0].message.content;
    return typeof content === 'string' ? content : JSON.stringify(content);
  } catch (error) {
    console.error("[AI] Chapter generation error:", error);
    throw new Error("Falha ao gerar capítulo");
  }
}
