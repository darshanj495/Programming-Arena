import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import MatchResult from './MatchResult';

const LANGUAGES = ['JavaScript', 'Python', 'C++', 'Java', 'Go', 'Rust'];

// Fallback shown only in dev/simulate mode when no real problem is provided
const DEV_PROBLEM = {
  problemId:   'two-sum',
  title:       'Two Sum',
  difficulty:  'Easy',
  description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target.',
  examples:    [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', note: 'nums[0] + nums[1] = 9' }],
  constraints: ['2 ≤ nums.length ≤ 10⁴', '-10⁹ ≤ nums[i] ≤ 10⁹'],
  total:       3,
};

function LiveDot({ color = '#10b981' }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10 }}>
      <motion.span
        animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, opacity: 0.6 }}
      />
      <span style={{ position: 'relative', width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
    </span>
  );
}

function ArenaHeader({ player, opponent, timeString, myScore = 0, opponentScore = 0, total = 3 }) {
  return (
    <header style={{
      height: 64, background: '#111118', borderBottom: '1px solid #1e1e2e',
      display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16, flexShrink: 0, zIndex: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#10b981', marginRight: 6 }}>◈</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em' }}>Arena</span>
      </div>

      <div style={{ width: 1, height: 24, background: '#1e1e2e', margin: '0 8px' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: '#0d2a1a', border: '1px solid #064e2a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: '#10b981',
        }}>
          {player.avatar ?? player.name?.[0]?.toUpperCase() ?? 'P'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', lineHeight: 1.2 }}>{player.name} (You)</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#10b981' }}>{player.elo} ELO</span>
        </div>
      </div>

      <span style={{ fontSize: 11, fontWeight: 800, color: '#475569', margin: '0 4px' }}>VS</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', lineHeight: 1.2 }}>{opponent.name}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>{opponent.elo} ELO</span>
        </div>
        <LiveDot color="#ef4444" />
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: '#1a0808', border: '1px solid #4e1414',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: '#ef4444',
        }}>
          {opponent.avatar ?? opponent.name?.[0]?.toUpperCase() ?? 'O'}
        </div>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.05em' }}>YOUR TESTS</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: total }, (_, i) => i + 1).map(n => (
              <div key={n} style={{
                width: 24, height: 6, borderRadius: 4, transition: 'all 0.3s ease',
                background: myScore >= n ? '#10b981' : '#1e1e2e',
                boxShadow: myScore >= n ? '0 0 8px rgba(16,185,129,0.4)' : 'none',
              }} />
            ))}
          </div>
        </div>

        <div style={{ width: 1, height: 32, background: '#1e1e2e' }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#3b82f6', letterSpacing: '0.1em', marginBottom: 3 }}>IN PROGRESS</span>
          <span style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 700, color: '#f1f5f9', lineHeight: 1 }}>{timeString}</span>
        </div>

        <div style={{ width: 1, height: 32, background: '#1e1e2e' }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 5 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.05em' }}>OPPONENT</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: total }, (_, i) => i + 1).map(n => (
              <div key={n} style={{
                width: 24, height: 6, borderRadius: 4, transition: 'all 0.3s ease',
                background: opponentScore >= n ? '#ef4444' : '#1e1e2e',
                boxShadow: opponentScore >= n ? '0 0 8px rgba(239,68,68,0.4)' : 'none',
              }} />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

function ProblemPane({ problem }) {
  const diffMap = {
    Easy:   { bg: '#0d2a1a', border: '#064e2a', color: '#10b981' },
    Medium: { bg: '#0d1a2a', border: '#1e3a5f', color: '#3b82f6' },
    Hard:   { bg: '#1a0808', border: '#4e1414', color: '#ef4444' },
  };
  const diff = diffMap[problem.difficulty] ?? diffMap.Medium;
  const tags      = problem.tags      ?? [];
  const timeLimit = problem.timeLimit ?? '2000ms';

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#0e0e16', borderRight: '1px solid #1e1e2e', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #1e1e2e', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Problem</span>
        <span style={{ marginLeft: 'auto' }}>
          <span style={{
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
            background: diff.bg, border: `1px solid ${diff.border}`, color: diff.color,
            padding: '2px 8px', borderRadius: 5,
          }}>{problem.difficulty}</span>
        </span>
      </div>

      <div style={{ padding: '20px 20px 32px', flex: 1 }}>
        <h1 style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9', margin: '0 0 12px', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
          {problem.title}
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
          {tags.map(t => (
            <span key={t} style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', background: '#16161f', border: '1px solid #2a2a3e', color: '#94a3b8', padding: '2px 8px', borderRadius: 4 }}>{t}</span>
          ))}
          <span style={{ fontSize: 10, color: '#475569', background: '#16161f', border: '1px solid #1e1e2e', padding: '2px 8px', borderRadius: 4 }}>⏱ {timeLimit}</span>
        </div>

        <div style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.75, marginBottom: 24 }}>
          {(problem.description ?? '').split('\n\n').map((para, i) => (
            <p key={i} style={{ margin: '0 0 12px' }} dangerouslySetInnerHTML={{
              __html: para
                .replace(/`([^`]+)`/g, `<code style="font-family:monospace;background:#1c1c28;color:#10b981;padding:1px 5px;border-radius:3px;font-size:12px">$1</code>`)
                .replace(/\*\*([^*]+)\*\*/g, `<strong style="color:#f1f5f9">$1</strong>`),
            }} />
          ))}
        </div>

        {problem.examples?.length > 0 && (
          <>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>Examples</h3>
            {problem.examples.map((ex, i) => (
              <div key={i} style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 10, padding: '14px 16px', marginBottom: 10 }}>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Input</span>
                  <pre style={{ margin: '4px 0 0', fontFamily: 'monospace', fontSize: 12, color: '#94a3b8', whiteSpace: 'pre-wrap' }}>{ex.input}</pre>
                </div>
                <div>
                  <span style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Output</span>
                  <pre style={{ margin: '4px 0 0', fontFamily: 'monospace', fontSize: 12, color: '#10b981', whiteSpace: 'pre-wrap' }}>{ex.output}</pre>
                </div>
                {ex.note && <p style={{ margin: '8px 0 0', fontSize: 11, color: '#475569', fontStyle: 'italic' }}>{ex.note}</p>}
              </div>
            ))}
          </>
        )}

        {problem.constraints?.length > 0 && (
          <>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '20px 0 10px' }}>Constraints</h3>
            <ul style={{ padding: '0 0 0 16px', margin: 0 }}>
              {problem.constraints.map((c, i) => (
                <li key={i} style={{ fontSize: 12, color: '#475569', lineHeight: 1.8, fontFamily: 'monospace' }}>{c}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function EditorPane({ onSubmit, submitting }) {
  const [lang, setLang]         = useState('JavaScript');
  const [dropOpen, setDropOpen] = useState(false);
  const editorRef               = useRef(null);

  const handleEditorDidMount = (editor) => { editorRef.current = editor; };

  const handleRun = () => {
    const code = editorRef.current ? editorRef.current.getValue() : '';
    onSubmit(lang, code);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' }}>
      <div style={{ height: 44, background: '#111118', borderBottom: '1px solid #1e1e2e', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8, flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setDropOpen(o => !o)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#16161f', border: '1px solid #2a2a3e',
            color: '#94a3b8', fontSize: 12, fontWeight: 500,
            padding: '5px 10px', borderRadius: 6, cursor: 'pointer', minWidth: 120,
          }}>
            <span style={{ flex: 1, textAlign: 'left' }}>{lang}</span>
            <span style={{ fontSize: 10, opacity: 0.5 }}>▾</span>
          </button>
          <AnimatePresence>
            {dropOpen && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#16161f', border: '1px solid #2a2a3e', borderRadius: 8, zIndex: 50, minWidth: 140, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                {LANGUAGES.map(l => (
                  <button key={l} onClick={() => { setLang(l); setDropOpen(false); }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 12, cursor: 'pointer', background: l === lang ? '#1c1c28' : 'transparent', color: l === lang ? '#10b981' : '#94a3b8', border: 'none', borderBottom: '1px solid #1e1e2e' }}>
                    {l}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ flex: 1 }} />

        <button style={{ background: 'transparent', border: '1px solid #2a2a3e', color: '#94a3b8', fontSize: 12, fontWeight: 500, padding: '5px 14px', borderRadius: 6, cursor: 'pointer' }}>
          Run tests
        </button>

        <motion.button onClick={handleRun} whileTap={{ scale: 0.95, y: 1 }} disabled={submitting}
          style={{
            background: submitting ? '#064e2a' : '#10b981', color: submitting ? '#10b981' : '#000',
            fontWeight: 700, fontSize: 12, padding: '5px 18px', borderRadius: 6, border: 'none',
            cursor: submitting ? 'not-allowed' : 'pointer', transition: 'background 0.2s', minWidth: 100,
          }}>
          {submitting ? 'Judging...' : 'Submit code'}
        </motion.button>
      </div>

      <div style={{ flex: 1, position: 'relative', background: '#0d0d14', overflow: 'hidden' }}>
        <Editor
          height="100%"
          defaultLanguage="javascript"
          language={lang.toLowerCase()}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{ fontSize: 14, fontFamily: '"Fira Code", monospace', minimap: { enabled: false }, lineNumbers: 'on', scrollBeyondLastLine: false, padding: { top: 16 } }}
        />
      </div>
    </div>
  );
}

function TerminalPane({ output, running }) {
  const lineColor = { success: '#10b981', error: '#ef4444', info: '#3b82f6', muted: '#475569' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#080810' }}>
      <div style={{ height: 38, background: '#111118', borderBottom: '1px solid #1e1e2e', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Output</span>
        {output && !running && (
          <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
              background: output.status === 'Accepted' ? '#0d2a1a' : '#1a0808',
              border: `1px solid ${output.status === 'Accepted' ? '#064e2a' : '#4e1414'}`,
              color: output.status === 'Accepted' ? '#10b981' : '#ef4444',
              padding: '2px 8px', borderRadius: 4, marginLeft: 4,
            }}>
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
            <motion.div key="running" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3b82f6' }}>
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block' }}>◌</motion.span>
              Running against test cases...
            </motion.div>
          ) : output ? (
            <motion.div key="output" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {output.lines.map((l, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} style={{ color: lineColor[l.type] ?? '#94a3b8', marginBottom: 2 }}>
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

// ── Battle (main export) ──────────────────────────────────────────────────────
export default function Battle({ matchData, socket, playerData, onReturn }) {
  const [submitting, setSubmitting] = useState(false);
  const [output, setOutput]         = useState(null);
  const [timeLeft, setTimeLeft]     = useState(600);
  const [opponentScore, setOpponentScore] = useState(0);
  const [myScore, setMyScore]             = useState(0);
  const [matchResult, setMatchResult]     = useState(null);

  // Use real problem from server, fall back to DEV_PROBLEM so the UI never goes blank
  const problem = matchData?.problem ?? DEV_PROBLEM;
  const total   = problem?.total ?? 3;

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(t => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // Listen for opponent progress
  useEffect(() => {
    if (!socket) return;
    socket.on('opponent_progress', ({ passedCount }) => setOpponentScore(passedCount));
    return () => socket.off('opponent_progress');
  }, [socket]);

  // Listen for server-authoritative match result
  useEffect(() => {
    if (!socket) return;
    socket.on('match_finished', (data) => {
      console.log('Received match_finished:', data);
      setMatchResult(data);
    });
    return () => socket.off('match_finished');
  }, [socket]);

  const amIPlayer1 = matchData?.player1?.id === socket?.id;
  const defaultPlayer   = { name: 'You',      avatar: 'Y', elo: '—' };
  const defaultOpponent = { name: 'Opponent',  avatar: 'O', elo: '—' };
  const player   = (amIPlayer1 ? matchData?.player1 : matchData?.player2) ?? defaultPlayer;
  const opponent = (amIPlayer1 ? matchData?.player2 : matchData?.player1) ?? defaultOpponent;

  const handleSubmit = async (language, code) => {
    setSubmitting(true);
    setOutput(null);
    try {
      const response = await fetch('https://programming-arena-7hr2.onrender.com/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId: problem.problemId, language: language.toLowerCase(), code }),
      });
      const data = await response.json();

      setMyScore(data.passed);

      if (socket && matchData?.roomId) {
        socket.emit('update_progress', {
          roomId:      matchData.roomId,
          passedCount: data.passed,
          firebaseUid: playerData?.firebaseUid,
          total,
        });
      }

      const formattedLines = data.results.map(res =>
        res.passed
          ? { type: 'success', text: `✓  Test ${res.testCase} passed (${res.cpuTime || 0}s)` }
          : { type: 'error',   text: `✗  Test ${res.testCase} failed\n   Expected: ${res.expected}\n   Got:      ${res.output}` }
      );
      formattedLines.push({ type: 'info', text: `Runtime: ${data.results[0]?.cpuTime ?? '0.00'}s  ·  Memory: ${data.results[0]?.memory || 'N/A'} KB` });

      setOutput({ status: data.status, passed: data.passed, total: data.total, time: `${data.results[0]?.cpuTime || 0}s`, memory: `${data.results[0]?.memory || 0} KB`, lines: formattedLines });
    } catch (error) {
      console.error('API Error:', error);
      setOutput({ status: 'Error', passed: 0, total, time: '0s', memory: '0 KB', lines: [{ type: 'error', text: 'Server connection failed. Is your backend running?' }] });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0f', overflow: 'hidden' }}>
      <ArenaHeader
        player={player}
        opponent={opponent}
        timeString={formatTime(timeLeft)}
        myScore={myScore}
        opponentScore={opponentScore}
        total={total}
      />

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '340px 1fr', overflow: 'hidden' }}>
        <ProblemPane problem={problem} />
        <div style={{ display: 'grid', gridTemplateRows: '1fr 220px', overflow: 'hidden' }}>
          <EditorPane onSubmit={handleSubmit} submitting={submitting} />
          <TerminalPane output={output} running={submitting} />
        </div>
      </div>

      {matchResult && (
        <MatchResult
          result={matchResult.result}
          reason={matchResult.reason}
          myScore={matchResult.myScore}
          opponentScore={matchResult.opponentScore}
          eloChange={matchResult.eloChange}
          onReturn={onReturn}
        />
      )}
    </div>
  );
}