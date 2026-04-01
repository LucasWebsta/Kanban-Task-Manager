import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Label } from '../types'

export function useLabels(userId: string | undefined) {
  const [labels, setLabels] = useState<Label[]>([])

  const fetchLabels = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('labels')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    setLabels(data || [])
  }, [userId])

  useEffect(() => { fetchLabels() }, [fetchLabels])

  const addLabel = async (name: string, color: string): Promise<Label | null> => {
    if (!userId) return null
    const { data, error } = await supabase
      .from('labels')
      .insert({ name: name.trim(), color, user_id: userId })
      .select()
      .single()
    if (error) return null
    setLabels(prev => [...prev, data])
    return data
  }

  const deleteLabel = async (id: string) => {
    await supabase.from('labels').delete().eq('id', id)
    setLabels(prev => prev.filter(l => l.id !== id))
  }

  const syncTaskLabels = async (taskId: string, labelIds: string[]) => {
    await supabase.from('task_labels').delete().eq('task_id', taskId)
    if (labelIds.length > 0) {
      await supabase.from('task_labels').insert(
        labelIds.map(label_id => ({ task_id: taskId, label_id }))
      )
    }
  }

  return { labels, addLabel, deleteLabel, syncTaskLabels }
}
