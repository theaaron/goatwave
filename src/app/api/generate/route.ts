import { NextResponse } from 'next/server';
import axios from 'axios';

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

    // Log the first few characters of the API key for debugging (don't log the full key)
    console.log('API Key starts with:', apiKey.substring(0, 5) + '...');
    console.log('Model ID:', modelId);

    // Check if we should use the mock response for testing
    const useMockResponse = process.env.NEXT_PUBLIC_USE_MOCK_RESPONSE === 'true';
    
    if (useMockResponse) {
      console.log('Using mock response for testing');
      
      // Add a 2-second delay to demonstrate the loading state
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return NextResponse.json({
        output: [
          "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1000&auto=format&fit=crop"
        ],
        message: "Mock response for testing"
      });
    }

    // Make the actual API call to BlackForestLabs
    console.log('Making request to BlackForestLabs API...');
    
    try {
      // Use the specific endpoint name from the Python code
      const endpoint = "flux-pro-1.1-ultra-finetuned";
      console.log('Using endpoint:', endpoint);
      
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
          }
        }
      );
      
      console.log('API response received successfully:', response.data);
      
      // Check if we have an inference ID
      if (response.data && response.data.id) {
        const inferenceId = response.data.id;
        console.log('Inference ID:', inferenceId);
        
        // Poll for results
        let attempts = 0;
        const maxAttempts = 12; // 1 minute with 5-second intervals
        const checkInterval = 5000; // 5 seconds
        
        while (attempts < maxAttempts) {
          // Wait for the check interval
          await new Promise(resolve => setTimeout(resolve, checkInterval));
          
          // Check the result
          const resultResponse = await axios.get(
            `https://api.us1.bfl.ai/v1/get_result?id=${inferenceId}`,
            {
              headers: {
                'Content-Type': 'application/json',
                'X-Key': apiKey
              }
            }
          );
          
          console.log(`Check #${attempts + 1} - Status: ${resultResponse.data.status || 'Unknown'}`);
          
          if (resultResponse.data.status === 'Ready') {
            console.log('Image generation complete!');
            return NextResponse.json({
              output: [resultResponse.data.result.sample],
              message: "Image generated successfully"
            });
          } else if (resultResponse.data.status === 'Failed') {
            console.log('Image generation failed!');
            return NextResponse.json(
              { 
                error: 'Image generation failed', 
                details: JSON.stringify(resultResponse.data)
              },
              { status: 500 }
            );
          }
          
          attempts++;
        }
        
        // If we've reached the maximum number of attempts, return a timeout error
        return NextResponse.json(
          { 
            error: 'Timeout waiting for image generation', 
            details: 'Maximum attempts reached'
          },
          { status: 504 }
        );
      } else {
        // If we don't have an inference ID, return an error
        return NextResponse.json(
          { 
            error: 'No inference ID received', 
            details: JSON.stringify(response.data)
          },
          { status: 500 }
        );
      }
    } catch (apiError: any) {
      console.error('BlackForestLabs API error:', {
        status: apiError.response?.status,
        statusText: apiError.response?.statusText,
        data: apiError.response?.data,
        message: apiError.message
      });
      
      // Format the error details properly
      let errorDetails = '';
      if (apiError.response?.data) {
        if (typeof apiError.response.data === 'object') {
          errorDetails = JSON.stringify(apiError.response.data);
        } else {
          errorDetails = apiError.response.data.toString();
        }
      } else {
        errorDetails = apiError.message || 'Unknown error';
      }
      
      return NextResponse.json(
        { 
          error: 'API request failed', 
          details: errorDetails,
          status: apiError.response?.status || 500
        },
        { status: apiError.response?.status || 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in API route:', error);
    
    // Format the error details properly
    let errorDetails = '';
    if (error.response?.data) {
      if (typeof error.response.data === 'object') {
        errorDetails = JSON.stringify(error.response.data);
      } else {
        errorDetails = error.response.data.toString();
      }
    } else {
      errorDetails = error.message || 'Unknown error';
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate image', 
        details: errorDetails,
        status: error.response?.status || 500
      },
      { status: error.response?.status || 500 }
    );
  }
} 