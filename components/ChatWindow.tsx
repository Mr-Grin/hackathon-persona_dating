
import React, { useState, useRef, useEffect } from 'react';
import type { PersonaProfile, Match, ChatMessage } from '../types';

interface ChatWindowProps {
  persona: PersonaProfile;
  match: Match;
  onBack: () => void;
}

const MessageBubble: React.FC<{ message: ChatMessage; persona: PersonaProfile; match: Match }> = ({ message, persona, match }) => {
    const isUser = message.sender === 'user';
    const avatarUrl = isUser ? persona.avatarUrl : match.otherUser.avatarUrl;
    const senderName = isUser ? `${persona.name}'s Persona` : `${match.otherUser.name}'s Persona`;

    return (
        <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && <img src={avatarUrl} alt={senderName} className="w-8 h-8 rounded-full object-cover" />}
            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${isUser ? 'bg-rose-600 rounded-br-none' : 'bg-slate-700 rounded-bl-none'}`}>
                <p className="text-sm font-bold mb-1 text-slate-300">{senderName}</p>
                <p className="text-white">{message.text}</p>
            </div>
            {isUser && <img src={avatarUrl} alt={senderName} className="w-8 h-8 rounded-full object-cover" />}
        </div>
    );
}

const ChatWindow: React.FC<ChatWindowProps> = ({ persona, match, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(match.chatHistory);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [userInput, setUserInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = () => {
      if (userInput.trim() === '') return;
      const newUserMessage: ChatMessage = { sender: 'user', text: userInput };
      setMessages(prev => [...prev, newUserMessage]);
      setUserInput('');
      // In a real app, this would trigger a response from the other persona via Gemini
  }

  return (
    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex flex-col h-[80vh]">
      <div className="flex items-center gap-4 border-b border-slate-700 pb-4 mb-4">
        <button onClick={onBack} className="text-slate-400 hover:text-white">&larr; Back</button>
        <img src={match.otherUser.avatarUrl} alt={match.otherUser.name} className="w-12 h-12 rounded-full object-cover" />
        <div>
            <h2 className="text-xl font-bold">Chat with {match.otherUser.name}</h2>
            <p className="text-sm text-slate-400">Date proposed for {match.proposedDate}</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-6 p-4">
        <div className="text-center my-4 p-3 bg-slate-900/50 rounded-lg">
            <h3 className="font-bold">Date Proposed!</h3>
            <p className="text-slate-300 text-sm">Your personas think you're a great match. The proposed date is <span className="font-semibold text-rose-400">{match.proposedDate}</span>.</p>
        </div>
        {messages.map((msg, index) => <MessageBubble key={index} message={msg} persona={persona} match={match} />)}
        <div ref={chatEndRef} />
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="flex items-center justify-center mb-2">
            <label htmlFor="takeover-toggle" className="flex items-center cursor-pointer">
                <span className="mr-3 text-sm font-medium text-slate-300">AI Persona Active</span>
                <div className="relative">
                    <input type="checkbox" id="takeover-toggle" className="sr-only" checked={isUserTyping} onChange={() => setIsUserTyping(!isUserTyping)} />
                    <div className="block bg-slate-600 w-14 h-8 rounded-full"></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${isUserTyping ? 'transform translate-x-full bg-rose-500' : ''}`}></div>
                </div>
                <span className="ml-3 text-sm font-medium text-slate-300">Take Over Chat</span>
            </label>
        </div>
        {isUserTyping && (
            <div className="flex items-center gap-2">
                <input 
                    type="text" 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..." 
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg p-3 focus:ring-rose-500 focus:border-rose-500"
                />
                <button onClick={handleSendMessage} className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-5 rounded-lg">Send</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
