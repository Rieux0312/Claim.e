-- ═══════════════════════════════════════════════
-- Claim.e — Schéma Supabase
-- Copiez-collez dans : SQL Editor → New query
-- ═══════════════════════════════════════════════

-- 1. TABLE USERS
CREATE TABLE IF NOT EXISTS public.users (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  company_name TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger : création automatique du profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email, company_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'company_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. TABLE LIVRAISONS
CREATE TABLE IF NOT EXISTS public.deliveries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      TEXT NOT NULL,
  tracking      TEXT NOT NULL DEFAULT '',
  expected_date DATE NOT NULL,
  actual_date   DATE,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('delivered', 'delayed', 'lost', 'pending')),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS deliveries_user_id_idx ON public.deliveries(user_id);

-- 3. TABLE ANOMALIES
CREATE TABLE IF NOT EXISTS public.anomalies (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id      UUID NOT NULL REFERENCES public.deliveries(id) ON DELETE CASCADE,
  type             TEXT NOT NULL CHECK (type IN ('delay', 'lost', 'service_failure')),
  estimated_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'sent', 'paid')),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS anomalies_user_id_idx ON public.anomalies(user_id);

-- 4. SÉCURITÉ RLS (Row Level Security)
ALTER TABLE public.users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anomalies  ENABLE ROW LEVEL SECURITY;

-- Policies users
CREATE POLICY "users_select" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_insert" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Policies livraisons
CREATE POLICY "deliveries_select" ON public.deliveries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "deliveries_insert" ON public.deliveries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "deliveries_update" ON public.deliveries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "deliveries_delete" ON public.deliveries FOR DELETE USING (auth.uid() = user_id);

-- Policies anomalies
CREATE POLICY "anomalies_select" ON public.anomalies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "anomalies_insert" ON public.anomalies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "anomalies_update" ON public.anomalies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "anomalies_delete" ON public.anomalies FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════
-- Migration v2 : Clés API transporteurs + synchro automatique
-- À exécuter une seule fois dans le SQL Editor
-- ═══════════════════════════════════════════════
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS carrier_api_keys JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS integrations      JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS last_sync_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS webhook_secret    TEXT;

-- Index unique pour éviter les doublons lors de la synchro API
-- (les imports CSV sans tracking ne sont pas concernés)
CREATE UNIQUE INDEX IF NOT EXISTS deliveries_user_tracking_unique
  ON public.deliveries (user_id, tracking)
  WHERE tracking IS NOT NULL AND tracking <> '';
