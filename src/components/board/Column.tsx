import { useState } from 'react'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDroppable } from '@dnd-kit/core'
import type { Column as ColumnType, Task } from '../../types'
import { TaskCard } from './TaskCard'
import { TaskModal } from './TaskModal'
import { ConfirmModal } from '../ui/ConfirmModal'

interface Props {
  column: ColumnType
  tasks: Task[]
  onUpdateTitle: (id: string, title: string) => void
  onDeleteColumn: (id: string) => void
  onAddTask: (columnId: string, fields: { title: string; memo: string; priority: Task['priority']; due_date: string }) => void
  onUpdateTask: (id: string, fields: Partial<Pick<Task, 'title' | 'memo' | 'priority' | 'due_date'>>) => void
  onDeleteTask: (id: string) => void
}

function DroppableColumn({ columnId, children }: { columnId: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId })
  return (
    <div ref={setNodeRef} className={`flex-1 min-h-12 space-y-2 rounded-xl transition-colors ${isOver ? 'bg-white/20' : ''}`}>
      {children}
    </div>
  )
}

export function Column({ column, tasks, onUpdateTitle, onDeleteColumn, onAddTask, onUpdateTask, onDeleteTask }: Props) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleInput, setTitleInput] = useState(column.title)
  const [addingTask, setAddingTask] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: { type: 'column' },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const taskIds = tasks.map(t => t.id)
  const completedCount = tasks.filter(t => t.is_completed).length

  const saveTitle = () => {
    if (titleInput.trim() && titleInput !== column.title) {
      onUpdateTitle(column.id, titleInput.trim())
    } else {
      setTitleInput(column.title)
    }
    setEditingTitle(false)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="board-column flex flex-col rounded-2xl w-[85vw] sm:w-72 shrink-0 max-h-[calc(100vh-100px)]"
      css-note="column"
    >
      <div style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(12px)' }} className="rounded-2xl flex flex-col h-full min-h-[calc(100vh-100px)]">
        {/* カラムヘッダー */}
        <div className="flex items-center justify-between px-3 pt-3 pb-2 group">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-white/40 hover:text-white/70 shrink-0"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm8-12a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
              </svg>
            </div>

            {editingTitle ? (
              <input
                autoFocus
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setTitleInput(column.title); setEditingTitle(false) } }}
                className="font-semibold text-white text-sm bg-white/20 border border-white/40 rounded px-2 py-0.5 w-full focus:outline-none"
              />
            ) : (
              <button
                onDoubleClick={() => setEditingTitle(true)}
                className="font-semibold text-white text-sm truncate text-left"
                title="ダブルクリックで編集"
              >
                {column.title}
              </button>
            )}
            <span className="text-xs text-white/50 bg-white/10 rounded-full px-2 py-0.5 shrink-0">
              {tasks.length > 0 ? `${completedCount}/${tasks.length}` : '0'}
            </span>
          </div>

          <button
            onClick={() => setConfirmingDelete(true)}
            className="text-white/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0 ml-1"
            title="カラムを削除"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* タスク一覧 */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-white/25 select-none">
              <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-xs">タスクを追加してみましょう</p>
            </div>
          )}
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            <DroppableColumn columnId={column.id}>
              <div className="space-y-2">
                {tasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={onUpdateTask}
                    onDelete={onDeleteTask}
                  />
                ))}
              </div>
            </DroppableColumn>
          </SortableContext>
        </div>

        {/* タスク追加ボタン */}
        <div className="px-2 pb-2">
          <button
            onClick={() => setAddingTask(true)}
            className="w-full text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-xl py-2 transition-all flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            タスクを追加
          </button>
        </div>
      </div>

      {addingTask && (
        <TaskModal
          onSave={fields => onAddTask(column.id, fields)}
          onClose={() => setAddingTask(false)}
        />
      )}

      {confirmingDelete && (
        <ConfirmModal
          message={`「${column.title}」と中のタスクを全て削除しますか？`}
          onConfirm={() => { onDeleteColumn(column.id); setConfirmingDelete(false) }}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </div>
  )
}
