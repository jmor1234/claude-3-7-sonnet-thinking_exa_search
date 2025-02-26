// app/chat/_components/message-parser.ts

export interface Source {
  number: number
  url: string
  title?: string | undefined
}

export interface ParsedMessage {
  content: string
  sources: Source[]
}

export function parseMessage(content: string): ParsedMessage {
  if (!content) {
    return { content: "", sources: [] }
  }

  let sources: Source[] = []
  let cleanedContent = content

  try {
    // Only keep the sources regex pattern
    const sourcesRegex = /<sources>([\s\S]*?)<\/sources>/g
    
    // Extract sources if present
    const sourcesMatch = sourcesRegex.exec(content)
    if (sourcesMatch) {
      const sourcesContent = sourcesMatch[1]
      sources = sourcesContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('-'))
        .map((line, index) => {
          const content = line.substring(1).trim()
          const urlMatch = content.match(/(https?:\/\/[^\s]+)(?:\s+(.*))?/)
          
          return {
            number: index + 1,
            url: urlMatch ? urlMatch[1] : content,
            ...(urlMatch && urlMatch[2] ? { title: urlMatch[2].trim() } : {})
          }
        })
      
      // Remove sources section from content
      cleanedContent = content.replace(sourcesRegex, '').trim()
    }

    return { content: cleanedContent, sources }
  } catch (error) {
    console.error('Error parsing message:', error)
    try {
      // Even in error case, try to remove sources tag
      const sourcesRegex = /<sources>[\s\S]*?<\/sources>/g;
      const cleanedContent = content.replace(sourcesRegex, '').trim();
      return { content: cleanedContent, sources: [] }
    } catch {
      // If that fails too, just return original content
      return { content: content.trim(), sources: [] }
    }
  }
} 