import { NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { inferenceId, apiKey } = body;

    if (!inferenceId || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Check if this is a mock inference ID
    if (inferenceId.startsWith('mock-')) {
      console.log('Handling mock inference ID:', inferenceId);
      
      // Extract the timestamp from the mock ID
      const timestamp = parseInt(inferenceId.split('-')[1]);
      const elapsedTime = Date.now() - timestamp;
      
      // Simulate different states based on elapsed time
      if (elapsedTime < 5000) {
        // First 5 seconds: still processing
        return NextResponse.json({
          status: 'processing',
          message: "MOCK RESPONSE - Image generation in progress (no API credits used)"
        });
      } else if (elapsedTime < 10000) {
        // 5-10 seconds: 50% chance of success or failure
        if (Math.random() > 0.5) {
          return NextResponse.json({
            status: 'ready',
            output: [
              "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1000&auto=format&fit=crop"
            ],
            message: "MOCK RESPONSE - Image generated successfully (no API credits used)"
          });
        } else {
          return NextResponse.json(
            { 
              status: 'failed',
              error: 'MOCK RESPONSE - Image generation failed', 
              details: "This is a simulated failure for testing purposes"
            },
            { status: 500 }
          );
        }
      } else {
        // After 10 seconds: always return success
        return NextResponse.json({
          status: 'ready',
          output: [
            "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1000&auto=format&fit=crop"
          ],
          message: "MOCK RESPONSE - Image generated successfully (no API credits used)"
        });
      }
    }

    try {
      // Check the result with a shorter timeout
      const resultResponse = await axios.get(
        `https://api.us1.bfl.ai/v1/get_result?id=${inferenceId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Key': apiKey
          },
          timeout: 5000 // 5 second timeout for status checks
        }
      );
      
      console.log(`Status check for ${inferenceId}:`, resultResponse.data.status);
      
      if (resultResponse.data.status === 'Ready') {
        return NextResponse.json({
          status: 'ready',
          output: [resultResponse.data.result.sample],
          message: "Image generated successfully"
        });
      } else if (resultResponse.data.status === 'Failed') {
        return NextResponse.json(
          { 
            status: 'failed',
            error: 'Image generation failed', 
            details: JSON.stringify(resultResponse.data)
          },
          { status: 500 }
        );
      } else {
        // Still processing
        return NextResponse.json({
          status: 'processing',
          message: "Image generation in progress"
        });
      }
    } catch (apiError: any) {
      console.error('Status check error:', apiError);
      
      let errorMessage = 'Status check failed';
      let errorDetails = apiError.message || 'Unknown error';
      let statusCode = apiError.response?.status || 500;
      
      if (apiError.code === 'ECONNABORTED' || statusCode === 504) {
        errorMessage = 'Status check timeout';
        errorDetails = 'The status check timed out. Please try again.';
        statusCode = 504;
      }
      
      return NextResponse.json(
        { 
          status: 'error',
          error: errorMessage, 
          details: errorDetails,
          statusCode: statusCode
        },
        { status: statusCode }
      );
    }
  } catch (error: any) {
    console.error('Error in status check route:', error);
    
    return NextResponse.json(
      { 
        status: 'error',
        error: 'Failed to check status', 
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
} 