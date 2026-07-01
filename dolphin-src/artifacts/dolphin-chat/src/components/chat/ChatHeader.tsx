import React from 'react';
import { Flame, Star, CheckCircle } from 'lucide-react';

export function ChatHeader() {
  return (
    <div className="w-full flex flex-col items-center justify-center pt-16 pb-8 px-4 text-center">
      {/* Avatar / Icon */}
      <div className="relative w-16 h-16 rounded-full bg-card border border-border shadow-lg flex items-center justify-center mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-1 ring-primary/20">
          <div className="w-4 h-4 rounded-full bg-primary animate-pulse shadow-[0_0_15px_rgba(0,229,255,0.5)]" />
        </div>
      </div>

      <h1 className="text-3xl font-bold text-foreground tracking-tight mb-3">
        Dolphin Uncensored Pro (v1)
      </h1>

      <div className="flex flex-wrap items-center justify-center gap-3 text-sm mb-4">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary rounded-full border border-secondary-border">
          <span className="text-foreground font-medium">by NativeCodes</span>
          <CheckCircle size={14} className="text-primary" />
        </div>
        
        <div className="flex items-center gap-1.5 px-3 py-1 bg-card rounded-full border border-border text-muted-foreground">
          <Flame size={14} className="text-orange-500" />
          <span>15.4k runs</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-card rounded-full border border-border text-muted-foreground">
          <Star size={14} className="text-yellow-500 fill-yellow-500" />
          <span>5.0</span>
        </div>
      </div>

      <p className="max-w-lg text-muted-foreground text-sm leading-relaxed">
        The ultimate uncensored AI engineering companion. Multi-file code generation, advanced scripting, and zero compliance friction.
      </p>
    </div>
  );
}