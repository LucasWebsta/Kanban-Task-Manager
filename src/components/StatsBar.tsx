import type { Task, KanbanColumn } from '../types'
import { isOverdue } from '../utils/dates'

interface Props {
  tasks: Task[]
  columns: KanbanColumn[]
}

export default function StatsBar({ tasks, columns }: Props) {
  if (tasks.length === 0) return null

  const total = tasks.length
  const doneCount = tasks.filter(t => columns.find(c => c.status_key === t.status)?.is_done).length
  const overdueCount = tasks.filter(t => {
    const col = columns.find(c => c.status_key === t.status)
    return isOverdue(t.due_date, col?.is_done ?? false)
  }).length
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0

  return (
    <div className="bg-white border-b border-gray-100 px-4 board:px-6 py-2 flex items-center gap-6 overflow-x-auto scrollbar-thin">
      {/* Progress bar */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-500">{pct}% done</span>
      </div>

      <div className="w-px h-4 bg-gray-200 flex-shrink-0" />

      {/* Per-column counts */}
      <div className="flex items-center gap-4">
        {columns.map(col => {
          const count = tasks.filter(t => t.status === col.status_key).length
          return (
            <div key={col.id} className="flex items-center gap-1.5 flex-shrink-0">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: col.color }}
              />
              <span className="text-xs text-gray-500">{col.name}</span>
              <span className="text-xs font-semibold text-gray-700">{count}</span>
            </div>
          )
        })}
      </div>

      {overdueCount > 0 && (
        <>
          <div className="w-px h-4 bg-gray-200 flex-shrink-0" />
          <span className="text-xs font-medium text-rose-500 flex-shrink-0">
            {overdueCount} overdue
          </span>
        </>
      )}
    </div>
  )
}
