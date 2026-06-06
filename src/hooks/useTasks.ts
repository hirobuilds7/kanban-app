import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Task } from '../types'

export function useTasks(userId: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    fetchTasks()
  }, [userId])

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('position')
    if (data) setTasks(data)
    setLoading(false)
  }

  const addTask = async (columnId: string, fields: Omit<Task, 'id' | 'column_id' | 'user_id' | 'position' | 'created_at' | 'is_completed'>) => {
    const colTasks = tasks.filter(t => t.column_id === columnId)
    const maxPos = colTasks.length > 0 ? Math.max(...colTasks.map(t => t.position)) + 1 : 0
    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...fields, is_completed: false, column_id: columnId, user_id: userId, position: maxPos })
      .select()
      .single()
    if (data && !error) setTasks(prev => [...prev, data])
  }

  const updateTask = async (id: string, fields: Partial<Pick<Task, 'title' | 'memo' | 'priority' | 'due_date' | 'is_completed'>>) => {
    const { error } = await supabase.from('tasks').update(fields).eq('id', id)
    if (!error) setTasks(prev => prev.map(t => t.id === id ? { ...t, ...fields } : t))
  }

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (!error) setTasks(prev => prev.filter(t => t.id !== id))
  }

  const moveTask = async (taskId: string, toColumnId: string, newTasks: Task[]) => {
    setTasks(newTasks)
    const task = newTasks.find(t => t.id === taskId)
    if (!task) return
    await supabase.from('tasks').update({ column_id: toColumnId, position: task.position }).eq('id', taskId)
    const colTasks = newTasks.filter(t => t.column_id === toColumnId)
    await Promise.all(
      colTasks.map(t => supabase.from('tasks').update({ position: t.position }).eq('id', t.id))
    )
  }

  const reorderTasks = async (newTasks: Task[]) => {
    setTasks(newTasks)
    await Promise.all(
      newTasks.map(t => supabase.from('tasks').update({ position: t.position }).eq('id', t.id))
    )
  }

  return { tasks, loading, addTask, updateTask, deleteTask, moveTask, reorderTasks }
}
