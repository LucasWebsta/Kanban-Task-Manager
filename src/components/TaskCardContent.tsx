import type { Task, TeamMember, Label } from '../types'
import { PRIORITY_CONFIG } from '../types'
import { dueDateStatus, formatDueDate } from '../utils/dates'
import Avatar from './Avatar'
import LabelBadge from './LabelBadge'

interface Props {
  task: Task
  members: TeamMember[]
  labels: Label[]
  isDone: boolean
}

export default function TaskCardContent({ task, members, labels, isDone }: Props) {
  const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.normal
  const assignee = members.find(m => m.id === task.assignee_id)
  const taskLabelIds = task.task_labels?.map(tl => tl.label_id) ?? []
  const taskLabels = labels.filter(l => taskLabelIds.includes(l.id))
  const dateStatus = dueDateStatus(task.due_date, isDone)

  const dateBadge = dateStatus ? {
    overdue:  { bg: '#fee2e2', color: '#dc2626', text: formatDueDate(task.due_date!) },
    soon:     { bg: '#fef9c3', color: '#ca8a04', text: formatDueDate(task.due_date!) },
    upcoming: { bg: '#dbeafe', color: '#2563eb', text: formatDueDate(task.due_date!) },
  }[dateStatus] : null

  return (
    <>
      {/* Labels */}
      {taskLabels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {taskLabels.map(l => <LabelBadge key={l.id} label={l} />)}
        </div>
      )}

      {/* Priority + Title */}
      <div className="flex items-start gap-2">
        <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${priority.dot}`} />
        <p className="text-sm font-medium text-gray-800 leading-snug flex-1">{task.title}</p>
      </div>

      {task.description && (
        <p className="text-xs text-gray-400 mt-1.5 ml-4 line-clamp-2">{task.description}</p>
      )}

      {/* Footer: due date badge + assignee */}
      {(dateBadge || assignee) && (
        <div className="flex items-center justify-between mt-2.5 ml-4 gap-2">
          {dateBadge ? (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
              style={{ backgroundColor: dateBadge.bg, color: dateBadge.color }}
            >
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {dateBadge.text}
            </span>
          ) : <span />}
          {assignee && <Avatar member={assignee} size="sm" />}
        </div>
      )}
    </>
  )
}
