'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Loader2,
  User,
  Bot,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokensUsed?: number;
}

interface AIChatInterfaceProps {
  initialContext?: {
    page?: string;
    feature?: string;
    data?: any;
  };
}

export function AIChatInterface({ initialContext }: AIChatInterfaceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCredits();
      if (messages.length === 0) {
        // Welcome message
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: `Hi! I'm your AI assistant. I can help you with:\n\n• QR code optimization and design\n• Landing page creation and copywriting\n• Branding (names, logos, colors, taglines)\n• Content creation (blogs, social, emails)\n• Analytics insights and recommendations\n\nWhat can I help you with today?`,
            timestamp: new Date(),
          },
        ]);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function fetchCredits() {
    try {
      const res = await fetch('/api/ai/credits');
      if (res.ok) {
        const data = await res.json();
        setCredits(data.unlimited ? -1 : data.remaining);
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error);
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Determine the best AI feature based on the message
      const feature = determineFeature(input, initialContext);
      
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature,
          prompt: input,
          context: {
            conversationHistory: messages.slice(-4).map(m => ({
              role: m.role,
              content: m.content,
            })),
            ...initialContext,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.upgradeRequired) {
          toast.error(data.message || 'No AI credits remaining');
          const assistantMessage: Message = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: `I'm sorry, but you've reached your AI credit limit for this month. ${data.message}\n\nWould you like to upgrade your plan for more AI features?`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
          setLoading(false);
          return;
        }
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.result,
        timestamp: new Date(),
        tokensUsed: data.tokensUsed,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setCredits(data.creditsRemaining);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get AI response');
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  function determineFeature(message: string, context?: any): string {
    const lower = message.toLowerCase();
    
    // Check context first
    if (context?.page === 'qr-codes' || context?.feature?.includes('qr')) {
      if (lower.includes('design') || lower.includes('style')) return 'suggest_qr_design';
      if (lower.includes('name')) return 'name_qr';
      return 'optimize_qr';
    }
    
    if (context?.page === 'landing-pages' || lower.includes('landing page')) {
      if (lower.includes('seo')) return 'optimize_seo';
      if (lower.includes('image')) return 'suggest_images';
      if (lower.includes('copy')) return 'write_copy';
      return 'generate_landing_page';
    }

    // Branding keywords
    if (lower.includes('name') && (lower.includes('business') || lower.includes('company'))) {
      return 'generate_names';
    }
    if (lower.includes('logo')) return 'generate_logo_concepts';
    if (lower.includes('color') || lower.includes('palette')) return 'generate_colors';
    if (lower.includes('tagline') || lower.includes('slogan')) return 'generate_taglines';

    // Content keywords
    if (lower.includes('blog')) return 'write_blog';
    if (lower.includes('social') || lower.includes('post') || lower.includes('caption')) {
      return 'write_social';
    }
    if (lower.includes('email')) return 'write_email';
    if (lower.includes('idea') || lower.includes('brainstorm')) return 'brainstorm_ideas';

    // Analytics keywords
    if (lower.includes('analyz') || lower.includes('performance')) return 'analyze_performance';
    if (lower.includes('trend')) return 'predict_trends';
    if (lower.includes('improve')) return 'suggest_improvements';

    // Default
    return 'brainstorm_ideas';
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              aria-label="Open AI chat assistant"
            >
              <Sparkles className="h-6 w-6" />
            </Button>
            {credits !== null && credits > 0 && credits < 20 && (
              <Badge
                className="absolute -top-2 -right-2 bg-yellow-500 text-white"
                variant="default"
              >
                {credits}
              </Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 w-[calc(100vw-2rem)] max-w-[400px] max-h-[70vh] lg:max-h-[600px] flex flex-col"
          >
            <Card className="flex flex-col h-full shadow-2xl backdrop-blur-md bg-white/95">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <div>
                    <h3 className="font-semibold">AI Assistant</h3>
                    {credits !== null && (
                      <p className="text-xs opacity-90">
                        {credits === -1 ? '∞ credits' : `${credits} credits left`}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        {message.tokensUsed && (
                          <p className="text-xs opacity-70 mt-1">
                            {message.tokensUsed} tokens
                          </p>
                        )}
                      </div>
                      {message.role === 'user' && (
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask me anything..."
                    className="min-h-[60px] max-h-[120px] resize-none"
                    disabled={loading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!input.trim() || loading}
                    className="self-end bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
