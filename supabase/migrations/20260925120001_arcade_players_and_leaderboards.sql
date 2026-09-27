-- =========================================================================
-- MIGRAÇÃO: SISTEMA DE IDENTIDADE (NICK + SENHA) & RANKINGS DEDICADOS
-- =========================================================================

-- 1. TABELA DE PERFIS DE JOGADORES COM SENHA E CHAVE DE RECUPERAÇÃO
CREATE TABLE IF NOT EXISTS public.arcade_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text UNIQUE NOT NULL,               -- Identificador único em minúsculas (para busca rápida)
  player_name_display text NOT NULL,       -- Nome formatado exibido (ex: "KitoMaster")
  password_hash text NOT NULL,              -- Hash SHA-256 do nick + senha
  recovery_key text NOT NULL,               -- Chave secreta de recuperação (ex: "REC-9X2A-7K")
  created_at timestamptz DEFAULT now(),
  last_login timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_arcade_players_lower_name 
  ON public.arcade_players (lower(player_name));

ALTER TABLE public.arcade_players ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_players" ON public.arcade_players;
CREATE POLICY "anon_select_players" ON public.arcade_players 
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_players" ON public.arcade_players;
CREATE POLICY "anon_insert_players" ON public.arcade_players 
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_players" ON public.arcade_players;
CREATE POLICY "anon_update_players" ON public.arcade_players 
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);


-- 2. TABELA DE RANKING DEDICADA: JOGO DE XADREZ
CREATE TABLE IF NOT EXISTS public.xadrez_leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES public.arcade_players(id) ON DELETE SET NULL,
  player_name text NOT NULL,
  wins int NOT NULL DEFAULT 0,
  draws int NOT NULL DEFAULT 0,
  losses int NOT NULL DEFAULT 0,
  points int NOT NULL DEFAULT 0,            -- (wins * 3 + draws * 1)
  last_match_mode text DEFAULT 'ia',        -- 'ia' ou 'online'
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_xadrez_leaderboard_points 
  ON public.xadrez_leaderboard (points DESC, wins DESC);

ALTER TABLE public.xadrez_leaderboard ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_xadrez" ON public.xadrez_leaderboard;
CREATE POLICY "anon_select_xadrez" ON public.xadrez_leaderboard 
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_xadrez" ON public.xadrez_leaderboard;
CREATE POLICY "anon_insert_xadrez" ON public.xadrez_leaderboard 
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_xadrez" ON public.xadrez_leaderboard;
CREATE POLICY "anon_update_xadrez" ON public.xadrez_leaderboard 
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);


-- 3. TABELA DE RANKING DEDICADA: DAMAS CLÁSSICAS
CREATE TABLE IF NOT EXISTS public.damas_leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES public.arcade_players(id) ON DELETE SET NULL,
  player_name text NOT NULL,
  wins int NOT NULL DEFAULT 0,
  losses int NOT NULL DEFAULT 0,
  captures int NOT NULL DEFAULT 0,
  points int NOT NULL DEFAULT 0,            -- (wins * 3 + captures)
  last_match_mode text DEFAULT 'ia',        -- 'ia' ou 'online'
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_damas_leaderboard_points 
  ON public.damas_leaderboard (points DESC, wins DESC);

ALTER TABLE public.damas_leaderboard ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_damas" ON public.damas_leaderboard;
CREATE POLICY "anon_select_damas" ON public.damas_leaderboard 
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_damas" ON public.damas_leaderboard;
CREATE POLICY "anon_insert_damas" ON public.damas_leaderboard 
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_damas" ON public.damas_leaderboard;
CREATE POLICY "anon_update_damas" ON public.damas_leaderboard 
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);


-- 4. ATUALIZAÇÃO DA TABELA TETRIS LEADERBOARD
ALTER TABLE public.tetris_leaderboard 
  ADD COLUMN IF NOT EXISTS player_id uuid REFERENCES public.arcade_players(id) ON DELETE SET NULL;
