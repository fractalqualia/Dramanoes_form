# Dramanoes Card Submission App

Authentication and form handling for Dramanoes card submissions, built with Next.js 14.

## Setup & Config

1. Create environment variables:
```
AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=
AIRTABLE_TABLE_NAME=
NEXT_PUBLIC_MAGIC_API_KEY=
NEXT_PUBLIC_NEYNAR_CLIENT_ID=
```

2. Configure authentication domains:
   - Magic Link Dashboard: Add your domain to allowed origins
   - Neynar Dashboard: Add your domain to approved list

3. Run the app:
```bash
npm install
npm run dev
```

## Airtable Schema 

1. **ID**: Primary key field
2. **email**: Email field, type "Email"
3. **farcasterFid**: Single line text field, type "Single line text"
4. **CardType**: Single select field, type "Single select" with options "Annoy", "Blame", "Flaw" 
5. **subTypeAnnoy**: Single select field, type "Single select" with options "Duck", "Skip", "Steal", "Undo"
6. **subTypePersonality**: Single select field, type "Single select" with options "Arrogant", "Condescending", "Obnoxious", "Meddling", "Odd", "Tactless"
7. **cardText**: Single line text field, type "Single line text"
8. **flawName**: Single line text field, type "Single line text"
9. **agreedToTerms**: Checkbox field, type "Checkbox" 
10. **submissionDate**: Date field, type "Date" with US format


## Features

- **Auth**: Email (Magic Link) or Farcaster login
- **Cards**: Create Annoy, Blame, or Flaw cards
- **Storage**: Direct submission to Airtable
- **UI**: Built with shadcn/ui + TailwindCSS
- **Type-Safe**: Full TypeScript implementation

## Tech Used

- Next.js 14
- TypeScript
- TailwindCSS
- Magic SDK
- Neynar SDK
- Airtable

