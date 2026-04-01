import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Comment } from '../types'

export function useComments(taskId: string, userId: string | undefined) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })
    setComments(data || [])
    setLoading(false)
  }, [taskId])

  useEffect(() => { fetchComments() }, [fetchComments])

  const addComment = async (body: string) => {
    if (!userId || !body.trim()) return
    const { data, error } = await supabase
      .from('comments')
      .insert({ task_id: taskId, user_id: userId, body: body.trim() })
      .select()
      .single()
    if (error) throw error
    setComments(prev => [...prev, data])
  }

  return { comments, loading, addComment }
}
