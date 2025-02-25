"use client";

import Link from "next/link";
import { Bot } from "lucide-react";
import { ModeToggle } from "../darkMode";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "sticky top-0 z-50 w-full",
        "bg-background/40 backdrop-blur-2xl",
        "border-b border-neutral-200/30 dark:border-neutral-800/40",
        "shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)]",
        "dark:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.4)]",
        "after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/10 after:to-transparent after:dark:from-white/5",
        "transition duration-300 ease-in-out"
      )}
    >
      <div className="relative z-10 mx-auto flex h-14 items-center justify-between px-4 sm:px-8 max-w-7xl">
        <Link 
          href="/" 
          className="flex items-center space-x-4 group"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 15 }}
            className={cn(
              "relative flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden",
              "bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10",
              "dark:bg-gradient-to-br dark:from-primary/40 dark:via-primary/25 dark:to-primary/15",
              "ring-2 ring-white/20 dark:ring-white/10",
              "shadow-[0_10px_20px_-8px_rgba(0,0,0,0.15),0_4px_10px_-3px_rgba(0,0,0,0.1),inset_0_1px_0_0_rgba(255,255,255,0.1)]",
              "dark:shadow-[0_10px_25px_-8px_rgba(0,0,0,0.4),0_4px_15px_-3px_rgba(0,0,0,0.2),inset_0_1px_0_0_rgba(255,255,255,0.05)]",
              "transition-all duration-300 ease-out",
              "group-hover:from-primary/40 group-hover:via-primary/30 group-hover:to-primary/20",
              "dark:group-hover:from-primary/50 dark:group-hover:via-primary/35 dark:group-hover:to-primary/25",
              "group-hover:ring-white/30 dark:group-hover:ring-white/15",
              "group-hover:scale-110",
              "group-hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.2),0_6px_15px_-3px_rgba(0,0,0,0.15),inset_0_1px_0_0_rgba(255,255,255,0.15)]",
              "dark:group-hover:shadow-[0_15px_35px_-10px_rgba(0,0,0,0.5),0_6px_20px_-3px_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.08)]"
            )}
            whileHover={{ 
              rotate: [0, -5, 0, 5, 0],
              scale: 1.1,
              transition: { duration: 0.5, ease: "easeInOut" }
            }}
          >
            <motion.div 
              className="absolute inset-0 opacity-60"
              style={{
                background: "linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)",
                backgroundSize: "200% 200%"
              }}
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <Bot className={cn(
              "h-5 w-5 text-white dark:text-white",
              "filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]",
              "transition-all duration-300",
              "group-hover:text-white group-hover:drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
            )} />
          </motion.div>
          
          <motion.div 
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1, type: "spring", stiffness: 120 }}
            className="relative"
          >
            <motion.div
              className={cn(
                "absolute -inset-1 rounded-lg opacity-0 blur-xl",
                "bg-gradient-to-r from-primary/20 to-primary/5",
                "dark:from-primary/30 dark:to-primary/10",
                "transition-opacity duration-300",
                "group-hover:opacity-100"
              )}
              initial={false}
              animate={{ opacity: [0, 0.7, 0] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                repeatType: "reverse" 
              }}
            />
            
            <span className={cn(
              "relative text-sm font-bold sm:text-base tracking-tight",
              "bg-clip-text text-transparent",
              "bg-gradient-to-r from-primary via-primary/90 to-primary/80",
              "dark:from-white dark:via-primary dark:to-primary/90",
              "filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_1px_3px_rgba(0,0,0,0.2)]",
              "transition-all duration-300"
            )}>
              Claude 3.7 Sonnet With Thinking and Contextual Search
            </span>
          </motion.div>
        </Link>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className={cn(
            "rounded-full p-0.5",
            "bg-white/10 dark:bg-white/5",
            "backdrop-blur-md",
            "ring-1 ring-white/20 dark:ring-white/10",
            "shadow-[0_4px_12px_-6px_rgba(0,0,0,0.2)]",
            "dark:shadow-[0_4px_15px_-6px_rgba(0,0,0,0.4)]",
            "transition-all duration-300 hover:scale-105",
            "hover:bg-white/15 dark:hover:bg-white/10",
            "hover:ring-white/30 dark:hover:ring-white/15",
            "hover:shadow-[0_6px_18px_-8px_rgba(0,0,0,0.25)]",
            "dark:hover:shadow-[0_6px_20px_-8px_rgba(0,0,0,0.5)]"
          )}
        >
          <ModeToggle />
        </motion.div>
      </div>
    </motion.header>
  );
} 