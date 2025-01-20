import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Topic {
  title: string;
  subtopics?: Topic[];
}

interface ChunkSummary {
  topics: Topic[];
}

const CHUNK_PROMPT = `You are an AI assistant helping summarize part of a PDF document. 
Extract key points, main ideas, and hierarchical topics. If the text is repetitive, 
try to consolidate redundant information. Please return a structured JSON in this shape:

{
  "topics": [
    {
      "title": "...",
      "subtopics": [
        { "title": "...", "subtopics": [ ... ] }, 
        ...
      ]
    },
    ...
  ]
}

Make sure you keep the hierarchical relationships. The top-level "topics" 
are major sections, and "subtopics" nest inside them. 

Avoid any extra commentary or text outside of the JSON structure.`;

const MERGE_PROMPT = `You are an AI assistant. You have several JSON summaries (with "topics" arrays). 
Please merge them into a single combined JSON with the same structure, merging duplicates 
or overlapping topics where reasonable. Return only the final JSON, no extra commentary.`;

async function summarizeChunk(chunk: string, chunkIndex: number): Promise<ChunkSummary> {
  console.log(`Processing chunk ${chunkIndex + 1}`);
  
  const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: CHUNK_PROMPT
        },
        {
          role: 'user',
          content: chunk
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    }),
  });

  if (!openAIResponse.ok) {
    throw new Error(`OpenAI API error: ${await openAIResponse.text()}`);
  }

  const result = await openAIResponse.json();
  return JSON.parse(result.choices[0].message.content);
}

async function mergeSummaries(summaries: ChunkSummary[]): Promise<ChunkSummary> {
  if (summaries.length === 1) {
    return summaries[0];
  }

  console.log(`Merging ${summaries.length} summaries`);

  const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: MERGE_PROMPT
        },
        {
          role: 'user',
          content: JSON.stringify(summaries)
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    }),
  });

  if (!openAIResponse.ok) {
    throw new Error(`OpenAI API error: ${await openAIResponse.text()}`);
  }

  const result = await openAIResponse.json();
  return JSON.parse(result.choices[0].message.content);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { chunks } = await req.json()
    
    if (!chunks || !Array.isArray(chunks) || chunks.length === 0) {
      throw new Error('No text chunks provided')
    }

    console.log(`Processing ${chunks.length} chunks...`)

    // Process each chunk in parallel
    const chunkPromises = chunks.map((chunk, index) => 
      summarizeChunk(chunk, index)
        .catch(error => {
          console.error(`Error processing chunk ${index}:`, error);
          throw error;
        })
    );

    const chunkSummaries = await Promise.all(chunkPromises);
    console.log('Successfully processed all chunks, merging summaries...');

    // Merge all summaries into a single structure
    const mergedSummary = await mergeSummaries(chunkSummaries);
    console.log('Successfully merged all summaries');

    return new Response(
      JSON.stringify({
        summary: mergedSummary,
        status: 'success'
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Error processing chunks:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        status: 'error'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})