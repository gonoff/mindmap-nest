import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as pdfjs from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configure PDF.js worker
const PDFJS_WORKER_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'
pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL

async function parseAndChunkPDF(base64PDF: string): Promise<{ chunks: string[], totalTokens: number }> {
  try {
    // Decode base64 to Uint8Array
    const pdfBytes = base64ToUint8Array(base64PDF)
    
    // Load the PDF document
    const pdf = await pdfjs.getDocument({ data: pdfBytes }).promise
    console.log(`PDF loaded successfully with ${pdf.numPages} pages`)

    // Extract text from all pages
    let fullText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`Processing page ${i}/${pdf.numPages}`)
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
      fullText += pageText + '\n\n'
    }

    // If no text was extracted, throw error
    if (!fullText.trim()) {
      throw new Error('No readable text found in PDF')
    }

    // Estimate tokens (rough approximation: ~4 chars per token)
    const totalTokens = Math.ceil(fullText.length / 4)
    console.log(`Extracted ${totalTokens} estimated tokens`)

    // Chunk the text if it's long
    const MAX_CHUNK_TOKENS = 2000
    const chunks: string[] = []
    
    if (totalTokens <= MAX_CHUNK_TOKENS) {
      // If text is short enough, return as single chunk
      chunks.push(fullText)
    } else {
      // Split into chunks of roughly MAX_CHUNK_TOKENS
      const words = fullText.split(/\s+/)
      let currentChunk = ''
      let currentChunkTokens = 0

      for (const word of words) {
        const wordTokens = Math.ceil(word.length / 4)
        
        if (currentChunkTokens + wordTokens > MAX_CHUNK_TOKENS) {
          // Current chunk is full, start new chunk
          if (currentChunk) {
            chunks.push(currentChunk.trim())
          }
          currentChunk = word
          currentChunkTokens = wordTokens
        } else {
          // Add to current chunk
          currentChunk += (currentChunk ? ' ' : '') + word
          currentChunkTokens += wordTokens
        }
      }

      // Add final chunk if not empty
      if (currentChunk) {
        chunks.push(currentChunk.trim())
      }
    }

    console.log(`Split text into ${chunks.length} chunks`)
    return { chunks, totalTokens }
  } catch (error) {
    console.error('Error parsing PDF:', error)
    throw new Error(`Failed to parse PDF: ${error.message}`)
  }
}

// Helper function to convert base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { base64PDF } = await req.json()
    
    if (!base64PDF) {
      throw new Error('No PDF content provided')
    }

    console.log('Processing PDF content...')

    const result = await parseAndChunkPDF(base64PDF)

    console.log(`Successfully processed PDF: ${result.chunks.length} chunks, ${result.totalTokens} tokens`)

    return new Response(
      JSON.stringify({
        chunks: result.chunks,
        totalTokens: result.totalTokens,
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
    console.error('Error processing PDF:', error)
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