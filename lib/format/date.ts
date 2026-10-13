const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' })

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

/** "Wed, 30 Sep 2026" */
export const formatDate = (iso: string) => dateFormatter.format(new Date(iso))

/** "14:22" */
export const formatTime = (iso: string) => timeFormatter.format(new Date(iso))

/** "Wed, 30 Sep 2026, 14:22" */
export const formatDateTime = (iso: string) => dateTimeFormatter.format(new Date(iso))

const isSameLocalDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

/** Calendar-day key in the viewer's timezone, used to group a list by day. */
export const dayKey = (iso: string) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

/** "Today", "Yesterday", otherwise "Mon, 5 Oct 2026". Days are the viewer's local days. */
export function formatDayHeading(iso: string, now: Date = new Date()): string {
  const date = new Date(iso)
  if (isSameLocalDay(date, now)) return 'Today'
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (isSameLocalDay(date, yesterday)) return 'Yesterday'
  return dateFormatter.format(date)
}
