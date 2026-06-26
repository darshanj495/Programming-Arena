import { motion } from 'framer-motion';

const rowVariants = {
  hidden: { opacity: 0, y: 16 },
  show:   (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

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

function EloBar({ value, max, color }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ width: '100%', height: 4, background: '#1e1e2e', borderRadius: 4, overflow: 'hidden', marginTop: 8 }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        style={{ height: '100%', background: color, borderRadius: 4 }}
      />
    </div>
  );
}

const STATS = (playerData) => {
  const matches = playerData.matchesPlayed || 0;
  const wins    = playerData.wins || 0;
  const losses  = matches - wins;
  const winRate = matches > 0 ? Math.round((wins / matches) * 100) : 0;
  const elo     = playerData.elo || 1200;

  const tier =
    elo >= 2000 ? { name: 'Legend',   color: '#f59e0b' } :
    elo >= 1600 ? { name: 'Diamond',  color: '#a855f7' } :
    elo >= 1300 ? { name: 'Platinum', color: '#3b82f6' } :
                  { name: 'Gold',     color: '#10b981' };

  return [
    { label: 'ELO Rating',     value: elo.toLocaleString(),  sub: tier.name + ' Tier', color: tier.color, bar: { value: elo, max: 3000 } },
    { label: 'Win Rate',       value: `${winRate}%`,          sub: `${wins}W / ${losses}L`,  color: '#3b82f6', bar: { value: winRate, max: 100 } },
    { label: 'Total Matches',  value: matches,                sub: 'Career games',            color: '#a855f7', bar: { value: matches, max: Math.max(matches, 100) } },
    { label: 'Total Wins',     value: wins,                   sub: `${losses} losses`,        color: '#10b981', bar: { value: wins, max: Math.max(matches, 1) } },
  ];
};

export default function Profile({ playerData, onBack }) {
  if (!playerData) return null;

  const elo  = playerData.elo || 1200;
  const tier =
    elo >= 2000 ? { name: 'Legend',   color: '#f59e0b', border: '#713f12', bg: '#1a1200' } :
    elo >= 1600 ? { name: 'Diamond',  color: '#a855f7', border: '#3b1f5f', bg: '#1a0d2a' } :
    elo >= 1300 ? { name: 'Platinum', color: '#3b82f6', border: '#1e3a5f', bg: '#0d1a2a' } :
                  { name: 'Gold',     color: '#10b981', border: '#064e2a', bg: '#0d2a1a' };

  const stats = STATS(playerData);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', flexDirection: 'column' }}>

      {/* ── Nav — identical to Leaderboard ── */}
      <nav style={{
        height: 64, background: '#111118', borderBottom: '1px solid #1e1e2e',
        display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16, flexShrink: 0,
      }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>◈</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
          Algorithmic Arena
        </span>
        <span style={{ fontSize: 13, color: '#2a2a3e', margin: '0 4px' }}>/</span>
        <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>Profile</span>
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

      {/* ── Hero strip — mirrors Leaderboard ── */}
      <div style={{
        padding: '32px 28px 24px', borderBottom: '1px solid #1e1e2e',
        background: 'radial-gradient(ellipse 70% 80% at 50% 0%, rgba(16,185,129,0.05) 0%, transparent 70%)',
      }}>
        <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#10b981', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Season 3
        </p>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em' }}>
          Player Profile
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#475569' }}>
          {playerData.username}'s career stats
        </p>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 48px' }}>

        {/* ── Player identity row — styled like a table row ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 20,
            padding: '24px 28px', borderBottom: '1px solid #1e1e2e',
            background: 'rgba(16,185,129,0.04)',
            borderLeft: `3px solid ${tier.color}`,
          }}
        >
          {/* Avatar */}
          <div style={{
            width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
            background: tier.bg, border: `1.5px solid ${tier.color}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, color: tier.color,
            boxShadow: `0 0 20px ${tier.color}33`,
          }}>
            {playerData.avatar ?? playerData.username?.[0]?.toUpperCase()}
          </div>

          {/* Name + tier */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
                {playerData.username}
              </span>
              <TierLabel elo={elo} />
            </div>
            <span style={{ fontSize: 12, color: '#2a2a3e', fontFamily: 'monospace' }}>
              UID: {playerData.firebaseUid?.substring(0, 12)}…
            </span>
          </div>

          {/* ELO pill — mirrors the ELO column in Leaderboard */}
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '0 0 2px', fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ELO
            </p>
            <span style={{
              fontSize: 28, fontWeight: 800, fontFamily: 'monospace',
              color: tier.color,
            }}>
              {elo.toLocaleString()}
            </span>
          </div>
        </motion.div>

        {/* ── Stats table — same visual language as leaderboard table ── */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#111118' }}>
              {['Stat', 'Value', 'Breakdown', ''].map((h, i) => (
                <th key={i} style={{
                  padding: '10px 28px', textAlign: i === 1 ? 'right' : 'left',
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
            {stats.map((s, i) => (
              <motion.tr
                key={s.label}
                custom={i}
                initial="hidden"
                animate="show"
                variants={rowVariants}
                style={{ borderBottom: '1px solid #1e1e2e' }}
              >
                {/* Label */}
                <td style={{ padding: '18px 28px', width: '30%' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>
                    {s.label}
                  </span>
                </td>

                {/* Value */}
                <td style={{ padding: '18px 28px', textAlign: 'right' }}>
                  <span style={{
                    fontSize: 22, fontWeight: 800, fontFamily: 'monospace',
                    color: s.color,
                  }}>
                    {s.value}
                  </span>
                </td>

                {/* Sub label */}
                <td style={{ padding: '18px 28px' }}>
                  <span style={{ fontSize: 12, color: '#475569' }}>{s.sub}</span>
                </td>

                {/* Bar */}
                <td style={{ padding: '18px 28px 18px 0', width: 140 }}>
                  <EloBar value={s.bar.value} max={s.bar.max} color={s.color} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}