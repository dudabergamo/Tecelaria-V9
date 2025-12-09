import { invokeLLM } from "./llm";

/**
 * Extract text from handwritten notebook images using LLM Vision
 */
export async function extractTextFromImage(imageUrl: string): Promise<string> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Você é um especialista em transcrever texto manuscrito de imagens. Transcreva fielmente todo o texto visível na imagem, preservando a estrutura e formatação quando possível."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Por favor, transcreva todo o texto manuscrito desta imagem. Se houver partes ilegíveis, indique com [ilegível]. Preserve quebras de linha e parágrafos."
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high"
              }
            }
          ]
        }
      ]
    });

    const messageContent = response.choices[0]?.message?.content;
    const extractedText = typeof messageContent === 'string' ? messageContent : "";
    
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error("Não foi possível extrair texto da imagem");
    }

    return extractedText;
  } catch (error) {
    console.error("[OCR] Failed to extract text from image:", error);
    throw new Error("Erro ao processar imagem: " + (error as Error).message);
  }
}

/**
 * Process handwritten recipe image and extract structured information
 */
export async function extractRecipeFromImage(imageUrl: string): Promise<{
  title: string;
  ingredients: string[];
  instructions: string;
  notes?: string;
}> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Você é um especialista em transcrever receitas manuscritas. Extraia e estruture as informações da receita."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extraia desta imagem: 1) Título da receita, 2) Lista de ingredientes, 3) Modo de preparo, 4) Observações adicionais (se houver)"
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high"
              }
            }
          ]
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "recipe_extraction",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "Nome da receita"
              },
              ingredients: {
                type: "array",
                items: { type: "string" },
                description: "Lista de ingredientes"
              },
              instructions: {
                type: "string",
                description: "Modo de preparo"
              },
              notes: {
                type: "string",
                description: "Observações adicionais"
              }
            },
            required: ["title", "ingredients", "instructions"],
            additionalProperties: false
          }
        }
      }
    });

    const messageContent = response.choices[0]?.message?.content;
    if (!messageContent || typeof messageContent !== 'string') {
      throw new Error("Resposta vazia do OCR");
    }

    const recipe = JSON.parse(messageContent);
    return recipe;
  } catch (error) {
    console.error("[OCR] Failed to extract recipe from image:", error);
    throw new Error("Erro ao processar receita: " + (error as Error).message);
  }
}
