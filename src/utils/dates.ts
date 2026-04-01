import { differenceInDays, parseISO, isValid } from 'date-fns'

export function isOverdue(dueDate: string | null, isDone: boolean): boolean {
  if (!dueDate || isDone) return false
  const d = parseISO(dueDate)
  if (!isValid(d)) return false
  return differenceInDays(d, new Date()) < 0
}

export function isDueSoon(dueDate: string | null, isDone: boolean): boolean {
  if (!dueDate || isDone) return false
  const d = parseISO(dueDate)
  if (!isValid(d)) return false
  const diff = differenceInDays(d, new Date())
  return diff >= 0 && diff <= 1
}

export function dueDateStatus(dueDate: string | null, isDone: boolean): 'overdue' | 'soon' | 'upcoming' | null {
  if (!dueDate || isDone) return null
  const d = parseISO(dueDate)
  if (!isValid(d)) return null
  const diff = differenceInDays(d, new Date())
  if (diff < 0) return 'overdue'
  if (diff <= 1) return 'soon'
  return 'upcoming'
}

export function formatDueDate(dueDate: string): string {
  const d = parseISO(dueDate)
  if (!isValid(d)) return ''
  const diff = differenceInDays(d, new Date())
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff < 0) return `${Math.abs(diff)}d overdue`
  return `${diff}d left`
}
