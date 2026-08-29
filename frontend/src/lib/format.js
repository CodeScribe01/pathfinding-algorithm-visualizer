/** Small presentation helpers shared across pages. */

export const formatNumber = (value) =>
  typeof value === 'number' && Number.isFinite(value) ? value.toLocaleString('en-US') : '—'

export function formatMs(value, digits = 2) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
  if (value >= 1000) return `${(value / 1000).toFixed(2)} s`
  if (value < 0.01) return '<0.01 ms'
  return `${value.toFixed(digits)} ms`
}

export function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatRelative(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const seconds = Math.round((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(value)
}

export const pluralize = (count, singular, plural = `${singular}s`) =>
  `${formatNumber(count)} ${count === 1 ? singular : plural}`
