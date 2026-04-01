import { useState } from 'react'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  rectIntersection, type DragStartEvent, type DragEndEvent,
} from '@dnd-kit/core'
import type { Task, KanbanColumn, TeamMember, Label } from '../types'
import Column from './Column'
import TaskCardContent from './TaskCardContent'

interface Props {
  tasks: Task[]
  filteredTasks: Task[]
  columns: KanbanColumn[]
  members: TeamMember[]
  labels: Label[]
  onAddTask: (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'position'>) => Promise<void>
  onMoveTask: (id: string, status: string) => Promise<void>
  onTaskClick: (task: Task) => void
}

export default function Board({ tasks, filteredTasks, columns, members, labels, onAddTask, onMoveTask, onTaskClick }: Props) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const handleDragStart = (e: DragStartEvent) => {
    setActiveTask(tasks.find(t => t.id === e.active.id) ?? null)
  }

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = e
    if (!over) return
    const task = tasks.find(t => t.id === active.id)
    if (!task) return

    let newStatus: string | undefined
    if (columns.some(c => c.status_key === over.id)) {
      newStatus = over.id as string
    } else {
      newStatus = tasks.find(t => t.id === over.id)?.status
    }
    if (newStatus && newStatus !== task.status) onMoveTask(task.id, newStatus)
  }

  const activeTaskColumn = activeTask ? columns.find(c => c.status_key === activeTask.status) : null

  return (
    <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-0 board:gap-4 px-0 board:px-6 py-6 overflow-x-auto pb-8 min-h-[calc(100vh-130px)] snap-x snap-mandatory board:snap-none">
        {columns.map(col => (
          <Column
            key={col.id}
            column={col}
            tasks={filteredTasks.filter(t => t.status === col.status_key)}
            members={members}
            labels={labels}
            onAddTask={onAddTask}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
        {activeTask && (
          <div className="bg-white rounded-xl border border-brand-500/40 p-3.5 shadow-2xl w-72 rotate-1 scale-105">
            <TaskCardContent
              task={activeTask}
              members={members}
              labels={labels}
              isDone={activeTaskColumn?.is_done ?? false}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
