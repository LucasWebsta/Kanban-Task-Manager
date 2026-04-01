import type { Task, TeamMember, Filters, Priority, Label } from '../types'
import { PRIORITY_CONFIG } from '../types'
import { isOverdue, isDueSoon } from '../utils/dates'

interface Props {
  tasks: Task[]
  members: TeamMember[]
  labels: Label[]
  search: string
  filters: Filters
  onSearchChange: (val: string) => void
  onFiltersChange: (f: Filters) => void
  onTeamClick: () => void
}

export default function Header({ tasks, members, labels, search, filters, onSearchChange, onFiltersChange, onTeamClick }: Props) {
  const total = tasks.length
  const done = tasks.filter(t => t.status === 'done').length
  const overdue = tasks.filter(t => isOverdue(t.due_date, t.status === 'done')).length
  const dueSoon = tasks.filter(t => isDueSoon(t.due_date, t.status === 'done')).length

  const hasFilters = filters.priority !== '' || filters.assigneeId !== '' || filters.dueDate !== '' || filters.labelId !== ''

  const clearFilters = () => onFiltersChange({ priority: '', assigneeId: '', dueDate: '', labelId: '' })

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-screen-2xl mx-auto px-4 board:px-6 py-3 board:py-4 flex flex-col gap-3">
        {/* Top row: logo + stats + team button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-7 h-7 board:w-8 board:h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 board:w-5 board:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-base board:text-lg font-semibold text-gray-900">TaskFlow</h1>
          </div>

          <div className="flex items-center gap-3 board:gap-4 ml-auto">
            <Stat label="Total" value={total} color="text-gray-700" />
            <Stat label="Done" value={done} color="text-emerald-600" />
            {overdue > 0 && <Stat label="Overdue" value={overdue} color="text-rose-600" />}
            {dueSoon > 0 && <Stat label="Due Soon" value={dueSoon} color="text-amber-600" />}

            {/* Team button */}
            <button
              onClick={onTeamClick}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Team
              {members.length > 0 && (
                <span className="bg-brand-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">{members.length}</span>
              )}
            </button>
          </div>
        </div>

        {/* Search + filters row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[160px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
            />
          </div>

          {/* Priority filter */}
          <select
            value={filters.priority}
            onChange={e => onFiltersChange({ ...filters, priority: e.target.value as Priority | '' })}
            className={`text-xs border rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition bg-white ${filters.priority ? 'border-brand-500 text-brand-600' : 'border-gray-200 text-gray-500'}`}
          >
            <option value="">Priority</option>
            {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          {/* Due date filter */}
          <select
            value={filters.dueDate}
            onChange={e => onFiltersChange({ ...filters, dueDate: e.target.value as Filters['dueDate'] })}
            className={`text-xs border rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition bg-white ${filters.dueDate ? 'border-brand-500 text-brand-600' : 'border-gray-200 text-gray-500'}`}
          >
            <option value="">Due Date</option>
            <option value="overdue">Overdue</option>
            <option value="due_soon">Due Soon</option>
          </select>

          {/* Assignee filter */}
          {members.length > 0 && (
            <select
              value={filters.assigneeId}
              onChange={e => onFiltersChange({ ...filters, assigneeId: e.target.value })}
              className={`text-xs border rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition bg-white ${filters.assigneeId ? 'border-brand-500 text-brand-600' : 'border-gray-200 text-gray-500'}`}
            >
              <option value="">Assignee</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          )}

          {/* Label filter */}
          {labels.length > 0 && (
            <select
              value={filters.labelId}
              onChange={e => onFiltersChange({ ...filters, labelId: e.target.value })}
              className={`text-xs border rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition bg-white ${filters.labelId ? 'border-brand-500 text-brand-600' : 'border-gray-200 text-gray-500'}`}
            >
              <option value="">Label</option>
              {labels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          )}

          {/* Clear filters */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-rose-500 hover:text-rose-700 font-medium transition px-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className={`text-lg font-semibold leading-none ${color}`}>{value}</span>
      <span className="text-xs text-gray-400 mt-0.5">{label}</span>
    </div>
  )
}
