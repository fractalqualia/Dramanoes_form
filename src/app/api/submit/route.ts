import { NextResponse } from 'next/server';
import { submitToAirtable, CardSubmission } from '@/utils/airtable';

// Verify environment variables are set
if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
  throw new Error('Required environment variables are not set');
}

export async function POST(req: Request) {
  console.log('API route started');
  
  try {
    const data = await req.json() as CardSubmission;
    console.log('Received data in API route:', JSON.stringify(data, null, 2));

    // Check for required fields - either email OR farcasterFid must be present
    if ((!data.email && !data.farcasterFid) || !data.name || !data.CardType || !data.agreedToTerms) {
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
  } catch (error: any) {
    console.error('API route error:', {
      message: error.message,
      statusCode: error.statusCode,
      error: error
    });

    return NextResponse.json(
      {
        error: 'Failed to submit card',
        details: error.message,
        debug: JSON.stringify(error, null, 2)
      },
      { status: error.statusCode || 500 }
    );
  }
}