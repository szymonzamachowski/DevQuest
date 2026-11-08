-- Supabase exposes the `public` schema through its Data API (PostgREST) using the
-- public `anon` key. The app only talks to Postgres through Prisma as the table
-- owner, which bypasses RLS, so enabling RLS with no policies blocks Data API
-- access without affecting the app.
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;
END
$$;
