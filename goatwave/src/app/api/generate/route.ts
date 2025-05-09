import { NextResponse } from 'next/server';
import axios from 'axios';

// Configure for Vercel serverless functions
export const dynamic = 'force-dynamic'; // Disable static optimization

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, apiKey, modelId } = body;

    console.log('Received request with:', { 
      prompt: prompt ? 'present' : 'missing', 
      apiKey: apiKey ? 'present' : 'missing', 
      modelId: modelId ? 'present' : 'missing' 
    });

    if (!prompt || !apiKey || !modelId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Check if we should use the mock response for testing
    const useMockResponse = process.env.NEXT_PUBLIC_USE_MOCK_RESPONSE === 'true';
    
    if (useMockResponse) {
      console.log('Using mock response for testing');
      
      // Generate a random inference ID for the mock response
      const mockInferenceId = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      console.log('Generated mock inference ID:', mockInferenceId);
      
      // Return a mock inference ID to simulate the real API behavior
      return NextResponse.json({
        inferenceId: mockInferenceId,
        message: "MOCK RESPONSE - Image generation started (no API credits used)",
        status: "processing"
      });
    }

    // Make the actual API call to BlackForestLabs
    console.log('Making request to BlackForestLabs API...');
    
    try {
      // Use the specific endpoint name from the Python code
      const endpoint = "flux-pro-1.1-ultra-finetuned";
      console.log('Using endpoint:', endpoint);
      
      // Initial request to start image generation with a shorter timeout
      const response = await axios.post(
        `https://api.us1.bfl.ai/v1/${endpoint}`,
        {
          finetune_id: modelId,
          finetune_strength: 1.2,
          prompt: prompt,
          num_images: 1,
          width: 1024,
          height: 768,
          num_inference_steps: 30,
          guidance_scale: 7.5,
          scheduler: "DPM++ 2M Karras"
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Key': apiKey
          },
          timeout: 5000 // 5 second timeout for initial request
        }
      );
      
      console.log('Initial API response received:', response.data);
      
      if (!response.data || !response.data.id) {
        return NextResponse.json(
          { 
            error: 'Invalid response from API', 
            details: 'No inference ID received'
          },
          { status: 500 }
        );
      }

      const inferenceId = response.data.id;
      console.log('Inference ID:', inferenceId);
      
      // Return the inference ID to the client
      return NextResponse.json({
        inferenceId: inferenceId,
        message: "Image generation started",
        status: "processing"
      });
      
    } catch (apiError: any) {
      console.error('BlackForestLabs API error:', {
        status: apiError.response?.status,
        statusText: apiError.response?.statusText,
        data: apiError.response?.data,
        message: apiError.message
      });
      
      let errorMessage = 'API request failed';
      let errorDetails = apiError.message || 'Unknown error';
      let statusCode = apiError.response?.status || 500;
      
      if (apiError.code === 'ECONNABORTED' || statusCode === 504) {
        errorMessage = 'Request timeout';
        errorDetails = 'The image generation request timed out. Please try again.';
        statusCode = 504;
      }
      
      return NextResponse.json(
        { 
          error: errorMessage, 
          details: errorDetails,
          status: statusCode
        },
        { status: statusCode }
      );
    }
  } catch (error: any) {
    console.error('Error in API route:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process request', 
        details: error.message || 'Unknown error',
        status: 500
      },
      { status: 500 }
    );
  }
} 