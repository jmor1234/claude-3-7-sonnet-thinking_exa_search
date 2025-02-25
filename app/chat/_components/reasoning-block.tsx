// app/chat/_components/reasoning-block.tsx

"use client"

import type { ReasoningBlock } from "./message-parser"
import { Brain, TestTubes, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, type KeyboardEvent } from "react"
import { cn } from "@/lib/utils"

interface ReasoningBlockProps {
  block: ReasoningBlock
}

const blockVariants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { height: "auto", opacity: 1 },
}

export function ReasoningBlockComponent({ block }: ReasoningBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const Icon = block.type === "thinking" ? Brain : TestTubes
  const title = block.type === "thinking" ? "Thinking" : "Stress Test"

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
      className="bg-muted/30 dark:bg-muted/20 rounded-xl overflow-hidden transition-all duration-200 hover:bg-muted/40 dark:hover:bg-muted/30 shadow-sm"
    >
      <button
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-controls={`content-${block.type}-${block.iteration}`}
        className={cn(
          "w-full p-2.5 flex items-center justify-between text-sm",
          "text-muted-foreground/80 hover:text-foreground/90",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
          "transition-all duration-200"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-background/50 dark:bg-background/30 shadow-sm">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          </div>
          <span className="text-sm font-medium">
            {title} {block.iteration > 1 ? `#${block.iteration}` : ""}
          </span>
        </div>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            isExpanded ? "rotate-180" : ""
          )}
        />
      </button>
      
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={`content-${block.type}-${block.iteration}`}
            role="region"
            aria-label={`${title} content`}
            variants={blockVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div className="px-4 pb-3 pt-1 border-t border-muted/30 dark:border-muted/40 bg-muted/10 dark:bg-muted/5">
              <p className="text-sm text-muted-foreground/90 whitespace-pre-wrap leading-relaxed">
                {block.content}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 