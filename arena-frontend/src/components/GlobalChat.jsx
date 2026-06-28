import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../socket';
import { useAuth } from '../authContext';

export default function GlobalChat() {
  const { playerData } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const bottomRef               = useRef(null);

  useEffect(() => {
    const handleReceive = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };
    socket.on('receive_chat', handleReceive);
    return () => socket.off('receive_chat', handleReceive);
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    socket.emit('send_chat', {
      user: playerData?.username ?? 'Anonymous',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setInput('');
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const windowVariants = {
    hidden:  { opacity: 0, y: 60, scale: 0.97 },
    visible: { opacity: 1, y: 0,  scale: 1, transition: { type: 'spring', stiffness: 280, damping: 28, mass: 0.8 } },
  };

  const messageVariants = {
    hidden:  { opacity: 0, y: 14, filter: 'blur(4px)' },
    visible: { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { type: 'spring', stiffness: 320, damping: 26 } },
    exit:    { opacity: 0, x: -16, transition: { duration: 0.18 } },
  };

  return (
    <motion.div
      variants={windowVariants}
      initial="hidden"
      animate="visible"
      style={{
        position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 50,
        width: '22rem', display: 'flex', flexDirection: 'column',
        borderRadius: '1rem', overflow: 'hidden',
        boxShadow: '0 0 0 1px #1e1e2e, 0 8px 32px rgba(0,0,0,0.72), 0 0 80px rgba(16,185,129,0.05)',
        background: '#111118', border: '1px solid #1e1e2e',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.75rem 1rem', borderBottom: '1px solid #1e1e2e',
        background: 'linear-gradient(135deg, #13131f 0%, #111118 100%)',
      }}>
        <span style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <motion.span
            animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', inset: 0, borderRadius: '9999px', background: '#10b981' }}
          />
          <span style={{ width: 8, height: 8, borderRadius: '9999px', background: '#10b981', boxShadow: '0 0 6px #10b981', position: 'relative' }} />
        </span>
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#e2e8f0', fontFamily: 'ui-monospace, monospace' }}>
          Lobby Chat
        </span>
        {messages.length > 0 && (
          <motion.span
            key={messages.length}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              marginLeft: 'auto', fontSize: '0.65rem', fontWeight: 600,
              color: '#10b981', background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.25)', borderRadius: '9999px',
              padding: '0.1rem 0.45rem', fontFamily: 'ui-monospace, monospace',
            }}
          >
            {messages.length}
          </motion.span>
        )}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '0.75rem',
        display: 'flex', flexDirection: 'column', gap: '0.35rem',
        minHeight: 260, maxHeight: 320,
        scrollbarWidth: 'thin', scrollbarColor: '#2d2d45 transparent',
      }}>
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ margin: 'auto', textAlign: 'center', color: '#3d3d5c', fontSize: '0.75rem', fontFamily: 'ui-monospace, monospace', userSelect: 'none' }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>💬</div>
              No messages yet.<br />Be the first to break the silence.
            </motion.div>
          )}
          {messages.map((m, i) => (
            <motion.div
              key={i}
              variants={messageVariants}
              initial="hidden" animate="visible" exit="exit" layout
              style={{
                display: 'flex', flexDirection: 'column', gap: '0.1rem',
                padding: '0.45rem 0.6rem', borderRadius: '0.5rem',
                background: 'rgba(30,30,46,0.5)', border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', fontFamily: 'ui-monospace, monospace', textShadow: '0 0 8px rgba(59,130,246,0.5)', flexShrink: 0 }}>
                  {m.user}
                </span>
                <span style={{ fontSize: '0.65rem', color: '#3d3d5c', fontFamily: 'ui-monospace, monospace', marginLeft: 'auto', flexShrink: 0 }}>
                  {m.time}
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, wordBreak: 'break-word' }}>
                {m.text}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        style={{ display: 'flex', gap: '0.5rem', padding: '0.65rem 0.75rem', borderTop: '1px solid #1e1e2e', background: '#0d0d15' }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Send a message…"
          autoComplete="off"
          style={{
            flex: 1, background: '#0a0a0f', border: '1px solid #1e1e2e',
            borderRadius: '0.5rem', padding: '0.45rem 0.75rem',
            fontSize: '0.8rem', color: '#e2e8f0', outline: 'none',
            fontFamily: 'inherit', transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 2px rgba(16,185,129,0.15)'; }}
          onBlur={(e)  => { e.target.style.borderColor = '#1e1e2e'; e.target.style.boxShadow = 'none'; }}
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.07, boxShadow: '0 0 14px rgba(16,185,129,0.45)' }}
          whileTap={{ scale: 0.93 }}
          disabled={!input.trim()}
          style={{
            padding: '0.45rem 0.85rem', borderRadius: '0.5rem',
            fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em',
            color: input.trim() ? '#0a0a0f' : '#2d2d45',
            background: input.trim() ? 'linear-gradient(135deg, #10b981, #059669)' : '#1a1a28',
            border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s, color 0.2s', fontFamily: 'ui-monospace, monospace',
          }}
        >
          Send
        </motion.button>
      </form>
    </motion.div>
  );
}