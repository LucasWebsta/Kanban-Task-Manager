import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Task, KanbanColumn, TeamMember, Label } from '../types'
import TaskCard from './TaskCard'
import AddTaskForm from './AddTaskForm'

interface Props {
  column: KanbanColumn
  tasks: Task[]
  members: TeamMember[]
  labels: Label[]
  onAddTask: (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'position'>) => Promise<void>
  onTaskClick: (task: Task) => void
}

export default function Column({ column, tasks, members, labels, onAddTask, onTaskClick }: Props) {
  const [adding, setAdding] = useState(false)
  const { setNodeRef, isOver } = useDroppable({ id: column.status_key })

  return (
    <div className="flex flex-col flex-shrink-0 w-screen px-4 board:px-0 board:flex-1 board:w-auto board:min-w-[180px] snap-start snap-always">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ color: column.color, backgroundColor: column.bg_color }}
          >
            {column.name}
          </span>
          <span className="text-xs font-medium text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          title="Add task"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2.5 flex-1 rounded-xl p-2 min-h-[120px] transition-colors ${isOver ? 'border-2 border-dashed' : 'bg-gray-200/70'}`}
        style={isOver ? { borderColor: column.color, backgroundColor: column.bg_color + '88' } : {}}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              members={members}
              labels={labels}
              isDone={column.is_done}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && !adding && (
          <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
            <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-xs text-gray-400">No tasks yet</p>
          </div>
        )}

        {adding && (
          <AddTaskForm
            status={column.status_key}
            onAdd={onAddTask}
            onCancel={() => setAdding(false)}
          />
        )}

        {!adding && tasks.length > 0 && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-white/70 rounded-lg transition w-full"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add task
          </button>
        )}
      </div>
    </div>
  )
}
