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
      transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "relative flex items-end gap-2 w-full glass-input",
        "backdrop-blur-xl",
        "border border-glass-border",
        "rounded-[28px] transition-all duration-300 ease-out",
        "shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.05)]",
        "hover:shadow-[0_14px_40px_-5px_rgba(0,0,0,0.12),0_10px_15px_-3px_rgba(0,0,0,0.07)]",
        "focus-within:shadow-[0_18px_50px_-6px_rgba(0,0,0,0.15),0_12px_20px_-6px_rgba(0,0,0,0.1)]",
        "dark:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.2),0_4px_10px_-3px_rgba(0,0,0,0.1)]",
        "dark:hover:shadow-[0_16px_45px_-5px_rgba(0,0,0,0.25),0_8px_15px_-6px_rgba(0,0,0,0.15)]",
        "dark:focus-within:shadow-[0_20px_60px_-6px_rgba(0,0,0,0.3),0_12px_25px_-10px_rgba(0,0,0,0.15)]"
      )}
    >
      <div className="pl-3.5 pb-2.5">
        <AnimatePresence mode="wait">
          <motion.div
            key="clear"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <Button
              type="button"
              onClick={onClear}
              size="sm"
              variant="ghost"
              className={cn(
                "glass-button h-11",
                "bg-muted/30 hover:bg-muted/50",
                "transition-all duration-300",
                "hover:scale-105 active:scale-95",
                "shadow-[0_4px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_14px_-6px_rgba(0,0,0,0.08)]",
                "flex items-center gap-2",
                "px-3 sm:px-4"
              )}
            >
              <PlusCircle className="h-4 w-4 text-muted-foreground/60" />
              <span className="hidden sm:inline text-sm font-medium text-muted-foreground/70">New / Clear Chat</span>
              <span className="sr-only sm:hidden">New / Clear Chat</span>
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex-grow relative min-h-[56px]">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="thinking"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center justify-center h-[56px] w-full"
            >
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className={cn(
                  "flex items-center justify-center h-7 w-7 rounded-full",
                  "bg-gradient-to-br from-primary/20 to-primary/10",
                  "shadow-[0_0_12px_-3px] shadow-primary/20",
                  "ring-1 ring-primary/20"
                )}>
                  <Sparkles className="h-4 w-4 text-primary animate-[pulse_2s_ease-in-out_infinite]" />
                </div>
                <div className="flex items-center gap-3">
                  <motion.span 
                    className={cn(
                      "text-lg font-medium",
                      "text-gradient",
                      "tracking-wide"
                    )}
                    animate={{ 
                      opacity: [0.5, 1, 0.5],
                      scale: [0.98, 1, 0.98],
                      filter: [
                        "brightness(0.9)",
                        "brightness(1.1)",
                        "brightness(0.9)"
                      ]
                    }}
                    transition={{
                      duration: 1.8,
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
                        "bg-gradient-to-br from-primary/50 to-primary/30",
                        "shadow-[0_0_8px_-2px] shadow-primary/30"
                      )}
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0 
                      }}
                    />
                    <motion.span 
                      className={cn(
                        "h-2 w-2 rounded-full",
                        "bg-gradient-to-br from-primary/50 to-primary/30",
                        "shadow-[0_0_8px_-2px] shadow-primary/30"
                      )}
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.2 
                      }}
                    />
                    <motion.span 
                      className={cn(
                        "h-2 w-2 rounded-full",
                        "bg-gradient-to-br from-primary/50 to-primary/30",
                        "shadow-[0_0_8px_-2px] shadow-primary/30"
                      )}
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.4 
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
              className="w-full"
            >
              <TextareaAutosize
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder="Message the new Claude 3.7 Sonnet..."
                className={cn(
                  "w-full py-3.5 px-5 text-base bg-transparent border-0 resize-none",
                  "placeholder:text-muted-foreground/40",
                  "focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg",
                  "transition duration-200",
                  "min-h-[56px] max-h-[200px]"
                )}
                disabled={isLoading}
                minRows={1}
                maxRows={6}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="pr-3.5 pb-2.5">
        <AnimatePresence mode="wait">
          <motion.div
            key={isLoading ? "loading" : "send"}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="icon"
              variant="ghost"
              className={cn(
                "glass-button h-11 w-11",
                "bg-primary/5 hover:bg-primary/10",
                "disabled:opacity-40 disabled:hover:bg-primary/5 disabled:hover:scale-100",
                isLoading && "animate-pulse"
              )}
            >
              <Send className={cn(
                "h-4 w-4 text-primary/80",
                "transition-transform duration-200 ease-out",
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