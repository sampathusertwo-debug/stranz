const { createClient } = require('@supabase/supabase-js');
const { supabaseSchema } = require('../src/lib/schema.js');
const fs = require('fs');
const path = require('path');

// Manually load .env.local since this is a Node script
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    // Skip comments and empty lines
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
}

async function migrate() {
  console.log('🚀 Running Supabase migrations for production...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    process.exit(1);
  }
  
  console.log('📡 Connecting to Supabase...');
  console.log(`   URL: ${supabaseUrl}`);
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('\n📝 Checking database status...\n');
    
    // Test the connection by trying to fetch from a table
    console.log('🔍 Testing database connection...');
    const { data, error } = await supabase.from('vehicle_types').select('count');
    
    if (error) {
      if (error.message.includes('table') || error.message.includes('relation')) {
        console.log('⚠️  Tables do not exist yet. Migration required!\n');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('📋 MIGRATION INSTRUCTIONS:');
        console.log('═══════════════════════════════════════════════════════════════\n');
        console.log('1. Go to Supabase SQL Editor:');
        console.log('   https://supabase.com/dashboard/project/_/sql/new\n');
        console.log('2. Copy the SQL schema below\n');
        console.log('3. Paste into the SQL Editor and click "Run"\n');
        console.log('═══════════════════════════════════════════════════════════════\n');
        console.log('📄 SQL SCHEMA TO EXECUTE:\n');
        console.log(supabaseSchema);
        console.log('\n═══════════════════════════════════════════════════════════════\n');
        console.log('💡 Tip: The complete schema is also saved in src/lib/schema.js');
      } else {
        console.error('❌ Database connection error:', error.message);
      }
    } else {
      console.log('✅ Database connection successful!');
      console.log('✅ Tables already exist and are accessible!');
      console.log('\n📊 Your Supabase database is ready to use!');
    }
    
  } catch (error) {
    console.error('❌ Migration check failed:', error.message);
  }
}

migrate();
