import pdf from 'pdf-parse';
import { getSupabaseAdmin } from '@/lib/supabase/client';

const OPENAI_EMBEDDING_MODEL = 'text-embedding-ada-002';
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

// Lazy initialization of OpenAI client (only when needed)
import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set. RAG features require OpenAI API key.');
    }
    openaiClient = new OpenAI({
      apiKey,
    });
  }
  return openaiClient;
}

export async function processPDF(buffer: Buffer, filename: string, userId: string): Promise<string> {
  const supabase = getSupabaseAdmin();

  // Create document record
  const { data: document, error: docError } = await supabase
    .from('documents')
    .insert({
      user_id: userId,
      filename,
      file_size: buffer.length,
      mime_type: 'application/pdf',
      status: 'processing',
    })
    .select()
    .single();

  if (docError || !document) {
    throw new Error(`Failed to create document: ${docError?.message}`);
  }

  try {
    // Extract text from PDF
    const pdfData = await pdf(buffer);
    const text = pdfData.text;

    if (!text || text.trim().length === 0) {
      throw new Error('PDF contains no extractable text');
    }

    // Chunk text with overlap
    const chunks = chunkText(text, CHUNK_SIZE, CHUNK_OVERLAP);

    // Generate embeddings for each chunk
    const chunksWithEmbeddings = await Promise.all(
      chunks.map(async (chunk, index) => {
        const embedding = await generateEmbedding(chunk.content);
        return {
          ...chunk,
          embedding,
          chunk_index: index,
        };
      })
    );

    // Insert chunks into database
    const chunkRecords = chunksWithEmbeddings.map((chunk) => ({
      document_id: document.id,
      chunk_index: chunk.chunk_index,
      content: chunk.content,
      embedding: chunk.embedding,
      metadata: {
        start_char: chunk.startIndex,
        end_char: chunk.endIndex,
      },
    }));

    const { error: chunksError } = await supabase.from('document_chunks').insert(chunkRecords);

    if (chunksError) {
      throw new Error(`Failed to insert chunks: ${chunksError.message}`);
    }

    // Update document status
    await supabase
      .from('documents')
      .update({ status: 'completed' })
      .eq('id', document.id);

    return document.id;
  } catch (error: any) {
    // Update document status to failed
    await supabase
      .from('documents')
      .update({
        status: 'failed',
        error_message: error.message,
      })
      .eq('id', document.id);

    throw error;
  }
}

function chunkText(text: string, chunkSize: number, overlap: number): Array<{ content: string; startIndex: number; endIndex: number }> {
  const chunks: Array<{ content: string; startIndex: number; endIndex: number }> = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const chunk = text.substring(startIndex, endIndex);

    chunks.push({
      content: chunk,
      startIndex,
      endIndex,
    });

    // Move startIndex forward by chunkSize - overlap
    startIndex += chunkSize - overlap;

    // If we've reached the end, break
    if (endIndex >= text.length) {
      break;
    }
  }

  return chunks;
}

async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAIClient();
  const response = await openai.embeddings.create({
    model: OPENAI_EMBEDDING_MODEL,
    input: text,
  });

  return response.data[0].embedding;
}

export async function queryDocuments(
  query: string,
  userId: string,
  limit: number = 5,
  threshold: number = 0.7
): Promise<Array<{ content: string; similarity: number; metadata: any; document_id: string }>> {
  const supabase = getSupabaseAdmin();

  // Generate embedding for query
  const queryEmbedding = await generateEmbedding(query);

  // Get user's documents
  const { data: userDocuments } = await supabase
    .from('documents')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'completed');

  const documentIds = (userDocuments || []).map((d) => d.id);

  if (documentIds.length === 0) {
    return [];
  }

  // Query using vector similarity search (filtered to user's documents)
  const { data, error } = await supabase.rpc('match_document_chunks', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: limit,
    filter_document_ids: documentIds.length > 0 ? documentIds : null,
  });

  if (error) {
    throw new Error(`Vector search failed: ${error.message}`);
  }

  return data || [];
}

