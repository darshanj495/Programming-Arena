import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const READY_SECONDS = 60;

function PlayerCard({ label, name, avatar, accepted, isYou }) {
  const green  = '#10b981';
  const blue   = '#3b82f6';
  const accent = isYou ? green : blue;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      padding: '24px 32px', borderRadius: 16, minWidth: 148,
      background: '#111118',
      border: `1px solid ${accepted ? accent : '#1e1e2e'}`,
      boxShadow: accepted ? `0 0 24px ${accent}22` : 'none',
      transition: 'border 0.3s, box-shadow 0.3s',
      position: 'relative', overflow: 'hidden',
    }}>
      {accepted && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `radial-gradient(ellipse at center, ${accent}14 0%, transparent 70%)`,
          }}
        />
      )}
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        background: isYou ? '#0d2a1a' : '#0d1f3c',
        border: `2px solid ${accepted ? accent : (isYou ? '#064e2a' : '#1e3a5f')}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, fontWeight: 700, color: accent,
        transition: 'border 0.3s',
      }}>
        {avatar ?? name?.[0]?.toUpperCase() ?? '?'}
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{name}</p>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#475569',
          textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      </div>
      <AnimatePresence mode="wait">
        {accepted ? (
          <motion.div key="ready"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
              background: isYou ? '#0d2a1a' : '#0d1f3c',
              border: `1px solid ${accent}`, color: accent,
              padding: '3px 10px', borderRadius: 6,
            }}
          >
            ✓ Ready
          </motion.div>
        ) : (
          <motion.div key="waiting"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
              background: '#16161f', border: '1px solid #2a2a3e', color: '#475569',
              padding: '3px 10px', borderRadius: 6,
            }}
          >
            Waiting...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── ReadyCheck now accepts onMatchStart so it can trigger the transition ──────
export default function ReadyCheck({ socket, matchData, onMatchStart }) {
  const [timeLeft, setTimeLeft]                 = useState(READY_SECONDS);
  const [hasAccepted, setHasAccepted]           = useState(false);
  const [opponentAccepted, setOpponentAccepted] = useState(false);

  // Countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const iv = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(iv);
  }, [timeLeft]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const onOpponentAccepted = () => setOpponentAccepted(true);

    // match_started → hand off to App.jsx via onMatchStart
    const onMatchStarted = () => {
      if (onMatchStart) onMatchStart(matchData);
    };

    socket.on('opponent_accepted', onOpponentAccepted);
    socket.on('match_started',     onMatchStarted);

    return () => {
      socket.off('opponent_accepted', onOpponentAccepted);
      socket.off('match_started',     onMatchStarted);
    };
  }, [socket, matchData, onMatchStart]);

  const handleAccept = () => {
    console.log("🚀 Attempting to accept roomId:", matchData?.roomId);
    if (hasAccepted || !socket) return;
    socket.emit('accept_match', { roomId: matchData?.roomId });
    setHasAccepted(true);
  };

  const amIPlayer1 = matchData?.player1?.id === socket?.id;
  const me         = (amIPlayer1 ? matchData?.player1 : matchData?.player2) ?? { name: 'You',      avatar: 'Y' };
  const opponent   = (amIPlayer1 ? matchData?.player2 : matchData?.player1) ?? { name: 'Opponent', avatar: 'O' };

  const RADIUS    = 28;
  const CIRC      = 2 * Math.PI * RADIUS;
  const progress  = timeLeft / READY_SECONDS;
  const danger    = timeLeft <= 10;
  const ringColor = danger ? '#ef4444' : '#10b981';

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(10,10,15,0.88)', backdropFilter: 'blur(8px)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1,  y: 0  }}
        exit={{   opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        style={{
          background: '#0e0e16', border: '1px solid #1e1e2e',
          borderRadius: 20, padding: '36px 40px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28,
          minWidth: 420, boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Top glow line */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 240, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.4), transparent)',
        }} />

        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase', color: '#10b981' }}>
            Match Found
          </p>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
            Ready Check
          </h2>
        </div>

        {/* Countdown ring */}
        <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
          <svg width={72} height={72} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={36} cy={36} r={RADIUS} fill="none" stroke="#1e1e2e" strokeWidth={4} />
            <motion.circle cx={36} cy={36} r={RADIUS} fill="none"
              stroke={ringColor} strokeWidth={4} strokeLinecap="round"
              strokeDasharray={CIRC}
              animate={{ stroke: ringColor, strokeDashoffset: CIRC * (1 - progress) }}
              transition={{ duration: 0.5 }}
              style={{ strokeDashoffset: CIRC * (1 - progress) }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.span key={timeLeft}
              initial={{ scale: 1.3, opacity: 0.6 }} animate={{ scale: 1, opacity: 1 }}
              style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700,
                color: danger ? '#ef4444' : '#f1f5f9' }}
            >
              {timeLeft}
            </motion.span>
          </div>
        </div>

        {/* Player cards */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <PlayerCard label="You"      name={me.name}       avatar={me.avatar}       accepted={hasAccepted}     isYou />
          <span style={{ fontSize: 13, fontWeight: 800, color: '#2a2a3e', letterSpacing: '-0.02em' }}>VS</span>
          <PlayerCard label="Opponent" name={opponent.name} avatar={opponent.avatar} accepted={opponentAccepted} isYou={false} />
        </div>

        {/* Accept button */}
        <motion.button
          onClick={handleAccept}
          whileHover={!hasAccepted ? { scale: 1.03 } : {}}
          whileTap={!hasAccepted   ? { scale: 0.97 } : {}}
          disabled={hasAccepted}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 10, border: 'none',
            cursor: hasAccepted ? 'default' : 'pointer',
            fontWeight: 700, fontSize: 14, letterSpacing: '0.04em',
            background: hasAccepted ? '#0d2a1a'               : '#10b981',
            color:      hasAccepted ? '#10b981'               : '#000',
            boxShadow:  hasAccepted ? 'none'                  : '0 0 28px rgba(16,185,129,0.35)',
            transition: 'background 0.25s, color 0.25s, box-shadow 0.25s',
          }}
        >
          {hasAccepted ? '⏳ Waiting for opponent...' : 'ACCEPT MATCH'}
        </motion.button>

        <p style={{ margin: 0, fontSize: 11, color: '#2a2a3e' }}>
          Not responding will return both players to queue.
        </p>
      </motion.div>
    </motion.div>
  );
}