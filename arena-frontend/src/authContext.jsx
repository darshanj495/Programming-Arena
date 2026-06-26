import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';

const AuthContext = createContext();

async function syncWithBackend(firebaseUser, usernameOverride) {
  const response = await fetch('http://localhost:3000/api/users/sync', {
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