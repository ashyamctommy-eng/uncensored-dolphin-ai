import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ModelOption {
  id: string;
  name: string;
  badge: string;
  icon: string;
}

export const MODELS: ModelOption[] = [
  {
    id: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
    name: 'Dolphin',
    badge: 'Uncensored',
    icon: '🐬',
  },
  {
    id: 'google/gemma-3-27b-it:free',
    name: 'Gemma 3',
    badge: '27B Vision',
    icon: '✨',
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 3.3',
    badge: '70B',
    icon: '🦙',
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1',
    badge: 'Reasoning',
    icon: '🧠',
  },
  {
    id: 'mistralai/mistral-7b-instruct:free',
    name: 'Mistral',
    badge: '7B Fast',
    icon: '⚡',
  },
];

interface ModelSelectorProps {
  value: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
}

export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = MODELS.find((m) => m.id === value) ?? MODELS[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/60 hover:bg-secondary border border-border text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>{current.icon}</span>
        <span className="font-medium text-foreground">{current.name}</span>
        <span className="text-[10px] text-muted-foreground hidden sm:inline">{current.badge}</span>
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute bottom-full mb-2 left-0 z-50 w-52 bg-card border border-border rounded-xl shadow-xl overflow-hidden"
          >
            <div className="p-1">
              {MODELS.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    onChange(model.id);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-secondary text-left transition-colors group"
                >
                  <span className="text-base leading-none">{model.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{model.name}</div>
                    <div className="text-[10px] text-muted-foreground">{model.badge}</div>
                  </div>
                  {model.id === value && (
                    <Check size={13} className="text-primary flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
