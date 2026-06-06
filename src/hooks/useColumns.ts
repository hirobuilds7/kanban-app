import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Column } from '../types'

export function useColumns(userId: string) {
  const [columns, setColumns] = useState<Column[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    fetchColumns()
  }, [userId])

  const fetchColumns = async () => {
    const { data } = await supabase
      .from('columns')
      .select('*')
      .eq('user_id', userId)
      .order('position')
    if (data) setColumns(data)
    setLoading(false)
  }

  const addColumn = async (title: string) => {
    const maxPos = columns.length > 0 ? Math.max(...columns.map(c => c.position)) + 1 : 0
    const { data, error } = await supabase
      .from('columns')
      .insert({ user_id: userId, title, position: maxPos })
      .select()
      .single()
    if (data && !error) setColumns(prev => [...prev, data])
  }

  const updateColumnTitle = async (id: string, title: string) => {
    const { error } = await supabase.from('columns').update({ title }).eq('id', id)
    if (!error) setColumns(prev => prev.map(c => c.id === id ? { ...c, title } : c))
  }

  const deleteColumn = async (id: string) => {
    const { error } = await supabase.from('columns').delete().eq('id', id)
    if (!error) setColumns(prev => prev.filter(c => c.id !== id))
  }

  const reorderColumns = async (reordered: Column[]) => {
    setColumns(reordered)
    await Promise.all(
      reordered.map((col, i) =>
        supabase.from('columns').update({ position: i }).eq('id', col.id)
      )
    )
  }

  return { columns, loading, addColumn, updateColumnTitle, deleteColumn, reorderColumns }
}
