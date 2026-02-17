# Transport Book Web App

A comprehensive transport management system built with Next.js, featuring separate database configurations for local development (SQLite) and production (Supabase).

## Features

- 🚛 **Drivers Management** - Track driver information, licenses, and contact details
- 🚚 **Trucks Management** - Monitor truck fleet, capacity, and status
- 👥 **Parties (Clients)** - Manage client information and outstanding balances
- 📄 **Invoices** - Create and track invoices with complete trip details
- 💰 **Expenses** - Record and categorize operational expenses
- 🎁 **Tips/Incentives** - Manage driver bonuses and incentives

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI) v5
- **Local Database**: SQLite (better-sqlite3)
- **Production Database**: Supabase (PostgreSQL)
- **Styling**: Material-UI + Custom Theme

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd transport_book_web_app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

   For local development, the default configuration uses SQLite:
   ```env
   NODE_ENV=development
   DATABASE_URL=./data/transport.db
   ```

4. **Run database migrations**
   ```bash
   npm run db:migrate:local
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Setup

### Local Development (SQLite)

SQLite is used for local development. The database file is created automatically in the `data/` directory.

Run migrations:
```bash
npm run db:migrate:local
```

### Production (Supabase)

For production deployment with Supabase:

1. Create a Supabase project at [supabase.com](https://supabase.com)

2. Update your environment variables:
   ```env
   NODE_ENV=production
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. Run Supabase migrations:
   ```bash
   npm run db:migrate:prod
   ```

## Project Structure

```
transport_book_web_app/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── drivers/           # Drivers management page
│   │   ├── trucks/            # Trucks management page
│   │   ├── parties/           # Parties/clients page
│   │   ├── invoices/          # Invoices page
│   │   ├── expenses/          # Expenses page
│   │   ├── tips/              # Tips/incentives page
│   │   └── api/               # API routes
│   ├── components/            # Reusable React components
│   ├── lib/                   # Utility functions and configs
│   │   ├── db.ts             # Database configuration
│   │   └── schema.ts         # Database schema
│   └── theme/                 # Material-UI theme
├── scripts/                   # Migration scripts
│   ├── migrate-local.js      # SQLite migrations
│   └── migrate-prod.js       # Supabase migrations
├── sample/                    # Sample HTML pages (reference)
└── data/                      # SQLite database (local only)
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:migrate:local` - Run SQLite migrations
- `npm run db:migrate:prod` - Run Supabase migrations

## Environment Variables

### Local Development
```env
NODE_ENV=development
DATABASE_URL=./data/transport.db
```

### Production
```env
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Database Schema

The application uses the following main tables:
- `drivers` - Driver information
- `trucks` - Truck fleet details
- `parties` - Client/customer information
- `invoices` - Invoice and trip records
- `expenses` - Expense tracking
- `tips` - Driver incentives

## Features in Detail

### Drivers
- Add, edit, and delete driver records
- Track license numbers and contact information
- Monitor driver assignments to trucks

### Trucks
- Manage truck fleet with unique truck numbers
- Track truck capacity, type, and status
- Assign drivers to trucks

### Parties (Clients)
- Maintain client database with GST information
- Track outstanding balances
- Store complete contact details

### Invoices
- Create detailed trip invoices
- Link invoices to parties, trucks, and drivers
- Track freight amounts, advances, and balances
- Monitor invoice status (pending/completed/cancelled)

### Expenses
- Record operational expenses
- Link expenses to specific invoices or trucks
- Categorize expense types
- Track expense dates

### Tips/Incentives
- Manage driver bonuses and incentives
- Record tip amounts and descriptions
- Track tip dates

## Deployment

### Vercel (Recommended for Next.js)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The application can be deployed to any platform that supports Node.js:
- Netlify
- Railway
- Render
- AWS
- Google Cloud
- Azure

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on the GitHub repository.
