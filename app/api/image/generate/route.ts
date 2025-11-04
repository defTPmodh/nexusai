import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import OpenAI from 'openai';

// Initialize OpenRouter client for image generation
const openrouterClient = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'Nexus-AI',
  },
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Image generation is currently not available
    return NextResponse.json(
      { 
        error: 'Image generation is not available at this time',
        available: false,
        message: 'This feature is coming soon. Please check back later.'
      },
      { status: 503 }
    );

    // Legacy code below (disabled)
    /*
    const body = await request.json();
    const { prompt, model = 'black-forest-labs/flux-pro', size = '1024x1024', quality = 'standard' } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth0_id', session.user.sub)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate image using OpenRouter
    // OpenRouter uses OpenAI-compatible API but might need direct fetch for images
    const startTime = Date.now();
    
    try {
      // Try using OpenAI SDK first, if that fails, use direct fetch
      let imageUrl: string | null = null;
      
      try {
        const response = await openrouterClient.images.generate({
          model: model,
          prompt: prompt,
          size: size as '1024x1024' | '512x512' | '256x256',
          quality: quality as 'standard' | 'hd',
          n: 1,
        });
        imageUrl = response.data[0]?.url || null;
      } catch (sdkError: any) {
        // If SDK fails, try direct API call
        console.log('SDK method failed, trying direct API call...');
        
        const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            'X-Title': 'Nexus-AI',
          },
          body: JSON.stringify({
            model: model,
            prompt: prompt,
            size: size,
            quality: quality,
            n: 1,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`OpenRouter API error (${response.status}): ${errorText || 'Unknown error'}`);
        }

        const data = await response.json();
        imageUrl = data.data?.[0]?.url || null;
      }
      
      if (!imageUrl) {
        throw new Error('No image URL returned from API');
      }

      const latency = Date.now() - startTime;

      // Log image generation request
      await supabase.from('llm_requests').insert({
        user_id: user.id,
        model_id: null, // Image models might not be in llm_models table
        session_id: null,
        prompt: prompt,
        response: imageUrl,
        input_tokens: 0, // Image generation doesn't use tokens the same way
        output_tokens: 0,
        cost: 0, // Would need to calculate based on model pricing
        pii_detected: false,
        pii_types: null,
        latency_ms: latency,
        status: 'success',
        error_message: null,
      });

      return NextResponse.json({
        imageUrl,
        model,
        prompt,
        latency,
      });
    } catch (error: any) {
      const errorMsg = error.message || 'Unknown error';
      const statusCode = error.status || error.response?.status || error.statusCode || 500;

      // Log the full error for debugging
      console.error('Image generation error:', {
        message: errorMsg,
        status: statusCode,
        model: model,
        error: error,
      });

      // Log failed request
      await supabase.from('llm_requests').insert({
        user_id: user.id,
        model_id: null,
        session_id: null,
        prompt: prompt,
        response: null,
        input_tokens: 0,
        output_tokens: 0,
        cost: 0,
        pii_detected: false,
        pii_types: null,
        latency_ms: Date.now() - startTime,
        status: 'error',
        error_message: errorMsg,
      });

      return NextResponse.json(
        { 
          error: `Image generation failed: ${errorMsg}`,
          statusCode: statusCode,
          hint: statusCode === 405 
            ? 'Image generation might not be supported via OpenRouter. OpenRouter primarily supports text models. Consider using OpenAI DALL-E API directly or Stability AI for image generation.'
            : 'Check available image models at https://openrouter.ai/models or use a dedicated image generation service.'
        },
        { status: statusCode >= 400 && statusCode < 600 ? statusCode : 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
    */
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

