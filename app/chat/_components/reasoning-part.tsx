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
    details: Array<{ type: 'text'; text: string }>;
  };
  isStreaming?: boolean;
}

const blockVariants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { height: "auto", opacity: 1 },
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
      className="bg-muted/30 rounded-lg overflow-hidden transition-all duration-200 hover:bg-muted/40"
    >
      <button
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-controls="reasoning-content"
        className={cn(
          "w-full p-3 flex items-center justify-between text-sm font-medium",
          "text-muted-foreground hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "transition-all duration-200"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-background/50">
            <Brain className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="text-sm font-medium">
            {isStreaming ? "Reasoning..." : "Reasoning"}
          </span>
        </div>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isExpanded ? "rotate-180" : ""
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
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div className="px-4 pb-3 pt-1">
              <div className="text-sm text-muted-foreground space-y-3">
                {part.details.map((detail, index) => (
                  <div key={index} className="whitespace-pre-wrap leading-relaxed">
                    <MarkdownContent 
                      content={detail.text}
                      className="text-sm"
                      isUser={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 