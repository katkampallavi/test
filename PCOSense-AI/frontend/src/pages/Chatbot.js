import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const SUGGESTIONS = [
  'What is PCOS?',
  'What are PCOS symptoms?',
  'Can diet help PCOS?',
  'Best exercises for PCOS',
  'Can I get pregnant with PCOS?',
  'How to manage PCOS naturally?',
  'PCOS and insulin resistance',
  'How to reduce acne with PCOS?',
];

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${isUser ? 'bg-pink-500 text-white' : 'bg-purple-100 text-purple-600'}`}>
        {isUser ? '👤' : '🌸'}
      </div>
      <div className={isUser ? 'chat-user' : 'chat-bot'}>
        {msg.text.split('\n').map((line, i) => {
          const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          return <p key={i} className={line.startsWith('•') || line.startsWith('✅') || line.startsWith('❌') ? 'my-0.5' : ''} dangerouslySetInnerHTML={{ __html: bold }} />;
        })}
        <div className={`text-xs mt-1.5 ${isUser ? 'text-pink-200' : 'text-gray-400'}`}>
          {msg.time}
        </div>
      </div>
    </div>
  );
}

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: "Hi there! 👋 I'm your **PCOSense AI Assistant**.\n\nI can answer questions about PCOS, symptoms, diet, exercise, fertility, and more.\n\nTry one of the suggestions below or type your own question!",
      time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setInput('');

    const time = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    setMessages(m => [...m, { id: Date.now(), role:'user', text: userMsg, time }]);
    setLoading(true);

    try {
      const res = await api.post('/api/chatbot/message', { message: userMsg });
      setMessages(m => [...m, { id: Date.now()+1, role:'bot', text: res.data.response, time }]);
    } catch {
      toast.error('Chatbot unavailable');
      setMessages(m => [...m, { id: Date.now()+1, role:'bot', text: 'Sorry, I had trouble connecting. Please try again!', time }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-display font-bold text-gray-800 mb-2">AI Health Chatbot 💬</h1>
        <p className="text-gray-500">Ask any question about PCOS, symptoms, diet, and lifestyle</p>
      </div>

      {/* Chat container */}
      <div className="bg-white rounded-3xl shadow-sm border border-pink-100 overflow-hidden flex flex-col" style={{ height: '70vh' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center text-xl">🌸</div>
          <div>
            <div className="font-bold text-white">PCOSense AI</div>
            <div className="text-pink-100 text-xs flex items-center gap-1">
              <span className="w-2 h-2 bg-green-300 rounded-full" />
              Online · PCOS Health Assistant
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map(msg => <Message key={msg.id} msg={msg} />)}
          {loading && (
            <div className="flex items-end gap-2 animate-fade-in">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm">🌸</div>
              <div className="chat-bot">
                <div className="flex gap-1 py-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        <div className="px-4 py-2 border-t border-pink-50 overflow-x-auto">
          <div className="flex gap-2 pb-1 min-w-max">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)} disabled={loading}
                className="bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs px-3 py-1.5 rounded-full border border-pink-200 transition-colors whitespace-nowrap font-medium">
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-2 bg-white flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask a PCOS question…"
            className="flex-1 input-field"
            disabled={loading}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()}
            className="btn-primary px-4 py-2.5 shrink-0">
            {loading ? '⏳' : '↑'}
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-3">
        ⚕️ This chatbot provides general information only, not medical advice.
      </p>
    </div>
  );
}
