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

async function summarizeChunk(chunk: string, chunkIndex: number): Promise<ChunkSummary> {
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
          content: `You are analyzing part ${chunkIndex + 1} of a PDF document. Extract key points and create a hierarchical structure of topics.
          Be concise and focus on main ideas and their relationships.
          Format your response as a clean JSON structure.`
        },
        {
          role: 'user',
          content: `Please analyze this text and extract key topics and subtopics in a hierarchical structure:

${chunk}

Return your analysis in this exact JSON format:
{
  "topics": [
    {
      "title": "Main Topic",
      "subtopics": [
        {
          "title": "Subtopic",
          "subtopics": []
        }
      ]
    }
  ]
}`
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
          content: 'You are merging multiple topic hierarchies from different parts of a document into a single coherent structure. Combine similar topics, maintain hierarchical relationships, and create a clean, unified structure.'
        },
        {
          role: 'user',
          content: `Here are separate topic hierarchies from different parts of the document. Please merge them into a single coherent structure, combining similar topics and maintaining proper relationships:

${JSON.stringify(summaries, null, 2)}

Return the merged structure in this exact JSON format:
{
  "topics": [
    {
      "title": "Main Topic",
      "subtopics": [
        {
          "title": "Subtopic",
          "subtopics": []
        }
      ]
    }
  ]
}`
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