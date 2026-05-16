import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Headphones, MessageCircle, Send, UserRound, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ChatIntentT, ChatT } from '@/i18n/translations/types';

const RESPONSE_DELAY_MS = 15000;
const attendants = ['Mariana', 'Lucas', 'Camila', 'Rafael', 'Fernanda', 'Bruno'];

interface ChatMessage {
  id: number;
  role: 'bot' | 'user';
  text: string;
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getBotAnswer(question: string, intents: ChatIntentT[], fallback: string) {
  const text = normalize(question);
  const words = text.split(/\s+/).filter(Boolean);

  const ranked = intents
    .map(intent => {
      const score = intent.keywords.reduce((total, keyword) => {
        const key = normalize(keyword);
        if (text.includes(key)) return total + (key.includes(' ') ? 3 : 2);
        if (words.some(word => key.includes(word) || word.includes(key))) return total + 1;
        return total;
      }, 0);
      return { ...intent, score };
    })
    .sort((a, b) => b.score - a.score);

  if (ranked[0]?.score > 0) {
    return ranked[0].answer;
  }

  return fallback;
}

interface FloatingChatProps {
  chat: ChatT;
  intents: ChatIntentT[];
}

export default function FloatingChat({ chat, intents }: FloatingChatProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const attendantName = useMemo(() => attendants[Math.floor(Math.random() * attendants.length)], []);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 1,
      role: 'bot',
      text: chat.welcome,
    },
  ]);

  useEffect(() => {
    setMessages([
      {
        id: 1,
        role: 'bot',
        text: chat.welcome,
      },
    ]);
  }, [chat.welcome]);

  const canSend = useMemo(() => input.trim().length > 0 && !isTyping, [input, isTyping]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const sendQuestion = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || isTyping) return;

    setMessages(current => [...current, { id: Date.now(), role: 'user', text: trimmed }]);
    setInput('');
    setIsTyping(true);

    timeoutRef.current = window.setTimeout(() => {
      setMessages(current => [
        ...current,
        { id: Date.now() + 1, role: 'bot', text: getBotAnswer(trimmed, intents, chat.fallback) },
      ]);
      setIsTyping(false);
      timeoutRef.current = null;
    }, RESPONSE_DELAY_MS);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendQuestion(input);
  };

  const typingLabel = `${attendantName}${chat.typingSuffix}`;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-4 w-[calc(100vw-2.5rem)] max-w-sm overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-950/25">
          <div className="bg-gradient-to-r from-slate-950 via-blue-900 to-emerald-700 p-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-heading font-bold">{attendantName} - FinanceApp</p>
                  <p className="text-xs text-white/65">{chat.online}</p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-full p-1 text-white/70 hover:bg-white/10 hover:text-white"
                onClick={() => setOpen(false)}
                aria-label={chat.closeAria}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4 p-4">
            <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {messages.map(message => (
                <div key={message.id} className={message.role === 'bot' ? 'mr-8' : 'ml-8'}>
                  {message.role === 'bot' && (
                    <p className="mb-1 px-1 text-[11px] font-semibold text-slate-500">{attendantName}</p>
                  )}
                  <div
                    className={`rounded-2xl p-3 text-sm leading-6 ${
                      message.role === 'bot'
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-gradient-to-r from-blue-700 to-emerald-600 text-white'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="mr-8">
                  <p className="mb-1 px-1 text-[11px] font-semibold text-slate-500">{attendantName}</p>
                  <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 p-3 text-sm text-slate-600">
                    <span>{typingLabel}</span>
                    <span className="flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:120ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:240ms]" />
                    </span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                className="h-10 rounded-xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                placeholder={chat.placeholder}
                value={input}
                onChange={event => setInput(event.target.value)}
                disabled={isTyping}
              />
              <Button type="submit" size="icon" disabled={!canSend} className="h-10 w-10 rounded-xl bg-blue-700 hover:bg-blue-800">
                <Send className="h-4 w-4" />
              </Button>
            </form>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
              <p className="text-sm font-semibold text-emerald-800">{chat.humanTitle}</p>
              <p className="mt-1 text-xs leading-5 text-emerald-700">{chat.humanSubtitle}</p>
              <Button asChild className="mt-3 w-full rounded-xl bg-gradient-to-r from-blue-700 to-emerald-600 hover:from-blue-800 hover:to-emerald-700">
                <a href="mailto:atendimento@financeapp.com.br?subject=Atendimento%20FinanceApp">
                  <Headphones className="h-4 w-4" /> {chat.supportCta}
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        className="group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-700 to-emerald-600 text-white shadow-2xl shadow-blue-950/30 transition-all hover:scale-105"
        onClick={() => setOpen(current => !current)}
        aria-label={chat.openAria}
      >
        {open ? <Send className="h-6 w-6" /> : <MessageCircle className="h-6 w-6 transition-transform group-hover:scale-110" />}
      </button>
    </div>
  );
}
