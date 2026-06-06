import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '../../types'
import { PriorityBadge } from '../ui/PriorityBadge'
import { DueDateLabel } from '../ui/DueDateLabel'
import { TaskModal } from './TaskModal'
import { ConfirmModal } from '../ui/ConfirmModal'

interface Props {
  task: Task
  onUpdate: (id: string, fields: Partial<Pick<Task, 'title' | 'memo' | 'priority' | 'due_date' | 'is_completed'>>) => void
  onDelete: (id: string) => void
}

export function TaskCard({ task, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const priorityBorder: Record<string, string> = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#22c55e',
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    borderLeft: `4px solid ${priorityBorder[task.priority]}`,
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`rounded-xl p-3 shadow-md hover:shadow-lg transition-all cursor-grab active:cursor-grabbing group ${task.is_completed ? 'bg-green-100 border border-green-300' : 'bg-white'}`}
        {...attributes}
        {...listeners}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            {/* 完了チェックボックス */}
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); onUpdate(task.id, { is_completed: !task.is_completed }) }}
              className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 transition-all flex items-center justify-center ${
                task.is_completed
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-300 hover:border-green-400'
              }`}
              title={task.is_completed ? '未完了に戻す' : '完了にする'}
            >
              {task.is_completed && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            <p className={`text-sm font-medium leading-snug flex-1 ${task.is_completed ? 'task-completed' : ''}`}>
              {task.title}
            </p>
          </div>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); setEditing(true) }}
              className="text-gray-400 hover:text-blue-500 transition-colors p-0.5 rounded"
              title="編集"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828A2 2 0 0110 16.414H8v-2a2 2 0 01.586-1.414z" />
              </svg>
            </button>
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); setConfirming(true) }}
              className="text-gray-400 hover:text-red-500 transition-colors p-0.5 rounded"
              title="削除"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {task.memo && (
          <p className="text-xs text-gray-400 mt-1.5 ml-6 line-clamp-2 leading-relaxed">{task.memo}</p>
        )}

        <div className="flex items-center gap-2 mt-2.5 ml-6 flex-wrap">
          <PriorityBadge priority={task.priority} />
          {task.due_date && <DueDateLabel dueDate={task.due_date} />}
        </div>
      </div>

      {editing && (
        <TaskModal
          initial={task}
          onSave={fields => onUpdate(task.id, fields)}
          onClose={() => setEditing(false)}
        />
      )}

      {confirming && (
        <ConfirmModal
          message="このタスクを削除しますか？"
          onConfirm={() => { onDelete(task.id); setConfirming(false) }}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  )
}
