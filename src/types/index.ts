export type Status = string
export type Priority = 'low' | 'normal' | 'high'

export interface Task {
  id: string
  title: string
  description: string | null
  status: Status
  priority: Priority
  due_date: string | null
  assignee_id: string | null
  user_id: string
  created_at: string
  position: number
  task_labels?: { label_id: string }[]
}

export interface TeamMember {
  id: string
  name: string
  color: string
  user_id: string
  created_at: string
}

export interface KanbanColumn {
  id: string
  name: string
  color: string      // hex text color
  bg_color: string   // hex background color
  status_key: string // value stored in task.status
  is_done: boolean
  position: number
  user_id: string
  created_at: string
}

export interface Label {
  id: string
  name: string
  color: string
  user_id: string
  created_at: string
}

export interface Comment {
  id: string
  task_id: string
  user_id: string
  body: string
  created_at: string
}

export interface Activity {
  id: string
  task_id: string
  user_id: string
  description: string
  created_at: string
}

export interface Filters {
  priority: Priority | ''
  assigneeId: string
  dueDate: 'overdue' | 'due_soon' | ''
  labelId: string
}

export const PRIORITY_CONFIG = {
  low:    { label: 'Low',    color: 'text-slate-500', dot: 'bg-slate-400' },
  normal: { label: 'Normal', color: 'text-blue-500',  dot: 'bg-blue-400'  },
  high:   { label: 'High',   color: 'text-rose-500',  dot: 'bg-rose-400'  },
}

export const AVATAR_COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#ef4444',
  '#f97316','#eab308','#22c55e','#14b8a6',
  '#3b82f6','#06b6d4',
]

export const LABEL_COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e',
  '#14b8a6','#3b82f6','#6366f1','#8b5cf6',
  '#ec4899','#64748b',
]

export const DEFAULT_COLUMNS_SEED = [
  { name: 'To Do',       color: '#475569', bg_color: '#f1f5f9', status_key: 'todo',        is_done: false, position: 0 },
  { name: 'In Progress', color: '#2563eb', bg_color: '#dbeafe', status_key: 'in_progress', is_done: false, position: 1 },
  { name: 'In Review',   color: '#7c3aed', bg_color: '#ede9fe', status_key: 'in_review',   is_done: false, position: 2 },
  { name: 'Done',        color: '#059669', bg_color: '#d1fae5', status_key: 'done',         is_done: true,  position: 3 },
]
