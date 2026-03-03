import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const INITIAL_MESSAGE: Message = {
  id: '1',
  type: 'bot',
  content: '¡Hola! Soy tu asistente de TranspoSys. Puedo ayudarte con dudas sobre alumnos, pagos o funcionalidades del sistema. ¿En qué te puedo ayudar hoy?',
  timestamp: new Date(),
};

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipDismissed, setTooltipDismissed] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setShowTooltip(false);
    } else if (!tooltipDismissed) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [messages, isOpen, tooltipDismissed]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const newBotMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Entiendo tu consulta. Como soy un asistente demo en este prototipo frontend, todavía no tengo acceso al backend real para procesar solicitudes complejas, pero pronto podré ayudarte de forma automática.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newBotMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Tooltip Bubble */}
      <div
        className={twMerge(
          clsx(
            'fixed bottom-24 right-6 bg-white px-4 py-3 rounded-2xl shadow-xl shadow-violet-500/10 border border-violet-100 z-50 transition-all duration-500 origin-bottom-right',
            showTooltip && !isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
          )
        )}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Pss... ¿Necesitás ayuda?</span>
          <button
            onClick={() => {
              setShowTooltip(false);
              setTooltipDismissed(true);
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 rounded-full p-1"
            aria-label="Cerrar sugerencia"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        {/* Tail of the speech bubble */}
        <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b border-r border-violet-100 transform rotate-45"></div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={twMerge(
          clsx(
            'fixed bottom-6 right-6 p-4 rounded-full shadow-lg shadow-violet-500/40 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-violet-500/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 z-50',
            'bg-gradient-to-r from-violet-600 to-violet-500 text-white',
            isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
          )
        )}
        aria-label="Abrir asistente"
      >
        <Bot className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div
        className={twMerge(
          clsx(
            'fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-[350px] max-h-full sm:max-h-[500px] h-[100dvh] sm:h-[calc(100vh-100px)] bg-white sm:rounded-2xl shadow-2xl flex flex-col z-50 transition-all duration-300 origin-bottom-right overflow-hidden border border-gray-100',
            isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-50 opacity-0 pointer-events-none'
          )
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-700 to-violet-500 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">TranspoBot</h3>
              <p className="text-violet-200 text-xs">Asistente Virtual</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-violet-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Layout */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={twMerge(
                clsx(
                  'flex w-full',
                  msg.type === 'user' ? 'justify-end' : 'justify-start'
                )
              )}
            >
              <div
                className={twMerge(
                  clsx(
                    'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm',
                    msg.type === 'user'
                      ? 'bg-violet-600 text-white rounded-tr-sm'
                      : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                  )
                )}
              >
                {msg.type === 'bot' && (
                  <div className="flex items-center gap-2 mb-1.5 opacity-60">
                    <Bot className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Bot</span>
                  </div>
                )}
                <p className="leading-relaxed">{msg.content}</p>
                <div 
                  className={twMerge(
                    clsx(
                      "text-[10px] mt-1.5 text-right",
                      msg.type === 'user' ? "text-violet-200" : "text-gray-400"
                    )
                  )}
                >
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex gap-1.5 items-center">
                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-gray-100">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu consulta..."
              className="w-full bg-gray-50 border border-gray-200 rounded-full pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all placeholder:text-gray-400"
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="absolute right-1.5 p-1.5 rounded-full bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 disabled:hover:bg-violet-600 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-1"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
