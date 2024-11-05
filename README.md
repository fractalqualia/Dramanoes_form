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

## License

Private & Proprietary - All rights reserved.