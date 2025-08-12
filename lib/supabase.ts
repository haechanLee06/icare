import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 添加调试信息
console.log("Supabase URL:", supabaseUrl)
console.log("Supabase Anon Key:", supabaseAnonKey ? "已设置" : "未设置")

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 类型定义
export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Diary {
  id: string
  user_id: string
  content: string
  date: string
  template: string
  highlight?: string
  images: string[]
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  user_id: string
  role: "user" | "assistant"
  content: string
  chat_date: string // 新增：聊天日期 (YYYY-MM-DD)
  created_at: string
}

// 工具函数：格式化日期为 YYYY-MM-DD
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

// 工具函数：获取今天的日期字符串
export function getTodayString(): string {
  return formatDate(new Date())
}
