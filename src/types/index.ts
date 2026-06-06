export interface Column {
  id: string
  user_id: string
  title: string
  position: number
  created_at: string
}

export interface Task {
  id: string
  column_id: string
  user_id: string
  title: string
  memo: string | null
  priority: 'high' | 'medium' | 'low'
  due_date: string | null
  position: number
  is_completed: boolean
  created_at: string
}

export type Priority = Task['priority']
