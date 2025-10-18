
import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import type { PersonaProfile, ChatMessage, OtherUser } from '../types';

// IMPORTANT: This file uses a mock API key and returns mock data.
// In a real application, process.env.API_KEY would be used.
// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MOCK_API = true;

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const analyzeImagesForPersona = async (images: File[]): Promise<string> => {
    if (MOCK_API) {
        return new Promise(resolve => setTimeout(() => resolve("Based on the photos, the user has a stylish, urban aesthetic, often seen in social settings, suggesting an extroverted personality. They appear to enjoy art and cultural events."), 1500));
    }
    
    // const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // const imageParts = await Promise.all(images.map(fileToGenerativePart));

    // const response = await ai.models.generateContent({
    //     model: 'gemini-2.5-flash',
    //     contents: { parts: [
    //         ...imageParts,
    //         { text: "You are an expert at inferring personality, style, and hobbies from photos for a dating app. Analyze these images of a user. Describe their fashion sense, potential interests (e.g., outdoorsy, artistic, social), and the overall vibe they project. Be positive and insightful. Output a short paragraph." }
    //     ]},
    // });
    // return response.text;
    return "Mock image analysis"; // Placeholder for real implementation
};


export const generateFinalPersona = async (
  name: string,
  age: number,
  imageAnalysis: string,
  quizAnswers: Record<string, string>,
  bio: string
): Promise<string> => {
    if (MOCK_API) {
        return new Promise(resolve => setTimeout(() => resolve(`I'm ${name}, ${age}. My style is urban and I love social and cultural events. My ideal first date is trying a new restaurant, and my friends would say I'm adventurous. I'm looking for a genuine connection with someone who shares my love for the city and arts.`), 1500));
    }
    
    // const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // const prompt = `
    //   You are creating a user persona for a dating app based on the following information. 
    //   Create a concise, compelling, first-person summary that captures this user's personality, preferences, and what they're looking for in a partner. 
    //   This summary will be used to chat with other AI personas.
      
    //   **User's Name:** ${name}
    //   **User's Age:** ${age}
      
    //   **Information from their photos:** ${imageAnalysis}
      
    //   **Answers to a short quiz:**
    //   ${Object.entries(quizAnswers).map(([q, a]) => `- ${q}: ${a}`).join('\n')}
      
    //   **The user's own description:** ${bio}
      
    //   Now, generate the final persona summary.
    // `;

    // const response = await ai.models.generateContent({
    //     model: 'gemini-2.5-flash',
    //     contents: prompt,
    // });
    // return response.text;
    return "Mock final persona";
};

// The following functions would be used to power the live chat simulation
// For this example, we are using mock data in constants.ts

export const simulateChatTurn = async (
    myPersona: PersonaProfile, 
    otherUser: OtherUser, 
    history: ChatMessage[]
): Promise<string> => {
    // This would make a call to Gemini to generate the next message in the conversation.
    return Promise.resolve("This is a simulated response based on our personas!");
};

export const decideOnMatch = async (history: ChatMessage[]): Promise<{ shouldMatch: boolean; reasoning: string; proposedDate: string; }> => {
    // This would analyze the chat history and decide if a date should be proposed.
    return Promise.resolve({
        shouldMatch: true,
        reasoning: "Strong compatibility found based on shared interests in hiking and creativity.",
        proposedDate: 'Saturday at 2 PM at "The Trailhead Cafe"',
    });
};
