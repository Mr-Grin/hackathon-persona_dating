import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { PersonaProfile, OtherUser, Match, ChatMessage } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { mockOtherUsers } from './constants';
import Header from './components/Header';
import { simulateChatTurn, getOtherUserResponse, decideOnMatch } from './services/geminiService';
import * as db from './services/dbService';

const App: React.FC = () => {
  const [persona, setPersona] = useState<PersonaProfile | null>(null);
  const [otherUsers, setOtherUsers] = useState<OtherUser[]>(mockOtherUsers);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>({});
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Load data from storage on initial mount
  useEffect(() => {
    const savedPersona = db.loadPersona();
    if (savedPersona) {
      setPersona(savedPersona);
      setMatches(db.loadMatches());
      const savedConversations = db.loadConversations();
      if (savedConversations) {
        setConversations(savedConversations);
      } else {
        // If there's a persona but no conversations, initialize them.
        const initialConversations: Record<string, ChatMessage[]> = {};
        mockOtherUsers.forEach(user => {
          initialConversations[user.id] = [];
        });
        setConversations(initialConversations);
      }
    }
    setIsInitialized(true);
  }, []);

  const simulationStateRef = useRef({
    persona,
    otherUsers,
    matches,
    conversations,
  });
  simulationStateRef.current = { persona, otherUsers, matches, conversations };
  
  // Persist state changes to localStorage
  useEffect(() => {
    if(isInitialized && persona) db.savePersona(persona);
  }, [persona, isInitialized]);

  useEffect(() => {
    if(isInitialized) db.saveMatches(matches);
  }, [matches, isInitialized]);

  useEffect(() => {
    if(isInitialized) db.saveConversations(conversations);
  }, [conversations, isInitialized]);


  const handlePersonaCreated = useCallback((newPersona: PersonaProfile) => {
    setPersona(newPersona);
    const initialConversations: Record<string, ChatMessage[]> = {};
    mockOtherUsers.forEach(user => {
      initialConversations[user.id] = [];
    });
    setConversations(initialConversations);
    setMatches([]); // Reset matches when a new persona is created
  }, []);

  const runSimulationTurn = useCallback(async () => {
    const { persona: currentPersona, otherUsers: currentOtherUsers, matches: currentMatches, conversations: currentConversations } = simulationStateRef.current;

    if (!currentPersona) return;

    const potentialUsers = currentOtherUsers.filter(u => !currentMatches.some(m => m.otherUser.id === u.id));
    if (potentialUsers.length === 0) {
      setIsSimulating(false);
      return;
    }

    const targetUser = potentialUsers.find(u => (currentConversations[u.id] || []).length < 6) || potentialUsers[0];
    if (!targetUser) {
        setIsSimulating(false);
        return;
    }

    const conversationHistory = currentConversations[targetUser.id] || [];

    if (conversationHistory.length >= 6) {
        return;
    }

    const lastMessage = conversationHistory[conversationHistory.length - 1];
    const isMyTurn = !lastMessage || lastMessage.sender === 'other';

    try {
      if (isMyTurn) {
        const myMessageText = await simulateChatTurn(currentPersona, targetUser, conversationHistory);
        const newHistory = [...conversationHistory, { sender: 'user' as 'user', text: myMessageText }];
        setConversations(prev => ({ ...prev, [targetUser.id]: newHistory }));
      } else {
        const otherMessageText = await getOtherUserResponse(currentPersona, targetUser, conversationHistory);
        const newHistory = [...conversationHistory, { sender: 'other' as 'other', text: otherMessageText }];
        setConversations(prev => ({ ...prev, [targetUser.id]: newHistory }));

        if (newHistory.length >= 4) {
          const matchResult = await decideOnMatch(currentPersona, targetUser, newHistory);
          if (matchResult.shouldMatch) {
            const newMatch: Match = {
              id: `m-${targetUser.id}`,
              otherUser: targetUser,
              status: 'pending',
              proposedDate: matchResult.proposedDate,
              chatHistory: newHistory,
              matchReason: matchResult.reasoning,
            };
            setMatches(prev => [...prev, newMatch]);
          }
        }
      }
    } catch (error) {
      console.error("Error during simulation turn:", error);
    }
  }, []);

  useEffect(() => {
    if (persona && !isSimulating && Object.keys(conversations).length > 0) {
      setIsSimulating(true);
    }
  }, [persona, isSimulating, conversations]);

  useEffect(() => {
    if (isSimulating) {
      const interval = setInterval(() => {
        runSimulationTurn();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isSimulating, runSimulationTurn]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        {!isInitialized ? (
          <div></div> // Render nothing or a loading spinner while initializing
        ) : !persona ? (
          <Onboarding onPersonaCreated={handlePersonaCreated} />
        ) : (
          <Dashboard persona={persona} otherUsers={otherUsers} matches={matches} conversations={conversations} />
        )}
      </main>
    </div>
  );
};

export default App;