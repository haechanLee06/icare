-- 添加 chat_date 列到现有的 chat_messages 表
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS chat_date DATE;

-- 为现有记录设置 chat_date（基于 created_at）
UPDATE chat_messages 
SET chat_date = DATE(created_at) 
WHERE chat_date IS NULL;

-- 设置默认值为当前日期
ALTER TABLE chat_messages 
ALTER COLUMN chat_date SET DEFAULT CURRENT_DATE;

-- 添加非空约束
ALTER TABLE chat_messages 
ALTER COLUMN chat_date SET NOT NULL;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_date ON chat_messages(user_id, chat_date);
CREATE INDEX IF NOT EXISTS idx_chat_messages_date ON chat_messages(chat_date);

-- 验证数据
SELECT 
  chat_date,
  COUNT(*) as message_count
FROM chat_messages 
GROUP BY chat_date 
ORDER BY chat_date DESC;
