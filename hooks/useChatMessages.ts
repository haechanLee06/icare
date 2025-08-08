import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { ChatMessage } from '@/lib/supabase'

export function useChatMessages() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('获取聊天记录失败:', error)
        return
      }

      setMessages(data || [])
    } catch (error) {
      console.error('获取聊天记录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const addMessage = async (role: 'user' | 'assistant', content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('用户未登录')

      const { data, error } = await supabase
        .from('chat_messages')
        .insert([
          {
            user_id: user.id,
            role,
            content,
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('添加消息失败:', error)
        return { error }
      }

      setMessages(prev => [...prev, data])
      return { data }
    } catch (error) {
      console.error('添加消息失败:', error)
      return { error }
    }
  }

  const clearMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        console.error('清空消息失败:', error)
        return { error }
      }

      setMessages([])
      return { success: true }
    } catch (error) {
      console.error('清空消息失败:', error)
      return { error }
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  return {
    messages,
    loading,
    fetchMessages,
    addMessage,
    clearMessages,
  }
}
