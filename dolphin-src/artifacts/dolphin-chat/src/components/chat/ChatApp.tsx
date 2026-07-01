import React, { useRef, useEffect, useState } from 'react';
import { ArrowDown, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@/hooks/use-chat';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageItem } from '@/components/chat/MessageItem';
import { ChatInput } from '@/components/chat/ChatInput';
import { EmptyState } from '@/components/chat/EmptyState';
import { Sidebar } from '@/components/chat/Sidebar';
import { Button } from '@/components/ui/button';

export function ChatApp() {
  const { messages, isStreaming, sendMessage, conversationId, setConversationId } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Auto scroll when streaming
  useEffect(() => {
    if (isStreaming) {
      scrollToBottom();
    }
  }, [messages, isStreaming]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollButton(distanceFromBottom > 300);
  };

  const handleSelectPrompt = (prompt: string) => {
    sendMessage(prompt, undefined, undefined);
  };

  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden relative">
      
      {/* Sidebar */}
      <Sidebar 
        activeId={conversationId} 
        onSelect={setConversationId} 
        onNew={() => setConversationId(null)}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative h-full max-w-full">
        
        {/* Mobile Header trigger */}
        <div className="md:hidden absolute top-4 left-4 z-30">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="bg-card/50 backdrop-blur-sm border border-border">
            <Menu size={20} />
          </Button>
        </div>

        {/* Scrollable Message Area */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto w-full px-4 scroll-smooth pb-32"
        >
          <div className="max-w-4xl mx-auto flex flex-col min-h-full">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col">
                <ChatHeader />
                <EmptyState onSelectPrompt={handleSelectPrompt} />
              </div>
            ) : (
              <div className="flex-1 flex flex-col py-8 gap-2">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MessageItem 
                      role={msg.role as 'user'|'assistant'} 
                      content={msg.content} 
                      isStreaming={msg.isStreaming}
                      fileName={msg.fileName}
                      imageBase64={msg.imageBase64}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Scroll to bottom button */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30"
            >
              <Button 
                onClick={scrollToBottom}
                size="icon"
                className="rounded-full h-10 w-10 bg-card border border-border text-foreground hover:bg-secondary shadow-lg"
              >
                <ArrowDown size={18} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fixed Bottom Input & Footer Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/90 to-transparent pt-8 pb-2">
          <ChatInput onSend={sendMessage} isStreaming={isStreaming} />
          <div className="text-center text-[10px] text-muted-foreground pb-2">
            Built and Engineered by NativeCodes | Powered by{" "}
            <a
              href="https://t.me/Poriot_ke"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-500 hover:text-cyan-400 transition-colors"
            >
              P.o.Riot_ke
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}