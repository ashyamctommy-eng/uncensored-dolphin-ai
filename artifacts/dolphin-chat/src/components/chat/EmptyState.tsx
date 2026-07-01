import React from 'react';
import { Terminal, Code, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export function EmptyState({ onSelectPrompt }: EmptyStateProps) {
  const examples = [
    {
      title: "Write a Python web scraper",
      icon: <Terminal size={16} className="text-primary" />,
      prompt: "Write a complete Python web scraper using BeautifulSoup to extract product data from an e-commerce site, including handling pagination and saving to CSV."
    },
    {
      title: "Debug this React component",
      icon: <Code size={16} className="text-primary" />,
      prompt: "I have a React component that is causing an infinite re-render loop in useEffect. How do I debug and fix it?"
    },
    {
      title: "Generate a REST API",
      icon: <Cpu size={16} className="text-primary" />,
      prompt: "Generate a robust Express.js REST API with TypeScript, Zod validation, error handling middleware, and a Drizzle ORM setup for a users table."
    }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {examples.map((example, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(example.prompt)}
            className="flex flex-col items-start gap-3 p-4 rounded-2xl bg-card border border-border hover:border-primary/50 hover:bg-secondary/50 transition-all text-left group"
          >
            <div className="p-2 rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">
              {example.icon}
            </div>
            <span className="text-sm font-medium text-foreground">{example.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}