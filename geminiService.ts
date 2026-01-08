
import { GoogleGenAI, Type } from "@google/genai";
import { ModelId, PlatformResult } from "./types";

const SYSTEM_INSTRUCTION = `
You are a world-class E-commerce Creative Director for "Team Maria Homes". Your task is to generate ultra-accurate, professional product photography prompts for AI image generators.

CRITICAL PRODUCT FIDELITY RULES:
1. DESIGN LOCK: The product's EXACT shape, texture, color, and unique design elements from the source image must be maintained. Use phrases like "1:1 exact replica", "identical design details", "preserve original material textures".
2. NO HALLUCINATIONS: Do not add features, buttons, or decorations that don't exist in the provided image.
3. QUALITY STACK: Every prompt must end with: "high-end commercial photography, 8k resolution, sharp focus, professional color grading, studio lighting, highly detailed textures, realistic shadows".

AMAZON 5-IMAGE STRATEGY (STRICT SPECIFICATIONS):

1. MAIN (White Background): 
   - REQUIREMENT: Strictly a PURE WHITE background (HEX #FFFFFF).
   - CONTENT: "A professional commercial studio shot of the EXACT product centered on a flat, pure white background. Product fills 85% of the frame. Soft natural drop shadow underneath for realism. Zero clutter, zero props. Crystal clear product isolated on white."

2. LIFESTYLE (High-End Context): 
   - REQUIREMENT: A premium, aspirational environment where the product naturally fits.
   - CONTENT: "The EXACT product showcased in a high-end, realistic [CONTEXT-APPROPRIATE ROOM, e.g., modern living room or designer kitchen]. Soft ambient natural lighting from a window, elegant interior design, shallow depth of field with the product in sharp focus. Modern, clean aesthetic."

3. USAGE (Human Interaction): 
   - REQUIREMENT: Show the product being used by a person.
   - CONTENT: "A high-quality lifestyle shot of a person naturally interacting with the EXACT product. [SPECIFY ACTION BASED ON ITEM, e.g., a hand holding it or someone sitting next to it]. Ensure the product is the central focus, looking perfectly integrated into the scene. Realistic skin textures and natural pose."

4. FEATURES (Full View Highlight): 
   - REQUIREMENT: Full view of the product showing its best technical/design aspects.
   - CONTENT: "A wide-angle full view of the EXACT product, showing every detail from front to back. Surround the product with sleek, modern 3D floating callout lines and labels pointing to key features visible in the image. High-tech commercial presentation, sharp details, informative infographic style."

5. SIZING (Technical Diagram): 
   - REQUIREMENT: White background with arrows and manual placeholders.
   - CONTENT: "A technical sizing diagram of the EXACT product on a flat PURE WHITE background. Include professional 3D dimension arrows for Height, Width, and Length. You MUST include the text '[ADD HEIGHT CM]', '[ADD WIDTH CM]', and '[ADD LENGTH CM]' in the prompt as placeholders for the user to fill. Clean, architectural drawing style with a 3D product view."

Return strictly JSON.
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    amazon: {
      type: Type.OBJECT,
      properties: {
        seo: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            bulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            averageSize: { type: Type.STRING }
          },
          required: ["title", "description", "bulletPoints", "averageSize"]
        },
        prompts: {
          type: Type.OBJECT,
          properties: {
            lifestyle1: { type: Type.STRING, description: "Strict White Background Main Image" },
            lifestyle2: { type: Type.STRING, description: "Premium Lifestyle Setting" },
            usage: { type: Type.STRING, description: "Human Usage Interaction" },
            features: { type: Type.STRING, description: "Full View Feature Highlight" },
            sizing: { type: Type.STRING, description: "White Background Sizing with [BRACKET] Placeholders" }
          },
          required: ["lifestyle1", "lifestyle2", "usage", "features", "sizing"]
        }
      },
      required: ["seo", "prompts"]
    },
    trendyol: {
      type: Type.OBJECT,
      properties: {
        seo: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["title", "description"]
        },
        prompts: {
          type: Type.OBJECT,
          properties: {
            lifestyle1: { type: Type.STRING },
            lifestyle2: { type: Type.STRING },
            usage: { type: Type.STRING },
            features: { type: Type.STRING },
            sizing: { type: Type.STRING }
          },
          required: ["lifestyle1", "lifestyle2", "usage", "features", "sizing"]
        }
      },
      required: ["seo", "prompts"]
    }
  },
  required: ["amazon", "trendyol"]
};

export const generatePlatformData = async (
  base64Image: string,
  mimeType: string
): Promise<PlatformResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: ModelId.PRO_3,
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: SYSTEM_INSTRUCTION }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    }
  });

  return {
    modelName: ModelId.PRO_3,
    ...JSON.parse(response.text || '{}')
  };
};
