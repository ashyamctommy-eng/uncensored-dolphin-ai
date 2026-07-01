import React, { useState, useRef } from 'react';
import { Paperclip, ArrowUp, X, FileCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ModelSelector, MODELS } from '@/components/chat/ModelSelector';

interface ChatInputProps {
  onSend: (text: string, file?: { name: string, base64?: string, text?: string }, model?: string) => void;
  isStreaming: boolean;
}

export function ChatInput({ onSend, isStreaming }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [file, setFile] = useState<{ name: string; type: string; base64?: string; text?: string; previewUrl?: string } | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>(MODELS[0].id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if ((!input.trim() && !file) || isStreaming) return;
    
    const attachment = file ? {
      name: file.name,
      base64: file.base64,
      text: file.text
    } : undefined;

    onSend(input, attachment, selectedModel);
    setInput('');
    setFile(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const reader = new FileReader();
    const isImage = selected.type.startsWith('image/');

    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (isImage) {
        const base64Data = result.split(',')[1];
        setFile({
          name: selected.name,
          type: selected.type,
          base64: base64Data,
          previewUrl: result
        });
      } else {
        setFile({
          name: selected.name,
          type: selected.type,
          text: result
        });
      }
    };

    if (isImage) {
      reader.readAsDataURL(selected);
    } else {
      reader.readAsText(selected);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-6 pt-2 relative z-20">
      <AnimatePresence>
        {file && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute -top-14 left-4 bg-card border border-border rounded-lg p-2 flex items-center gap-3 shadow-lg max-w-[200px]"
          >
            {file.previewUrl ? (
              <div className="w-8 h-8 rounded overflow-hidden bg-muted flex-shrink-0">
                <img src={file.previewUrl} alt="preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded bg-muted/50 flex items-center justify-center flex-shrink-0 text-primary">
                <FileCode size={16} />
              </div>
            )}
            <span className="text-xs text-foreground truncate flex-1 font-medium">{file.name}</span>
            <button 
              onClick={() => setFile(null)}
              className="text-muted-foreground hover:text-foreground p-1 transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative bg-card border border-border rounded-[24px] shadow-sm flex flex-col transition-all focus-within:ring-1 focus-within:ring-primary/50 focus-within:border-primary/30 overflow-hidden">
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          onChange={handleFileChange}
          accept=".py,.html,.js,.ts,.php,.css,.txt,.json,.png,.jpg,.jpeg"
        />

        {/* Top row: attach + textarea */}
        <div className="flex items-end px-2 pt-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10 flex-shrink-0 mb-0.5"
            onClick={() => fileInputRef.current?.click()}
            disabled={isStreaming}
          >
            <Paperclip size={20} />
          </Button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              autoResize();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Describe your code or project..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground resize-none border-none focus:outline-none focus:ring-0 py-3 px-2 max-h-[200px] min-h-[44px]"
            rows={1}
            disabled={isStreaming}
          />
        </div>

        {/* Bottom row: model selector + send */}
        <div className="flex items-center justify-between px-3 pb-2 pt-1">
          <ModelSelector
            value={selectedModel}
            onChange={setSelectedModel}
            disabled={isStreaming}
          />

          <Button 
            size="icon" 
            className="rounded-full h-9 w-9 bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0 transition-transform active:scale-95 disabled:opacity-50"
            onClick={handleSend}
            disabled={(!input.trim() && !file) || isStreaming}
          >
            <ArrowUp size={18} className={isStreaming ? "animate-pulse" : ""} />
          </Button>
        </div>
      </div>
    </div>
  );
}
