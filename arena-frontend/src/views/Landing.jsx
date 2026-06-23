import { motion } from 'framer-motion';

// ── Animation variants ──────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

const bentoItem = {
  hidden: { opacity: 0, y: 32, scale: 0.96 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ── Bento card data ─────────────────────────────────────────────────────────
const features = [
  {
    label:   'Real-time 1v1',
    icon:    '⚔',
    accent:  '#10b981',
    glow:    'rgba(16,185,129,0.15)',
    border:  '#064e2a',
    desc:    'Matched by ELO, synced by WebSocket. Every keystroke is a live signal to your opponent.',
    size:    'col-span-2',
  },
  {
    label:   'Live Judge0 execution',
    icon:    '⚡',
    accent:  '#3b82f6',
    glow:    'rgba(59,130,246,0.15)',
    border:  '#1e3a5f',
    desc:    'Code runs in isolated sandboxes against hidden test cases. Results in under 2 seconds.',
    size:    'col-span-1',
  },
  {
    label:   'Global sync',
    icon:    '◉',
    accent:  '#a855f7',
    glow:    'rgba(168,85,247,0.15)',
    border:  '#3b1f5f',
    desc:    "Your opponent's pass rate ticks up in real time. Watch the pressure build.",
    size:    'col-span-1',
  },
  {
    label:   'ELO ranking',
    icon:    '▲',
    accent:  '#f59e0b',
    glow:    'rgba(245,158,11,0.15)',
    border:  '#713f12',
    desc:    'Win to climb. Lose to learn. Every match reshapes the leaderboard.',
    size:    'col-span-1',
  },
  {
    label:   'Arena rating',
    icon:    '◆',
    accent:  '#ef4444',
    glow:    'rgba(239,68,68,0.15)',
    border:  '#4e1414',
    desc:    'Seasonal championships. Top 100 players displayed globally.',
    size:    'col-span-1',
  },
];

// ── Live stats ticker ───────────────────────────────────────────────────────
const stats = [
  { value: '12,847', label: 'matches today' },
  { value: '4.2s',   label: 'avg solve time' },
  { value: '99.97%', label: 'uptime' },
];

// ── Component ───────────────────────────────────────────────────────────────
export default function Landing({ onEnterQueue }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen relative overflow-hidden"
      style={{ background: '#0a0a0f' }}
    >
      {/* Scrolling grid background */}
      <div className="grid-bg absolute inset-0 pointer-events-none" />

      {/* Radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,185,129,0.06) 0%, transparent 70%)',
        }}
      />

      {/* ── Nav ── */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b"
        style={{ borderColor: '#1e1e2e' }}>
        <div className="flex items-center gap-2">
          <span style={{ color: '#10b981', fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>
            ◈
          </span>
          <span style={{ color: '#f1f5f9', fontWeight: 600, letterSpacing: '-0.01em' }}>
            Algorithmic Arena
          </span>
        </div>
        <div className="flex items-center gap-6">
          {['Leaderboard', 'Problems', 'Docs'].map(item => (
            <a key={item} href="#"
              style={{ color: '#475569', fontSize: 14, textDecoration: 'none' }}
              className="hover:text-slate-300 transition-colors">
              {item}
            </a>
          ))}
          <button
            style={{
              background: '#16161f',
              border: '1px solid #2a2a3e',
              color: '#94a3b8',
              padding: '6px 16px',
              borderRadius: 8,
              fontSize: 13,
              cursor: 'pointer',
            }}
            className="hover:border-slate-500 hover:text-slate-200 transition-all"
          >
            Sign in
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <motion.section
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-16"
      >
        {/* Eyebrow */}
        <motion.div variants={fadeUp}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#0d2a1a', border: '1px solid #064e2a',
            color: '#10b981', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '4px 12px', borderRadius: 20, marginBottom: 28,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#10b981', boxShadow: '0 0 6px #10b981',
              display: 'inline-block',
            }} />
            Season 3 — Live now
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={fadeUp}
          style={{
            fontSize: 'clamp(3rem, 8vw, 6.5rem)',
            fontWeight: 800,
            lineHeight: 1.02,
            letterSpacing: '-0.04em',
            marginBottom: 24,
            maxWidth: 900,
          }}
        >
          <span className="shimmer-text">Code faster</span>
          <br />
          <span style={{ color: '#1e293b', WebkitTextStroke: '1px #2a2a3e' }}>than your</span>
          <br />
          <span style={{ color: '#f1f5f9' }}>opponent.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          style={{
            color: '#475569', fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            maxWidth: 520, lineHeight: 1.65, marginBottom: 48,
          }}
        >
          Real-time 1v1 algorithmic battles. Matched by ELO, judged by code.
          Every second counts.
        </motion.p>

        {/* CTA */}
        <motion.div variants={fadeUp}>
          <motion.button
            onClick={onEnterQueue}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="cta-aura"
            style={{
              background: '#10b981',
              color: '#000',
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: '-0.01em',
              padding: '16px 48px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              zIndex: 1,
            }}
          >
            Enter the queue →
          </motion.button>
          <p style={{ color: '#334155', fontSize: 12, marginTop: 12 }}>
            No sign-up required for a demo match
          </p>
        </motion.div>

        {/* Live stats row */}
        <motion.div
          variants={fadeUp}
          style={{
            display: 'flex', gap: 40, marginTop: 56,
            borderTop: '1px solid #1e1e2e', paddingTop: 32,
          }}
        >
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', fontVariantNumeric: 'tabular-nums', margin: 0 }}>
                {s.value}
              </p>
              <p style={{ fontSize: 12, color: '#475569', margin: '4px 0 0', letterSpacing: '0.04em' }}>
                {s.label}
              </p>
            </div>
          ))}
        </motion.div>
      </motion.section>

      {/* ── Bento grid ── */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        className="relative z-10 px-6 pb-24 max-w-5xl mx-auto"
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
        }}>
          {features.map((f) => (
            <motion.div
              key={f.label}
              variants={bentoItem}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              style={{
                gridColumn: f.size === 'col-span-2' ? 'span 2' : 'span 1',
                background: '#111118',
                border: `1px solid ${f.border}`,
                borderRadius: 14,
                padding: '24px 28px',
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Glow blob */}
              <div style={{
                position: 'absolute', top: -30, right: -30,
                width: 120, height: 120, borderRadius: '50%',
                background: f.glow, filter: 'blur(30px)',
                pointerEvents: 'none',
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <span style={{
                  fontSize: 22, display: 'block', marginBottom: 12,
                  color: f.accent,
                }}>
                  {f.icon}
                </span>
                <h3 style={{
                  fontSize: 15, fontWeight: 600, color: '#f1f5f9',
                  margin: '0 0 8px', letterSpacing: '-0.01em',
                }}>
                  {f.label}
                </h3>
                <p style={{
                  fontSize: 13, color: '#475569', lineHeight: 1.6, margin: 0,
                  maxWidth: 340,
                }}>
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}