import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

type View = 'login' | 'signup' | 'reset'

export function AuthPage() {
  const { signIn, signUp, resetPassword } = useAuth()
  const [view, setView] = useState<View>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const switchView = (v: View) => { setView(v); setError(''); setMessage('') }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setMessage(''); setLoading(true)

    if (view === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError(error.message)
    } else if (view === 'signup') {
      const { error } = await signUp(email, password)
      if (error) setError(error.message)
      else setMessage('確認メールを送りました。メールを確認してください。')
    } else {
      const { error } = await resetPassword(email)
      if (error) setError(error.message)
      else setMessage('パスワードリセットのメールを送りました。')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f5298 50%, #1a6b4a 100%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wide">タスク管理</h1>
          <p className="text-white/60 text-sm mt-1">タスクをかんたん管理</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            {view === 'login' ? 'ログイン' : view === 'signup' ? 'アカウント作成' : 'パスワードをリセット'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                placeholder="example@email.com"
              />
            </div>

            {view !== 'reset' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">パスワード</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="6文字以上"
                />
              </div>
            )}

            {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2.5">{error}</p>}
            {message && <p className="text-green-600 text-sm bg-green-50 rounded-xl px-4 py-2.5">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-medium rounded-xl py-2.5 text-sm text-white shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 mt-2"
              style={{ background: 'linear-gradient(135deg, #0f5298, #1a6b4a)' }}
            >
              {loading ? '処理中...' : view === 'login' ? 'ログイン' : view === 'signup' ? 'アカウントを作成' : 'リセットメールを送る'}
            </button>
          </form>

          <div className="mt-5 space-y-2 text-center text-sm text-gray-400">
            {view === 'login' && (
              <>
                <p>
                  <button onClick={() => switchView('reset')} className="text-blue-600 hover:underline font-medium">
                    パスワードを忘れた場合
                  </button>
                </p>
                <p>
                  アカウントをお持ちでないですか？{' '}
                  <button onClick={() => switchView('signup')} className="text-blue-600 hover:underline font-medium">新規登録</button>
                </p>
              </>
            )}
            {view === 'signup' && (
              <p>
                すでにアカウントがありますか？{' '}
                <button onClick={() => switchView('login')} className="text-blue-600 hover:underline font-medium">ログイン</button>
              </p>
            )}
            {view === 'reset' && (
              <p>
                <button onClick={() => switchView('login')} className="text-blue-600 hover:underline font-medium">← ログインに戻る</button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
