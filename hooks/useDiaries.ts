import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Diary } from '@/lib/supabase'

export function useDiaries() {
  const [diaries, setDiaries] = useState<Diary[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDiaries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('diaries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) {
        console.error('获取日记失败:', error)
        return
      }

      setDiaries(data || [])
    } catch (error) {
      console.error('获取日记失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const addDiary = async (diary: Omit<Diary, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('用户未登录')

      const { data, error } = await supabase
        .from('diaries')
        .insert([
          {
            ...diary,
            user_id: user.id,
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('添加日记失败:', error)
        return { error }
      }

      setDiaries(prev => [data, ...prev])
      return { data }
    } catch (error) {
      console.error('添加日记失败:', error)
      return { error }
    }
  }

  const updateDiary = async (id: string, updates: Partial<Diary>) => {
    try {
      const { data, error } = await supabase
        .from('diaries')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('更新日记失败:', error)
        return { error }
      }

      setDiaries(prev => prev.map(diary => diary.id === id ? data : diary))
      return { data }
    } catch (error) {
      console.error('更新日记失败:', error)
      return { error }
    }
  }

  const deleteDiary = async (id: string) => {
    try {
      const { error } = await supabase
        .from('diaries')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('删除日记失败:', error)
        return { error }
      }

      setDiaries(prev => prev.filter(diary => diary.id !== id))
      return { success: true }
    } catch (error) {
      console.error('删除日记失败:', error)
      return { error }
    }
  }

  useEffect(() => {
    fetchDiaries()
  }, [])

  return {
    diaries,
    loading,
    fetchDiaries,
    addDiary,
    updateDiary,
    deleteDiary,
  }
}
