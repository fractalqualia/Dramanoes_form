import { NextResponse } from 'next/server';
import { submitToAirtable, CardSubmission } from '@/utils/airtable';

// Verify environment variables are set
if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
  throw new Error('Required environment variables are not set');
}

interface ErrorResponse {
  message: string;
  statusCode?: number;
  [key: string]: unknown;
}

export async function POST(req: Request) {
  console.log('API route started');
  
  try {
    const data = await req.json() as CardSubmission;
    console.log('Received data in API route:', JSON.stringify(data, null, 2));

    // Check for required fields - either email OR farcasterFid must be present
    if ((!data.email && !data.farcasterFid) || !data.CardType || !data.agreedToTerms) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          receivedData: data 
        },
        { status: 400 }
      );
    }

    const record = await submitToAirtable(data);
    
    return NextResponse.json({
      success: true,
      record
    });
  } catch (error: unknown) {
    // Type guard to ensure error is an object with required properties
    const errorResponse = error as ErrorResponse;
    
    console.error('API route error:', {
      message: errorResponse.message || 'Unknown error',
      statusCode: errorResponse.statusCode,
      error: errorResponse
    });

    return NextResponse.json(
      {
        error: 'Failed to submit card',
        details: errorResponse.message || 'Unknown error',
        debug: JSON.stringify(errorResponse, null, 2)
      },
      { status: errorResponse.statusCode || 500 }
    );
  }
}