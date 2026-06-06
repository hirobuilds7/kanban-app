# タスク管理アプリ（Kanban Board）

React + TypeScript + Supabase で作成したカンバン方式のタスク管理アプリです。

**デモ: https://kanban-app-2026.netlify.app**

## 機能

- **認証**: メール+パスワードでのサインアップ・ログイン・パスワードリセット
- **カスタム列**: 列の追加・リネーム・削除
- **タスク管理**: タイトル・メモ・優先度（高/中/低）・期限の設定
- **ドラッグ&ドロップ**: 列内の並び替え・列間の移動（両方向対応）
- **タスク完了**: 完了チェックで打ち消し線＋色変更
- **検索・フィルター**: タスク名検索・優先度フィルター
- **削除確認**: タスク・列の削除時に確認ダイアログ表示
- **モバイル対応**: スクロールスナップによるスマートフォン対応

## 技術スタック

| 用途 | 技術 |
|---|---|
| フロントエンド | React 18 + TypeScript + Vite |
| スタイル | Tailwind CSS v4 |
| バックエンド | Supabase（PostgreSQL + Auth） |
| ドラッグ&ドロップ | @dnd-kit/core + @dnd-kit/sortable |
| デプロイ | Netlify |

## セットアップ

### 必要なもの
- Node.js 18以上
- Supabase アカウント

### 手順

1. リポジトリをクローン
```bash
git clone https://github.com/hirobuilds7/kanban-app.git
cd kanban-app
```

2. 依存パッケージをインストール
```bash
npm install
```

3. Supabase でテーブルを作成
```sql
create table columns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  position integer not null,
  created_at timestamptz default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  column_id uuid references columns on delete cascade not null,
  user_id uuid references auth.users not null,
  title text not null,
  memo text,
  priority text check (priority in ('high','medium','low')) default 'medium',
  due_date date,
  position integer not null,
  is_completed boolean default false,
  created_at timestamptz default now()
);

alter table columns enable row level security;
alter table tasks enable row level security;
create policy "own columns" on columns using (auth.uid() = user_id);
create policy "own tasks" on tasks using (auth.uid() = user_id);
```

4. 環境変数を設定
```bash
cp .env.example .env.local
# .env.local に Supabase の URL と anon key を入力
```

5. 開発サーバーを起動
```bash
npm run dev
```
