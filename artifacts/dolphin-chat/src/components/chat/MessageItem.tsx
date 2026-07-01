import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CheckCircle2, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MessageItemProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  imageBase64?: string | null;
  fileName?: string | null;
}

export function MessageItem({ role, content, isStreaming, imageBase64, fileName }: MessageItemProps) {
  const isUser = role === 'user';

  return (
    <div className={cn(
      "w-full flex py-6",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-3xl w-full flex flex-col gap-2",
        isUser ? "items-end" : "items-start"
      )}>
        
        {fileName && (
          <div className="text-xs text-muted-foreground flex items-center gap-2 mb-1 bg-card px-3 py-1.5 rounded-full border border-border">
            <span>Attached file: <span className="font-mono text-foreground">{fileName}</span></span>
          </div>
        )}

        {imageBase64 && (
          <div className="max-w-sm rounded-xl overflow-hidden border border-border">
            <img src={`data:image/jpeg;base64,${imageBase64}`} alt="Uploaded content" className="w-full h-auto" />
          </div>
        )}

        <div className={cn(
          "w-full text-base",
          isUser 
            ? "bg-secondary text-secondary-foreground px-5 py-3 rounded-2xl rounded-tr-sm inline-block w-auto max-w-[85%]" 
            : "text-foreground prose prose-invert max-w-none"
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="relative">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeContent = String(children).replace(/\n$/, '');
                    
                    if (!inline && match) {
                      const language = match[1];
                      return (
                        <CodeBlock language={language} code={codeContent} />
                      );
                    }
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {content}
              </ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1 align-middle" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CodeBlock({ language, code }: { language: string, code: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extMap: Record<string, string> = {
      python: '.py',
      javascript: '.js',
      html: '.html',
      css: '.css',
      php: '.php',
      ts: '.ts',
      typescript: '.ts',
      json: '.json',
      sh: '.sh',
      bash: '.sh'
    };
    
    const ext = extMap[language] || '.txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snippet${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative my-4 group rounded-xl overflow-hidden border border-border/50 shadow-sm">
      <div className="flex items-center justify-between px-4 py-1.5 bg-card/80 border-b border-border/50">
        <span className="text-xs font-mono text-muted-foreground uppercase">{language}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-muted" onClick={handleCopy}>
            {copied ? <CheckCircle2 size={14} className="text-primary" /> : <Copy size={14} className="text-muted-foreground hover:text-foreground" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-muted" onClick={handleDownload}>
            <Download size={14} className="text-muted-foreground hover:text-foreground" />
          </Button>
        </div>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus as any}
        customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '0.875rem' }}
        wrapLongLines={true}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}