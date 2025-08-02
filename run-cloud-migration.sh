#!/bin/bash

echo "🚀 Running FoodTruck Hub Cloud Migration..."

# Check if we're linked to the cloud project
echo "📋 Checking project link..."
supabase status --linked

# Run the migration script
echo "📊 Running migration script..."
echo "Please run the contents of 'cloud-migration.sql' in your Supabase dashboard SQL editor:"
echo "https://supabase.com/dashboard/project/wavezrlgdhfyscyvtlcn/sql"
echo ""
echo "Or run this command to execute it directly:"
echo "supabase db remote commit --include-seed"

echo "✅ Migration script ready!"
echo "📝 Next steps:"
echo "1. Go to your Supabase dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Copy and paste the contents of 'cloud-migration.sql'"
echo "4. Run the script"
echo "5. Test your app at http://localhost:3000" 