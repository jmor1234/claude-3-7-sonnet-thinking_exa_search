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
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.3,
      opacity: { duration: 0.4 },
      y: { type: "spring", stiffness: 100, damping: 15 },
      scale: { duration: 0.25, ease: "easeOut" }
    }
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    scale: 0.98,
    transition: { duration: 0.25, ease: "easeIn" }
  }
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
      className="flex flex-col gap-6 ml-1 py-2"
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
                <motion.div
                  key={`text-${index}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.05 }}
                  className={cn(
                    "glass-card max-w-[85%]",
                    "px-6 py-4",
                    "mb-3 last:mb-0",
                    "shadow-lg"
                  )}
                  whileHover={{
                    y: -2,
                    boxShadow: "0 16px 30px -12px rgba(0,0,0,0.1), 0 4px 8px -2px rgba(0,0,0,0.05), inset 0 1px 0 0 rgba(255,255,255,0.1)"
                  }}
                >
                  <MarkdownContent 
                    content={cleanedText}
                    className={cn(
                      "text-[15.5px] tracking-[-0.01em]",
                      "selection:bg-primary/15 font-normal text-foreground/90 dark:text-foreground/95"
                    )}
                    isUser={false}
                  />
                </motion.div>
              );
            }
            
            return null;
          });
        })()
      ) : (
        // Fall back to legacy parsing for backward compatibility
        <>
          {reasoning.length > 0 && (
            <div className="space-y-4">
              {reasoning.map((block, index) => (
                <ReasoningBlockComponent key={`${block.type}-${block.iteration}-${index}`} block={block} />
              ))}
            </div>
          )}
          
          {finalResponse && (
            <motion.div 
              className="glass-card max-w-[85%] px-6 py-4 mb-3 last:mb-0 shadow-lg"
              whileHover={{
                y: -2,
                boxShadow: "0 16px 30px -12px rgba(0,0,0,0.1), 0 4px 8px -2px rgba(0,0,0,0.05), inset 0 1px 0 0 rgba(255,255,255,0.1)"
              }}
            >
              <MarkdownContent 
                content={finalResponse}
                className={cn(
                  "text-[15.5px] tracking-[-0.01em]",
                  "selection:bg-primary/15 font-normal text-foreground/90 dark:text-foreground/95"
                )}
                isUser={false}
              />
            </motion.div>
          )}
        </>
      )}

      {/* Display sources if available */}
      {sources.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mt-3"
        >
          <SourceBlock sources={sources} />
        </motion.div>
      )}
    </motion.div>
  );
} 