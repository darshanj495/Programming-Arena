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

  const [view, setView]                 = useState('landing');
  const [authMode, setAuthMode]         = useState('signin');
  const [activeMatch, setActiveMatch]   = useState(null);
  const [pendingQueue, setPendingQueue] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('Easy');

  useEffect(() => {
    if (!user && view !== 'landing' && view !== 'auth') {
      setView('landing');
    }
  }, [user]);

  const enterQueue = (difficulty) => {
    if (!socket.connected) socket.connect();
    setView('lobby');
  };

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

  const handleSignUpDone = () => setAuthMode('signin');

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

  const handleReturn = () => {
    socket.disconnect();
    setActiveMatch(null);
    setView('landing');
  };

  // Render Battle outside AnimatePresence entirely — no animation,
  // no position:absolute, no exit animation that could swallow the view.
  // Battle is full-screen by itself (height:100vh) so it doesn't need any wrapper.
  if (view === 'battle') {
    return (
      <Battle
        matchData={activeMatch}
        socket={socket}
        playerData={playerData}
        onReturn={handleReturn}
      />
    );
  }

  return (
    <AnimatePresence mode="wait">

      {view === 'auth' && authMode === 'signup' && (
        <motion.div key="signup"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <SignUp onSuccess={handleSignUpDone} onSwitchMode={() => setAuthMode('signin')} />
        </motion.div>
      )}

      {view === 'auth' && authMode === 'signin' && (
        <motion.div key="signin"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <SignIn onSuccess={handleSignInDone} onSwitchMode={() => setAuthMode('signup')} />
        </motion.div>
      )}

      {view === 'landing' && (
        <motion.div key="landing"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
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

      {view === 'leaderboard' && (
        <motion.div key="leaderboard"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <Leaderboard playerData={playerData} onBack={() => setView('landing')} />
        </motion.div>
      )}

      {view === 'profile' && (
        <motion.div key="profile"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <Profile playerData={playerData} onBack={() => setView('landing')} />
        </motion.div>
      )}

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

    </AnimatePresence>
  );
}