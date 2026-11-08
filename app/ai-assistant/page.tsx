'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bot, Send, User, Sparkles, AlertTriangle, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your **MediReach Health Assistant**. 

I can help you with:
- General information on OTC and common medications (active ingredients, common uses, precautions).
- Explaining how MediReach's **Delay Fallback Engine** works when stores run low on stock.
- Assisting with digital prescription uploads and platform navigation.

*⚠️ Disclaimer: I provide general pharmacological information only and cannot diagnose diseases or prescribe drug dosages. Always consult your qualified physician or pharmacist.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!messageText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend.trim() }),
      });

      const data = await res.json();
      const botReply = data.reply || 'I am currently unable to answer. Please try again.';

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'assistant',
          text: 'Sorry, I encountered a temporary connection issue. Please check your network and try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    'What is Dolo 650 used for?',
    'Do I need a prescription for Azithromycin 500mg?',
    'How does the delay fallback engine work?',
    'How do I upload a doctor prescription?',
    'What are the common side effects of Augmentin 625?',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-emerald-600 transition flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Home
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">AI Health Assistant</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Bot className="w-8 h-8 text-emerald-600" />
          <span>MediReach AI Health Assistant</span>
        </h1>
      </div>

      {/* Mandatory Regulatory Medical Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-bold">Important Medical & Pharmacological Disclaimer:</strong>
          <p className="leading-relaxed text-amber-800">
            This AI assistant provides educational pharmacological information and platform guidance only. It is <strong>NOT</strong> a certified medical practitioner, does not provide medical diagnosis, and does not prescribe dosage schedules. In medical emergencies, immediately dial <strong>112 or 108</strong> in India or visit the nearest hospital emergency room.
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col h-[600px] overflow-hidden">
        {/* Messages scroll area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  m.sender === 'user'
                    ? 'bg-slate-900 text-white'
                    : 'bg-emerald-600 text-white shadow-xs'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 ${
                  m.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                <div
                  className={`text-[10px] text-right ${
                    m.sender === 'user' ? 'text-slate-400' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none p-4 text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>MediReach AI is analyzing medical catalog...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Questions */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Suggested:
          </span>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition cursor-pointer shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 sm:p-4 border-t border-slate-200 bg-white flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about a medicine, generic salt, or platform help..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white p-2.5 rounded-xl transition cursor-pointer shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

