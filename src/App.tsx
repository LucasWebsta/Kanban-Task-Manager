import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useTasks } from './hooks/useTasks'
import { useTeamMembers } from './hooks/useTeamMembers'
import { useColumns } from './hooks/useColumns'
import { useLabels } from './hooks/useLabels'
import Header from './components/Header'
import Board from './components/Board'
import TaskModal from './components/TaskModal'
import TeamModal from './components/TeamModal'
import StatsBar from './components/StatsBar'
import type { Task, Filters } from './types'
import { isOverdue, isDueSoon } from './utils/dates'

export default function App() {
  const { user, loading: authLoading } = useAuth()
  const { tasks, loading, error, createTask, updateTask, deleteTask, moveTask } = useTasks(user?.id)
  const { members, addMember, deleteMember } = useTeamMembers(user?.id)
  const { columns } = useColumns(user?.id)
  const { labels, addLabel, syncTaskLabels } = useLabels(user?.id)

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showTeam, setShowTeam] = useState(false)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Filters>({ priority: '', assigneeId: '', dueDate: '', labelId: '' })

  const filteredTasks = tasks.filter(t => {
    const col = columns.find(c => c.status_key === t.status)
    const isDone = col?.is_done ?? false
    if (search.trim()) {
      const q = search.toLowerCase()
      if (!t.title.toLowerCase().includes(q) && !t.description?.toLowerCase().includes(q)) return false
    }
    if (filters.priority && t.priority !== filters.priority) return false
    if (filters.assigneeId && t.assignee_id !== filters.assigneeId) return false
    if (filters.dueDate === 'overdue' && !isOverdue(t.due_date, isDone)) return false
    if (filters.dueDate === 'due_soon' && !isDueSoon(t.due_date, isDone)) return false
    if (filters.labelId && !t.task_labels?.some(tl => tl.label_id === filters.labelId)) return false
    return true
  })

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Setting up your workspace...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-rose-500 font-medium">Something went wrong</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        tasks={tasks}
        members={members}
        labels={labels}
        search={search}
        filters={filters}
        onSearchChange={setSearch}
        onFiltersChange={setFilters}
        onTeamClick={() => setShowTeam(true)}
      />

      <StatsBar tasks={tasks} columns={columns} />

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Loading tasks...</p>
          </div>
        </div>
      ) : (
        <Board
          tasks={tasks}
          filteredTasks={filteredTasks}
          columns={columns}
          members={members}
          labels={labels}
          onAddTask={createTask}
          onMoveTask={moveTask}
          onTaskClick={setSelectedTask}
        />
      )}

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          members={members}
          labels={labels}
          userId={user?.id}
          columns={columns}
          onClose={() => setSelectedTask(null)}
          onUpdate={updateTask}
          onDelete={deleteTask}
          onSyncLabels={syncTaskLabels}
          onAddLabel={addLabel}
        />
      )}

      {showTeam && (
        <TeamModal
          members={members}
          onAdd={addMember}
          onDelete={deleteMember}
          onClose={() => setShowTeam(false)}
        />
      )}
    </div>
  )
}
