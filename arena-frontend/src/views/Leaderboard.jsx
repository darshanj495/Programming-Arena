import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };

const rowVariants = {
  hidden: { opacity: 0, y: 16 },
  show:   (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.03, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

function EloBar({ elo, max }) {
  const pct = Math.min((elo / max) * 100, 100);
  const color = elo >= 2000 ? '#f59e0b' : elo >= 1600 ? '#a855f7' : elo >= 1300 ? '#3b82f6' : '#10b981';
  return (
    <div style={{ width: 80, height: 4, background: '#1e1e2e', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
    </div>
  );
}

function RankBadge({ rank }) {
  if (rank <= 3) return <span style={{ fontSize: 18 }}>{MEDAL[rank]}</span>;
  const color = rank <= 10 ? '#f59e0b' : rank <= 25 ? '#a855f7' : '#475569';
  return (
    <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'monospace', minWidth: 28, textAlign: 'right' }}>
      #{rank}
    </span>
  );
}

function TierLabel({ elo }) {
  const tier =
    elo >= 2000 ? { label: 'Legend',   color: '#f59e0b', bg: '#1a1200', border: '#713f12' } :
    elo >= 1600 ? { label: 'Diamond',  color: '#a855f7', bg: '#1a0d2a', border: '#3b1f5f' } :
    elo >= 1300 ? { label: 'Platinum', color: '#3b82f6', bg: '#0d1a2a', border: '#1e3a5f' } :
                  { label: 'Gold',     color: '#10b981', bg: '#0d2a1a', border: '#064e2a' };
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
      background: tier.bg, border: `1px solid ${tier.border}`, color: tier.color,
      padding: '1px 6px', borderRadius: 4,
    }}>
      {tier.label}
    </span>
  );
}

export default function Leaderboard({ playerData, onBack }) {
  const [top100, setTop100]     = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    const uid = playerData?.firebaseUid;
    axios.get(`http://localhost:3000/api/leaderboard${uid ? `?firebaseUid=${uid}` : ''}`)
      .then(res => {
        setTop100(res.data.top100 ?? []);
        setUserRank(res.data.userRank ?? null);
      })
      .catch(() => setError('Failed to load leaderboard.'))
      .finally(() => setLoading(false));
  }, [playerData]);

  const maxElo    = top100[0]?.elo ?? 2400;
  const myInTop   = top100.some(p => p.username === playerData?.username);
  const showFooter = playerData && userRank && !myInTop;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', flexDirection: 'column' }}>

      {/* ── Nav ── */}
      <nav style={{
        height: 64, background: '#111118', borderBottom: '1px solid #1e1e2e',
        display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16, flexShrink: 0,
      }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>◈</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
          Algorithmic Arena
        </span>
        <span style={{ fontSize: 13, color: '#2a2a3e', margin: '0 4px' }}>/</span>
        <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>Leaderboard</span>
        <button
          onClick={onBack}
          style={{
            marginLeft: 'auto', background: '#16161f', border: '1px solid #2a2a3e',
            color: '#94a3b8', padding: '6px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
          }}
        >
          ← Back
        </button>
      </nav>

      {/* ── Hero strip ── */}
      <div style={{
        padding: '32px 28px 24px', borderBottom: '1px solid #1e1e2e',
        background: 'radial-gradient(ellipse 70% 80% at 50% 0%, rgba(16,185,129,0.05) 0%, transparent 70%)',
      }}>
        <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#10b981', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Season 3 Rankings
        </p>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em' }}>
          Global Leaderboard
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#475569' }}>
          Top {top100.length} players ranked by ELO
        </p>
      </div>

      {/* ── Table ── */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: showFooter ? 96 : 32 }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
              style={{ fontSize: 22, color: '#10b981', display: 'inline-block' }}
            >
              ◌
            </motion.span>
          </div>
        ) : error ? (
          <p style={{ textAlign: 'center', color: '#ef4444', padding: 60, fontSize: 14 }}>{error}</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            {/* Sticky header */}
            <thead>
              <tr style={{ position: 'sticky', top: 0, zIndex: 10, background: '#111118' }}>
                {['Rank', 'Player', 'Tier', 'ELO', ''].map((h, i) => (
                  <th key={h + i} style={{
                    padding: '10px 20px', textAlign: i === 0 ? 'center' : i === 3 ? 'right' : 'left',
                    fontSize: 10, fontWeight: 700, color: '#2a2a3e',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    borderBottom: '1px solid #1e1e2e',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {top100.map((player, i) => {
                const rank  = i + 1;
                const isMe  = player.username === playerData?.username;
                return (
                  <motion.tr
                    key={player.username}
                    custom={i}
                    initial="hidden"
                    animate="show"
                    variants={rowVariants}
                    style={{
                      background: isMe ? 'rgba(16,185,129,0.06)' : 'transparent',
                      borderLeft: isMe ? '2px solid #10b981' : '2px solid transparent',
                      transition: 'background 0.2s',
                    }}
                  >
                    {/* Rank */}
                    <td style={{ padding: '13px 20px', textAlign: 'center', width: 64 }}>
                      <RankBadge rank={rank} />
                    </td>

                    {/* Player */}
                    <td style={{ padding: '13px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                          background: isMe ? '#0d2a1a' : '#16161f',
                          border: `1px solid ${isMe ? '#10b981' : '#2a2a3e'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 700,
                          color: isMe ? '#10b981' : '#475569',
                          boxShadow: isMe ? '0 0 12px rgba(16,185,129,0.25)' : 'none',
                        }}>
                          {player.username?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <span style={{
                            fontSize: 14, fontWeight: isMe ? 700 : 500,
                            color: isMe ? '#f1f5f9' : '#94a3b8',
                          }}>
                            {player.username}
                          </span>
                          {isMe && (
                            <span style={{
                              marginLeft: 8, fontSize: 10, fontWeight: 700,
                              color: '#10b981', letterSpacing: '0.06em',
                            }}>
                              YOU
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Tier */}
                    <td style={{ padding: '13px 20px' }}>
                      <TierLabel elo={player.elo} />
                    </td>

                    {/* ELO */}
                    <td style={{ padding: '13px 20px', textAlign: 'right' }}>
                      <span style={{
                        fontSize: 15, fontWeight: 700, fontFamily: 'monospace',
                        color: isMe ? '#10b981' : '#f1f5f9',
                      }}>
                        {player.elo.toLocaleString()}
                      </span>
                    </td>

                    {/* ELO bar */}
                    <td style={{ padding: '13px 20px 13px 0', width: 100 }}>
                      <EloBar elo={player.elo} max={maxElo} />
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Sticky footer — shown when user is outside top 100 ── */}
      {showFooter && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
            background: '#111118', borderTop: '1px solid #064e2a',
            padding: '14px 28px',
            display: 'flex', alignItems: 'center', gap: 20,
            boxShadow: '0 -8px 32px rgba(16,185,129,0.08)',
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: '#0d2a1a', border: '1px solid #10b981',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: '#10b981',
            boxShadow: '0 0 12px rgba(16,185,129,0.25)',
          }}>
            {playerData.username?.[0]?.toUpperCase()}
          </div>

          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>
              {playerData.username}
            </span>
            <span style={{
              marginLeft: 8, fontSize: 10, fontWeight: 700,
              color: '#10b981', letterSpacing: '0.06em',
            }}>
              YOU
            </span>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#475569' }}>
              Not yet in the top 100
            </p>
          </div>

          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: 11, color: '#475569', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Your Rank
            </p>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', fontFamily: 'monospace' }}>
              #{userRank.rank.toLocaleString()}
            </span>
          </div>

          <div style={{ width: 1, height: 36, background: '#1e1e2e' }} />

          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: 11, color: '#475569', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              ELO
            </p>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#10b981', fontFamily: 'monospace' }}>
              {userRank.elo.toLocaleString()}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}