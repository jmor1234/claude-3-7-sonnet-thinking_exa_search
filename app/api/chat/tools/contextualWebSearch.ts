// app/api/chat/tools/contextualWebSearch.ts

import { anthropic } from '@ai-sdk/anthropic';
import { tool, generateObject } from 'ai';
import { z } from 'zod';
import Exa from 'exa-js';

const exa = new Exa(process.env.EXA_API_KEY);

export const formatCurrentDateTime = () => {
  const now = new Date();
  return now.toLocaleString('en-US', { 
    timeZone: 'America/New_York',
    dateStyle: 'medium',
    timeStyle: 'medium'
  }) + ' EST';
};

export const contextualWebSearch = tool({
  description: `Executes a specified number of web searches based on your strategic decision. You determine the number of searches (2-6) based on topic complexity and user needs. Current date is ${formatCurrentDateTime()}`,
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
    
    // Define schema for query generation with fixed count
    const queryGenSchema = z.object({
      queries: z.array(z.object({
        query: z.string(),
        reasoning: z.string(),
        dateRange: z.object({
          startPublishedDate: z.string().optional(),
          endPublishedDate: z.string().optional()
        }).optional()
      })).length(numberOfQueries)
    });

    try {
      // Generate contextual queries
      const { object: generatedQueries } = await generateObject({
        model: anthropic('claude-3-7-sonnet-20250219'),
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
        3. Date range requirements (if applicable for time-sensitive topics)`,
      });

      // Add delay helper
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      console.log('\n🔬 Deep Research Strategy:');
      console.log('📊 Number of Queries:', numberOfQueries);
      console.log('------------------------\n');

      // Execute searches with rate limiting
      const searchResults = [];
      for (const queryObj of generatedQueries.queries) {
        // Configure search parameters for this query
        const searchConfig = {
          numResults: 4,
          type: 'auto' as const,
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