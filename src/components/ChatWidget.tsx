import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  MessageSquare, 
  X, 
  Bot, 
  Trash2, 
  RefreshCw,
  Sparkles
} from 'lucide-react';

// --- CONFIG ---
// 🟢 NEW: Your public internet backend
const API_BASE = 'https://isreal-falconiform-seasonedly.ngrok-free.dev';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const QUICK_ACTIONS = [
  "Update News",
  "Who is winning?",
  "Ferrari News",
  "Lando Norris Stats"
];

// --- HELPER: Make Links Clickable ---
const renderMessageWithLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a 
          key={index} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-red-400 font-bold underline ml-1 hover:text-red-300 transition-colors"
        >
          Read Article &rarr;
        </a>
      );
    }
    return part;
  });
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      text: "🏎️ Hi! I'm your F1 Insider. I can fetch the latest news or predict race results.", 
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, loading]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = { 
      id: Date.now(), 
      text: textToSend, 
      sender: 'user', 
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true' // 🟢 ADDED: This fixes the connection
        }, 
        body: JSON.stringify({ message: userMsg.text })
      });
      
      const data = await res.json();
      
      const botMsg: Message = { 
        id: Date.now() + 1, 
        text: data.reply, 
        sender: 'bot', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, botMsg]);
      
    } catch (e) {
      const errorMsg: Message = { 
        id: Date.now() + 1, 
        text: "⚠️ Connection Error. Ensure app.py is running.", 
        sender: 'bot', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMsg]);
    }
    setLoading(false);
  };

  const clearChat = () => {
    setMessages([{ 
      id: Date.now(), 
      text: "Chat cleared. What else can I help you with?", 
      sender: 'bot',
      timestamp: new Date()
    }]);
  };

  // --- CLOSED STATE (Floating Button) ---
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        // 🛡️ SAFETY: Using inline styles for positioning to guarantee visibility
        style={{ 
          position: 'fixed', 
          bottom: '100px', 
          right: '20px', 
          zIndex: 99999 
        }}
        className="w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
      >
        <MessageSquare className="w-8 h-8 fill-current" />
        <span className="absolute top-0 right-0 w-4 h-4 bg-green-500 border-2 border-neutral-900 rounded-full"></span>
      </button>
    );
  }

  // --- OPEN STATE (Chat Window) ---
  return (
    <div 
      // 🛡️ SAFETY: Using inline styles for Z-Index
      style={{ zIndex: 99999 }}
      className="fixed bottom-24 inset-x-4 md:inset-auto md:right-6 md:w-[400px] h-[65vh] max-h-[600px] bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300"
    >
      
      {/* Header */}
      <div className="p-4 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between shrink-0 z-20 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center shadow-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              F1 Insider
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            </h3>
            <span className="text-neutral-400 text-[10px] font-medium tracking-wide">POWERED BY AI & RSS</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={clearChat} className="p-2 hover:bg-white/10 rounded-full text-neutral-400 hover:text-white transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-neutral-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent bg-neutral-950 relative z-10">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-md leading-relaxed ${
              msg.sender === 'user' 
                ? 'bg-red-600 text-white rounded-br-sm' 
                : 'bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-bl-sm'
            }`}>
              {renderMessageWithLinks(msg.text)}
            </div>
            <span className="text-[10px] text-neutral-500 mt-1 px-1">
              {msg.sender === 'user' ? 'You' : 'AI'} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {loading && (
           <div className="flex justify-start">
             <div className="bg-neutral-800 rounded-2xl p-4 rounded-bl-none border border-neutral-700 flex gap-1.5 items-center w-fit">
                <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce"></span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {!loading && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide shrink-0 bg-neutral-950 z-20 relative">
          {QUICK_ACTIONS.map((action, i) => (
            <button 
              key={i}
              onClick={() => handleSend(action)}
              className="flex-shrink-0 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 text-xs px-3 py-1.5 rounded-full transition-all whitespace-nowrap active:scale-95 flex items-center gap-1.5"
            >
              {action.includes("Update") ? <RefreshCw className="w-3 h-3" /> : <Sparkles className="w-3 h-3 text-yellow-500" />}
              {action}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-neutral-900 border-t border-neutral-800 shrink-0 z-30 relative">
        <div className="relative group w-full">
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about drivers..."
            className="w-full bg-neutral-800 border border-neutral-700 rounded-2xl pl-4 pr-14 py-3.5 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-neutral-500"
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={loading} 
          />
          {/* Force Button Center with Transform */}
          <button 
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-red-600 hover:bg-red-500 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:hover:bg-red-600 shadow-lg"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

    </div>
  );
}