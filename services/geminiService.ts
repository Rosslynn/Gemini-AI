
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { ModelType, Attachment, GroundingMetadata } from "../types";

// Ya no instanciamos 'ai' globalmente para evitar errores si no hay key.
// Usamos una factoría o pasamos la instancia.

const getClient = (apiKey: string) => new GoogleGenAI({ apiKey });

export const streamGeminiResponse = async (
  apiKey: string,
  systemInstruction: string, // Nueva prop
  prompt: string,
  contextCode: string,
  attachments: Attachment[],
  history: { role: string; parts: Part[] }[],
  model: ModelType,
  useSearch: boolean,
  onChunk: (text: string, grounding?: GroundingMetadata) => void,
  signal?: AbortSignal
): Promise<void> => {
  
  if (!apiKey) throw new Error("API Key faltante");

  const ai = getClient(apiKey);
  
  const currentParts: Part[] = [];
  
  // Agregar contexto técnico si existe
  let finalPrompt = prompt;
  if (contextCode) {
      finalPrompt = `${prompt}\n\nCONTEXTO TÉCNICO:\n\`\`\`\n${contextCode}\n\`\`\``;
  }

  attachments.forEach(att => {
      currentParts.push({ inlineData: { mimeType: att.mimeType, data: att.data } });
  });
  
  if (finalPrompt.trim()) currentParts.push({ text: finalPrompt });

  const tools: any[] = [];
  if (useSearch && model === ModelType.SMART) {
      tools.push({ googleSearch: {} });
  }

  try {
    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: systemInstruction, // Usar instrucción dinámica
        tools: tools,
        thinkingConfig: model === ModelType.SMART ? { thinkingBudget: 1024 } : undefined,
      },
      history: history, 
    });

    const resultStream = await chat.sendMessageStream({ 
        message: currentParts 
    });

    for await (const chunk of resultStream) {
        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
        const c = chunk as GenerateContentResponse;
        if (c.text) onChunk(c.text, undefined);
        if (c.candidates?.[0]?.groundingMetadata) onChunk("", c.candidates[0].groundingMetadata as GroundingMetadata);
    }

  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateQuickAction = async (
    apiKey: string,
    code: string,
    taskPrompt: string, // AHORA: Recibe el prompt traducido desde la UI
    onChunk: (text: string) => void,
    signal?: AbortSignal
): Promise<string> => {
    if (!apiKey) throw new Error("API Key faltante");
    const ai = getClient(apiKey);
    
    try {
        const responseStream = await ai.models.generateContentStream({
            model: ModelType.FAST,
            contents: `TAREA: ${taskPrompt}\n\nCÓDIGO:\n\`\`\`\n${code}\n\`\`\``,
        });
        let fullText = "";
        for await (const chunk of responseStream) {
            if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
            if (chunk.text) {
                fullText += chunk.text;
                onChunk(chunk.text);
            }
        }
        return fullText;
    } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") throw e;
        throw e;
    }
}
