import { useState } from 'react'
import type { Task, Status } from '../types'

interface Props {
  status: Status
  onAdd: (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'position'>) => Promise<void>
  onCancel: () => void
}

export default function AddTaskForm({ status, onAdd, onCancel }: Props) {
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    try {
      await onAdd({ title: title.trim(), description: null, status, priority: 'normal', due_date: null, assignee_id: null })
      onCancel()
    } catch {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-brand-500/50 shadow-card p-3">
      <input
        autoFocus
        type="text"
        placeholder="Task title..."
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => e.key === 'Escape' && onCancel()}
        className="w-full text-sm text-gray-800 placeholder-gray-400 outline-none"
      />
      <div className="flex gap-2 mt-3">
        <button
          type="submit"
          disabled={!title.trim() || submitting}
          className="px-3 py-1.5 text-xs font-medium bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 transition"
        >
          Add task
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
