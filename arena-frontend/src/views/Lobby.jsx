import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../socket';
import GlobalChat from '../components/GlobalChat';
import ReadyCheck from '../components/ReadyCheck';

// ── Radar blip positions ──────────────────────────────────────────────────────
const BLIPS = [
  { id: 1, angle: 45,  r: 38, delay: 0.2 },
  { id: 2, angle: 130, r: 60, delay: 0.8 },
  { id: 3, angle: 210, r: 45, delay: 1.5 },
  { id: 4, angle: 300, r: 70, delay: 0.5 },
  { id: 5, angle: 20,  r: 72, delay: 2.1 },
];

function polarToXY(angleDeg, radiusPct, cx = 100, cy = 100, size = 200) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  const r   = (radiusPct / 100) * (size / 2);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function Radar({ size = 200 }) {
  const c = size / 2;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {[25, 50, 75, 100].map(r => (
          <circle key={r} cx={c} cy={c} r={(r / 100) * c}
            fill="none" stroke="rgba(16,185,129,0.12)" strokeWidth="1" />
        ))}
        <line x1={c} y1={0} x2={c} y2={size} stroke="rgba(16,185,129,0.08)" strokeWidth="1" />
        <line x1={0} y1={c} x2={size} y2={c} stroke="rgba(16,185,129,0.08)" strokeWidth="1" />
        {BLIPS.map(b => {
          const { x, y } = polarToXY(b.angle, b.r, c, c, size);
          return (
            <motion.circle key={b.id} cx={x} cy={y} r={3} fill="#10b981"
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5] }}
              transition={{ duration: 2.5, delay: b.delay, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: `${x}px ${y}px` }}
            />
          );
        })}
        <circle cx={c} cy={c} r={4} fill="#10b981" />
        <circle cx={c} cy={c} r={8} fill="none" stroke="rgba(16,185,129,0.4)" strokeWidth="1" />
      </svg>
      <div className="radar-spin" style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: `conic-gradient(from 0deg, transparent 0deg, rgba(16,185,129,0.18) 60deg, transparent 60deg)`,
      }} />
      <div style={{
        position: 'absolute', inset: -2, borderRadius: '50%',
        border: '1px solid rgba(16,185,129,0.25)',
        boxShadow: '0 0 20px rgba(16,185,129,0.1)',
      }} />
    </div>
  );
}

// ── Loading screen shown while playerData hydrates ────────────────────────────
function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0f',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #1e1e2e', borderTopColor: '#10b981' }}
      />
      <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>Loading your profile...</p>
    </div>
  );
}

// ── Main Lobby ────────────────────────────────────────────────────────────────
export default function Lobby({ onMatchStart, onBack, playerData, difficulty }) {
  const [matchFound, setMatchFound] = useState(false);
  const [queueCount, setQueueCount] = useState(142);
  const [searchTime, setSearchTime] = useState(0);
  const [matchData, setMatchData]   = useState(null);
  const [queued, setQueued]         = useState(false);

  // Simulated queue counter
  useEffect(() => {
    const iv = setInterval(() => {
      setQueueCount(n => n + (Math.random() > 0.5 ? 1 : -1));
    }, 2200);
    return () => clearInterval(iv);
  }, []);

  // Search timer — pauses once matched
  useEffect(() => {
    if (matchFound) return;
    const iv = setInterval(() => setSearchTime(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, [matchFound]);

  // Only emit join_queue once playerData is available
  useEffect(() => {
    if (!playerData || queued) return;

    setQueued(true);
    socket.emit('join_queue', {
      name:        playerData.username,
      elo:         playerData.elo,
      firebaseUid: playerData.firebaseUid,
      difficulty:  difficulty,
      avatar:      playerData.avatar || 'D',
      rank:        'Specialist',
    });

    const handleMatchFound = (data) => {
      setMatchData(data);
      setMatchFound(true);
    };

    const handleMatchCancelled = ({ reason } = {}) => {
      alert(reason ?? 'Match cancelled — opponent did not ready up in time.');
      setMatchData(null);
      setMatchFound(false);
      setQueued(false);
    };

    socket.on('match_found',     handleMatchFound);
    socket.on('match_cancelled', handleMatchCancelled);

    return () => {
      socket.off('match_found',     handleMatchFound);
      socket.off('match_cancelled', handleMatchCancelled);
    };
  }, [playerData]);

  // Leave queue and go back to landing
  const handleBack = () => {
    socket.emit('leave_queue');
    onBack?.();
  };

  if (!playerData) return <LoadingScreen />;

  const formatTime = s =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        minHeight: '100vh', background: '#0a0a0f',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 24, position: 'relative', overflow: 'hidden',
      }}
    >
      <div className="grid-bg absolute inset-0 pointer-events-none" />

      {/* ── Nav bar with back button — matches leaderboard/profile style ── */}
      <nav style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 64, background: '#111118', borderBottom: '1px solid #1e1e2e',
        display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16, zIndex: 10,
      }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>◈</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
          Algorithmic Arena
        </span>
        <span style={{ fontSize: 13, color: '#2a2a3e', margin: '0 4px' }}>/</span>
        <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>Matchmaking</span>

        {/* Only show back button while still searching — hide once match is found */}
        {!matchFound && (
          <button
            onClick={handleBack}
            style={{
              marginLeft: 'auto', background: '#16161f', border: '1px solid #2a2a3e',
              color: '#94a3b8', padding: '6px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
            }}
          >
            ← Leave queue
          </button>
        )}
      </nav>

      {/* ── Searching screen ── */}
      <AnimatePresence>
        {!matchFound && (
          <motion.div
            key="searching"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, zIndex: 1 }}
          >
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#10b981', marginBottom: 8 }}>
                Matchmaking · {difficulty}
              </p>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9', margin: 0, letterSpacing: '-0.02em' }}>
                Searching for opponent...
              </h2>
            </div>

            <div style={{ position: 'relative' }} className="float">
              <Radar size={200} />
            </div>

            <div style={{
              display: 'flex', gap: 32, background: '#111118',
              border: '1px solid #1e1e2e', borderRadius: 12, padding: '16px 32px',
            }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#10b981', fontVariantNumeric: 'tabular-nums' }}>
                  {queueCount.toLocaleString()}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#475569', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  players in queue
                </p>
              </div>
              <div style={{ width: 1, background: '#1e1e2e' }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#94a3b8', fontFamily: 'monospace' }}>
                  {formatTime(searchTime)}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#475569', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  searching
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#0d1f3c', border: '1px solid #1e3a5f',
              borderRadius: 8, padding: '8px 16px',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
              <span style={{ fontSize: 13, color: '#3b82f6' }}>Your ELO: {playerData.elo ?? 1200}</span>
              <span style={{ color: '#1e3a5f', margin: '0 4px' }}>·</span>
              <span style={{ fontSize: 13, color: '#475569' }}>Searching ±200</span>
            </div>

            {/* Dev shortcut */}
            <button
              onClick={() => {
                setMatchData({
                  roomId:  'dev_room',
                  player1: { id: socket.id, name: playerData.username ?? 'You', avatar: playerData.avatar ?? 'Y', elo: playerData.elo ?? 1450, rank: 'Specialist' },
                  player2: { id: 'fake_id', name: 'Opponent', avatar: 'O', elo: 1400, rank: 'Specialist' },
                });
                setMatchFound(true);
              }}
              style={{
                background: 'transparent', border: '1px dashed #2a2a3e',
                color: '#475569', fontSize: 12,
                padding: '8px 20px', borderRadius: 8,
                cursor: 'pointer', marginTop: 8,
              }}
            >
              [dev] Simulate match found →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GlobalChat only while searching */}
      {!matchFound && <GlobalChat />}

      {/* ── ReadyCheck modal ── */}
      <AnimatePresence>
        {matchFound && matchData && (
          <ReadyCheck
            key="ready-check"
            socket={socket}
            matchData={matchData}
            onMatchStart={onMatchStart}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}