-- Get Connection String for CLI
-- Run this in your Supabase dashboard SQL editor

-- This will help us understand the exact connection details
SELECT 
    current_database() as database_name,
    current_user as current_user,
    inet_server_addr() as server_address,
    inet_server_port() as server_port,
    version() as postgres_version; 