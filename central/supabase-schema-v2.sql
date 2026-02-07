-- ClawShield Cloud Database Schema
-- Rode no SQL Editor do Supabase

-- ============================================
-- Tabela: api_keys
-- Chaves de API para autenticação do scanner
-- ============================================
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    key TEXT UNIQUE NOT NULL,
    name TEXT DEFAULT 'Default Key',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ
);

-- RLS: Users só veem suas próprias chaves
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own API keys"
    ON api_keys
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Tabela: scans
-- Histórico de scans de cada usuário
-- ============================================
CREATE TABLE IF NOT EXISTS scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    skill_fingerprint TEXT NOT NULL,
    status TEXT CHECK (status IN ('CLEAN', 'CAUTION', 'WARNING', 'BLOCKED')),
    score INTEGER CHECK (score >= 0 AND score <= 100),
    files_scanned INTEGER DEFAULT 0,
    issues_count INTEGER DEFAULT 0,
    critical_count INTEGER DEFAULT 0,
    high_count INTEGER DEFAULT 0,
    medium_count INTEGER DEFAULT 0,
    findings JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes para performance
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at);
CREATE INDEX IF NOT EXISTS idx_scans_skill_fingerprint ON scans(skill_fingerprint);

-- RLS: Users só veem seus próprios scans
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scans"
    ON scans
    FOR SELECT
    USING (auth.uid() = user_id);

-- Scans são inseridos via Edge Function (service role)
CREATE POLICY "Service can insert scans"
    ON scans
    FOR INSERT
    WITH CHECK (true);

-- ============================================
-- Tabela: skills_reputation
-- Reputação agregada das skills
-- ============================================
CREATE TABLE IF NOT EXISTS skills_reputation (
    skill_fingerprint TEXT PRIMARY KEY,
    skill_name TEXT NOT NULL,
    total_scans INTEGER DEFAULT 0,
    blocked_count INTEGER DEFAULT 0,
    reputation_score INTEGER CHECK (reputation_score >= 0 AND reputation_score <= 100) DEFAULT 100,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Todos podem ver reputação
ALTER TABLE skills_reputation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reputation"
    ON skills_reputation
    FOR SELECT
    USING (true);

-- Updates via Edge Function
CREATE POLICY "Service can update reputation"
    ON skills_reputation
    FOR ALL
    WITH CHECK (true);

-- ============================================
-- Função para gerar API key automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS TEXT AS $$
DECLARE
    new_key TEXT;
BEGIN
    new_key := 'claw_' || encode(gen_random_bytes(32), 'hex');
    RETURN new_key;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Trigger para criar API key quando usuário se registra
-- ============================================
CREATE OR REPLACE FUNCTION create_default_api_key()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO api_keys (user_id, key, name)
    VALUES (NEW.id, generate_api_key(), 'Default Key');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger (remover se já existir)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_api_key();
