import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Landing     from './views/Landing';
import Lobby       from './views/Lobby';
import Arena       from './views/Arena';
import MatchTimer  from './components/MatchTimer';
import { io }      from 'socket.io-client';

export const socket = io('http://localhost:3000');

/**
 * App.jsx
 *
 * FIX: onMatchStart now receives and stores `matchData` from Lobby.
 * Previously the Lobby called `onMatchStart()` with no arguments, so
 * `activeMatch` was always null and Arena had no roomId to pass to ArenaChat.
 */
export default function App() {
  const [view, setView]           = useState('landing');
  const [activeMatch, setActiveMatch] = useState(null);

  // Lobby calls this with the full matchData payload from the server
  const handleEnterArena = (matchData) => {
    setActiveMatch(matchData);   // ← was missing, causing roomId to be undefined
    setView('arena');
  };

  return (
    <AnimatePresence mode="wait">
      {view === 'landing' && (
        <Landing
          key="landing"
          onEnterQueue={() => setView('lobby')}
        />
      )}

      {view === 'lobby' && (
        <Lobby
          key="lobby"
          onMatchStart={handleEnterArena}   // ← pass the full handler, not () => setView('arena')
        />
      )}

      {view === 'arena' && (
        <Arena
          key="arena"
          matchData={activeMatch}
          timerSlot={<MatchTimer initialMinutes={10} />}
        />
      )}
    </AnimatePresence>
  );
}