Dramanoes Card Submission Form
A web application built with Next.js that allows users to submit cards for the Dramanoes game. Users can authenticate using either email (Magic Link) or their Farcaster account.
⚠️ Important Domain Configuration
Before deploying to production, you must configure your domain in both authentication services:
Magic Link Setup

Go to Magic Link Dashboard
Navigate to your application settings
Add your production domain to the "Allowed Origins" list
Default allowed origin is only localhost:3000

Neynar Setup

Access Neynar Developer Dashboard
Navigate to your application settings
Add your production domain to the approved domains list
Default allowed domain is only localhost:3000

Without these configurations, authentication will fail in production.
Features
Authentication

Email Authentication: Secure login via Magic Link
Farcaster Integration: Direct sign-in with Farcaster account
Session Management: Maintains login state during form submissions

Form Capabilities

Three card types:

Annoy Cards: With subtypes (Duck, Skip, Steal, Undo)
Blame Cards: With personality-based subtypes
Flaw Cards: Custom named flaws with personality types


Interactive UI with real-time validation
Maintains state between multiple submissions
Automated form field validation

Technical Features

Frontend: Next.js with TypeScript
Styling: TailwindCSS with shadcn/ui components
Authentication: Magic SDK and Neynar for Farcaster
Database: Airtable integration
Environment Configuration: Flexible environment variable setup

Prerequisites
Before running this project, make sure you have:

Node.js (v18 or higher)
npm or yarn
Required API keys:

Airtable API key
Magic Link API key
Neynar Client ID



Environment Setup
Create a .env.local file in the root directory with the following variables:
envCopyAIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id
AIRTABLE_TABLE_NAME=your_table_name
NEXT_PUBLIC_MAGIC_API_KEY=your_magic_api_key
NEXT_PUBLIC_NEYNAR_CLIENT_ID=your_neynar_client_id
Installation

Clone the repository:

bashCopygit clone https://github.com/fractalqualia/Dramanoes_form.git

Install dependencies:

bashCopynpm install
# or
yarn install

Run the development server:

bashCopynpm run dev
# or
yarn dev

Open http://localhost:3000 in your browser.

Project Structure
Copydramanoes-form/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── submit/
│   │   │       └── route.ts    # API route for form submission
│   │   └── page.tsx            # Main form component
│   ├── components/
│   │   └── ui/                 # shadcn/ui components
│   └── utils/
│       └── airtable.ts         # Airtable configuration and helpers
├── public/
├── .env.local                  # Environment variables
└── README.md
Tech Stack

Framework: Next.js 14
Language: TypeScript
Styling: TailwindCSS
UI Components: shadcn/ui
Authentication:

Magic SDK for email authentication
Neynar for Farcaster integration


Database: Airtable
Form Handling: React Hook Form
Development:

ESLint
Prettier
TypeScript strict mode



Contributing

Fork the repository
Create your feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add some amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request


Magic SDK Documentation
Neynar Documentation
shadcn/ui Components
Next.js Documentation
Airtable API Documentation