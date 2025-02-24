// app/chat/_components/ai-message.tsx

import { Message } from 'ai';
import { parseMessage } from './message-parser';
import { ReasoningBlockComponent } from './reasoning-block';
import { ReasoningPartComponent } from './reasoning-part';
import { SourceBlock } from './source-block';
import { motion } from 'framer-motion';
import { MarkdownContent } from './markdown-content';
import { cn } from '@/lib/utils';

// Define types for the message parts
type TextPart = {
  type: 'text';
  text: string;
};

// Update ReasoningPart to match the structure expected in UIMessage
type ReasoningPart = {
  type: 'reasoning';
  reasoning: string;
  details: Array<{ type: 'text'; text: string; signature?: string } | { type: 'redacted'; data: string }>;
};

type MessagePart = TextPart | ReasoningPart;

// Extend the Message type to include parts
interface ExtendedMessage extends Message {
  parts?: MessagePart[];
}

interface AIMessageProps {
  message: ExtendedMessage;
}

const messageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

// Function to clean any possible remaining source tags from text content
const cleanSourceTags = (content: string): string => {
  // Handle both <sources> tags and numbered references like [1], [2] at the end of sentences
  return content
    .replace(/<sources>[\s\S]*?<\/sources>/g, '') // Remove any source XML tags
    .replace(/\s*\[\d+\](?:,\s*\[\d+\])*\s*(?=\.|$)/g, '.') // Remove citation numbers [1], [2] at end of sentences
    .trim();
};

export function AIMessage({ message }: AIMessageProps) {
  // Parse the message content to extract sources and clean the final response
  const { reasoning, finalResponse, sources } = parseMessage(message.content);
  
  // Ensure the parts are of the correct type
  const safeParts = message.parts?.filter(
    part => part.type === 'text' || part.type === 'reasoning'
  ) as MessagePart[] | undefined;
  
  return (
    <motion.div
      variants={messageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-4"
    >
      {/* Handle message parts if they exist */}
      {safeParts && safeParts.length > 0 ? (
        (() => {
          return safeParts.map((part, index) => {
            if (part.type === 'reasoning') {
              return (
                <ReasoningPartComponent 
                  key={`reasoning-${index}`} 
                  part={part} 
                  isStreaming={index === safeParts.length - 1 && !part.details.length}
                />
              );
            }
            
            if (part.type === 'text') {
              // Clean any source tags from structured text parts
              const cleanedText = cleanSourceTags(part.text);
              
              return (
                <div 
                  key={`text-${index}`}
                  className={cn(
                    "bg-card text-card-foreground rounded-[22px] px-6 py-4 max-w-[85%]",
                    "hover:bg-card/98 transition-all duration-300 ease-out",
                    "shadow-[0_2px_12px_-3px_rgba(0,0,0,0.08),0_2px_4px_-1px_rgba(0,0,0,0.04)]", 
                    "hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.12),0_2px_6px_-1px_rgba(0,0,0,0.08)]",
                    "border border-border/10",
                    "mb-5 last:mb-0",
                    "backdrop-blur-sm",
                    "dark:bg-card/95 dark:hover:bg-card/98"
                  )}
                >
                  <MarkdownContent 
                    content={cleanedText}
                    className={cn(
                      "text-[15.5px] tracking-[-0.01em]",
                      "selection:bg-primary/15"
                    )}
                    isUser={false}
                  />
                </div>
              );
            }
            
            return null;
          });
        })()
      ) : (
        // Fall back to legacy parsing for backward compatibility
        <>
          {reasoning.length > 0 && (
            <div className="space-y-2">
              {reasoning.map((block, index) => (
                <ReasoningBlockComponent key={`${block.type}-${block.iteration}-${index}`} block={block} />
              ))}
            </div>
          )}
          
          {finalResponse && (
            <div className={cn(
              "bg-card text-card-foreground rounded-[22px] px-6 py-4 max-w-[85%]",
              "hover:bg-card/98 transition-all duration-300 ease-out",
              "shadow-[0_2px_12px_-3px_rgba(0,0,0,0.08),0_2px_4px_-1px_rgba(0,0,0,0.04)]", 
              "hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.12),0_2px_6px_-1px_rgba(0,0,0,0.08)]",
              "border border-border/10",
              "mb-5 last:mb-0",
              "backdrop-blur-sm",
              "dark:bg-card/95 dark:hover:bg-card/98"
            )}>
              <MarkdownContent 
                content={finalResponse}
                className={cn(
                  "text-[15.5px] tracking-[-0.01em]",
                  "selection:bg-primary/15"
                )}
                isUser={false}
              />
            </div>
          )}
        </>
      )}

      {/* Display sources if available */}
      {sources.length > 0 && (
        <div className="mt-2">
          <SourceBlock sources={sources} />
        </div>
      )}
    </motion.div>
  );
} 