
export interface PersonaProfile {
  name: string;
  age: number;
  imageAnalysis: string;
  quizAnswers: Record<string, string>;
  bio: string;
  finalPersona: string;
  avatarUrl: string;
}

export interface OtherUser {
  id: string;
  name: string;
  age: number;
  avatarUrl: string;
  persona: string;
}

export interface ChatMessage {
  sender: 'user' | 'other' | 'system';
  text: string;
}

export interface Match {
  id: string;
  otherUser: OtherUser;
  status: 'pending' | 'confirmed' | 'declined';
  proposedDate: string;
  chatHistory: ChatMessage[];
  matchReason: string;
}

export interface Question {
  id: string;
  text: string;
  options?: string[];
}
