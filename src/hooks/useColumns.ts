import type { KanbanColumn } from '../types'

const STATIC_COLUMNS: KanbanColumn[] = [
  { id: 'col-todo',        name: 'To Do',       color: '#475569', bg_color: '#f1f5f9', status_key: 'todo',        is_done: false, position: 0, user_id: '', created_at: '' },
  { id: 'col-in_progress', name: 'In Progress', color: '#2563eb', bg_color: '#dbeafe', status_key: 'in_progress', is_done: false, position: 1, user_id: '', created_at: '' },
  { id: 'col-in_review',   name: 'In Review',   color: '#7c3aed', bg_color: '#ede9fe', status_key: 'in_review',   is_done: false, position: 2, user_id: '', created_at: '' },
  { id: 'col-done',        name: 'Done',         color: '#059669', bg_color: '#d1fae5', status_key: 'done',        is_done: true,  position: 3, user_id: '', created_at: '' },
]

export function useColumns(_userId: string | undefined) {
  return { columns: STATIC_COLUMNS }
}
