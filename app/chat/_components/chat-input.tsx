// app/chat/_components/chat-input.tsx

import type React from "react"
import { Send, Sparkles, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import TextareaAutosize from 'react-textarea-autosize'
import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  onClear: () => void
}

export function ChatInput({ input, handleInputChange, handleSubmit, isLoading, onClear }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus input with keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        textareaRef.current?.focus()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Handle enter key submission
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (input.trim()) {
        const syntheticEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>
        handleSubmit(syntheticEvent)
      }
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 250, damping: 25 }}
      className={cn(
        "relative flex items-center gap-2 w-full glass-input frost-effect",
        "backdrop-blur-xl",
        "border border-glass-border",
        "rounded-[32px] transition-all duration-500 ease-out",
        "shadow-[0_20px_45px_-10px_rgba(0,0,0,0.08),0_12px_20px_-10px_rgba(0,0,0,0.04)]",
        "hover:shadow-[0_25px_50px_-10px_rgba(0,0,0,0.1),0_15px_25px_-10px_rgba(0,0,0,0.06)]",
        "focus-within:shadow-[0_30px_65px_-12px_rgba(0,0,0,0.12),0_18px_35px_-10px_rgba(0,0,0,0.08)]",
        "dark:shadow-[0_20px_45px_-10px_rgba(0,0,0,0.2),0_8px_20px_-7px_rgba(0,0,0,0.12)]",
        "dark:hover:shadow-[0_28px_60px_-10px_rgba(0,0,0,0.25),0_15px_30px_-10px_rgba(0,0,0,0.18)]",
        "dark:focus-within:shadow-[0_35px_75px_-12px_rgba(0,0,0,0.3),0_20px_40px_-15px_rgba(0,0,0,0.2)]",
        "py-3"
      )}
    >
      <div className="pl-4">
        <AnimatePresence mode="wait">
          <motion.div
            key="clear"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Button
              type="button"
              onClick={onClear}
              size="sm"
              variant="ghost"
              className={cn(
                "glass-button h-12 frost-effect",
                "bg-muted/15 hover:bg-muted/35",
                "transition-all duration-400",
                "hover:scale-105 active:scale-95",
                "shadow-[0_8px_20px_-6px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.06)]",
                "flex items-center gap-2.5",
                "px-4 sm:px-5"
              )}
            >
              <PlusCircle className="h-4 w-4 text-muted-foreground/60" />
              <span className="hidden sm:inline text-sm font-medium text-muted-foreground/80">New Chat</span>
              <span className="sr-only sm:hidden">New Chat</span>
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex-grow mx-1">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="thinking"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex items-center justify-center py-3 h-12 w-full"
            >
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className={cn(
                  "flex items-center justify-center h-8 w-8 rounded-full",
                  "bg-gradient-to-br from-primary/25 to-primary/5",
                  "shadow-[0_0_20px_-3px] shadow-primary/20",
                  "ring-1 ring-primary/20 animate-shimmer"
                )}>
                  <Sparkles className="h-4 w-4 text-primary animate-[pulse_3s_cubic-bezier(0.4,0,0.2,1)_infinite]" />
                </div>
                <div className="flex items-center gap-3">
                  <motion.span 
                    className={cn(
                      "text-lg font-medium",
                      "text-gradient",
                      "tracking-wide"
                    )}
                    animate={{ 
                      opacity: [0.7, 1, 0.7],
                      scale: [0.99, 1.01, 0.99],
                      filter: [
                        "brightness(0.95)",
                        "brightness(1.1)",
                        "brightness(0.95)"
                      ]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    Claude 3.7 Sonnet is thinking carefully
                  </motion.span>
                  <div className="flex gap-1.5 ml-1">
                    <motion.span 
                      className={cn(
                        "h-2 w-2 rounded-full",
                        "bg-gradient-to-br from-primary/60 to-primary/25",
                        "shadow-[0_0_10px_-1px] shadow-primary/30"
                      )}
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0 
                      }}
                    />
                    <motion.span 
                      className={cn(
                        "h-2 w-2 rounded-full",
                        "bg-gradient-to-br from-primary/60 to-primary/25",
                        "shadow-[0_0_10px_-1px] shadow-primary/30"
                      )}
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.3 
                      }}
                    />
                    <motion.span 
                      className={cn(
                        "h-2 w-2 rounded-full",
                        "bg-gradient-to-br from-primary/60 to-primary/25",
                        "shadow-[0_0_10px_-1px] shadow-primary/30"
                      )}
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.6 
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full"
            >
              <TextareaAutosize
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder="Message Claude 3.7 Sonnet..."
                className={cn(
                  "w-full py-3 px-4",
                  "text-base bg-transparent border-0 resize-none",
                  "placeholder:text-muted-foreground/30",
                  "focus:placeholder:opacity-10",
                  "focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg",
                  "transition duration-400 ease-out",
                  "max-h-[200px] min-h-[48px]",
                  "leading-normal",
                  "align-middle flex items-center"
                )}
                disabled={isLoading}
                minRows={1}
                maxRows={6}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="pr-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={isLoading ? "loading" : "send"}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="icon"
              variant="ghost"
              className={cn(
                "glass-button frost-effect h-12 w-12",
                "bg-primary/5 hover:bg-primary/15",
                "disabled:opacity-40 disabled:hover:bg-primary/5 disabled:hover:scale-100",
                isLoading && "animate-gentle-pulse"
              )}
            >
              <Send className={cn(
                "h-4.5 w-4.5 text-primary/90",
                "transition-transform duration-400 ease-out",
                "group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              )} />
              <span className="sr-only">Send message</span>
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.form>
  )
} 