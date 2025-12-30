# Qreate Studios v1.1

A professional QR code management platform with AI-powered tools and integrated print services.

## Features

- **Dynamic QR Codes**: Create and manage editable QR codes
- **Advanced Analytics**: Track scans, locations, devices, and user behavior
- **Custom Designs**: Brand QR codes with custom colors and logos
- **Digital Menus**: Mobile-friendly restaurant menus
- **Payment Links**: Support for CashApp, Venmo, Zelle, PayPal, and more
- **AI Tools**: GPT-4o powered content generation
- **Print Services**: Integrated print ordering
- **CRM**: Client and contact management
- **Organizations**: Multi-user team collaboration

## Tech Stack

- **Framework**: Next.js 15.5 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth v5 (Auth.js)
- **Styling**: Tailwind CSS + shadcn/ui
- **Email**: Resend
- **AI**: OpenAI GPT-4o
- **Payments**: Stripe

## Getting Started

### Prerequisites

- Node.js 18.x or later
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/qreatestudiosv1.git
cd qreatestudiosv1
```

2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env` and configure your environment variables:
```bash
cp .env.example .env
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL`: Your application URL
- `STRIPE_SECRET_KEY`: Stripe API key for payments
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `RESEND_API_KEY`: Resend API key for emails

## Accessibility

This project follows WCAG 2.1 Level AA guidelines:
- Full keyboard navigation support
- Proper ARIA labels and landmarks
- Screen reader compatibility
- Minimum 4.5:1 color contrast
- Visible focus indicators
- 44x44px minimum touch targets

## Database Schema

See `prisma/schema.prisma` for the complete database schema including:
- User authentication
- QR code management
- Analytics
- Organizations
- Clients & CRM
- Menus
- Print orders
- Subscriptions
- Security & audit logs

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm run lint`: Run ESLint

## License

All rights reserved © 2025 Qreate Studios

## Support

For support, email support@qreatestudios.com
