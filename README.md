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

| Field Name           | Description                                                                 | Type                    |
|----------------------|-----------------------------------------------------------------------------|-------------------------|
| **ID**               | Primary key field                                                           | Primary key             |
| **email**            | Email field                                                                 | Email                   |
| **farcasterFid**     | Single line text field                                                      | Single line text        |
| **CardType**         | Single select field with options "Annoy", "Blame", "Flaw"                   | Single select           |
| **subTypeAnnoy**     | Single select field with options "Duck", "Skip", "Steal", "Undo"            | Single select           |
| **subTypePersonality** | Single select field with options "Arrogant", "Condescending", <br> "Obnoxious", "Meddling", "Odd", "Tactless" | Single select           |
| **cardText**         | Single line text field                                                      | Single line text        |
| **flawName**         | Single line text field                                                      | Single line text        |
| **agreedToTerms**    | Checkbox field                                                              | Checkbox                |
| **submissionDate**   | Date field with US format                                                   | Date                    |


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

