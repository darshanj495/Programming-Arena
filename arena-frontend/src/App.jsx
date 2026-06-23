import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Landing    from './views/Landing';
import Lobby      from './views/Lobby';
import Battle     from './components/Battle';   // ← was Arena, now Battle
import MatchTimer from './components/MatchTimer';
import { io }     from 'socket.io-client';

// Single shared socket — autoConnect: false so we only connect when
// the user enters the queue, not on page load.
export const socket = io('http://localhost:3000', { autoConnect: false });

export default function App() {
  const [view, setView]               = useState('landing');
  const [activeMatch, setActiveMatch] = useState(null);

  useEffect(() => {
    return () => socket.disconnect();
  }, []);

  const handleEnterQueue = () => {
    if (!socket.connected) socket.connect();
    setView('lobby');
  };

  // Lobby calls this with the full matchData payload when match_found fires
  const handleMatchStart = (matchData) => {
    setActiveMatch(matchData);
    setView('battle');
  };

  return (
    <AnimatePresence mode="wait">
      {view === 'landing' && (
        <Landing
          key="landing"
          onEnterQueue={handleEnterQueue}
        />
      )}

      {view === 'lobby' && (
        <Lobby
          key="lobby"
          onMatchStart={handleMatchStart}
        />
      )}

      {view === 'battle' && (
        <Battle
          key="battle"
          matchData={activeMatch}
           socket={socket}
        />
      )}
    </AnimatePresence>
  );
}