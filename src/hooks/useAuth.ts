import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        setLoading(false)
        return
      }

      // Try anonymous sign-in first; fall back to auto-generated guest account
      const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
      if (!anonError && anonData.user) {
        setUser(anonData.user)
        setLoading(false)
        return
      }

      // Fallback: use a persisted random guest credential stored in localStorage
      let guestEmail = localStorage.getItem('guest_email')
      let guestPassword = localStorage.getItem('guest_password')
      if (!guestEmail || !guestPassword) {
        guestEmail = `guest_${crypto.randomUUID()}@example.com`
        guestPassword = crypto.randomUUID()
        localStorage.setItem('guest_email', guestEmail)
        localStorage.setItem('guest_password', guestPassword)
      }

      // Try signing in with existing credentials first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: guestEmail,
        password: guestPassword,
      })
      if (!signInError && signInData.user) {
        setUser(signInData.user)
        setLoading(false)
        return
      }

      // First visit — create the account
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: guestEmail,
        password: guestPassword,
        options: { emailRedirectTo: undefined },
      })
      if (!signUpError) setUser(signUpData.user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
