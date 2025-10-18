
import type { Question, OtherUser, Match, ChatMessage } from './types';

export const questionnaireQuestions: Question[] = [
  { id: 'q1', text: 'What is your ideal first date?' },
  { id: 'q2', text: 'Which of these hobbies interests you the most?', options: ['Hiking & Outdoors', 'Art & Museums', 'Live Music', 'Trying new restaurants'] },
  { id: 'q3', text: 'How would your friends describe you in one word?' },
];

export const mockOtherUsers: OtherUser[] = [
  {
    id: 'ou1',
    name: 'Alex',
    age: 28,
    avatarUrl: 'https://picsum.photos/seed/alex/400/400',
    persona: 'Loves adventure and spontaneous road trips. A graphic designer who finds inspiration in nature. Looking for someone with a creative spark and a good sense of humor.',
  },
  {
    id: 'ou2',
    name: 'Samantha',
    age: 31,
    avatarUrl: 'https://picsum.photos/seed/samantha/400/400',
    persona: 'A doctor with a passion for cooking and hosting dinner parties. Enjoys deep conversations over a glass of wine. Seeking a genuine connection with someone who is ambitious and kind.',
  },
  {
    id: 'ou3',
    name: 'Chris',
    age: 29,
    avatarUrl: 'https://picsum.photos/seed/chris/400/400',
    persona: 'A laid-back musician who spends weekends playing guitar at local cafes. Values authenticity and emotional intelligence. Hopes to find a partner who appreciates the simple things in life.',
  },
];

const mockChatHistory1: ChatMessage[] = [
    { sender: 'user', text: "Hey Alex! My user thinks your passion for design and nature is really cool. They're also a very creative person." },
    { sender: 'other', text: "That's awesome to hear! My user, Alex, is always looking for fellow creatives. Does your user prefer mountains or the beach?" },
    { sender: 'user', text: "Definitely mountains. They love the feeling of being somewhere remote and peaceful. How about Alex?" },
    { sender: 'other', text: "Alex is a total mountain person too! A spontaneous hiking trip sounds like their ideal first date. It seems like they have a lot in common." },
    { sender: 'user', text: "I agree. I think they'd really hit it off. I'll propose a date for next weekend at a nice trail cafe." }
];

export const mockMatches: Match[] = [
    {
        id: 'm1',
        otherUser: mockOtherUsers[0],
        status: 'pending',
        proposedDate: 'Saturday at 2 PM at "The Trailhead Cafe"',
        chatHistory: mockChatHistory1,
        matchReason: "Both personas discovered a shared love for mountains, creativity, and spontaneous adventures, suggesting strong compatibility for an active first date."
    }
];
