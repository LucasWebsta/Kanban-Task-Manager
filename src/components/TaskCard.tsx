import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task, TeamMember, Label } from '../types'
import TaskCardContent from './TaskCardContent'

interface Props {
  task: Task
  members: TeamMember[]
  labels: Label[]
  isDone: boolean
  onClick: () => void
}

export default function TaskCard({ task, members, labels, isDone, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        bg-white rounded-xl border p-3.5 cursor-grab active:cursor-grabbing
        transition-all duration-150 select-none
        ${isDragging ? 'opacity-0' : 'border-gray-200 shadow-card hover:shadow-card-hover hover:border-gray-300'}
      `}
    >
      <TaskCardContent task={task} members={members} labels={labels} isDone={isDone} />
    </div>
  )
}
