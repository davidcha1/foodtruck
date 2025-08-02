-- Get current database schema from Supabase as JSON
-- Run this in the Supabase Dashboard SQL Editor

-- Export complete schema as JSON
SELECT json_build_object(
    'tables', (
        SELECT json_object_agg(t.table_name, json_build_object(
            'table_type', t.table_type,
            'columns', (
                SELECT json_object_agg(c.column_name, json_build_object(
                    'data_type', c.data_type,
                    'is_nullable', c.is_nullable,
                    'column_default', c.column_default,
                    'character_maximum_length', c.character_maximum_length,
                    'ordinal_position', c.ordinal_position
                ))
                FROM information_schema.columns c
                WHERE c.table_name = t.table_name 
                AND c.table_schema = 'public'
            )
        ))
        FROM information_schema.tables t
        WHERE t.table_schema = 'public'
    ),
    'triggers', (
        SELECT json_object_agg(trigger_name, json_build_object(
            'event_manipulation', event_manipulation,
            'event_object_table', event_object_table,
            'action_statement', action_statement
        ))
        FROM information_schema.triggers
        WHERE trigger_schema = 'public'
    ),
    'functions', (
        SELECT json_object_agg(routine_name, json_build_object(
            'routine_type', routine_type,
            'data_type', data_type,
            'routine_definition', routine_definition
        ))
        FROM information_schema.routines
        WHERE routine_schema = 'public'
    ),
    'policies', (
        SELECT json_object_agg(policyname, json_build_object(
            'tablename', tablename,
            'permissive', permissive,
            'roles', roles,
            'cmd', cmd,
            'qual', qual,
            'with_check', with_check
        ))
        FROM pg_policies
        WHERE schemaname = 'public'
    ),
    'enums', (
        SELECT json_object_agg(enum_name, enum_values)
        FROM (
            SELECT 
                t.typname AS enum_name,
                json_agg(e.enumlabel ORDER BY e.enumsortorder) AS enum_values
            FROM pg_type t 
            JOIN pg_enum e ON t.oid = e.enumtypid  
            JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
            WHERE n.nspname = 'public'
            GROUP BY t.typname
        ) enum_data
    ),
    'foreign_keys', (
        SELECT json_agg(json_build_object(
            'table_name', tc.table_name,
            'column_name', kcu.column_name,
            'foreign_table_name', ccu.table_name,
            'foreign_column_name', ccu.column_name
        ))
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND tc.table_schema = 'public'
    ),
    'indexes', (
        SELECT json_object_agg(indexname, json_build_object(
            'tablename', tablename,
            'indexdef', indexdef
        ))
        FROM pg_indexes 
        WHERE schemaname = 'public'
    ),
    'row_counts', (
        SELECT json_object_agg(table_name, row_count)
        FROM (
            SELECT 'users' as table_name, COUNT(*) as row_count FROM public.users
            UNION ALL
            SELECT 'listings' as table_name, COUNT(*) as row_count FROM public.listings
            UNION ALL
            SELECT 'bookings' as table_name, COUNT(*) as row_count FROM public.bookings
            UNION ALL
            SELECT 'vendor_profiles' as table_name, COUNT(*) as row_count FROM public.vendor_profiles
            UNION ALL
            SELECT 'venue_owner_profiles' as table_name, COUNT(*) as row_count FROM public.venue_owner_profiles
        ) counts
    )
) AS schema_json; 