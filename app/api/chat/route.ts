// app/api/chat/route.ts

import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { smoothStream, streamText } from 'ai';
import { contextualWebSearch } from './tools/contextualWebSearch';
import { SYSTEM_PROMPT } from './prompts/systemPrompt';

// Allow responses up to 5 minutes
export const maxDuration = 300;

export async function POST(req: Request) {
  console.log('\n🤖 --- New Chat Request ---\n');
  
  const { messages } = await req.json();
  
  // Show full message content
  const lastMessage = messages[messages.length - 1];
  console.log('📝 Last User Message:', {
    role: lastMessage.role,
    content: lastMessage.content  // Removed truncation
  });

  let stepCounter = 0;

  const result = streamText({
    model: openai('gpt-4o-mini'),
    // providerOptions: {
    //   anthropic: {
    //     thinking: {
    //       type: "enabled", 
    //       budgetTokens: 12000,
    //     },
    //   },
    // },
    system: SYSTEM_PROMPT,
    messages,
    experimental_transform: smoothStream(),
    maxSteps: 6,
    toolChoice: 'auto',
    onStepFinish: ({ toolCalls, toolResults, finishReason, usage, text, reasoning }) => {
      stepCounter++;
      console.log(`\n📊 Step ${stepCounter} Finished:`);
      console.log('🏁 Finish Reason:', finishReason);
      console.log('💭 Reasoning:', reasoning);

      console.log('💬 Model Response:', text);
      
      if (toolCalls && toolCalls.length > 0) {
        console.log('🛠️ Tool Calls:');
        toolCalls.forEach((call, index) => {
          console.log(`  [${index + 1}] Tool: ${call.toolName}, Arguments:`, call.args);
        });
      }
      
      if (toolResults && toolResults.length > 0) {
        console.log('🔧 Tool Results:');
        toolResults.forEach((result, index) => {
          console.log(`  [${index + 1}] Result:`, typeof result === 'object' ? JSON.stringify(result).slice(0, 100) + '...' : result);
        });
      }
      
      if (usage) {
        console.log('📈 Usage:', usage);
      }
      
      console.log('------------------------');
    },
    tools: {
      contextualWebSearch
    }
  });

  // Log when the response starts streaming
  console.log('\n📤 Starting response stream...\n');
  console.log('------------------------\n');

  return result.toDataStreamResponse({
    sendReasoning: true,
    getErrorMessage: () => {
      return 'An error occurred while generating the response. Please try again.';
    }
  });
}