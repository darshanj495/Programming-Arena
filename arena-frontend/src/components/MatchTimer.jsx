import { useState, useEffect, useRef } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
const TOTAL_SECONDS = 600; // 10 minutes for demo; swap to initialMinutes * 60

// ─── Sub-components ──────────────────────────────────────────────────────────

const LiveDot = ({ isCritical }) => (
  <span
    className={`inline-block w-2 h-2 rounded-full transition-colors duration-300 ${
      isCritical ? 'bg-red-500' : 'bg-emerald-400'
    }`}
    style={{
      boxShadow: isCritical
        ? '0 0 6px #ef4444'
        : '0 0 6px #10b981',
    }}
  />
);

const DifficultyBadge = ({ level }) => {
  const map = {
    Easy:   'bg-emerald-950 text-emerald-400 border border-emerald-900',
    Medium: 'bg-blue-950   text-blue-400   border border-blue-900',
    Hard:   'bg-red-950    text-red-400    border border-red-900',
  };
  return (
    <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${map[level] ?? map.Medium}`}>
      {level}
    </span>
  );
};

const PlayerCard = ({ name, elo, avatar, color, passed, total, accentClass, progressColor }) => {
  const pct = Math.round((passed / total) * 100);
  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-3 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${accentClass}`}
        >
          {avatar}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-200 truncate">{name}</p>
          <p className="text-[11px] text-gray-500">{elo} ELO</p>
        </div>
        <span
          className={`ml-auto text-[11px] font-semibold px-2 py-0.5 rounded shrink-0 ${
            passed === total
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
              : 'bg-[#1a1a28] text-gray-400 border border-[#2a2a3e]'
          }`}
        >
          {passed} / {total}
        </span>
      </div>
      <div>
        <div className="h-1 bg-[#1e1e2e] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-600 mt-1">Tests passed</p>
      </div>
    </div>
  );
};

const TimerArc = ({ progress, color }) => {
  const r = 56;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - progress);
  return (
    <svg
      viewBox="0 0 120 120"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r={r} fill="none" stroke="#1e1e2e" strokeWidth="3" />
      <circle
        cx="60" cy="60" r={r}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
        style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
      />
    </svg>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const MatchTimer = ({ initialMinutes = 10, onTimeUp }) => {
  const [timeLeft, setTimeLeft]   = useState(initialMinutes * 60);
  const [paused, setPaused]       = useState(false);
  const intervalRef               = useRef(null);
  const totalRef                  = useRef(initialMinutes * 60);


  useEffect(() => {
    setTimeLeft(initialMinutes * 60);
    totalRef.current = initialMinutes * 60;
    setPaused(false);
  }, [initialMinutes]);

  // Single, stable interval manager
  useEffect(() => {
    // If the timer is paused, do nothing (the cleanup function below already cleared it)
    if (paused) return;

    // Otherwise, start the interval
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          if (onTimeUp) onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // CRUCIAL: Cleanup runs every time the 'paused' state changes or component unmounts
    return () => clearInterval(intervalRef.current);
    
  }, [paused]);

  const reset = () => {
    // We do NOT clear the interval here anymore. 
    // We just reset the time and state, and let React handle the rest.
    setTimeLeft(totalRef.current);
    setPaused(false);
  };

  // ── Derived display values ─────────────────────────────────────────────────
  const minutes        = Math.floor(timeLeft / 60);
  const seconds        = timeLeft % 60;
  const formattedTime  = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progress       = timeLeft / totalRef.current;

  const isCritical  = timeLeft < 60;
  const isLow       = timeLeft < 120 && !isCritical;
  const isOver      = timeLeft <= 0;

  const timerColor = isCritical ? '#ef4444' : isLow ? '#f59e0b' : '#10b981';
  const timerTextClass = isCritical
    ? 'text-red-500'
    : isLow
    ? 'text-amber-400'
    : 'text-emerald-400';

  const statusLabel = isOver
    ? { text: "Time's up", cls: 'text-red-500' }
    : isCritical
    ? { text: 'Critical',   cls: 'text-red-500' }
    : isLow
    ? { text: 'Low time',   cls: 'text-amber-400' }
    : paused
    ? { text: 'Paused',     cls: 'text-gray-500' }
    : { text: 'In progress', cls: 'text-gray-500' };

  return (
    <div className="bg-[#0a0a0f] rounded-xl overflow-hidden font-sans min-h-[380px] flex flex-col">

      {/* ── Top bar ── */}
      <div className="bg-[#111118] border-b border-[#1e1e2e] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LiveDot isCritical={isCritical} />
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-widest">
            Live Match
          </span>
        </div>
        <span className="font-mono text-[11px] text-[#374151]">ROOM #4B2F</span>
        <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900">
          Round 1
        </span>
      </div>

      {/* ── Main grid: player | timer | player ── */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 p-4 items-center">

        <PlayerCard
          name="alex_dev"
          elo={1842}
          avatar="A"
          accentClass="bg-blue-950 text-blue-400 border border-blue-900"
          passed={2}
          total={3}
          progressColor="bg-blue-500"
        />

        {/* ── Clock ── */}
        <div className="flex flex-col items-center gap-2">
          <div
            className={`relative w-28 h-28 rounded-full bg-[#0f0f1a] border-2 border-[#1e1e2e]
              flex flex-col items-center justify-center
              ${isCritical ? 'animate-[pulse-ring_1.2s_ease-out_infinite]' : ''}
            `}
            style={
              isCritical
                ? { animation: 'pulseRing 1.2s ease-out infinite' }
                : undefined
            }
          >
            <TimerArc progress={progress} color={timerColor} />
            <span
              className={`relative font-mono text-[1.75rem] font-bold tabular-nums leading-none tracking-tight transition-colors duration-300 ${timerTextClass}`}
            >
              {formattedTime}
            </span>
            <span className="relative text-[9px] text-gray-600 uppercase tracking-widest mt-0.5">
              remaining
            </span>
          </div>

          <span className={`text-[11px] uppercase tracking-widest font-medium ${statusLabel.cls}`}>
            {statusLabel.text}
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => setPaused(p => !p)}
              disabled={isOver}
              className="flex items-center gap-1.5 bg-[#1a1a28] border border-[#2a2a3e] hover:border-[#3a3a5e]
                         text-gray-400 hover:text-gray-200 text-xs px-3 py-1.5 rounded-lg
                         transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {paused ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button
              onClick={reset}
              className="flex items-center gap-1.5 bg-[#1a1a28] border border-[#2a2a3e] hover:border-[#3a3a5e]
                         text-gray-400 hover:text-gray-200 text-xs px-3 py-1.5 rounded-lg
                         transition-all"
            >
              ↺ Reset
            </button>
          </div>
        </div>

        <PlayerCard
          name="sk_coder"
          elo={1790}
          avatar="S"
          accentClass="bg-purple-950 text-purple-400 border border-purple-900"
          passed={1}
          total={3}
          progressColor="bg-purple-500"
        />
      </div>

      {/* ── Problem panel ── */}
      <div className="mx-4 mb-4 bg-[#111118] border border-[#1e1e2e] rounded-xl px-4 py-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Problem</span>
          <DifficultyBadge level="Medium" />
        </div>
        <p className="text-sm font-medium text-gray-200">Two Sum — Find all unique pairs</p>
        <p className="text-[11px] text-gray-600 mt-0.5 font-mono">Array · Hash Map · O(n) expected</p>
      </div>

      {/* ── Time-up banner ── */}
      {isOver && (
        <div className="bg-red-950 border-t border-red-900 px-4 py-3 text-center">
          <span className="text-red-400 font-semibold text-sm">
            ⏱ Time's up — auto-submitting solutions...
          </span>
        </div>
      )}

    </div>
  );
};

export default MatchTimer;