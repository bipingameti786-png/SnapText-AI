import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const extractTextFromImage = async (base64Image: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please check your configuration.");
  }

  // Remove header if present (e.g., "data:image/jpeg;base64,")
  const base64Data = base64Image.split(',')[1] || base64Image;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming JPEG/PNG, Gemini handles standard image types well
              data: base64Data
            }
          },
          {
            text: "You are an advanced OCR engine. Extract all visible text from this image exactly as it appears. The text may be in English, Hindi, or Gujarati. Maintain the relative layout (line breaks) where possible. Return ONLY the extracted text, no conversational filler."
          }
        ]
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text could be extracted from the image.");
    }

    return text.trim();
  } catch (error) {
    console.error("OCR Error:", error);
    throw new Error("Failed to extract text. Please try again.");
  }
};
