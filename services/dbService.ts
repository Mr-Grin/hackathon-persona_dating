import type { PersonaProfile, Match, ChatMessage } from '../types';

const PERSONA_KEY = 'ai_persona_profile';
const MATCHES_KEY = 'ai_persona_matches';
const CONVERSATIONS_KEY = 'ai_persona_conversations';

// --- Persona ---
export const savePersona = (persona: PersonaProfile): void => {
  try {
    localStorage.setItem(PERSONA_KEY, JSON.stringify(persona));
  } catch (error) {
    console.error("Failed to save persona to localStorage", error);
  }
};

export const loadPersona = (): PersonaProfile | null => {
  try {
    const personaJson = localStorage.getItem(PERSONA_KEY);
    if (!personaJson) return null;
    return JSON.parse(personaJson);
  } catch (error) {
    console.error("Failed to load persona from localStorage", error);
    return null;
  }
};

// --- Matches ---
export const saveMatches = (matches: Match[]): void => {
  try {
    localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
  } catch (error) {
    console.error("Failed to save matches to localStorage", error);
  }
};

export const loadMatches = (): Match[] => {
  try {
    const matchesJson = localStorage.getItem(MATCHES_KEY);
    if (!matchesJson) return [];
    return JSON.parse(matchesJson);
  } catch (error) {
    console.error("Failed to load matches from localStorage", error);
    return [];
  }
};

// --- Conversations ---
export const saveConversations = (conversations: Record<string, ChatMessage[]>): void => {
    try {
        localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
    } catch (error) {
        console.error("Failed to save conversations to localStorage", error);
    }
};

export const loadConversations = (): Record<string, ChatMessage[]> | null => {
    try {
        const conversationsJson = localStorage.getItem(CONVERSATIONS_KEY);
        if (!conversationsJson) return null;
        return JSON.parse(conversationsJson);
    } catch (error) {
        console.error("Failed to load conversations from localStorage", error);
        return null;
    }
};
