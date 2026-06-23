// ArenaController.jsx is NOT used by App.jsx.
// App.jsx is the real router: Landing → Lobby → Battle
// Lobby handles: searching → ReadyCheck modal → onMatchStart → Battle
//
// This file is kept only as a reference / alternative standalone entry point.
// If you mount <ArenaController /> directly (e.g. for testing), it works
// independently with its own socket connection.

import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import ReadyCheck from '../components/ReadyCheck';
import Battle     from '../components/Battle';

// States: IDLE → QUEUE → READY_CHECK → BATTLE
export default function ArenaController() {
  const [appState, setAppState] = useState('IDLE');
  const [matchData, setMatchData] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io('http://localhost:3000', { autoConnect: false });
    socketRef.current = socket;

    socket.on('match_found', (data) => {
      setMatchData(data);
      setAppState('READY_CHECK');
    });

    socket.on('match_started', (data) => {
      if (data) setMatchData(prev => ({ ...prev, ...data }));
      setAppState('BATTLE');
    });

    socket.on('match_cancelled', ({ reason } = {}) => {
      alert(reason ?? 'Match cancelled — opponent did not ready up in time.');
      setMatchData(null);
      setAppState('IDLE');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    return () => socket.disconnect();
  }, []);

  const joinQueue = () => {
    const socket = socketRef.current;
    if (!socket.connected) socket.connect();
    socket.emit('join_queue', {
      playerId: 'player_' + Math.random().toString(36).slice(2, 7),
      name: 'alex_dev', elo: 1842, avatar: 'A',
    });
    setAppState('QUEUE');
  };

  return (
    <AnimatePresence mode="wait">
      {appState === 'IDLE' && (
        <motion.div key="idle"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ height: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', gap: 24 }}
        >
          <span style={{ fontSize: 32, fontWeight: 800, color: '#10b981' }}>◈ Arena</span>
          <motion.button onClick={joinQueue} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            style={{ background: '#10b981', color: '#000', fontWeight: 700, fontSize: 14,
              padding: '12px 32px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
            Enter the Arena
          </motion.button>
        </motion.div>
      )}

      {appState === 'QUEUE' && (
        <motion.div key="queue"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ height: '100vh', background: '#0a0a0f', display: 'flex',
            alignItems: 'center', justifyContent: 'center' }}
        >
          <p style={{ color: '#475569' }}>Searching for opponent...</p>
        </motion.div>
      )}

      {appState === 'READY_CHECK' && (
        <motion.div key="ready-check"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ height: '100vh', background: '#0a0a0f' }}
        >
          <ReadyCheck
            socket={socketRef.current}
            matchData={matchData}
            onMatchStart={(data) => {
              if (data) setMatchData(prev => ({ ...prev, ...data }));
              setAppState('BATTLE');
            }}
          />
        </motion.div>
      )}

      {appState === 'BATTLE' && (
        <motion.div key="battle"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ height: '100vh' }}
        >
          <Battle matchData={matchData} socket={socketRef.current} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}