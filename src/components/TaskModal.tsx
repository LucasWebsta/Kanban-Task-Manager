import { useState, useEffect } from 'react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import type { Task, Priority, Status, TeamMember, Label } from '../types'
import { PRIORITY_CONFIG, LABEL_COLORS } from '../types'
import Avatar from './Avatar'
import LabelBadge from './LabelBadge'
import { useComments } from '../hooks/useComments'
import { useActivity } from '../hooks/useActivity'

interface Props {
  task: Task
  members: TeamMember[]
  labels: Label[]
  userId: string | undefined
  onClose: () => void
  onUpdate: (id: string, updates: Partial<Task>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onSyncLabels: (taskId: string, labelIds: string[]) => Promise<void>
  onAddLabel: (name: string, color: string) => Promise<Label | null>
  columns: { status_key: string; name: string }[]
}

type Tab = 'details' | 'comments' | 'activity'

export default function TaskModal({ task, members, labels, userId, onClose, onUpdate, onDelete, onSyncLabels, onAddLabel, columns }: Props) {
  const [tab, setTab] = useState<Tab>('details')
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [priority, setPriority] = useState<Priority>(task.priority)
  const [dueDate, setDueDate] = useState(task.due_date || '')
  const [status, setStatus] = useState<Status>(task.status)
  const [assigneeId, setAssigneeId] = useState<string>(task.assignee_id || '')
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>(
    task.task_labels?.map(tl => tl.label_id) ?? []
  )
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0])
  const [addingLabel, setAddingLabel] = useState(false)

  const { comments, addComment } = useComments(task.id, userId)
  const { activity, log } = useActivity(task.id, userId)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const toggleLabel = (id: string) => {
    setSelectedLabelIds(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    )
  }

  const handleCreateLabel = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!newLabelName.trim()) return
    const created = await onAddLabel(newLabelName.trim(), newLabelColor)
    if (created) {
      setSelectedLabelIds(prev => [...prev, created.id])
      setNewLabelName('')
      setAddingLabel(false)
    }
  }

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)

    const changes: string[] = []
    if (title.trim() !== task.title) changes.push('Updated title')
    if ((description.trim() || null) !== task.description) changes.push('Updated description')
    if (priority !== task.priority) changes.push(`Priority changed to ${PRIORITY_CONFIG[priority].label}`)
    if ((dueDate || null) !== task.due_date) {
      changes.push(dueDate ? `Due date set to ${dueDate}` : 'Due date removed')
    }
    if ((assigneeId || null) !== task.assignee_id) {
      const newAssignee = members.find(m => m.id === assigneeId)
      changes.push(newAssignee ? `Assigned to ${newAssignee.name}` : 'Unassigned')
    }

    await onUpdate(task.id, {
      title: title.trim(),
      description: description.trim() || null,
      priority,
      due_date: dueDate || null,
      status,
      assignee_id: assigneeId || null,
    })
    await onSyncLabels(task.id, selectedLabelIds)
    for (const change of changes) await log(change)

    setSaving(false)
    onClose()
  }

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return
    setDeleting(true)
    await onDelete(task.id)
    onClose()
  }

  const handleAddComment = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmittingComment(true)
    await addComment(commentText)
    setCommentText('')
    setSubmittingComment(false)
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'details', label: 'Details' },
    { id: 'comments', label: 'Comments', count: comments.length },
    { id: 'activity', label: 'Activity', count: activity.length },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-0 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900 truncate flex-1 mr-4">{task.title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-gray-400 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-5 mt-4 flex-shrink-0">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 pb-3 px-1 mr-5 text-sm font-medium border-b-2 transition ${tab === t.id ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className="bg-gray-100 text-gray-500 text-xs rounded-full px-1.5 py-0.5 font-medium">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {tab === 'details' && (
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  className="mt-1.5 w-full text-sm font-medium text-gray-900 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition" />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Add a description..."
                  className="mt-1.5 w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)}
                    className="mt-1.5 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition bg-white">
                    {columns.map(c => <option key={c.status_key} value={c.status_key}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Priority</label>
                  <select value={priority} onChange={e => setPriority(e.target.value as Priority)}
                    className="mt-1.5 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition bg-white">
                    {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Due Date</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                    className="mt-1.5 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Assignee</label>
                  {members.length === 0 ? (
                    <p className="mt-1.5 text-xs text-gray-400">No team members yet</p>
                  ) : (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <button type="button" onClick={() => setAssigneeId('')}
                        className={`px-2 py-1 rounded-lg text-xs font-medium transition ${!assigneeId ? 'bg-gray-200 text-gray-700' : 'text-gray-400 hover:bg-gray-100'}`}>
                        None
                      </button>
                      {members.map(m => (
                        <button key={m.id} type="button" onClick={() => setAssigneeId(m.id)}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition ${assigneeId === m.id ? 'bg-gray-100 ring-2 ring-brand-500/40' : 'hover:bg-gray-50'}`}>
                          <Avatar member={m} size="sm" />
                          <span className="text-gray-700">{m.name.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Labels */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Labels</label>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {labels.map(l => (
                    <button key={l.id} type="button" onClick={() => toggleLabel(l.id)}
                      className={`transition rounded-full ${selectedLabelIds.includes(l.id) ? 'ring-2 ring-offset-1 ring-gray-400' : 'opacity-50 hover:opacity-75'}`}>
                      <LabelBadge label={l} size="sm" />
                    </button>
                  ))}
                  {addingLabel ? (
                    <form onSubmit={handleCreateLabel} className="flex items-center gap-1.5 w-full mt-1">
                      <input autoFocus type="text" value={newLabelName} onChange={e => setNewLabelName(e.target.value)}
                        placeholder="Label name..." className="text-xs border border-gray-200 rounded-lg px-2 py-1 flex-1 focus:outline-none focus:border-brand-500" />
                      <div className="flex gap-1">
                        {LABEL_COLORS.map(c => (
                          <button key={c} type="button" onClick={() => setNewLabelColor(c)}
                            className={`w-4 h-4 rounded-full transition-transform ${newLabelColor === c ? 'scale-125 ring-1 ring-offset-1 ring-gray-400' : ''}`}
                            style={{ backgroundColor: c }} />
                        ))}
                      </div>
                      <button type="submit" disabled={!newLabelName.trim()}
                        className="text-xs px-2 py-1 bg-brand-500 text-white rounded-lg disabled:opacity-50">Save</button>
                      <button type="button" onClick={() => setAddingLabel(false)} className="text-xs text-gray-400 hover:text-gray-600">×</button>
                    </form>
                  ) : (
                    <button type="button" onClick={() => setAddingLabel(true)}
                      className="text-xs text-gray-400 hover:text-gray-600 transition px-1.5 py-0.5 rounded-full border border-dashed border-gray-300 hover:border-gray-400">
                      + New label
                    </button>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-400 pt-1">
                Created {new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          )}

          {tab === 'comments' && (
            <div className="p-5 flex flex-col gap-4">
              {comments.length === 0 && (
                <div className="text-center py-8">
                  <svg className="w-8 h-8 text-gray-200 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-xs text-gray-400">No comments yet</p>
                </div>
              )}
              <div className="space-y-3">
                {comments.map(c => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xs font-semibold flex-shrink-0">G</div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-xl px-3 py-2">
                        <p className="text-sm text-gray-700">{c.body}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 ml-1">{formatDistanceToNow(parseISO(c.created_at), { addSuffix: true })}</p>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddComment} className="flex gap-2 mt-auto pt-2">
                <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Write a comment..."
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition" />
                <button type="submit" disabled={!commentText.trim() || submittingComment}
                  className="px-3 py-2 text-sm font-medium bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 transition">
                  Post
                </button>
              </form>
            </div>
          )}

          {tab === 'activity' && (
            <div className="p-5">
              {activity.length === 0 && (
                <div className="text-center py-8">
                  <svg className="w-8 h-8 text-gray-200 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-xs text-gray-400">No activity yet</p>
                </div>
              )}
              <div className="space-y-0">
                {activity.map((a, i) => (
                  <div key={a.id} className="flex gap-3 relative">
                    {i < activity.length - 1 && <div className="absolute left-[13px] top-7 bottom-0 w-px bg-gray-100" />}
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 z-10">
                      <div className="w-2 h-2 rounded-full bg-gray-400" />
                    </div>
                    <div className="pb-4 flex-1">
                      <p className="text-sm text-gray-700">{a.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDistanceToNow(parseISO(a.created_at), { addSuffix: true })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {tab === 'details' && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
            <button onClick={handleDelete} disabled={deleting}
              className="text-sm text-rose-500 hover:text-rose-700 font-medium transition disabled:opacity-50">
              {deleting ? 'Deleting...' : 'Delete task'}
            </button>
            <div className="flex gap-2">
              <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition">Cancel</button>
              <button onClick={handleSave} disabled={!title.trim() || saving}
                className="px-4 py-2 text-sm font-medium bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 transition">
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
