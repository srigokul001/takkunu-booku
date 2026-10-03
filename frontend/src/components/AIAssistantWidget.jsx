import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  Send,
  X,
  Sparkles,
  MapPin,
  Users,
  DollarSign,
  ArrowRight,
  Maximize2,
  Minimize2,
  RefreshCw,
  Building
} from 'lucide-react';
import aiService from '../services/aiService';

const AIAssistantWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Vanakkam & Welcome! I am your **TAKKUNU BOOKU AI Concierge** powered by Groq & LangChain.\n\nYou can ask me in **English or Tanglish**, for example:\n*\"Coimbatore-la 2 people-ku ₹2500 budget-la room venum.\"*",
      hotels: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    'Coimbatore-la 2 people-ku ₹2500 budget-la room venum.',
    'Find a Miami beachfront resort for 2 guests.',
    'Aspen mountain chalet under $350.',
  ];

  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiService.sendMessage(userMessage.text);
      if (res.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'ai',
            text: res.reply,
            hotels: res.hotels || [],
            extractedParams: res.extractedParams,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'ai',
            text: 'I could not process that request. Please try again.',
            hotels: [],
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: 'Sorry, I encountered an issue connecting to the AI engine. Please try again in a moment.',
          hotels: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl shadow-teal-700/30 flex items-center space-x-2.5 transition-all duration-300 hover:scale-105 group border-2 border-white/20"
          aria-label="Open AI Hotel Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6 animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-black uppercase tracking-wider leading-none">AI Concierge</p>
            <p className="text-[10px] text-teal-100 font-medium">Ask in English or Tanglish</p>
          </div>
        </button>
      )}

      {/* Expandable Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-full sm:w-[420px] max-w-[calc(100vw-32px)] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex items-center justify-between border-b border-teal-800/40">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-bold text-sm">TAKKUNU BOOKU AI</h3>
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30">
                    LangChain + Groq
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Database Search & Recommendation Engine</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center space-x-1.5 overflow-x-auto text-[11px]">
            <span className="text-slate-400 font-bold flex-shrink-0 flex items-center mr-1">
              <Sparkles className="w-3 h-3 text-amber-500 mr-1" />
              Try:
            </span>
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-teal-700 hover:border-teal-300 hover:bg-teal-50 flex-shrink-0 transition font-medium"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-teal-600 text-white rounded-br-none shadow-md shadow-teal-600/20'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line font-normal">{m.text}</p>
                </div>

                {/* Extracted Parameter Badges */}
                {m.extractedParams && (m.extractedParams.location || m.extractedParams.maxPrice) && (
                  <div className="flex flex-wrap gap-1 mt-1.5 max-w-[85%]">
                    {m.extractedParams.location && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold">
                        <MapPin className="w-2.5 h-2.5 text-teal-600" />
                        <span>Location: {m.extractedParams.location}</span>
                      </span>
                    )}
                    {m.extractedParams.guests && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">
                        <Users className="w-2.5 h-2.5 text-slate-500" />
                        <span>{m.extractedParams.guests} Guests</span>
                      </span>
                    )}
                    {m.extractedParams.maxPrice && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                        <span>Budget: ≤ ₹/${m.extractedParams.maxPrice}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Direct Room Cards in Chat */}
                {m.hotels && m.hotels.length > 0 && (
                  <div className="w-full mt-2.5 space-y-2">
                    {m.hotels.slice(0, 2).map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex space-x-3 items-center"
                      >
                        <img
                          src={item.roomImage || item.hotelImage}
                          alt={item.hotelName}
                          className="w-16 h-16 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80';
                          }}
                        />
                        <div className="flex-1 min-w-0 text-xs">
                          <p className="font-extrabold text-slate-900 truncate">{item.hotelName}</p>
                          <p className="text-[11px] text-teal-700 font-semibold truncate">
                            Room #{item.roomNumber} ({item.roomType})
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-black text-slate-900 text-xs">${item.pricePerNight} <span className="text-[9px] text-slate-400 font-normal">/ night</span></span>
                            <Link
                              to={`/booking?roomId=${item.roomId}&hotelId=${item.hotelId}`}
                              onClick={() => setIsOpen(false)}
                              className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] transition inline-flex items-center space-x-1"
                            >
                              <span>Book</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs p-2">
                <Bot className="w-4 h-4 text-teal-600 animate-spin" />
                <span className="animate-pulse">Searching hotel database...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask in English or Tanglish..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-teal-600 font-medium"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-40 transition shadow-md shadow-teal-600/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};

export default AIAssistantWidget;
