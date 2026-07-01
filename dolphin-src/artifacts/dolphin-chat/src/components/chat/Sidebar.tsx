import React from 'react';
import { useListConversations, useDeleteConversation, useCreateConversation } from '@workspace/api-client-react';
import { Plus, MessageSquare, Trash2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface SidebarProps {
  activeId: number | null;
  onSelect: (id: number) => void;
  onNew: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ activeId, onSelect, onNew, isOpen, setIsOpen }: SidebarProps) {
  const { data: conversations = [], isLoading } = useListConversations();
  const deleteMutation = useDeleteConversation();

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        if (activeId === id) {
          onNew();
        }
      }
    });
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <div className={cn(
        "fixed md:static inset-y-0 left-0 z-50 w-72 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        "md:flex-shrink-0"
      )}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Button 
            onClick={onNew} 
            className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 shadow-none font-medium flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            New Session
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden ml-2" onClick={() => setIsOpen(false)}>
            <Menu size={20} />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex flex-col gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm mt-10">
                No history yet.
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    onSelect(conv.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors group",
                    activeId === conv.id 
                      ? "bg-secondary text-foreground" 
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare size={16} className={activeId === conv.id ? "text-primary" : ""} />
                    <div className="flex flex-col truncate">
                      <span className="truncate text-sm font-medium">
                        {conv.title || 'New Conversation'}
                      </span>
                      <span className="text-[10px] opacity-70">
                        {formatDistanceToNow(new Date(conv.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-opacity"
                    onClick={(e) => handleDelete(e, conv.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}