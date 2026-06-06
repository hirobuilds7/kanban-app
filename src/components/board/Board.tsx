import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core'
import type { DragEndEvent, DragOverEvent, DragStartEvent, CollisionDetection } from '@dnd-kit/core'
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { useState } from 'react'
import type { Column as ColumnType, Task } from '../../types'
import { Column } from './Column'
import { TaskCard } from './TaskCard'

interface Props {
  columns: ColumnType[]
  tasks: Task[]
  onAddColumn: (title: string) => void
  onUpdateColumnTitle: (id: string, title: string) => void
  onDeleteColumn: (id: string) => void
  onReorderColumns: (cols: ColumnType[]) => void
  onAddTask: (colId: string, fields: { title: string; memo: string; priority: Task['priority']; due_date: string }) => void
  onUpdateTask: (id: string, fields: Partial<Pick<Task, 'title' | 'memo' | 'priority' | 'due_date'>>) => void
  onDeleteTask: (id: string) => void
  onMoveTask: (taskId: string, toColumnId: string, newTasks: Task[]) => void
  onReorderTasks: (newTasks: Task[]) => void
}

export function Board({
  columns, tasks,
  onAddColumn, onUpdateColumnTitle, onDeleteColumn, onReorderColumns,
  onAddTask, onUpdateTask, onDeleteTask, onMoveTask, onReorderTasks,
}: Props) {
  const [newColTitle, setNewColTitle] = useState('')
  const [addingCol, setAddingCol] = useState(false)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const collisionDetection: CollisionDetection = (args) => {
    const pointerHits = pointerWithin(args)
    if (pointerHits.length > 0) return pointerHits
    const rectHits = rectIntersection(args)
    if (rectHits.length > 0) return rectHits
    return closestCenter(args)
  }

  const columnIds = columns.map(c => c.id)

  const handleDragStart = (e: DragStartEvent) => {
    const task = tasks.find(t => t.id === e.active.id)
    if (task) setActiveTask(task)
  }

  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeTask = tasks.find(t => t.id === activeId)
    if (!activeTask) return

    const overTask = tasks.find(t => t.id === overId)
    const overColumn = columns.find(c => c.id === overId)

    const toColumnId = overTask ? overTask.column_id : overColumn?.id
    if (!toColumnId || activeTask.column_id === toColumnId) return

    const updated = tasks.map(t =>
      t.id === activeId ? { ...t, column_id: toColumnId } : t
    )
    onMoveTask(activeId, toColumnId, updated)
  }

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = e
    if (!over || active.id === over.id) return

    const activeId = active.id as string
    const overId = over.id as string

    if (columnIds.includes(activeId) && columnIds.includes(overId)) {
      const oldIndex = columns.findIndex(c => c.id === activeId)
      const newIndex = columns.findIndex(c => c.id === overId)
      onReorderColumns(arrayMove(columns, oldIndex, newIndex).map((c, i) => ({ ...c, position: i })))
      return
    }

    const activeTask = tasks.find(t => t.id === activeId)
    const overTask = tasks.find(t => t.id === overId)
    if (!activeTask || !overTask || activeTask.column_id !== overTask.column_id) return

    const colTasks = tasks.filter(t => t.column_id === activeTask.column_id)
    const oldIndex = colTasks.findIndex(t => t.id === activeId)
    const newIndex = colTasks.findIndex(t => t.id === overId)
    const reordered = arrayMove(colTasks, oldIndex, newIndex).map((t, i) => ({ ...t, position: i }))
    const newTasks = tasks.map(t => reordered.find(r => r.id === t.id) ?? t)
    onReorderTasks(newTasks)
  }

  const submitNewCol = (e: React.FormEvent) => {
    e.preventDefault()
    if (newColTitle.trim()) {
      onAddColumn(newColTitle.trim())
      setNewColTitle('')
      setAddingCol(false)
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={collisionDetection} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="board-scroll flex gap-3 items-start pb-4 min-h-[calc(100vh-88px)]">
        <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
          {columns.map(col => (
            <Column
              key={col.id}
              column={col}
              tasks={tasks.filter(t => t.column_id === col.id).sort((a, b) => a.position - b.position)}
              onUpdateTitle={onUpdateColumnTitle}
              onDeleteColumn={onDeleteColumn}
              onAddTask={onAddTask}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </SortableContext>

        {/* カラム追加 */}
        <div className="board-column w-[85vw] sm:w-72 shrink-0 min-h-[calc(100vh-100px)] flex flex-col">
          {addingCol ? (
            <div style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(12px)' }} className="rounded-2xl p-3">
              <form onSubmit={submitNewCol}>
                <input
                  autoFocus
                  type="text"
                  value={newColTitle}
                  onChange={e => setNewColTitle(e.target.value)}
                  placeholder="カラム名を入力"
                  className="w-full bg-white/20 text-white placeholder-white/40 border border-white/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/60 mb-2"
                  onKeyDown={e => e.key === 'Escape' && setAddingCol(false)}
                />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-white/20 hover:bg-white/30 text-white text-sm rounded-lg py-1.5 transition-colors font-medium">
                    追加
                  </button>
                  <button type="button" onClick={() => setAddingCol(false)} className="flex-1 text-white/60 hover:text-white text-sm rounded-lg py-1.5 hover:bg-white/10 transition-colors">
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button
              onClick={() => setAddingCol(true)}
              className="w-full flex-1 rounded-2xl py-4 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 border border-dashed border-white/20 hover:border-white/40"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              カラムを追加
            </button>
          )}
        </div>
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rotate-2 shadow-2xl">
            <TaskCard task={activeTask} onUpdate={() => {}} onDelete={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
