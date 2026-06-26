import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Landing from './views/Landing';
import Lobby   from './views/Lobby';
import Battle  from './components/Battle';
import SignUp  from './components/SignUp';
import SignIn  from './components/SignIn';
import { useAuth } from './authContext';
import { socket } from './socket';
import Leaderboard from './views/Leaderboard';
import Profile from './views/Profile';

export default function App() {
  const { user, playerData, handleSignOut } = useAuth();

  const [view, setView]               = useState('landing');
  const [authMode, setAuthMode]       = useState('signin');
  const [activeMatch, setActiveMatch] = useState(null);
  const [pendingQueue, setPendingQueue] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('Easy');

  // If user logs out, bounce back to landing
  useEffect(() => {
    if (!user && view !== 'landing' && view !== 'auth') {
      setView('landing');
    }
  }, [user]);

  useEffect(() => {
    return () => socket.disconnect();
  }, []);

  // The actual queue logic, split out so it can be called post-auth too
  const enterQueue = (difficulty) => {
    if (!socket.connected) socket.connect();
    setView('lobby');
    // Lobby will call join_queue; pass difficulty via state so Lobby can pick it up
  };

  // "Enter queue" button on Landing — receives difficulty from the selector
  const handleEnterQueue = (difficulty) => {
    setSelectedDifficulty(difficulty);
    if (!user) {
      setPendingQueue(true);
      setAuthMode('signin');
      setView('auth');
    } else {
      enterQueue(difficulty);
    }
  };

  // After Sign Up → switch to Sign In
  const handleSignUpDone = () => {
    setAuthMode('signin');
  };

  // After Sign In → resume queue or go to landing
  const handleSignInDone = () => {
    if (pendingQueue) {
      setPendingQueue(false);
      enterQueue(selectedDifficulty);
    } else {
      setView('landing');
    }
  };

  const handleMatchStart = (matchData) => {
    setActiveMatch(matchData);
    setView('battle');
  };

  return (
    <AnimatePresence mode="wait">

      {/* ── SIGN UP ── */}
      {view === 'auth' && authMode === 'signup' && (
        <motion.div key="signup"
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
        >
          <SignUp
            onSuccess={handleSignUpDone}
            onSwitchMode={() => setAuthMode('signin')}
          />
        </motion.div>
      )}

      {/* ── SIGN IN ── */}
      {view === 'auth' && authMode === 'signin' && (
        <motion.div key="signin"
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
        >
          <SignIn
            onSuccess={handleSignInDone}
            onSwitchMode={() => setAuthMode('signup')}
          />
        </motion.div>
      )}

      {/* ── LANDING ── */}
      {view === 'landing' && (
        <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Landing
            playerData={playerData}
            onEnterQueue={handleEnterQueue}
            onSignIn={() => { setAuthMode('signin'); setView('auth'); }}
            onSignOut={handleSignOut}
            onLeaderboard={() => setView('leaderboard')}
            onProfile={() => setView('profile')}
          />
        </motion.div>
      )}

      {/* ── LEADERBOARD ── */}
      {view === 'leaderboard' && (
        <motion.div key="leaderboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Leaderboard
            playerData={playerData}
            onBack={() => setView('landing')}
          />
        </motion.div>
      )}

      {/* ── PROFILE ── */}
      {view === 'profile' && (
        <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Profile
            playerData={playerData}
            onBack={() => setView('landing')}
          />
        </motion.div>
      )}

      {/* ── LOBBY ── */}
      {view === 'lobby' && (
        <motion.div key="lobby"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <Lobby
            onMatchStart={handleMatchStart}
            onBack={() => setView('landing')}  
            playerData={playerData}
            difficulty={selectedDifficulty}
          />
        </motion.div>
      )}

      {/* ── BATTLE ── */}
      {view === 'battle' && (
        <motion.div key="battle"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <Battle
            matchData={activeMatch}
            socket={socket}
            playerData={playerData}
            onReturn={() => setView('landing')}
          />
        </motion.div>
      )}

    </AnimatePresence>
  );
}