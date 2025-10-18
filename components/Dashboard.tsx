
import React, { useState } from 'react';
import type { PersonaProfile, OtherUser, Match, ChatMessage } from '../types';
import ChatWindow from './ChatWindow';
import Spinner from './Spinner';

interface DashboardProps {
  persona: PersonaProfile;
  otherUsers: OtherUser[];
  matches: Match[];
}

const MatchCard: React.FC<{ match: Match, onSelect: (match: Match) => void }> = ({ match, onSelect }) => (
    <div onClick={() => onSelect(match)} className="bg-slate-800 p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-slate-700 border border-slate-700 transition-colors">
        <img src={match.otherUser.avatarUrl} alt={match.otherUser.name} className="w-16 h-16 rounded-full object-cover" />
        <div>
            <h3 className="font-bold text-lg">{match.otherUser.name}, {match.otherUser.age}</h3>
            <p className="text-sm text-slate-400 italic truncate">"{match.matchReason}"</p>
            <span className="text-xs font-semibold uppercase px-2 py-1 bg-green-500/20 text-green-400 rounded-full mt-2 inline-block">Date Proposed!</span>
        </div>
    </div>
);

const PotentialMatchCard: React.FC<{ user: OtherUser }> = ({ user }) => (
    <div className="bg-slate-800 p-4 rounded-xl flex items-center gap-4 border border-slate-700 opacity-60">
        <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
        <div>
            <h3 className="font-bold text-lg">{user.name}, {user.age}</h3>
            <p className="text-sm text-slate-400">Your persona is chatting...</p>
        </div>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ persona, otherUsers, matches }) => {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const potentialUsers = otherUsers.filter(u => !matches.some(m => m.otherUser.id === u.id));

  if (selectedMatch) {
      return <ChatWindow persona={persona} match={selectedMatch} onBack={() => setSelectedMatch(null)} />
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 bg-slate-800/50 p-6 rounded-2xl border border-slate-700 self-start">
        <h2 className="text-2xl font-bold mb-4">Your AI Persona</h2>
        <div className="flex flex-col items-center text-center">
            <img src={persona.avatarUrl} alt={persona.name} className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-slate-600"/>
            <h3 className="text-xl font-bold">{persona.name}, {persona.age}</h3>
            <p className="text-slate-300 mt-4 italic">"{persona.finalPersona}"</p>
        </div>
      </div>
      <div className="lg:col-span-2">
        <div>
            <h2 className="text-2xl font-bold mb-4">Your Matches</h2>
            {matches.length > 0 ? (
                <div className="space-y-4">
                    {matches.map(match => <MatchCard key={match.id} match={match} onSelect={setSelectedMatch} />)}
                </div>
            ) : (
                <div className="text-center py-8 bg-slate-800/50 rounded-2xl border border-slate-700">
                    <p className="text-slate-400">Your persona is working its magic...</p>
                    <Spinner text="Searching for connections..." />
                </div>
            )}
        </div>
        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">In Conversation...</h2>
             {potentialUsers.length > 0 ? (
                <div className="space-y-4">
                    {potentialUsers.map(user => <PotentialMatchCard key={user.id} user={user} />)}
                </div>
             ) : (
                <div className="text-center py-8 bg-slate-800/50 rounded-2xl border border-slate-700">
                    <p className="text-slate-400">No new conversations right now.</p>
                </div>
             )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
