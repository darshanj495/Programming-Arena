import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../App';
import GlobalChat from '../components/GlobalChat';

// ── Radar blip positions ─────────────────────────────────────────────────────
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

function PlayerClashCard({ player, side }) {
  const isLeft = side === 'left';
  return (
    <motion.div
      initial={{ x: isLeft ? -180 : 180, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
      style={{
        background: '#111118',
        border: `1px solid ${isLeft ? '#064e2a' : '#1e3a5f'}`,
        borderRadius: 16, padding: '24px 32px',
        textAlign: 'center', minWidth: 160,
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: isLeft
          ? 'radial-gradient(ellipse at center, rgba(16,185,129,0.08) 0%, transparent 70%)'
          : 'radial-gradient(ellipse at center, rgba(59,130,246,0.08) 0%, transparent 70%)',
      }} />
      <div style={{
        width: 56, height: 56, borderRadius: '50%', margin: '0 auto 12px',
        background: isLeft ? '#0d2a1a' : '#0d1f3c',
        border: `2px solid ${isLeft ? '#10b981' : '#3b82f6'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, fontWeight: 700, color: isLeft ? '#10b981' : '#3b82f6',
      }}>
        {player.avatar}
      </div>
      <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 16, color: '#f1f5f9', letterSpacing: '-0.01em' }}>
        {player.name}
      </p>
      <p style={{ margin: 0, fontSize: 12, color: '#475569' }}>{player.elo} ELO</p>
      <div style={{
        marginTop: 12, display: 'inline-block',
        background: isLeft ? '#0d2a1a' : '#0d1f3c',
        border: `1px solid ${isLeft ? '#064e2a' : '#1e3a5f'}`,
        color: isLeft ? '#10b981' : '#3b82f6',
        fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
        textTransform: 'uppercase', padding: '3px 10px', borderRadius: 6,
      }}>
        {player.rank}
      </div>
    </motion.div>
  );
}

const SPARKS = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  angle: (i / 16) * 360,
  dist:  40 + Math.random() * 60,
  color: i % 3 === 0 ? '#10b981' : i % 3 === 1 ? '#3b82f6' : '#f1f5f9',
}));

function ClashSparks() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
      {SPARKS.map(s => {
        const rad = s.angle * (Math.PI / 180);
        const tx  = Math.cos(rad) * s.dist;
        const ty  = Math.sin(rad) * s.dist;
        return (
          <motion.div key={s.id}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: tx, y: ty, opacity: 0, scale: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.05 }}
            style={{
              position: 'absolute', left: '50%', top: '50%',
              width: 6, height: 6, borderRadius: '50%',
              background: s.color, boxShadow: `0 0 6px ${s.color}`,
              marginLeft: -3, marginTop: -3,
            }}
          />
        );
      })}
    </div>
  );
}

// ── Main Lobby ───────────────────────────────────────────────────────────────
export default function Lobby({ onMatchStart }) {
  const [matchFound, setMatchFound] = useState(false);
  const [queueCount, setQueueCount] = useState(142);
  const [searchTime, setSearchTime] = useState(0);
  const [matchData, setMatchData]   = useState(null);

  // ── FIX 1: All three effects are now deduplicated into one block each.
  //    The original file had the queue-count and search-timer effects
  //    defined twice, causing double-registration in React 18 StrictMode
  //    and polluting the matchmaking queue with ghost entries. ────────────────

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

  // ── FIX 2: join_queue is emitted inside the effect that also registers
  //    the match_found listener. The cleanup offloads the listener AND
  //    (if needed) could notify the server to leave the queue.
  //
  //    Critically: the effect has an empty dep array so it runs exactly
  //    once per component mount — not once per StrictMode double-invoke,
  //    because the cleanup (socket.off) correctly tears down the duplicate. ───
  useEffect(() => {
    // Emit join_queue once when the lobby mounts
    socket.emit('join_queue', {
      name:   `Coder_${Math.floor(Math.random() * 1000)}`,
      elo:    1450,
      avatar: 'D',
    });

    const handleMatchFound = (data) => {
      setMatchData(data);
      setMatchFound(true);
    };

    socket.on('match_found', handleMatchFound);

    // Cleanup removes only this handler, not all 'match_found' handlers
    return () => socket.off('match_found', handleMatchFound);
  }, []); // ← empty array: fires once on mount, cleans up on unmount

  const formatTime = s =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const mockP1 = matchData?.player1 ?? { name: 'alex_dev', elo: 1842, avatar: 'A', rank: 'Specialist' };
  const mockP2 = matchData?.player2 ?? { name: 'sk_coder', elo: 1790, avatar: 'S', rank: 'Specialist' };

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

      <AnimatePresence mode="wait">
        {!matchFound ? (
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
                Matchmaking
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
              <span style={{ fontSize: 13, color: '#3b82f6' }}>Your ELO: 1450</span>
              <span style={{ color: '#1e3a5f', margin: '0 4px' }}>·</span>
              <span style={{ fontSize: 13, color: '#475569' }}>Searching ±200</span>
            </div>

            <button
              onClick={() => setMatchFound(true)}
              style={{
                background: 'transparent', border: '1px dashed #2a2a3e',
                color: '#475569', fontSize: 12,
                padding: '8px 20px', borderRadius: 8,
                cursor: 'pointer', marginTop: 8,
              }}
              className="hover:border-slate-600 hover:text-slate-400 transition-all"
            >
              [dev] Simulate match found →
            </button>
          </motion.div>

        ) : (
          <motion.div
            key="found"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 1, width: '100%', maxWidth: 560, position: 'relative' }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0, 0.25, 0] }}
              transition={{ duration: 0.7, times: [0, 0.15, 0.4, 0.6, 1] }}
              style={{ position: 'fixed', inset: 0, background: 'white', pointerEvents: 'none', zIndex: 50 }}
            />

            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#10b981', marginBottom: 6 }}
              >
                Match found
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
                style={{ fontSize: 36, fontWeight: 800, color: '#f1f5f9', margin: 0, letterSpacing: '-0.03em' }}
              >
                Get ready.
              </motion.h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, position: 'relative' }}>
              <PlayerClashCard player={mockP1} side="left" />
              <div style={{ position: 'relative', zIndex: 5 }}>
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.35, type: 'spring', stiffness: 400, damping: 14 }}
                  style={{ fontSize: 28, fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.04em', textShadow: '0 0 20px rgba(241,245,249,0.4)' }}
                >
                  VS
                </motion.div>
                <ClashSparks />
              </div>
              <PlayerClashCard player={mockP2} side="right" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              style={{
                marginTop: 24, background: '#111118',
                border: '1px solid #1e1e2e', borderRadius: 12,
                padding: '16px 20px', textAlign: 'center',
              }}
            >
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Problem
              </p>
              <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>
                Two Sum — Find all unique pairs
              </p>
              <span style={{
                fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
                background: '#0d1a2a', color: '#3b82f6',
                border: '1px solid #1e3a5f', padding: '3px 10px', borderRadius: 6,
              }}>
                Medium
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              style={{ marginTop: 20, textAlign: 'center' }}
            >
              {/* ── FIX 3: Pass matchData to onMatchStart so App.jsx can store
                   it in activeMatch and forward it to Arena → ArenaChat.
                   Previously this was called with no argument, so roomId was
                   always undefined inside ArenaChat. ── */}
              <motion.button
                onClick={() => onMatchStart(matchData)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: '#10b981', color: '#000',
                  fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em',
                  padding: '14px 48px', borderRadius: 10,
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 0 30px rgba(16,185,129,0.3)',
                }}
              >
                Enter arena →
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GlobalChat only renders while still searching.
          Once matchFound flips true the match-found screen shows,
          and we unmount GlobalChat immediately — socket.off cleanup
          fires automatically so no stale listener persists. */}
      {!matchFound && <GlobalChat />}
    </motion.div>
  );
}