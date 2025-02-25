// app/chat/_components/markdown-content.tsx

import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { cn } from '@/lib/utils'

interface MarkdownContentProps {
  content: string
  className?: string
  isUser?: boolean
  isReasoning?: boolean
}

export function MarkdownContent({ content, className, isUser, isReasoning }: MarkdownContentProps) {
  return (
    <div className={cn(
      "prose prose-sm max-w-none",
      "prose-headings:mb-6 prose-headings:mt-4 prose-headings:font-bold",
      "prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg",
      "prose-p:leading-relaxed prose-p:mb-4 prose-p:last:mb-0",
      "prose-strong:font-semibold prose-em:italic",
      "prose-pre:p-0 prose-pre:bg-transparent prose-pre:my-4",
      "prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm",
      "prose-ul:my-4 prose-ul:list-disc prose-ul:pl-8",
      "prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-8",
      "prose-li:my-2 prose-li:pl-2",
      "prose-blockquote:border-l-2 prose-blockquote:pl-6 prose-blockquote:my-6 prose-blockquote:italic",
      "[&_sup]:text-xs [&_sup]:ml-0.5",
      "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
      isReasoning
        ? [
            "dark:prose-invert",
            "prose-p:text-muted-foreground/80",
            "prose-p:leading-normal prose-p:mb-2 prose-p:mt-0",
            "prose-a:text-muted-foreground/80 prose-a:hover:text-muted-foreground prose-a:font-normal",
            "prose-code:bg-muted/20",
            "prose-li:text-muted-foreground/80 prose-li:my-1",
            "prose-ol:my-2 prose-ol:pl-8",
            "prose-ul:my-2 prose-ul:pl-6",
            "prose-headings:text-muted-foreground/90 prose-headings:my-3 prose-headings:mb-2",
            "prose-blockquote:border-muted prose-blockquote:my-3 prose-blockquote:py-1",
            "[&>*]:my-2"
          ]
        : isUser 
          ? [
              "prose-invert",
              "prose-p:text-foreground prose-p:font-medium",
              "prose-a:text-foreground prose-a:hover:text-foreground prose-a:font-medium",
              "prose-code:bg-foreground/20",
              "prose-li:text-foreground",
              "prose-headings:text-foreground",
              "prose-blockquote:border-foreground/30"
            ]
          : [
              "dark:prose-invert",
              "prose-p:text-foreground/90",
              "prose-a:text-foreground/90 prose-a:hover:text-foreground prose-a:font-medium",
              "prose-code:bg-muted",
              "prose-li:text-foreground/90",
              "prose-headings:text-foreground",
              "prose-blockquote:border-border"
            ],
      className
    )}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code(props) {
            const { children, className, ...rest } = props
            const match = /language-(\w+)/.exec(className || '')
            return match ? (
              <SyntaxHighlighter
                language={match[1]}
                PreTag="div"
                style={vscDarkPlus}
                className="rounded-md !my-4 !bg-muted/50"
                customStyle={{
                  margin: 0,
                  padding: '1.25rem',
                  backgroundColor: 'transparent',
                  fontSize: '0.875rem',
                  lineHeight: '1.5'
                }}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code {...rest} className={cn(
                "bg-muted/50 px-1.5 py-0.5 rounded font-mono text-sm",
                isUser ? "text-primary-foreground font-medium bg-primary/10" : 
                isReasoning ? "text-muted-foreground/80 bg-muted/20" : 
                "text-foreground"
              )}>
                {children}
              </code>
            )
          },
          a: ({ href, ...props }) => {
            let formattedHref = href || '';
            
            try {
              // Decode URL-encoded characters
              formattedHref = decodeURIComponent(formattedHref);
              
              // Add protocol if missing
              if (formattedHref && !formattedHref.startsWith('http://') && !formattedHref.startsWith('https://')) {
                formattedHref = `https://${formattedHref}`;
              }
            } catch (e) {
              // If decoding fails, use original href and log error
              console.warn('Failed to decode URL:', e);
              formattedHref = href || '';
            }
            
            return (
              <a
                href={formattedHref}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-1 underline-offset-4 hover:decoration-2 transition-all"
                {...props}
              />
            );
          },
          ul: ({ ...props }) => (
            <ul className={cn(
              "my-2 ml-4 list-disc space-y-1",
              isReasoning && "space-y-0.5"
            )} {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className={cn(
              "my-2 ml-4 list-decimal space-y-1",
              isReasoning && "ml-0 pl-7 list-outside"
            )} {...props} />
          ),
          p: ({ ...props }) => (
            <p className={cn(
              "mb-2 last:mb-0 leading-relaxed",
              isReasoning && "leading-normal mb-1.5"
            )} {...props} />
          ),
          li: ({ ...props }) => (
            <li className={cn(
              "relative pl-2",
              isReasoning && "pl-1 ml-0"
            )} {...props} />
          ),
          h1: ({ ...props }) => (
            <h1 className="border-b pb-2 border-border/40" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="border-b pb-2 border-border/30" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
} 