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
  initial: { opacity: 0, y: 15, scale: 0.97 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { 
      duration: 0.5, 
      y: { type: "spring", stiffness: 80, damping: 15 },
      scale: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
      opacity: { duration: 0.4 }
    } 
  },
  exit: { 
    opacity: 0, 
    y: -15, 
    scale: 0.97, 
    transition: { 
      duration: 0.35, 
      ease: [0.32, 0.72, 0, 1]
    } 
  },
}

const containerVariants = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    transition: { 
      duration: 0.6,
      staggerChildren: 0.15,
      ease: [0.16, 1, 0.3, 1]
    } 
  },
}

// Enhanced loading animation variants
const loadingVariants = {
  initial: { opacity: 0, scale: 0.92, y: 15 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.92, 
    y: -15,
    transition: {
      duration: 0.35,
      ease: [0.32, 0.72, 0, 1]
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
      className={cn(
        "min-h-[calc(100vh-48px)] flex flex-col pt-14",
        "bg-gradient-to-b from-background/90 via-background/95 to-background/90",
        "relative overflow-hidden"
      )}
    >
      {/* Premium background effects */}
      <div className="absolute inset-0 z-[-1] bg-[radial-gradient(#00000002_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff01_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute inset-0 z-[-2] opacity-30 bg-[linear-gradient(to_right,transparent_0%,rgba(var(--primary-rgb),0.05)_50%,transparent_100%)]" style={{"--primary-rgb": "var(--primary)".replace("hsl(", "").replace(")", "").split(" ")[0]} as React.CSSProperties} />
      <div className="absolute inset-0 z-[-3] opacity-60">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[35%] rounded-full bg-primary/[0.02] filter blur-[80px]" />
        <div className="absolute bottom-[-5%] left-[-10%] w-[50%] h-[40%] rounded-full bg-primary/[0.01] filter blur-[100px]" />
      </div>
      
      <ScrollArea 
        className={cn(
          "flex-grow px-4 md:px-6 lg:px-8 py-6 custom-scrollbar",
          "transition-opacity duration-500 ease-in-out",
          "max-w-5xl mx-auto w-full",
          isLoading && !isStreaming && "opacity-40"
        )} 
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <motion.div 
            variants={messageVariants}
            className="flex flex-col items-center justify-center h-[70vh] text-muted-foreground"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1]
              }}
              className={cn(
                "flex items-center justify-center w-20 h-20 mb-10 rounded-3xl",
                "glass-panel-elevated backdrop-blur-2xl frost-effect",
                "shadow-[0_18px_35px_-8px_rgba(0,0,0,0.1),inset_0_1px_0_0_rgba(255,255,255,0.1)]",
                "border border-neutral-200/15 dark:border-neutral-700/25",
                "transition-all duration-500 ease-out"
              )}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 150,
                  damping: 15,
                  delay: 0.4
                }}
                className="p-5 flex items-center justify-center"
              >
                <MessageSquare className="h-10 w-10 opacity-50 text-primary/40 animate-shimmer" />
              </motion.div>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-xl mb-3 font-medium text-gradient animate-shimmer"
            >
              Start a conversation with Claude 3.7 Sonnet
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-sm mt-1 opacity-70 text-center max-w-md"
            >
              Experience Claude&apos;s advanced reasoning and contextual understanding capabilities
            </motion.p>
          </motion.div>
        ) : (
          <div className="space-y-10 pb-28">
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
                      className="user-glass-card max-w-[85%] md:max-w-[75%] px-5 py-4 shadow-lg"
                      whileHover={{ y: -3, boxShadow: "0 24px 45px -12px rgba(0,0,0,0.14), inset 0 1px 0 0 rgba(255,255,255,0.08)"}}
                    >
                      <MarkdownContent 
                        content={message.content}
                        className="text-sm leading-relaxed font-medium text-primary/90 dark:text-primary/95"
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
                  "flex items-center gap-3.5 text-muted-foreground",
                  "glass-panel rounded-full pl-4 pr-5 py-3",
                  "animate-gentle-pulse"
                )}>
                  <div className={cn(
                    "flex items-center justify-center h-7 w-7 rounded-full",
                    "bg-primary/15 backdrop-blur-2xl",
                    "border border-primary/20",
                    "shadow-[0_0_20px_-2px] shadow-primary/15"
                  )}>
                    <Sparkles className="h-4 w-4 text-primary animate-shimmer" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      <motion.span
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                        className="h-2 w-2 rounded-full bg-primary/50 shadow-[0_0_10px_-1px] shadow-primary/30"
                      />
                      <motion.span
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                        className="h-2 w-2 rounded-full bg-primary/50 shadow-[0_0_10px_-1px] shadow-primary/30"
                      />
                      <motion.span
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                        className="h-2 w-2 rounded-full bg-primary/50 shadow-[0_0_10px_-1px] shadow-primary/30"
                      />
                    </div>
                    <span className="text-sm font-medium text-gradient animate-shimmer">Claude is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "p-5 text-sm text-center text-destructive",
                  "bg-destructive/8 rounded-xl frost-effect",
                  "glass-panel border border-destructive/25",
                  "shadow-[0_15px_40px_-15px_rgba(220,38,38,0.2)]"
                )}
              >
                {error.message}
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      <div className="fixed bottom-0 left-0 right-0 bg-background/60 backdrop-blur-2xl border-t border-neutral-200/10 dark:border-neutral-800/15">
        <div className="max-w-5xl mx-auto w-full px-4 md:px-6 lg:px-8 py-5">
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