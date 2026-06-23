import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';

// ── Mock data ────────────────────────────────────────────────────────────────
const PROBLEM = {
  title:       'Two Sum — Find all unique pairs',
  difficulty:  'Medium',
  tags:        ['Array', 'Hash Map'],
  timeLimit:   '2000ms',
  memoryLimit: '256MB',
  description: `Given an array of integers \`nums\` and an integer \`target\`, return **all unique index pairs** \`[i, j]\` such that \`nums[i] + nums[j] == target\` and \`i != j\`.

Each input will have **at least one solution**, and you may return the pairs in any order. Pairs are considered unique by their index combination.`,
  examples: [
    {
      input:  'nums = [2, 7, 11, 15], target = 9',
      output: '[[0, 1]]',
      note:   'nums[0] + nums[1] = 2 + 7 = 9',
    },
    {
      input:  'nums = [3, 2, 4], target = 6',
      output: '[[1, 2]]',
      note:   '',
    },
  ],
  constraints: [
    '2 ≤ nums.length ≤ 10⁴',
    '-10⁹ ≤ nums[i] ≤ 10⁹',
    '-10⁹ ≤ target ≤ 10⁹',
    'At least one valid pair exists.',
  ],
};

const LANGUAGES = ['JavaScript', 'Python', 'C++', 'Java', 'Go', 'Rust'];

const MOCK_OUTPUT = {
  pass: {
    status: 'Accepted',
    passed: 3,
    total:  3,
    time:   '48ms',
    memory: '42.1 MB',
    lines: [
      { type: 'success', text: '✓  Test 1 passed (12ms)' },
      { type: 'success', text: '✓  Test 2 passed (9ms)' },
      { type: 'success', text: '✓  Test 3 passed (11ms)' },
      { type: 'info',    text: 'Runtime: 48ms  ·  Memory: 42.1 MB' },
    ],
  },
  fail: {
    status: 'Wrong Answer',
    passed: 1,
    total:  3,
    time:   '31ms',
    memory: '41.8 MB',
    lines: [
      { type: 'success', text: '✓  Test 1 passed (9ms)' },
      { type: 'error',   text: '✗  Test 2 failed' },
      { type: 'muted',   text: '   Expected: [[1, 2]]' },
      { type: 'muted',   text: '   Got:      [[0, 1]]' },
      { type: 'error',   text: '✗  Test 3 failed' },
    ],
  },
};

// ── Live dot ─────────────────────────────────────────────────────────────────
function LiveDot({ color = '#10b981' }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10 }}>
      <motion.span
        animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: color, opacity: 0.6,
        }}
      />
      <span style={{
        position: 'relative', width: 10, height: 10, borderRadius: '50%',
        background: color, boxShadow: `0 0 6px ${color}`,
      }} />
    </span>
  );
}

// ── Header ───────────────────────────────────────────────────────────────────
function ArenaHeader({ player, opponent, timerSlot }) {
  return (
    <header style={{
      height: 52, background: '#111118',
      borderBottom: '1px solid #1e1e2e',
      display: 'flex', alignItems: 'center',
      padding: '0 16px', gap: 12, flexShrink: 0,
      zIndex: 20,
    }}>
      <span style={{ fontSize: 14, fontWeight: 700, color: '#10b981', marginRight: 4 }}>◈</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', marginRight: 8 }}>Arena</span>

      <div style={{ width: 1, height: 20, background: '#1e1e2e' }} />

      {/* Player */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: '#0d2a1a', border: '1px solid #064e2a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, color: '#10b981',
        }}>
          {player.avatar}
        </div>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#f1f5f9' }}>{player.name}</span>
        <span style={{
          fontSize: 10, fontWeight: 600, background: '#0d2a1a',
          border: '1px solid #064e2a', color: '#10b981',
          padding: '1px 6px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          You
        </span>
      </div>

      <div style={{ width: 1, height: 20, background: '#1e1e2e' }} />

      {/* Opponent */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <LiveDot color="#10b981" />
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: '#0d1f3c', border: '1px solid #1e3a5f',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, color: '#3b82f6',
        }}>
          {opponent.avatar}
        </div>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8' }}>{opponent.name}</span>
        <span style={{
          fontSize: 10, fontWeight: 500, color: '#475569',
          background: '#16161f', border: '1px solid #1e1e2e',
          padding: '1px 6px', borderRadius: 4,
        }}>
          {opponent.elo} ELO
        </span>
        <span style={{
          fontSize: 10, fontWeight: 600,
          background: '#1a0808', border: '1px solid #4e1414',
          color: '#ef4444', padding: '1px 6px', borderRadius: 4,
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          1 / 3
        </span>
      </div>

      <div style={{ marginLeft: 'auto' }}>
        {timerSlot ?? (
          <div style={{
            background: '#0f0f1a', border: '1px solid #1e1e2e',
            borderRadius: 8, padding: '4px 14px',
            fontFamily: 'monospace', fontSize: 18, fontWeight: 700,
            color: '#10b981', letterSpacing: '0.05em',
          }}>
            10:00
          </div>
        )}
      </div>
    </header>
  );
}

// ── Problem pane ─────────────────────────────────────────────────────────────
function ProblemPane({ problem }) {
  const diffMap = {
    Easy:   { bg: '#0d2a1a', border: '#064e2a', color: '#10b981' },
    Medium: { bg: '#0d1a2a', border: '#1e3a5f', color: '#3b82f6' },
    Hard:   { bg: '#1a0808', border: '#4e1414', color: '#ef4444' },
  };
  const diff = diffMap[problem.difficulty] ?? diffMap.Medium;

  return (
    <div style={{
      height: '100%', overflowY: 'auto',
      background: '#0e0e16', borderRight: '1px solid #1e1e2e',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        padding: '14px 20px', borderBottom: '1px solid #1e1e2e',
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
          Problem
        </span>
        <span style={{ marginLeft: 'auto' }}>
          <span style={{
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.08em', background: diff.bg,
            border: `1px solid ${diff.border}`, color: diff.color,
            padding: '2px 8px', borderRadius: 5,
          }}>
            {problem.difficulty}
          </span>
        </span>
      </div>

      <div style={{ padding: '20px 20px 32px', flex: 1 }}>
        <h1 style={{
          fontSize: 17, fontWeight: 700, color: '#f1f5f9',
          margin: '0 0 12px', letterSpacing: '-0.01em', lineHeight: 1.3,
        }}>
          {problem.title}
        </h1>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
          {problem.tags.map(t => (
            <span key={t} style={{
              fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
              background: '#16161f', border: '1px solid #2a2a3e', color: '#94a3b8',
              padding: '2px 8px', borderRadius: 4,
            }}>
              {t}
            </span>
          ))}
          <span style={{
            fontSize: 10, color: '#475569',
            background: '#16161f', border: '1px solid #1e1e2e',
            padding: '2px 8px', borderRadius: 4,
          }}>
            ⏱ {problem.timeLimit}
          </span>
        </div>

        <div style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.75, marginBottom: 24 }}>
          {problem.description.split('\n\n').map((para, i) => (
            <p key={i} style={{ margin: '0 0 12px' }}
              dangerouslySetInnerHTML={{
                __html: para
                  .replace(/`([^`]+)`/g, `<code style="font-family:monospace;background:#1c1c28;color:#10b981;padding:1px 5px;border-radius:3px;font-size:12px">$1</code>`)
                  .replace(/\*\*([^*]+)\*\*/g, `<strong style="color:#f1f5f9">$1</strong>`),
              }}
            />
          ))}
        </div>

        <h3 style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
          Examples
        </h3>
        {problem.examples.map((ex, i) => (
          <div key={i} style={{
            background: '#111118', border: '1px solid #1e1e2e',
            borderRadius: 10, padding: '14px 16px', marginBottom: 10,
          }}>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Input</span>
              <pre style={{ margin: '4px 0 0', fontFamily: 'monospace', fontSize: 12, color: '#94a3b8', whiteSpace: 'pre-wrap' }}>
                {ex.input}
              </pre>
            </div>
            <div>
              <span style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Output</span>
              <pre style={{ margin: '4px 0 0', fontFamily: 'monospace', fontSize: 12, color: '#10b981', whiteSpace: 'pre-wrap' }}>
                {ex.output}
              </pre>
            </div>
            {ex.note && (
              <p style={{ margin: '8px 0 0', fontSize: 11, color: '#475569', fontStyle: 'italic' }}>
                {ex.note}
              </p>
            )}
          </div>
        ))}

        <h3 style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '20px 0 10px' }}>
          Constraints
        </h3>
        <ul style={{ padding: '0 0 0 16px', margin: 0 }}>
          {problem.constraints.map((c, i) => (
            <li key={i} style={{ fontSize: 12, color: '#475569', lineHeight: 1.8, fontFamily: 'monospace' }}>
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Editor pane ──────────────────────────────────────────────────────────────
function EditorPane({ onSubmit, submitting }) {
  const [lang, setLang]         = useState('JavaScript');
  const [dropOpen, setDropOpen] = useState(false);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: '#0a0a0f', borderBottom: '1px solid #1e1e2e',
    }}>
      <div style={{
        height: 44, background: '#111118', borderBottom: '1px solid #1e1e2e',
        display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8, flexShrink: 0,
      }}>
        {/* Language dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#16161f', border: '1px solid #2a2a3e',
              color: '#94a3b8', fontSize: 12, fontWeight: 500,
              padding: '5px 10px', borderRadius: 6, cursor: 'pointer', minWidth: 120,
            }}
          >
            <span style={{ flex: 1, textAlign: 'left' }}>{lang}</span>
            <span style={{ fontSize: 10, opacity: 0.5 }}>▾</span>
          </button>

          <AnimatePresence>
            {dropOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute', top: '100%', left: 0, marginTop: 4,
                  background: '#16161f', border: '1px solid #2a2a3e',
                  borderRadius: 8, zIndex: 50, minWidth: 140, overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}
              >
                {LANGUAGES.map(l => (
                  <button
                    key={l}
                    onClick={() => { setLang(l); setDropOpen(false); }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '8px 12px', fontSize: 12, cursor: 'pointer',
                      background: l === lang ? '#1c1c28' : 'transparent',
                      color: l === lang ? '#10b981' : '#94a3b8',
                      border: 'none', borderBottom: '1px solid #1e1e2e',
                    }}
                  >
                    {l}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ flex: 1 }} />

        <button style={{
          background: 'transparent', border: '1px solid #2a2a3e',
          color: '#94a3b8', fontSize: 12, fontWeight: 500,
          padding: '5px 14px', borderRadius: 6, cursor: 'pointer',
        }}>
          Run tests
        </button>

        <motion.button
          onClick={onSubmit}
          whileTap={{ scale: 0.95, y: 1 }}
          disabled={submitting}
          style={{
            background: submitting ? '#064e2a' : '#10b981',
            color: submitting ? '#10b981' : '#000',
            fontWeight: 700, fontSize: 12, padding: '5px 18px',
            borderRadius: 6, border: 'none',
            cursor: submitting ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s', minWidth: 100,
          }}
        >
          {submitting ? 'Judging...' : 'Submit code'}
        </motion.button>
      </div>

      <div style={{ flex: 1, position: 'relative', background: '#0d0d14', overflow: 'hidden' }}>
        <Editor
          height="100%"
          defaultLanguage="javascript"
          language={lang.toLowerCase()}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: '"Fira Code", monospace',
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            padding: { top: 16 },
          }}
        />
      </div>
    </div>
  );
}

// ── Terminal pane ─────────────────────────────────────────────────────────────
function TerminalPane({ output, running }) {
  const lineColor = { success: '#10b981', error: '#ef4444', info: '#3b82f6', muted: '#475569' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#080810' }}>
      <div style={{
        height: 38, background: '#111118', borderBottom: '1px solid #1e1e2e',
        display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8, flexShrink: 0,
      }}>
        <span style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
          Output
        </span>

        {output && !running && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
              background: output.status === 'Accepted' ? '#0d2a1a' : '#1a0808',
              border: `1px solid ${output.status === 'Accepted' ? '#064e2a' : '#4e1414'}`,
              color: output.status === 'Accepted' ? '#10b981' : '#ef4444',
              padding: '2px 8px', borderRadius: 4, marginLeft: 4,
            }}
          >
            {output.status}
          </motion.span>
        )}

        {output && !running && (
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>
            {output.passed}/{output.total} passed · {output.time} · {output.memory}
          </span>
        )}
      </div>

      <div style={{ flex: 1, padding: 16, overflowY: 'auto', fontFamily: 'monospace', fontSize: 12, lineHeight: 1.8 }}>
        <AnimatePresence mode="wait">
          {running ? (
            <motion.div key="running" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3b82f6' }}
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                style={{ display: 'inline-block' }}
              >
                ◌
              </motion.span>
              Running against test cases...
            </motion.div>
          ) : output ? (
            <motion.div key="output" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {output.lines.map((l, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{ color: lineColor[l.type] ?? '#94a3b8', marginBottom: 2 }}
                >
                  {l.text}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#2a2a3e' }}>
              — Submit your code to see results here
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Main Arena ────────────────────────────────────────────────────────────────
export default function Arena({ timerSlot, matchData }) {
  const [submitting, setSubmitting] = useState(false);
  const [output, setOutput]         = useState(null);
  const submitCount                 = useRef(0);

  const player   = matchData?.player1 ?? { name: 'alex_dev', avatar: 'A', elo: 1842 };
  const opponent = matchData?.player2 ?? { name: 'sk_coder', avatar: 'S', elo: 1790 };

  const handleSubmit = () => {
    setSubmitting(true);
    setOutput(null);
    const count = ++submitCount.current;
    setTimeout(() => {
      if (submitCount.current !== count) return;
      setSubmitting(false);
      setOutput(count % 2 === 1 ? MOCK_OUTPUT.pass : MOCK_OUTPUT.fail);
    }, 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        background: '#0a0a0f', overflow: 'hidden',
      }}
    >
      <ArenaHeader player={player} opponent={opponent} timerSlot={timerSlot} />

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '340px 1fr', overflow: 'hidden' }}>
        <ProblemPane problem={PROBLEM} />

        <div style={{ display: 'grid', gridTemplateRows: '1fr 220px', overflow: 'hidden' }}>
          <EditorPane onSubmit={handleSubmit} submitting={submitting} />
          <TerminalPane output={output} running={submitting} />
        </div>
      </div>

      {/* ArenaChat removed — no import, no render */}
    </motion.div>
  );
}