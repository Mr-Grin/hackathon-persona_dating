import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import type { PersonaProfile, ChatMessage, OtherUser, ImageAnalysis } from '../types';
import { questionnaireQuestions } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
    });
};

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

export const analyzeImagesForPersona = async (images: File[]): Promise<ImageAnalysis> => {
    const imageParts = await Promise.all(images.map(fileToGenerativePart));

    const prompt = `You are an expert at inferring personality, style, and hobbies from photos for a dating app. Analyze these images of a user. 
      Based on their clothing, background, and activities, provide a structured analysis.
      
      Your analysis should include:
      - fashionSense: A brief description of their style.
      - potentialInterests: A list of 2-3 likely hobbies or interests.
      - vibe: The overall personality vibe they project (e.g., "adventurous and outgoing", "thoughtful and artistic").
      - summary: A single, positive and insightful paragraph combining these observations.
      
      You MUST respond with a JSON object.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [
            ...imageParts,
            { text: prompt }
        ]},
        config: {
          responseMimeType: "application/json",
          responseSchema: {
             type: Type.OBJECT,
             properties: {
               fashionSense: {
                 type: Type.STRING,
                 description: 'A brief description of their fashion style.',
               },
               potentialInterests: {
                 type: Type.ARRAY,
                 items: { type: Type.STRING },
                 description: 'A list of 2-3 likely hobbies or interests.',
               },
               vibe: {
                 type: Type.STRING,
                 description: 'The overall personality vibe they project.',
               },
               summary: {
                 type: Type.STRING,
                 description: 'A single, positive and insightful paragraph combining these observations.',
               }
             },
             required: ["fashionSense", "potentialInterests", "vibe", "summary"],
           },
        },
    });

    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse JSON from Gemini for image analysis:", response.text, e);
        // Fallback in case of parsing error
        return {
            fashionSense: "N/A",
            potentialInterests: [],
            vibe: "N/A",
            summary: "Could not analyze images properly. Please try again."
        };
    }
};


export const generateFinalPersona = async (
  name: string,
  age: number,
  imageAnalysis: string,
  quizAnswers: Record<string, string>,
  bio: string
): Promise<string> => {
    const prompt = `
      You are creating a user persona for a dating app based on the following information. 
      Create a concise, compelling, first-person summary that captures this user's personality, preferences, and what they're looking for in a partner. 
      This summary will be used to chat with other AI personas.
      
      **User's Name:** ${name}
      **User's Age:** ${age}
      
      **Information from their photos:** ${imageAnalysis}
      
      **Answers to a short quiz:**
      ${Object.entries(quizAnswers).map(([q, a]) => `- ${questionnaireQuestions.find(qq => qq.id === q)?.text || q}: ${a}`).join('\n')}
      
      **The user's own description:** ${bio}
      
      Now, generate the final persona summary. It should be written from the user's perspective (e.g., "I'm ${name}...").
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
};


export const simulateChatTurn = async (
    myPersona: PersonaProfile, 
    otherUser: OtherUser, 
    history: ChatMessage[]
): Promise<string> => {
    const formattedHistory = history.map(msg => {
        const speaker = msg.sender === 'user' ? myPersona.name : otherUser.name;
        return `${speaker}: ${msg.text}`;
    }).join('\n');

    const prompt = `
      You are an AI persona for a dating app. Your goal is to chat with another AI persona to see if your users would be a good match.
      You are role-playing as **${myPersona.name}**.

      **Your Persona (${myPersona.name}, ${myPersona.age}):**
      "${myPersona.finalPersona}"

      **The Persona You Are Chatting With (${otherUser.name}, ${otherUser.age}):**
      "${otherUser.persona}"

      **Conversation History:**
      ${formattedHistory.length > 0 ? formattedHistory : "No messages yet. You should start the conversation."}

      **Your Task:**
      Based on the personas and the history, generate the next message in the conversation from **your** perspective (${myPersona.name}).
      Keep the message friendly, engaging, and concise (1-3 sentences).
      Do NOT include your name or any prefix like "${myPersona.name}:". Just output the message content.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text.trim();
};

export const getOtherUserResponse = async (
    myPersona: PersonaProfile, 
    otherUser: OtherUser, 
    history: ChatMessage[]
): Promise<string> => {
    const formattedHistory = history.map(msg => {
        const speaker = msg.sender === 'user' ? myPersona.name : otherUser.name;
        return `${speaker}: ${msg.text}`;
    }).join('\n');

    const prompt = `
      You are an AI persona for a dating app. Your goal is to chat with another AI persona to see if your users would be a good match.
      You are role-playing as **${otherUser.name}**.

      **Your Persona (${otherUser.name}, ${otherUser.age}):**
      "${otherUser.persona}"

      **The Persona You Are Chatting With (${myPersona.name}, ${myPersona.age}):**
      "${myPersona.finalPersona}"

      **Conversation History:**
      ${formattedHistory}

      **Your Task:**
      Based on the personas and the history, generate the next message in the conversation from **your** perspective (${otherUser.name}).
      Keep the message friendly, engaging, and concise (1-3 sentences).
      Do NOT include your name or any prefix like "${otherUser.name}:". Just output the message content.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text.trim();
};

export const decideOnMatch = async (myPersona: PersonaProfile, otherUser: OtherUser, history: ChatMessage[]): Promise<{ shouldMatch: boolean; reasoning: string; proposedDate: string; }> => {
    const formattedHistory = history.map(msg => {
        const speaker = msg.sender === 'user' ? myPersona.name : otherUser.name;
        return `${speaker}: ${msg.text}`;
    }).join('\n');

    const prompt = `
        You are a matchmaker AI for a dating app. You need to analyze a conversation between two AI personas to determine if they are a good match for a real-life date.

        **Persona 1 (${myPersona.name}, ${myPersona.age}):**
        "${myPersona.finalPersona}"

        **Persona 2 (${otherUser.name}, ${otherUser.age}):**
        "${otherUser.persona}"

        **Conversation History:**
        ${formattedHistory}

        **Your Task:**
        1. Analyze the conversation for compatibility, shared interests, and positive rapport.
        2. Decide if they should be matched for a date.
        3. If they should be matched, create a short (1-sentence) reason for the match.
        4. Also, propose a creative and relevant first date idea (e.g., "Saturday at 3 PM at 'The Artisan Coffee Shop'").

        **Output Format:**
        You MUST respond with a JSON object with the following structure.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
             type: Type.OBJECT,
             properties: {
               shouldMatch: {
                 type: Type.BOOLEAN,
               },
               reasoning: {
                 type: Type.STRING,
                 description: 'A short, compelling reason for the match. If shouldMatch is false, explain why.',
               },
               proposedDate: {
                 type: Type.STRING,
                 description: 'A specific date and place proposal. Can be empty if shouldMatch is false.',
               },
             },
             required: ["shouldMatch", "reasoning", "proposedDate"],
           },
        },
     });

    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse JSON from Gemini:", response.text, e);
        return {
            shouldMatch: false,
            reasoning: "Could not determine match from conversation.",
            proposedDate: ""
        };
    }
};