import Airtable, { FieldSet, Record } from 'airtable';

interface SubmissionFields {
  email?: string;
  CardType: 'Annoy' | 'Blame' | 'Flaw';
  subTypeAnnoy?: 'Duck' | 'Skip' | 'Steal' | 'Undo';
  subTypePersonality?: 'Arrogant' | 'Condescending' | 'Meddling' | 'Obnoxious' | 'Odd' | 'Tactless';
  cardText: string;
  flawName?: string;
  agreedToTerms: boolean;
  farcasterFid?: string;
}

export type CardSubmission = SubmissionFields;

interface AirtableError extends Error {
  statusCode?: number;
  explanation?: string;
}

// Check for required environment variables
if (!process.env.AIRTABLE_API_KEY) {
  throw new Error('AIRTABLE_API_KEY is not defined');
}

if (!process.env.AIRTABLE_BASE_ID) {
  throw new Error('AIRTABLE_BASE_ID is not defined');
}

if (!process.env.AIRTABLE_TABLE_NAME) {
  throw new Error('AIRTABLE_TABLE_NAME is not defined');
}

Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY,
  endpointUrl: 'https://api.airtable.com'
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);
const table = base(process.env.AIRTABLE_TABLE_NAME);

export async function submitToAirtable(data: CardSubmission): Promise<Record<FieldSet>> {
  console.log('Starting Airtable submission with data:', JSON.stringify(data, null, 2));
  
  try {
    const fields: Partial<SubmissionFields> & FieldSet = {
      ...(data.email && { email: data.email }),
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

    if (!records || !records[0]) {
      throw new Error('No records created');
    }

    return records[0];
  } catch (error: unknown) {
    const airtableError = error as AirtableError;
    console.error('Detailed Airtable error:', {
      error: airtableError,
      message: airtableError.message || 'Unknown error',
      statusCode: airtableError.statusCode,
      explanation: airtableError.explanation
    });
    throw airtableError;
  }
}