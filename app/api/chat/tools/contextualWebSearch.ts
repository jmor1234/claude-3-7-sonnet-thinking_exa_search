// app/api/chat/tools/contextualWebSearch.ts

import { openai } from '@ai-sdk/openai';
import { tool, generateObject } from 'ai';
import { z } from 'zod';
import Exa from 'exa-js';

const exa = new Exa(process.env.EXA_API_KEY);

export const formatCurrentDateTime = () => {
  const now = new Date();
  
  // Get the user's local time zone
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Format the date in the user's local time zone
  return now.toLocaleString('en-US', { 
    timeZone,
    dateStyle: 'medium',
    timeStyle: 'medium'
  }) + ` (${getTimeZoneAbbreviation(timeZone)})`;
};

// Helper function to get time zone abbreviation
function getTimeZoneAbbreviation(timeZone: string): string {
  try {
    // Get the time zone abbreviation from the formatted date
    const options: Intl.DateTimeFormatOptions = { timeZoneName: 'short' };
    const shortTimeZone = new Intl.DateTimeFormat('en-US', options)
      .formatToParts(new Date())
      .find(part => part.type === 'timeZoneName')?.value || '';
    
    return shortTimeZone;
  } catch {
    // Fallback if there's an error getting the abbreviation
    return timeZone.split('/').pop() || '';
  }
}

export const contextualWebSearch = tool({
  description: `Executes a specified number of web searches based on your strategic decision. You determine the number of searches (2-6) based on topic complexity and user needs. Each search can be configured as "keyword" (for specific terms/names that should appear in results), "neural" (for conceptual searches requiring semantic understanding), or "auto" search type. Current date is ${formatCurrentDateTime()}`,
  parameters: z.object({
    numberOfQueries: z.number()
      .min(2)
      .max(6)
      .describe('Number of searches to perform (2-6), determined based on topic complexity and depth needed'),
    conversationContext: z.string()
      .describe('Detailed Summary of the current conversation context and topic'),
    currentIntent: z.string()
      .describe('The current user intent or area of curiosity with detail')
  }),
  execute: async ({ numberOfQueries, conversationContext, currentIntent }) => {
    const searchStartTime = new Date();
    
    // Define schema for query generation with fixed count - now including searchType
    const queryGenSchema = z.object({
      queries: z.array(z.object({
        query: z.string(),
        reasoning: z.string(),
        searchType: z.enum(['neural', 'keyword', 'auto']),  // Add searchType field
        dateRange: z.object({
          startPublishedDate: z.string().optional(),
          endPublishedDate: z.string().optional()
        }).optional()
      })).length(numberOfQueries)
    });

    try {
      // Generate contextual queries with enhanced prompt for search type selection
      const { object: generatedQueries } = await generateObject({
        model: openai('gpt-4o-mini'),
        schema: queryGenSchema,
        prompt: `Based on the following context, generate exactly ${numberOfQueries} search queries to gather comprehensive information:

        Conversation Context: ${conversationContext}
        Current User Intent: ${currentIntent}
        Current Date: ${formatCurrentDateTime()}

        Generate ${numberOfQueries} queries that:
        - Cover different aspects of the topic
        - Are specific and focused
        - Will yield relevant but diverse results
        - Help build a comprehensive understanding
        - Consider time sensitivity of the topic

        IMPORTANT - For each query, select the appropriate search type:
        - "keyword": Use for specific terms, names, identifiers, or exact phrases that should appear directly in results. Best for looking up specific entities or when exact matching is important.
        - "neural": Use for broad, complex queries where semantic understanding is needed. Best for conceptual searches, finding related content, or exploring ideas.
        - "auto": Only use when uncertain which type is better. The system will try to choose, but explicit selection is preferred.

        Time Sensitivity Guidelines:
        - For current events or recent developments, specify date ranges
        - For timeless topics (concepts, definitions), skip date filtering
        - Common date range patterns:
          * Last week: startPublishedDate = "YYYY-MM-DD" (7 days ago)
          * Last month: startPublishedDate = "YYYY-MM-DD" (30 days ago)
          * Last year: startPublishedDate = "YYYY-MM-DD" (1 year ago)
          * Custom range: both startPublishedDate and endPublishedDate

        For each query, provide:
        1. The search query
        2. Reasoning for how this query contributes to the overall information gathering strategy
        3. The specific search type to use (keyword, neural, or auto) with clear justification
        4. Date range requirements (if applicable for time-sensitive topics)`,
      });

      // Add delay helper
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      console.log('\n🔬 Deep Research Strategy:');
      console.log('📊 Number of Queries:', numberOfQueries);
      console.log('------------------------\n');

      // Execute searches with rate limiting
      const searchResults = [];
      for (const queryObj of generatedQueries.queries) {
        // Configure search parameters for this query with the selected search type
        const searchConfig = {
          numResults: 4,
          type: queryObj.searchType,  // Use the selected search type
          useAutoprompt: true,
          highlights: {
            numSentences: 3,
            highlightsPerUrl: 4
          } as const,
          summary: true as const,
          // Optional date filtering
          ...(queryObj.dateRange?.startPublishedDate && {
            startPublishedDate: queryObj.dateRange.startPublishedDate
          }),
          ...(queryObj.dateRange?.endPublishedDate && {
            endPublishedDate: queryObj.dateRange.endPublishedDate
          })
        };

        const result = await exa.searchAndContents(queryObj.query, searchConfig);
        
        console.log('\n🤖 Autoprompt:');
        console.log('------------------------');
        console.log('Original Query:', queryObj.query);
        console.log('Query Reasoning:', queryObj.reasoning);
        console.log('Search Type:', queryObj.searchType);  // Log the search type
        if (queryObj.dateRange) {
          console.log('Date Range:', queryObj.dateRange);
        }
        if (result.autopromptString) {
          console.log('Auto Query:', result.autopromptString);
        } else {
          console.log('Auto Query: No autoprompt generated');
        }
        console.log('------------------------\n');

        console.log('🔎 Search Results:');
        result.results.forEach((searchResult, index) => {
          console.log(`\n[${index + 1}] ${searchResult.title}`);
          console.log('🔗 URL:', searchResult.url);
          if (searchResult.highlights) {
            console.log('💡 Highlights:', `${searchResult.highlights.length} found`);
          }
          if (searchResult.summary) {
            console.log('📝 Summary:', 'Available');
          }
        });
        console.log('\n------------------------\n');

        searchResults.push({
          query: queryObj.query,
          reasoning: queryObj.reasoning,
          searchType: queryObj.searchType,  // Include search type in results
          dateRange: queryObj.dateRange,
          results: result
        });
        await delay(200); // Rate limiting
      }

      const searchEndTime = new Date();
      const searchDuration = searchEndTime.getTime() - searchStartTime.getTime();

      console.log('\n📊 Search Summary:');
      console.log('------------------------');
      console.log(`⏱️ Duration: ${searchDuration}ms`);
      console.log(`📝 Queries Executed: ${searchResults.length}`);
      console.log('------------------------\n');

      return {
        searchMetadata: {
          queriesExecuted: searchResults.length,
          searchDurationMs: searchDuration,
          timestamp: formatCurrentDateTime()
        },
        searches: searchResults
      };
    } catch (error) {
      console.error('\n❌ Search execution error:', error);
      if (error instanceof Error) {
        console.error('Type:', error.name);
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
      } else {
        console.error('Unknown error:', error);
      }
      throw new Error('Failed to execute search queries');
    }
  }
}); 