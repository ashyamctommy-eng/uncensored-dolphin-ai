import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGetConversationMessages, getGetConversationMessagesQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import type { Message } from '@workspace/api-client-react/src/generated/api.schemas';
import { API_BASE_URL } from '@/lib/api-base-url';

export interface ChatHookReturn {
  messages: Array<Message & { isStreaming?: boolean }>;
  isStreaming: boolean;
  sendMessage: (content: string, file?: { name: string, base64: string } | { name: string, text: string }, model?: string) => Promise<void>;
  conversationId: number | null;
  setConversationId: (id: number | null) => void;
  streamingContent: string;
}

export function useChat(): ChatHookReturn {
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  
  const queryClient = useQueryClient();

  const { data: serverMessages = [] } = useGetConversationMessages(
    conversationId as number, 
    { 
      query: { 
        enabled: !!conversationId, 
        queryKey: getGetConversationMessagesQueryKey(conversationId as number) 
      } 
    }
  );

  // Combine server messages with any optimistic user messages (while streaming)
  const combinedMessages = [...serverMessages, ...optimisticMessages];

  const sendMessage = useCallback(async (content: string, file?: { name: string, base64?: string, text?: string }, model?: string) => {
    setIsStreaming(true);
    setStreamingContent('');
    
    // Create optimistic user message
    const tempUserId = Date.now();
    let imageBase64: string | undefined = undefined;
    let fileName: string | undefined = undefined;
    
    // Handle file attachment logic here 
    if (file) {
      fileName = file.name;
      if ('base64' in file) {
        imageBase64 = file.base64;
      } else if ('text' in file) {
        // Append text file content to context if it's a code/text file
        content = `Attached file: ${file.name}\n\`\`\`\n${file.text}\n\`\`\`\n\n${content}`;
      }
    }

    const newMessage: Message = {
      id: tempUserId,
      conversationId: conversationId || 0,
      role: 'user',
      content,
      imageBase64: imageBase64 || null,
      fileName: fileName || null,
      createdAt: new Date().toISOString()
    };

    setOptimisticMessages(prev => [...prev, newMessage]);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          conversationId, 
          messages: [{ role: 'user', content, imageBase64 }], 
          fileName,
          model,
        }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let currentStreamingContent = '';
      let serverConversationId = conversationId;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value);
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.chunk) {
                currentStreamingContent += parsed.chunk;
                setStreamingContent(currentStreamingContent);
              }
              if (parsed.conversationId && !serverConversationId) {
                serverConversationId = parsed.conversationId;
                setConversationId(parsed.conversationId);
              }
            } catch (e) {
              // ignore parse errors for partial chunks
            }
          }
        }
      }

      // Done streaming, refetch the messages completely
      setStreamingContent('');
      setIsStreaming(false);
      setOptimisticMessages([]);
      if (serverConversationId) {
        queryClient.invalidateQueries({ queryKey: getGetConversationMessagesQueryKey(serverConversationId) });
        // Also invalidate the list of conversations
        queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      }

    } catch (error) {
      console.error('Streaming error:', error);
      setIsStreaming(false);
      setStreamingContent('');
    }
  }, [conversationId, queryClient]);

  // Construct the final list of messages
  const displayMessages = [...combinedMessages];
  if (isStreaming) {
    displayMessages.push({
      id: Date.now() + 1,
      conversationId: conversationId || 0,
      role: 'assistant',
      content: streamingContent,
      createdAt: new Date().toISOString(),
      isStreaming: true
    } as any);
  }

  return {
    messages: displayMessages,
    isStreaming,
    sendMessage,
    conversationId,
    setConversationId,
    streamingContent
  };
}