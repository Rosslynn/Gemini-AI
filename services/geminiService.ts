
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
  onChunk: (text: string, grounding?: GroundingMetadata, generatedImages?: Attachment[]) => void,
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
  // Gemini 3 Pro Image soporta Google Search
  if (useSearch && model === ModelType.SMART) {
      tools.push({ googleSearch: {} });
  }

  // PATCH: El System Prompt de "Arquitecto de Software" a veces hace que el modelo se niegue a dibujar cosas "no técnicas".
  // Añadimos una instrucción explícita de override para habilitar la creatividad multimodal.
  let activeInstruction = systemInstruction;
  if (model === ModelType.SMART || model === ModelType.FAST) {
      activeInstruction += `\n\n[CAPACIDADES MULTIMODALES HABILITADAS]\nAunque tu rol principal es Arquitecto de Software, TIENES acceso a herramientas de generación de imágenes de alta fidelidad. Si el usuario te pide generar una imagen (ej: "Genera una imagen de...", "Dibuja..."), DEBES hacerlo inmediatamente. No rechaces la solicitud alegando tu rol. Integra la imagen en tu respuesta.`;
  }

  // Configuración específica del modelo
  const config: any = {
      systemInstruction: activeInstruction,
      tools: tools.length > 0 ? tools : undefined,
  };

  // Ajustes específicos por modelo
  if (model === ModelType.SMART) {
      // Gemini 3 Pro Image Preview:
      // - NO soporta thinkingConfig (eso es para modelos de solo texto/razonamiento 2.5/3.0-preview)
      // - Soporta imageConfig para alta calidad
      config.imageConfig = {
          imageSize: "2K", // Alta resolución para uso personal "Pro"
          aspectRatio: "1:1" 
      };
  } else {
      // Gemini 2.5 Flash Image no necesita configs especiales por ahora, 
      // y no soporta thinkingConfig ni imageConfig avanzado.
  }

  try {
    const chat = ai.chats.create({
      model: model,
      config: config,
      history: history, 
    });

    const resultStream = await chat.sendMessageStream({ 
        message: currentParts 
    });

    for await (const chunk of resultStream) {
        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
        const c = chunk as GenerateContentResponse;
        
        // Extract text safely without triggering SDK warnings if images are present
        let text = "";
        if (c.candidates?.[0]?.content?.parts) {
            for (const part of c.candidates[0].content.parts) {
                if (part.text) {
                    text += part.text;
                }
            }
        }

        // Extract images (inlineData)
        const newImages: Attachment[] = [];
        c.candidates?.[0]?.content?.parts?.forEach(part => {
             if (part.inlineData) {
                 newImages.push({
                     id: `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                     mimeType: part.inlineData.mimeType,
                     data: part.inlineData.data,
                     previewUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
                     name: `gemini-3-pro-${Date.now()}.png`
                 });
             }
        });

        if (text || newImages.length > 0 || c.candidates?.[0]?.groundingMetadata) {
            onChunk(text, c.candidates?.[0]?.groundingMetadata as GroundingMetadata, newImages);
        }
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
