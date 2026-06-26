import { motion } from 'framer-motion';

const DISCONNECT_TAUNTS = [
  "Couldn't handle the heat? 🐣",
  "Their keyboard must have slipped.",
  "Error 404: Opponent's courage not found.",
  "They saw your code and panicked.",
  "Ran faster than their runtime.",
  "Technically a win. Spiritually, a roast.",
];

export default function MatchResult({ result, reason, myScore, opponentScore, eloChange, onReturn }) {
  const isDisconnectWin = result === 'victory' && reason === 'disconnect';
  const taunt = DISCONNECT_TAUNTS[Math.floor(Math.random() * DISCONNECT_TAUNTS.length)];

  const config = {
    victory: { label: 'Victory',    color: '#10b981', border: '#064e2a', bg: '#0d2a1a', glow: 'rgba(16,185,129,0.15)' },
    defeat:  { label: 'Defeat',     color: '#ef4444', border: '#4e1414', bg: '#1a0808', glow: 'rgba(239,68,68,0.15)'  },
    draw:    { label: 'Draw',        color: '#f59e0b', border: '#713f12', bg: '#1a1200', glow: 'rgba(245,158,11,0.15)' },
  }[result] ?? { label: 'Match Over', color: '#94a3b8', border: '#2a2a3e', bg: '#111118', glow: 'transparent' };

  // Override label + glow for disconnect wins — golden/amber to signal "gift kill"
  const effectiveConfig = isDisconnectWin
    ? { ...config, label: 'Rage Quit', border: '#713f12', bg: '#1a1200', glow: 'rgba(245,158,11,0.18)', badgeColor: '#f59e0b', badgeBorder: '#713f12', badgeBg: '#1a1200' }
    : config;

  const badgeColor  = effectiveConfig.badgeColor  ?? config.color;
  const badgeBorder = effectiveConfig.badgeBorder ?? config.border;
  const badgeBg     = effectiveConfig.badgeBg     ?? config.bg;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.80)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        style={{
          width: '100%', maxWidth: 420,
          background: '#111118', border: `1px solid ${effectiveConfig.border}`,
          borderRadius: 20, padding: '40px 36px',
          boxShadow: `0 0 80px ${effectiveConfig.glow}, 0 32px 80px rgba(0,0,0,0.6)`,
          position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
        }}
      >
        {/* Top glow bar */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 200, height: 1,
          background: `linear-gradient(90deg, transparent, ${config.color}, transparent)`,
        }} />

        {/* Disconnect icon pulse */}
        {isDisconnectWin && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1,   opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
            style={{ fontSize: 36, marginBottom: 12, lineHeight: 1 }}
          >
            🏃
          </motion.div>
        )}

        {/* Result badge */}
        <div style={{
          fontSize: 11, fontWeight: 800, letterSpacing: '0.15em',
          textTransform: 'uppercase', color: badgeColor,
          background: badgeBg, border: `1px solid ${badgeBorder}`,
          padding: '4px 14px', borderRadius: 20,
          marginBottom: isDisconnectWin ? 10 : 20,
        }}>
          {effectiveConfig.label}
        </div>

        {/* Disconnect taunt line */}
        {isDisconnectWin && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            style={{
              margin: '0 0 20px',
              fontSize: 13, color: '#64748b',
              fontStyle: 'italic', textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            {taunt}
          </motion.p>
        )}

        {/* Disconnect sub-headline */}
        {isDisconnectWin && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.18 }}
            style={{
              margin: '0 0 20px',
              fontSize: 16, fontWeight: 700, color: '#f1f5f9',
              textAlign: 'center', letterSpacing: '-0.01em',
            }}
          >
            Opponent fled the match.
          </motion.p>
        )}

        {/* Score row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 28 }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 11, color: '#475569', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>You</p>
            <span style={{ fontSize: 48, fontWeight: 800, color: config.color, lineHeight: 1 }}>{myScore}</span>
          </div>

          <span style={{ fontSize: 18, fontWeight: 700, color: '#2a2a3e' }}>—</span>

          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 11, color: '#475569', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Opponent</p>
            <span style={{ fontSize: 48, fontWeight: 800, color: '#475569', lineHeight: 1 }}>{opponentScore}</span>
          </div>
        </div>

        {/* ELO change */}
        <div style={{
          width: '100%', padding: '12px 0',
          borderTop: '1px solid #1e1e2e', borderBottom: '1px solid #1e1e2e',
          textAlign: 'center', marginBottom: 28,
        }}>
          <span style={{ fontSize: 13, color: '#475569' }}>ELO  </span>
          <span style={{
            fontSize: 15, fontWeight: 700,
            color: eloChange > 0 ? '#10b981' : eloChange < 0 ? '#ef4444' : '#f59e0b',
          }}>
            {eloChange > 0 ? `+${eloChange}` : eloChange === 0 ? '±0' : eloChange}
          </span>
          {isDisconnectWin && (
            <span style={{ fontSize: 11, color: '#475569', marginLeft: 8 }}>(forfeit bonus)</span>
          )}
        </div>

        {/* Return button */}
        <motion.button
          onClick={onReturn}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{
            width: '100%', padding: '13px 0', borderRadius: 10, border: 'none',
            background: '#10b981', color: '#000',
            fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}
        >
          Return to Home
        </motion.button>
      </motion.div>
    </div>
  );
}