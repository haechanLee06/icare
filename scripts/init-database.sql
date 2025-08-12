-- 创建用户表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 修改聊天记录表，添加日期字段
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  chat_date DATE NOT NULL DEFAULT CURRENT_DATE, -- 新增：聊天日期
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建日记表
CREATE TABLE IF NOT EXISTS diaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  date DATE NOT NULL,
  template TEXT DEFAULT 'default',
  highlight TEXT,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date) -- 每个用户每天只能有一篇日记
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_date ON chat_messages(user_id, chat_date);
CREATE INDEX IF NOT EXISTS idx_diaries_user_date ON diaries(user_id, date);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_diaries_updated_at 
  BEFORE UPDATE ON diaries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入示例数据
INSERT INTO profiles (id, email, full_name) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'demo@example.com', '演示用户')
ON CONFLICT (id) DO NOTHING;

-- 插入示例聊天记录
INSERT INTO chat_messages (user_id, role, content, chat_date) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'user', '你好', '2025-01-12'),
  ('00000000-0000-0000-0000-000000000001', 'assistant', '你好！今天过得怎么样？', '2025-01-12'),
  ('00000000-0000-0000-0000-000000000001', 'user', '今天工作很顺利', '2025-01-12'),
  ('00000000-0000-0000-0000-000000000001', 'assistant', '那真是太好了！工作顺利会让人心情愉悦呢。', '2025-01-12')
ON CONFLICT DO NOTHING;

-- 插入示例日记
INSERT INTO diaries (user_id, content, date, template, highlight) VALUES 
  ('00000000-0000-0000-0000-000000000001', '今天是充实的一天。工作进展顺利，心情也很不错。', '2025-01-12', 'warm', '工作进展顺利')
ON CONFLICT (user_id, date) DO NOTHING;
