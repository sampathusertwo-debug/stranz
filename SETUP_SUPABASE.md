# Quick Setup Guide - Using Supabase (Recommended)

Due to native compilation requirements for SQLite on Windows, we recommend using Supabase for both local development and production. It's free, easy to set up, and provides a better development experience.

## Setup Steps

### 1. Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project

### 2. Get Your Credentials

From your Supabase project dashboard:
- Click on "Settings" → "API"
- Copy your:
  - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
  - **anon/public key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)
  - **service_role key** (SUPABASE_SERVICE_ROLE_KEY) - for migrations

### 3. Update Environment Variables

Update your `.env.local` file:

```env
NODE_ENV=development
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. Run Database Migrations

In your Supabase project dashboard:
1. Go to "SQL Editor"
2. Click "New Query"
3. Copy and paste the following SQL:

```sql
-- Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  license_number TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trucks Table  
CREATE TABLE IF NOT EXISTS trucks (
  id BIGSERIAL PRIMARY KEY,
  truck_number TEXT NOT NULL UNIQUE,
  truck_type TEXT,
  capacity DECIMAL,
  driver_id BIGINT REFERENCES drivers(id),
  status TEXT DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parties Table (Clients/Customers)
CREATE TABLE IF NOT EXISTS parties (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  gst_number TEXT,
  balance DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id BIGSERIAL PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  party_id BIGINT NOT NULL REFERENCES parties(id),
  truck_id BIGINT REFERENCES trucks(id),
  driver_id BIGINT REFERENCES drivers(id),
  from_location TEXT,
  to_location TEXT,
  material TEXT,
  weight DECIMAL,
  freight_amount DECIMAL,
  advance_paid DECIMAL DEFAULT 0,
  balance_amount DECIMAL,
  status TEXT DEFAULT 'pending',
  invoice_date DATE,
  delivery_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id BIGSERIAL PRIMARY KEY,
  invoice_id BIGINT REFERENCES invoices(id),
  truck_id BIGINT REFERENCES trucks(id),
  expense_type TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  description TEXT,
  expense_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tips Table  
CREATE TABLE IF NOT EXISTS tips (
  id BIGSERIAL PRIMARY KEY,
  driver_id BIGINT NOT NULL REFERENCES drivers(id),
  amount DECIMAL NOT NULL,
  description TEXT,
  tip_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trucks_driver ON trucks(driver_id);
CREATE INDEX IF NOT EXISTS idx_invoices_party ON invoices(party_id);
CREATE INDEX IF NOT EXISTS idx_invoices_truck ON invoices(truck_id);
CREATE INDEX IF NOT EXISTS idx_expenses_invoice ON expenses(invoice_id);
CREATE INDEX IF NOT EXISTS idx_tips_driver ON tips(driver_id);
```

4. Click "Run" to execute the SQL

### 5. Update API Routes to Use Supabase

The API routes need to be updated to use Supabase instead of SQLite. Here's an example for the drivers API:

**src/app/api/drivers/route.ts:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch drivers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, license_number, address } = body;

    const { data, error } = await supabase
      .from('drivers')
      .insert([{ name, phone, license_number, address }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create driver' }, { status: 500 });
  }
}
```

### 6. Install Dependencies

```bash
npm install
```

### 7. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Benefits of Using Supabase

✅ No native compilation required  
✅ Works on all platforms (Windows, Mac, Linux)  
✅ Free tier includes 500MB database  
✅ Real-time capabilities  
✅ Built-in authentication  
✅ Easy to scale  
✅ Automatic backups  
✅ No local database files to manage

## Alternative: SQLite with Docker

If you prefer SQLite, you can run the application in a Docker container where compilation tools are pre-installed. Contact me if you need help setting this up.
