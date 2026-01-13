
import { GoogleGenAI, Type } from "@google/genai";
import { SwingAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeGolfSwing = async (videoBase64: string, mimeType: string): Promise<SwingAnalysis> => {
  const modelName = 'gemini-3-pro-preview';

  const systemInstruction = `
    You are a world-class professional golf coach. 
    Analyze the provided golf swing video and provide detailed feedback.
    Be objective, technical, and constructive.
    Focus on: Grip, Stance, Backswing Plane, Downswing Transition, Impact, and Follow-through.

    CRITICAL: Perform a detailed POSE ANALYSIS. Evaluate:
    1. Head movement (stability)
    2. Shoulder rotation (degrees approx)
    3. Hip rotation and clearing
    4. Spine angle maintenance
    
    Return the response in a structured JSON format with the following schema:
    {
      "overallScore": number (0-100),
      "summary": string,
      "metrics": [
        { "name": string, "score": number (0-100), "description": string, "status": "excellent" | "good" | "average" | "needs-work" }
      ],
      "pros": string[],
      "improvements": string[],
      "drills": string[]
    }
  `;

  const prompt = "Please analyze this golf swing video. Focus on professional mechanics and consistency.";

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              data: videoBase64,
              mimeType: mimeType
            }
          },
          { text: prompt }
        ]
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            metrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  description: { type: Type.STRING },
                  status: { type: Type.STRING }
                },
                required: ["name", "score", "description", "status"]
              }
            },
            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            drills: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["overallScore", "summary", "metrics", "pros", "improvements", "drills"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from AI");

    return JSON.parse(resultText) as SwingAnalysis;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};
