-- =====================================================
-- SUPABASE RLS (Row Level Security) SETUP
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- =====================================================
-- 1. CRIAÇÃO DAS TABELAS
-- =====================================================

-- Tabela de versículos favoritos
CREATE TABLE IF NOT EXISTS favorite_verses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_id TEXT NOT NULL,
  verse_text TEXT NOT NULL,
  verse_reference TEXT NOT NULL,
  verse_emotion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, verse_id)
);

-- Tabela de reflexões do diário
CREATE TABLE IF NOT EXISTS reflections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_id TEXT,
  verse_text TEXT,
  verse_reference TEXT,
  content TEXT NOT NULL,
  mood TEXT,
  tags TEXT[],
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de preferências do usuário
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  preferred_emotions TEXT[],
  notification_enabled BOOLEAN DEFAULT true,
  notification_time TIME DEFAULT '08:00',
  theme TEXT DEFAULT 'light',
  font_size TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  premium_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

ALTER TABLE favorite_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. POLÍTICAS PARA favorite_verses
-- =====================================================

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can view own favorites" ON favorite_verses;
DROP POLICY IF EXISTS "Users can insert own favorites" ON favorite_verses;
DROP POLICY IF EXISTS "Users can update own favorites" ON favorite_verses;
DROP POLICY IF EXISTS "Users can delete own favorites" ON favorite_verses;

-- SELECT: Usuários podem ver apenas seus próprios favoritos
CREATE POLICY "Users can view own favorites" 
  ON favorite_verses 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- INSERT: Usuários podem inserir apenas em seus próprios registros
CREATE POLICY "Users can insert own favorites" 
  ON favorite_verses 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Usuários podem atualizar apenas seus próprios favoritos
CREATE POLICY "Users can update own favorites" 
  ON favorite_verses 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Usuários podem deletar apenas seus próprios favoritos
CREATE POLICY "Users can delete own favorites" 
  ON favorite_verses 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- 4. POLÍTICAS PARA reflections
-- =====================================================

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can view own reflections" ON reflections;
DROP POLICY IF EXISTS "Users can insert own reflections" ON reflections;
DROP POLICY IF EXISTS "Users can update own reflections" ON reflections;
DROP POLICY IF EXISTS "Users can delete own reflections" ON reflections;

-- SELECT: Usuários podem ver apenas suas próprias reflexões
CREATE POLICY "Users can view own reflections" 
  ON reflections 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- INSERT: Usuários podem inserir apenas em seus próprios registros
CREATE POLICY "Users can insert own reflections" 
  ON reflections 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Usuários podem atualizar apenas suas próprias reflexões
CREATE POLICY "Users can update own reflections" 
  ON reflections 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Usuários podem deletar apenas suas próprias reflexões
CREATE POLICY "Users can delete own reflections" 
  ON reflections 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- 5. POLÍTICAS PARA user_preferences
-- =====================================================

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete own preferences" ON user_preferences;

-- SELECT: Usuários podem ver apenas suas próprias preferências
CREATE POLICY "Users can view own preferences" 
  ON user_preferences 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- INSERT: Usuários podem inserir apenas em seus próprios registros
CREATE POLICY "Users can insert own preferences" 
  ON user_preferences 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Usuários podem atualizar apenas suas próprias preferências
CREATE POLICY "Users can update own preferences" 
  ON user_preferences 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Usuários podem deletar apenas suas próprias preferências
CREATE POLICY "Users can delete own preferences" 
  ON user_preferences 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- 6. POLÍTICAS PARA user_profiles
-- =====================================================

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;

-- SELECT: Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile" 
  ON user_profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- INSERT: Usuários podem inserir apenas seu próprio perfil
CREATE POLICY "Users can insert own profile" 
  ON user_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- UPDATE: Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile" 
  ON user_profiles 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- DELETE: Usuários podem deletar apenas seu próprio perfil
CREATE POLICY "Users can delete own profile" 
  ON user_profiles 
  FOR DELETE 
  USING (auth.uid() = id);

-- =====================================================
-- 7. ÍNDICES PARA MELHOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_favorite_verses_user_id ON favorite_verses(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_verses_verse_id ON favorite_verses(verse_id);
CREATE INDEX IF NOT EXISTS idx_favorite_verses_created_at ON favorite_verses(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reflections_user_id ON reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_reflections_created_at ON reflections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reflections_mood ON reflections(mood);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- =====================================================
-- 8. TRIGGERS PARA ATUALIZAR updated_at
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para favorite_verses
DROP TRIGGER IF EXISTS update_favorite_verses_updated_at ON favorite_verses;
CREATE TRIGGER update_favorite_verses_updated_at
  BEFORE UPDATE ON favorite_verses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para reflections
DROP TRIGGER IF EXISTS update_reflections_updated_at ON reflections;
CREATE TRIGGER update_reflections_updated_at
  BEFORE UPDATE ON reflections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para user_preferences
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. TRIGGER PARA CRIAR PERFIL AUTOMATICAMENTE
-- =====================================================

-- Função para criar perfil quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 10. VERIFICAÇÃO DAS POLÍTICAS CRIADAS
-- =====================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
