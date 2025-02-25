"use client"

import { Brain, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, type KeyboardEvent } from "react"
import { cn } from "@/lib/utils"
import { MarkdownContent } from './markdown-content'

interface ReasoningPartProps {
  part: {
    type: 'reasoning';
    reasoning: string;
    details: Array<{ type: 'text'; text: string; signature?: string } | { type: 'redacted'; data: string }>;
  };
  isStreaming?: boolean;
}

const blockVariants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { 
    height: "auto", 
    opacity: 1,
    transition: {
      height: { duration: 0.3, ease: "easeOut" },
      opacity: { duration: 0.4, ease: "easeOut" }
    }
  },
}

export function ReasoningPartComponent({ part, isStreaming = false }: ReasoningPartProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "rounded-lg overflow-hidden",
        "transition-all duration-300 ease-out",
        "max-w-[92%] bg-muted/30 dark:bg-muted/20 backdrop-blur-md",
        "border border-muted/40 dark:border-muted/30",
        "shadow-[0_8px_16px_-6px_rgba(0,0,0,0.08)]"
      )}
    >
      <button
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-controls="reasoning-content"
        className={cn(
          "w-full p-3.5 flex items-center justify-between",
          "text-muted-foreground hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "transition-all duration-200",
          "hover:bg-muted/10 active:bg-muted/20",
          "rounded-t-lg"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-1.5 rounded-full",
            "bg-muted/30 backdrop-blur-md",
            "border border-muted/40",
            "shadow-sm"
          )}>
            <Brain className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <span className={cn(
            "text-sm font-medium tracking-tight",
            isStreaming ? "animate-gentle-pulse" : ""
          )}>
            {isStreaming ? "Reasoning..." : "Reasoning"}
          </span>
        </div>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "h-4 w-4 transition-transform duration-300 ease-out",
            isExpanded ? "rotate-180" : "",
            "text-muted-foreground/70"
          )}
        />
      </button>
      
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id="reasoning-content"
            role="region"
            aria-label="Reasoning content"
            variants={blockVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
          >
            <div className={cn(
              "px-5 pb-4 pt-1",
              "border-t border-muted/20 dark:border-muted/30 bg-muted/10 dark:bg-muted/5",
              "bg-[radial-gradient(#00000005_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff03_1px,transparent_1px)]",
              "bg-[size:20px_20px]"
            )}>
              <div className="text-sm text-muted-foreground space-y-2">
                {part.details.map((detail, index) => (
                  <motion.div 
                    key={index} 
                    className="whitespace-pre-wrap leading-normal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    {detail.type === 'text' ? (
                      <MarkdownContent 
                        content={detail.text}
                        className="text-sm text-muted-foreground/80"
                        isUser={false}
                        isReasoning={true}
                      />
                    ) : (
                      <div className="text-muted italic opacity-60">[Redacted content]</div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 