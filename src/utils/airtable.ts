import Airtable from 'airtable';

interface SubmissionFields {
  email?: string;  // Made optional since we might only have farcasterFid
  name: string;
  CardType: 'Annoy' | 'Blame' | 'Flaw';
  subTypeAnnoy?: 'Duck' | 'Skip' | 'Steal' | 'Undo';
  subTypePersonality?: 'Arrogant' | 'Condescending' | 'Meddling' | 'Obnoxious' | 'Odd' | 'Tactless';
  cardText: string;
  flawName?: string;
  agreedToTerms: boolean;
  farcasterFid?: string;
}

export type CardSubmission = SubmissionFields;

// Check for required environment variables
if (!process.env.AIRTABLE_API_KEY) {
  throw new Error('AIRTABLE_API_KEY is not defined');
}

if (!process.env.AIRTABLE_BASE_ID) {
  throw new Error('AIRTABLE_BASE_ID is not defined');
}

Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY,
  endpointUrl: 'https://api.airtable.com'
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);
const table = base('Submissions');

export async function submitToAirtable(data: CardSubmission) {
  console.log('Starting Airtable submission with data:', JSON.stringify(data, null, 2));
  
  try {
    const fields = {
      ...(data.email && { email: data.email }),
      name: data.name,
      CardType: data.CardType,
      cardText: data.cardText,
      agreedToTerms: data.agreedToTerms,
      ...(data.CardType === 'Annoy' && { subTypeAnnoy: data.subTypeAnnoy }),
      ...(['Blame', 'Flaw'].includes(data.CardType) && { 
        subTypePersonality: data.subTypePersonality 
      }),
      ...(data.CardType === 'Flaw' && { flawName: data.flawName }),
      ...(data.farcasterFid && { farcasterFid: data.farcasterFid })
    };

    console.log('Creating record with fields:', JSON.stringify(fields, null, 2));

    const records = await table.create([{ fields }]);
    console.log('Airtable creation response:', JSON.stringify(records, null, 2));

    if (!records || records.length === 0) {
      throw new Error('No records created');
    }

    return records[0];
  } catch (error: any) {
    console.error('Detailed Airtable error:', {
      error: error,
      message: error.message,
      statusCode: error.statusCode,
      explanation: error.explanation
    });
    throw error;
  }
}