import { useState, useEffect } from 'react'
import type { TeamMember } from '../types'
import { AVATAR_COLORS } from '../types'
import Avatar from './Avatar'

interface Props {
  members: TeamMember[]
  onAdd: (name: string, color: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onClose: () => void
}

export default function TeamModal({ members, onAdd, onDelete, onClose }: Props) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(AVATAR_COLORS[0])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      await onAdd(name.trim(), color)
      setName('')
      setColor(AVATAR_COLORS[0])
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Team Members</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Add member form */}
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Alex Johnson"
                className="mt-1.5 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Color</label>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                {AVATAR_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={!name.trim() || saving}
              className="w-full py-2 text-sm font-medium bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 transition"
            >
              {saving ? 'Adding...' : 'Add Member'}
            </button>
          </form>

          {/* Member list */}
          {members.length > 0 && (
            <div className="border-t border-gray-100 pt-4 space-y-2">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2.5">
                    <Avatar member={member} size="md" />
                    <span className="text-sm font-medium text-gray-800">{member.name}</span>
                  </div>
                  <button
                    onClick={() => onDelete(member.id)}
                    className="text-xs text-gray-400 hover:text-rose-500 transition"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {members.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-2">No team members yet. Add one above.</p>
          )}
        </div>
      </div>
    </div>
  )
}
