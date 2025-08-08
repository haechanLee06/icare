# Supabase 配置指南

## 第一步：创建 Supabase 项目

1. 访问 [Supabase 官网](https://supabase.com)
2. 点击 "Start your project" 或 "Sign in"
3. 创建新项目：
   - 项目名称：`icare-diary`
   - 设置数据库密码（请记住这个密码）
   - 选择地区（建议选择离您最近的地区）

## 第二步：创建数据库表

在 Supabase 仪表板中，进入 "SQL Editor"，依次执行以下 SQL 脚本：

### 1. 创建用户资料表
\`\`\`sql
-- 创建用户资料表
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS（行级安全）
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看和编辑自己的资料
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
\`\`\`

### 2. 创建日记表
\`\`\`sql
-- 创建日记表
CREATE TABLE diaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  date DATE NOT NULL,
  template TEXT DEFAULT 'default',
  highlight TEXT,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 启用 RLS
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看和编辑自己的日记
CREATE POLICY "Users can view own diaries" ON diaries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diaries" ON diaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diaries" ON diaries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diaries" ON diaries
  FOR DELETE USING (auth.uid() = user_id);
\`\`\`

### 3. 创建聊天记录表
\`\`\`sql
-- 创建聊天记录表
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看自己的聊天记录
CREATE POLICY "Users can view own chat messages" ON chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat messages" ON chat_messages
  FOR DELETE USING (auth.uid() = user_id);
\`\`\`

### 4. 创建触发器函数（可选）
\`\`\`sql
-- 创建更新时间的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 profiles 表添加触发器
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 为 diaries 表添加触发器
CREATE TRIGGER update_diaries_updated_at 
    BEFORE UPDATE ON diaries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
\`\`\`

## 第三步：获取项目配置信息

1. 在 Supabase 仪表板中，点击左侧菜单的 "Settings"
2. 点击 "API"
3. 复制以下信息：
   - **Project URL** (例如：`https://your-project-id.supabase.co`)
   - **anon public key** (以 `eyJ...` 开头的长字符串)

## 第四步：配置环境变量

1. 在项目根目录创建 `.env.local` 文件
2. 添加以下内容（替换为您的实际配置）：

\`\`\`env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

## 第五步：安装依赖

\`\`\`bash
npm install @supabase/supabase-js
\`\`\`

## 第六步：启动项目

\`\`\`bash
npm run dev
\`\`\`

## 功能说明

配置完成后，您的应用将具备以下功能：

1. **用户认证**：
   - 用户注册和登录
   - 邮箱验证
   - 会话管理

2. **日记管理**：
   - 创建、编辑、查看日记
   - 按日期组织日记
   - 支持多种模板和图片

3. **聊天功能**：
   - 与AI聊天
   - 聊天记录保存
   - 基于聊天记录生成日记

4. **数据安全**：
   - 行级安全策略
   - 用户数据隔离
   - 自动数据备份

## 注意事项

1. 确保在生产环境中使用 HTTPS
2. 定期备份数据库
3. 监控 API 使用量
4. 根据需要调整 RLS 策略
