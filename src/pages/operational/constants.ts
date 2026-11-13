import type { FindingSeverity, FindingStatus } from '../../data/mockApi'

export const severityValues: FindingSeverity[] = ['critical', 'high', 'medium', 'low', 'info']
export const statusValues: FindingStatus[] = ['open', 'confirmed', 'resolved', 'false_positive']

export const severityBadgeClasses: Record<FindingSeverity, string> = {
  critical: 'bg-red-50 text-red-700',
  high: 'bg-orange-50 text-orange-700',
  medium: 'bg-amber-50 text-amber-800',
  low: 'bg-blue-50 text-blue-700',
  info: 'bg-slate-100 text-slate-600',
}
