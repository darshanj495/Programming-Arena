import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';

const AuthContext = createContext();

const BACKEND = 'https://programming-arena-7hr2.onrender.com';

// Retries up to 3 times with 3s delay to handle Render cold starts
async function syncWithBackend(firebaseUser, usernameOverride, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(`${BACKEND}/api/users/sync`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: firebaseUser.uid,
          email:       firebaseUser.email,
          username:    usernameOverride ?? firebaseUser.displayName ?? 'Arena Player',
        }),
      });
      if (!response.ok) throw new Error('Backend sync failed');
      return response.json();
    } catch (err) {
      if (i < retries - 1) {
        await new Promise(res => setTimeout(res, 3000)); // wait 3s before retry
      } else {
        throw err;
      }
    }
  }
}

export function AuthProvider({ children }) {
  const [user, setUser]             = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const mongo = await syncWithBackend(firebaseUser);
          setPlayerData(mongo);
        } catch (err) {
          console.error('Session restore sync failed:', err);
        }
      } else {
        setUser(null);
        setPlayerData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleAuthSuccess = useCallback(async (firebaseUser, usernameOverride) => {
    setUser(firebaseUser);
    try {
      const mongo = await syncWithBackend(firebaseUser, usernameOverride);
      setPlayerData(mongo);
      return mongo;
    } catch (err) {
      console.error('Post-auth sync failed:', err);
      throw err;
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut(auth);
    setUser(null);
    setPlayerData(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, playerData, loading, handleAuthSuccess, handleSignOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);