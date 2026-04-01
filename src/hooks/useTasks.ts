import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Task } from '../types'

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    const { data, error } = await supabase
      .from('tasks')
      .select('*, task_labels(label_id)')
      .eq('user_id', userId)
      .order('position', { ascending: true })
    if (error) {
      setError(error.message)
    } else {
      setTasks(data || [])
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const createTask = async (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'position'>) => {
    if (!userId) return
    const maxPosition = Math.max(0, ...tasks.filter(t => t.status === task.status).map(t => t.position))
    const payload = { ...task, user_id: userId, position: maxPosition + 1 }
    const { data, error } = await supabase
      .from('tasks')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    setTasks(prev => [...prev, data])
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const { error } = await supabase.from('tasks').update(updates).eq('id', id)
    if (error) throw error
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) throw error
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const moveTask = async (id: string, newStatus: string) => {
    const previous = tasks.find(t => t.id === id)
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t))
    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', id)
    if (error && previous) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: previous.status } : t))
      return
    }
    // Log activity
    if (userId && previous) {
      await supabase.from('task_activity').insert({
        task_id: id,
        user_id: userId,
        description: `Moved from ${previous.status} → ${newStatus}`
      })
    }
  }

  return { tasks, loading, error, createTask, updateTask, deleteTask, moveTask, refetch: fetchTasks }
}
