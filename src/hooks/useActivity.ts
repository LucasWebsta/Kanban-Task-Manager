import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Activity } from '../types'

export function useActivity(taskId: string, userId: string | undefined) {
  const [activity, setActivity] = useState<Activity[]>([])

  const fetchActivity = useCallback(async () => {
    const { data } = await supabase
      .from('task_activity')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })
    setActivity(data || [])
  }, [taskId])

  useEffect(() => { fetchActivity() }, [fetchActivity])

  const log = useCallback(async (description: string) => {
    if (!userId) return
    const { data, error } = await supabase
      .from('task_activity')
      .insert({ task_id: taskId, user_id: userId, description })
      .select()
      .single()
    if (error) return
    setActivity(prev => [...prev, data])
  }, [taskId, userId])

  return { activity, log }
}
