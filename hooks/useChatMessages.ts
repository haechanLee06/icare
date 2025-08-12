"use client"

import { useState, useEffect } from "react"
import { supabase, getTodayString } from "@/lib/supabase"
import type { ChatMessage } from "@/lib/supabase"

export function useChatMessages(selectedDate?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [chatDates, setChatDates] = useState<string[]>([])
  const [migrationNeeded, setMigrationNeeded] = useState(false)
  const currentDate = selectedDate || getTodayString()

  // 检查是否需要迁移数据库
  const checkMigration = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return false

      // 尝试查询 chat_date 列
      const { error } = await supabase.from("chat_messages").select("chat_date").limit(1)

      if (error && error.message.includes("chat_date")) {
        setMigrationNeeded(true)
        return false
      }
      return true
    } catch (error) {
      console.error("检查迁移状态失败:", error)
      return false
    }
  }

  const fetchMessages = async (date: string = currentDate) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // 检查是否需要迁移
      const canProceed = await checkMigration()
      if (!canProceed) {
        // 如果需要迁移，使用旧的查询方式（按创建日期过滤）
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)

        const { data, error } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("user_id", user.id)
          .gte("created_at", startOfDay.toISOString())
          .lte("created_at", endOfDay.toISOString())
          .order("created_at", { ascending: true })

        if (error) {
          console.error("获取聊天记录失败:", error)
          return
        }

        // 为旧数据添加 chat_date 字段
        const messagesWithDate = (data || []).map((msg) => ({
          ...msg,
          chat_date: date,
        }))

        setMessages(messagesWithDate)
        return
      }

      // 使用新的查询方式
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", user.id)
        .eq("chat_date", date)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("获取聊天记录失败:", error)
        return
      }

      setMessages(data || [])
    } catch (error) {
      console.error("获取聊天记录失败:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchChatDates = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // 检查是否需要迁移
      const canProceed = await checkMigration()
      if (!canProceed) {
        // 如果需要迁移，从 created_at 提取日期
        const { data, error } = await supabase
          .from("chat_messages")
          .select("created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("获取聊天日期失败:", error)
          return
        }

        // 提取唯一日期
        const uniqueDates = [
          ...new Set((data || []).map((item) => new Date(item.created_at).toISOString().split("T")[0])),
        ]
        setChatDates(uniqueDates)
        return
      }

      // 使用新的查询方式
      const { data, error } = await supabase
        .from("chat_messages")
        .select("chat_date")
        .eq("user_id", user.id)
        .order("chat_date", { ascending: false })

      if (error) {
        console.error("获取聊天日期失败:", error)
        return
      }

      // 去重并获取唯一日期
      const uniqueDates = [...new Set(data?.map((item) => item.chat_date) || [])]
      setChatDates(uniqueDates)
    } catch (error) {
      console.error("获取聊天日期失败:", error)
    }
  }

  const addMessage = async (role: "user" | "assistant", content: string, date: string = currentDate) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("用户未登录")

      // 检查是否需要迁移
      const canProceed = await checkMigration()

      const messageData: any = {
        user_id: user.id,
        role,
        content,
      }

      // 只有在迁移完成后才添加 chat_date
      if (canProceed) {
        messageData.chat_date = date
      }

      const { data, error } = await supabase.from("chat_messages").insert([messageData]).select().single()

      if (error) {
        console.error("添加消息失败:", error)
        return { error }
      }

      // 为返回的数据添加 chat_date（如果不存在）
      const messageWithDate = {
        ...data,
        chat_date: data.chat_date || date,
      }

      // 只有当添加的消息是当前选择的日期时，才更新本地状态
      if (date === currentDate) {
        setMessages((prev) => [...prev, messageWithDate])
      }

      // 更新聊天日期列表
      if (!chatDates.includes(date)) {
        setChatDates((prev) => [date, ...prev].sort((a, b) => b.localeCompare(a)))
      }

      return { data: messageWithDate }
    } catch (error) {
      console.error("添加消息失败:", error)
      return { error }
    }
  }

  const clearMessages = async (date: string = currentDate) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // 检查是否需要迁移
      const canProceed = await checkMigration()

      let error
      if (!canProceed) {
        // 使用日期范围删除
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)

        const result = await supabase
          .from("chat_messages")
          .delete()
          .eq("user_id", user.id)
          .gte("created_at", startOfDay.toISOString())
          .lte("created_at", endOfDay.toISOString())

        error = result.error
      } else {
        // 使用 chat_date 删除
        const result = await supabase.from("chat_messages").delete().eq("user_id", user.id).eq("chat_date", date)

        error = result.error
      }

      if (error) {
        console.error("清空消息失败:", error)
        return { error }
      }

      if (date === currentDate) {
        setMessages([])
      }

      // 更新聊天日期列表
      await fetchChatDates()

      return { success: true }
    } catch (error) {
      console.error("清空消息失败:", error)
      return { error }
    }
  }

  useEffect(() => {
    fetchMessages(currentDate)
    fetchChatDates()
  }, [currentDate])

  return {
    messages,
    loading,
    chatDates,
    currentDate,
    migrationNeeded,
    fetchMessages,
    addMessage,
    clearMessages,
    refreshChatDates: fetchChatDates,
  }
}
