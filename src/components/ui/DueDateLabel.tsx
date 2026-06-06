import { format, isPast, parseISO, isToday } from 'date-fns'
import { ja } from 'date-fns/locale'

export function DueDateLabel({ dueDate }: { dueDate: string }) {
  const date = parseISO(dueDate)
  const overdue = isPast(date) && !isToday(date)
  const today = isToday(date)

  const className = overdue
    ? 'text-red-500'
    : today
    ? 'text-orange-500'
    : 'text-gray-400'

  return (
    <span className={`text-xs ${className}`}>
      {format(date, 'M/d', { locale: ja })}
    </span>
  )
}
