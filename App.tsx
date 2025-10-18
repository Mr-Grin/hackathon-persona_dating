
import React, { useState, useCallback, useEffect } from 'react';
import type { PersonaProfile, OtherUser, Match } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { mockOtherUsers, mockMatches } from './constants';
import Header from './components/Header';

const App: React.FC = () => {
  const [persona, setPersona] = useState<PersonaProfile | null>(null);
  const [otherUsers, setOtherUsers] = useState<OtherUser[]>(mockOtherUsers);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const handlePersonaCreated = useCallback((newPersona: PersonaProfile) => {
    setPersona(newPersona);
  }, []);

  useEffect(() => {
    if (persona && !isSimulating && otherUsers.length > 0) {
      // Start simulation once persona is created
      setIsSimulating(true);
      // Simulate finding matches over time
      setTimeout(() => setMatches(mockMatches), 5000);
    }
  }, [persona, isSimulating, otherUsers]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        {!persona ? (
          <Onboarding onPersonaCreated={handlePersonaCreated} />
        ) : (
          <Dashboard persona={persona} otherUsers={otherUsers} matches={matches} />
        )}
      </main>
    </div>
  );
};

export default App;
