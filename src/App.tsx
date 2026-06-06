import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useColumns } from './hooks/useColumns'
import { useTasks } from './hooks/useTasks'
import { AuthPage } from './components/auth/AuthPage'
import { UpdatePasswordPage } from './components/auth/UpdatePasswordPage'
import { Board } from './components/board/Board'
import type { Priority } from './types'

function App() {
  const { session, loading, recoveryMode, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f5298 50%, #1a6b4a 100%)' }}>
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (recoveryMode) return <UpdatePasswordPage />
  if (!session) return <AuthPage />

  return <BoardPage userId={session.user.id} email={session.user.email ?? ''} onSignOut={signOut} />
}

function BoardPage({ userId, email, onSignOut }: { userId: string; email: string; onSignOut: () => void }) {
  const { columns, addColumn, updateColumnTitle, deleteColumn, reorderColumns } = useColumns(userId)
  const { tasks, addTask, updateTask, deleteTask, moveTask, reorderTasks } = useTasks(userId)

  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')

  const filteredTasks = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority
    return matchSearch && matchPriority
  })

  const priorityOptions: { value: Priority | 'all'; label: string }[] = [
    { value: 'all', label: 'すべて' },
    { value: 'high', label: '高' },
    { value: 'medium', label: '中' },
    { value: 'low', label: '低' },
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f5298 50%, #1a6b4a 100%)' }}>
      {/* ヘッダー */}
      <header className="px-4 py-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4" style={{ background: 'rgba(0,0,0,0.2)' }}>
        {/* 1行目：ロゴ＋ログアウト */}
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="font-bold text-white text-base tracking-wide">タスク管理</h1>
          </div>
          <div className="flex items-center gap-2 sm:hidden">
            <button
              onClick={onSignOut}
              className="text-xs text-white/80 hover:text-white border border-white/30 rounded-lg px-2.5 py-1.5 transition-all hover:bg-white/10"
            >
              ログアウト
            </button>
          </div>
        </div>

        {/* 2行目（モバイル）/ 1行目続き（PC）：検索＋フィルター */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="タスクを検索..."
              className="w-full bg-white/15 text-white placeholder-white/40 border border-white/20 rounded-xl pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all"
            />
          </div>

          <div className="flex gap-1 shrink-0">
            {priorityOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilterPriority(opt.value)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  filterPriority === opt.value
                    ? 'bg-white text-gray-800'
                    : 'text-white/70 hover:text-white hover:bg-white/15'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* PC のみ：メール＋ログアウト */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <span className="text-white/60 text-sm">{email}</span>
          <button
            onClick={onSignOut}
            className="text-sm text-white/80 hover:text-white border border-white/30 hover:border-white/60 rounded-lg px-3 py-1.5 transition-all hover:bg-white/10"
          >
            ログアウト
          </button>
        </div>
      </header>

      {/* ボード */}
      <main className="flex-1 p-5 overflow-x-auto">
        <Board
          columns={columns}
          tasks={filteredTasks}
          onAddColumn={addColumn}
          onUpdateColumnTitle={updateColumnTitle}
          onDeleteColumn={deleteColumn}
          onReorderColumns={reorderColumns}
          onAddTask={addTask}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          onMoveTask={moveTask}
          onReorderTasks={reorderTasks}
        />
      </main>
    </div>
  )
}

export default App
