import { motion } from 'framer-motion';

// Animated ring segments for the spinner
const SEGMENTS = 8;

export default function Matchmaking() {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0f',
      gap: 32,
    }}>
      {/* Spinner */}
      <div style={{ position: 'relative', width: 64, height: 64 }}>
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <motion.span
            key={i}
            animate={{ opacity: [0.08, 1, 0.08] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: (i / SEGMENTS) * 1.2,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 3,
              height: 14,
              borderRadius: 2,
              background: '#10b981',
              transformOrigin: '50% -14px',
              transform: `rotate(${(i / SEGMENTS) * 360}deg) translateX(-50%)`,
            }}
          />
        ))}
      </div>

      {/* Text */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', letterSpacing: '-0.01em' }}>
          Searching for opponent
        </span>

        {/* Animated ellipsis */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              animate={{ opacity: [0.2, 1, 0.2], y: [0, -3, 0] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.18,
                ease: 'easeInOut',
              }}
              style={{
                display: 'inline-block',
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: '#10b981',
              }}
            />
          ))}
        </div>
      </div>

      {/* Subtle status line */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={{
          fontSize: 12,
          color: '#2a2a3e',
          margin: 0,
          fontFamily: 'monospace',
          letterSpacing: '0.05em',
        }}
      >
        Matching by ELO · low latency servers
      </motion.p>
    </div>
  );
}