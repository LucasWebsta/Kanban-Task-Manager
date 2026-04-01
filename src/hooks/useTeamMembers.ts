import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { TeamMember } from '../types'

export function useTeamMembers(userId: string | undefined) {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMembers = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    const { data } = await supabase
      .from('team_members')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    setMembers(data || [])
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchMembers() }, [fetchMembers])

  const addMember = async (name: string, color: string) => {
    if (!userId) return
    const { data, error } = await supabase
      .from('team_members')
      .insert({ name: name.trim(), color, user_id: userId })
      .select()
      .single()
    if (error) throw error
    setMembers(prev => [...prev, data])
  }

  const deleteMember = async (id: string) => {
    await supabase.from('team_members').delete().eq('id', id)
    setMembers(prev => prev.filter(m => m.id !== id))
  }

  return { members, loading, addMember, deleteMember }
}
