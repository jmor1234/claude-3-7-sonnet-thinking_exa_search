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
        "relative flex items-center gap-2 w-full glass-input",
        "backdrop-blur-2xl",
        "border border-glass-border/70",
        "rounded-[28px] transition-all duration-500 ease-out",
        "shadow-[0_15px_35px_-12px_rgba(0,0,0,0.04)]",
        "hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.06)]",
        "focus-within:shadow-[0_25px_55px_-12px_rgba(0,0,0,0.08)]",
        "dark:shadow-[0_15px_35px_-10px_rgba(0,0,0,0.15)]",
        "dark:hover:shadow-[0_22px_50px_-10px_rgba(0,0,0,0.2)]",
        "dark:focus-within:shadow-[0_28px_65px_-12px_rgba(0,0,0,0.25)]",
        "py-2.5"
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
                "glass-button h-10 frost-effect",
                "bg-muted/10 hover:bg-muted/20",
                "transition-all duration-400",
                "hover:scale-103 active:scale-97",
                "shadow-[0_6px_16px_-6px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_20px_-8px_rgba(0,0,0,0.06)]",
                "flex items-center gap-2",
                "px-3.5 sm:px-4"
              )}
            >
              <PlusCircle className="h-4 w-4 text-muted-foreground/60" />
              <span className="hidden sm:inline text-sm font-medium text-muted-foreground/70">New Chat</span>
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
              className="flex items-center justify-center py-2.5 h-10 w-full"
            >
              <div className="flex items-center gap-3 text-muted-foreground/80">
                <div className={cn(
                  "flex items-center justify-center h-6 w-6 rounded-full",
                  "bg-primary/10 backdrop-blur-3xl",
                  "border border-primary/15",
                  "shadow-[0_0_15px_-2px] shadow-primary/10"
                )}>
                  <Sparkles className="h-3.5 w-3.5 text-primary/80 animate-shimmer" />
                </div>
                <span className="text-sm font-normal text-gradient animate-shimmer opacity-90">Thinking...</span>
                <div className="flex gap-1 ml-1">
                  <motion.span 
                    className="h-1.5 w-1.5 rounded-full bg-primary/40 shadow-[0_0_8px_-1px] shadow-primary/20"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.9, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                  />
                  <motion.span 
                    className="h-1.5 w-1.5 rounded-full bg-primary/40 shadow-[0_0_8px_-1px] shadow-primary/20"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.9, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                  />
                  <motion.span 
                    className="h-1.5 w-1.5 rounded-full bg-primary/40 shadow-[0_0_8px_-1px] shadow-primary/20"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.9, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                  />
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
                  "w-full py-2.5 px-4",
                  "text-base bg-transparent border-0 resize-none",
                  "placeholder:text-muted-foreground/25",
                  "focus:placeholder:opacity-0",
                  "focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg",
                  "transition duration-300 ease-out",
                  "max-h-[200px] min-h-[45px]",
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
                "glass-button frost-effect h-10 w-10",
                "bg-primary/5 hover:bg-primary/10",
                "disabled:opacity-40 disabled:hover:bg-primary/5 disabled:hover:scale-100",
                isLoading && "animate-gentle-pulse"
              )}
            >
              <Send className={cn(
                "h-4 w-4 text-primary/80",
                "transition-transform duration-300 ease-out",
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