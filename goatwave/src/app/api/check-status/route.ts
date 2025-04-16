import { NextResponse } from 'next/server';
import axios from 'axios';

export const maxDuration = 30; // 30 seconds should be enough for status checks
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

    try {
      // Check the result with a shorter timeout
      const resultResponse = await axios.get(
        `https://api.us1.bfl.ai/v1/get_result?id=${inferenceId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Key': apiKey
          },
          timeout: 10000 // 10 second timeout for status checks
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