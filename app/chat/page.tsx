// app/chat/page.tsx

'use client'

import type React from "react"
import { useChat } from "ai/react"
import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MessageSquare, Sparkles } from "lucide-react"
import { AIMessage } from "./_components/ai-message"
import { ChatInput } from "./_components/chat-input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { MarkdownContent } from "./_components/markdown-content"

// Types to match what's used in the app
type TextUIPart = { type: 'text'; text: string; }
type ReasoningUIPart = { 
  type: 'reasoning'; 
  reasoning: string; 
  details: Array<{ type: 'text'; text: string; signature?: string; } | { type: 'redacted'; data: string; }>;
}

const messageVariants = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { 
      duration: 0.4, 
      y: { type: "spring", stiffness: 100, damping: 15 },
      scale: { duration: 0.25, ease: "easeOut" },
      opacity: { duration: 0.3 }
    } 
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    scale: 0.98, 
    transition: { 
      duration: 0.25, 
      ease: "easeIn" 
    } 
  },
}

const containerVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    transition: { 
      duration: 0.4,
      staggerChildren: 0.1
    } 
  },
}

// Add new loading animation variants
const loadingVariants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: -10,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
}

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [userScrolled, setUserScrolled] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const lastMessageRef = useRef<string>("")

  // Detect when AI is streaming a response
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === "assistant") {
      if (lastMessage.content !== lastMessageRef.current) {
        lastMessageRef.current = lastMessage.content
        setIsStreaming(true)
      }
    } else {
      setIsStreaming(false)
    }
  }, [messages])

  // Reset streaming state when loading starts
  useEffect(() => {
    if (isLoading) {
      setIsStreaming(false)
      lastMessageRef.current = ""
    }
  }, [isLoading])

  // Handle scroll events
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollHeight, scrollTop, clientHeight } = event.currentTarget
    const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10
    setUserScrolled(!isAtBottom)
  }

  // Scroll to bottom only when appropriate
  useEffect(() => {
    const shouldAutoScroll =
      messages[messages.length - 1]?.role === "user" ||
      (isLoading && !isStreaming && !userScrolled) ||
      (!userScrolled && messages[messages.length - 1]?.role === "assistant" && !isStreaming)

    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isLoading, userScrolled, isStreaming])

  const handleClear = () => {
    setMessages([])
    setIsStreaming(false)
    lastMessageRef.current = ""
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="min-h-[calc(100vh-48px)] flex flex-col pt-12 bg-gradient-to-b from-background to-background/95"
    >
      <ScrollArea 
        className={cn(
          "flex-grow px-4 md:px-6 lg:px-8 py-6 custom-scrollbar",
          "transition-opacity duration-300",
          "max-w-5xl mx-auto w-full",
          isLoading && !isStreaming && "opacity-50"
        )} 
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <motion.div 
            variants={messageVariants}
            className="flex flex-col items-center justify-center h-[70vh] text-muted-foreground"
          >
            <div className={cn(
              "flex items-center justify-center w-16 h-16 mb-6 rounded-full",
              "bg-background/50 backdrop-blur-sm",
              "shadow-[0_8px_16px_-6px_rgba(0,0,0,0.1),inset_0_1px_0_0_rgba(255,255,255,0.1)]",
              "border border-neutral-200/10 dark:border-neutral-700/30"
            )}>
              <MessageSquare className="h-8 w-8 opacity-50 text-primary/50" />
            </div>
            <p className="text-base">Start a conversation with Claude 3.7 Sonnet...</p>
            <p className="text-sm mt-2 opacity-70">Type a message below to the best model in the world</p>
          </motion.div>
        ) : (
          <div className="space-y-8 pb-24">
            <AnimatePresence initial={false} mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  variants={messageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "user" ? (
                    <motion.div 
                      className="glass-card bg-primary/15 dark:bg-primary/20 backdrop-blur-sm max-w-[85%] md:max-w-[75%] px-5 py-3.5 border-primary/30"
                      whileHover={{ y: -2, boxShadow: "0 14px 28px -8px rgba(0,0,0,0.15), inset 0 1px 0 0 rgba(255,255,255,0.1)"}}
                    >
                      <MarkdownContent 
                        content={message.content}
                        className="text-sm leading-relaxed text-foreground font-medium"
                        isUser={true}
                      />
                    </motion.div>
                  ) : (
                    <AIMessage 
                      message={{
                        ...message,
                        parts: message.parts?.filter(
                          part => part.type === 'text' || part.type === 'reasoning'
                        ) as (TextUIPart | ReasoningUIPart)[]
                      }} 
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && !isStreaming && (
              <motion.div 
                variants={loadingVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex justify-start"
              >
                <div className={cn(
                  "flex items-center gap-3 text-muted-foreground",
                  "glass-panel rounded-full pl-3 pr-4 py-2.5",
                  "animate-gentle-pulse"
                )}>
                  <div className={cn(
                    "flex items-center justify-center h-6 w-6 rounded-full",
                    "bg-primary/20 backdrop-blur-md",
                    "border border-primary/30",
                    "shadow-[0_0_10px_-2px] shadow-primary/20"
                  )}>
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce" />
                    </div>
                    <span className="text-sm font-medium text-gradient">Thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "p-4 text-sm text-center text-destructive",
                  "bg-destructive/10 rounded-lg",
                  "glass-panel border border-destructive/30"
                )}
              >
                {error.message}
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      <div className="fixed bottom-0 left-0 right-0 bg-background/60 backdrop-blur-xl border-t border-neutral-200/20 dark:border-neutral-800/30">
        <div className="max-w-5xl mx-auto w-full px-4 md:px-6 lg:px-8 py-4">
          <ChatInput
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            onClear={handleClear}
          />
        </div>
      </div>
    </motion.div>
  )
}