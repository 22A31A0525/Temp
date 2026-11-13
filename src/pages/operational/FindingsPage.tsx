import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { AppLayout } from '../../components/AppLayout'
import { DataTable, type DataTableColumn } from '../../components/DataTable'
import { FormInput, FormSelect } from '../../components/FormControl'
import { ResourceState } from '../../components/ResourceState'
import {
  secondaryButtonClassName,
  sortButtonClassName,
  textButtonClassName,
  textLinkClassName,
} from '../../components/ui'
import { useApiResource } from '../../hooks/useApiResource'
import { mockApi, type Finding, type FindingSeverity, type FindingStatus } from '../../data/mockApi'
import { formatDate, formatDateTime } from '../../utils/format'
import { severityBadgeClasses, severityValues, statusValues } from './constants'

type SortKey = 'title' | 'severity' | 'category' | 'cwe' | 'target' | 'status' | 'date'

export function FindingsPage() {
  const findingsResource = useApiResource(mockApi.getFindings)
  const targetsResource = useApiResource(mockApi.getTargets)
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [severity, setSeverity] = useState(searchParams.get('severity') ?? '')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState(searchParams.get('status') ?? '')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const pageSize = 10
  const targetById = useMemo(
    () => new Map((targetsResource.data ?? []).map((target) => [target.id, target])),
    [targetsResource.data],
  )
  const filteredFindings = useMemo(() => {
    const targetId = searchParams.get('targetId')
    const scanId = searchParams.get('scanId')
    const normalizedQuery = query.trim().toLowerCase()
    const list = (findingsResource.data ?? []).filter((finding) => {
      const target = targetById.get(finding.targetId)
      return (
        (!targetId || finding.targetId === targetId) &&
        (!scanId || finding.scanId === scanId) &&
        (!severity || finding.severity === severity) &&
        (!category || finding.category === category) &&
        (!status || finding.status === status) &&
        (!normalizedQuery ||
          `${finding.title} ${finding.category} ${finding.cwe} ${finding.location} ${target?.name ?? ''} ${target?.url ?? ''}`
            .toLowerCase()
            .includes(normalizedQuery))
      )
    })
    const severityRank: Record<FindingSeverity, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
      info: 4,
    }
    const statusRank: Record<FindingStatus, number> = {
      open: 0,
      confirmed: 1,
      resolved: 2,
      false_positive: 3,
    }
    list.sort((a, b) => {
      let result = 0
      if (sortKey === 'title' || sortKey === 'category' || sortKey === 'cwe')
        result = a[sortKey].localeCompare(b[sortKey])
      else if (sortKey === 'severity') result = severityRank[a.severity] - severityRank[b.severity]
      else if (sortKey === 'status') result = statusRank[a.status] - statusRank[b.status]
      else if (sortKey === 'target')
        result = (targetById.get(a.targetId)?.name ?? '').localeCompare(
          targetById.get(b.targetId)?.name ?? '',
        )
      else result = a.discoveredAt.localeCompare(b.discoveredAt)
      return sortDirection === 'asc' ? result : -result
    })
    return list
  }, [
    findingsResource.data,
    targetById,
    searchParams,
    query,
    severity,
    category,
    status,
    sortKey,
    sortDirection,
  ])

  const totalPages = Math.max(1, Math.ceil(filteredFindings.length / pageSize))
  const visibleFindings = filteredFindings.slice((page - 1) * pageSize, page * pageSize)
  const categories = [
    ...new Set((findingsResource.data ?? []).map((finding) => finding.category)),
  ].sort()
  function changeSort(key: SortKey) {
    if (sortKey === key) setSortDirection((value) => (value === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDirection('asc')
    }
    setPage(1)
  }

  function clearFilters() {
    setQuery('')
    setSeverity('')
    setCategory('')
    setStatus('')
    setPage(1)
    setSearchParams({})
  }

  function sortableHeader(key: SortKey, label: string) {
    const Icon = sortKey === key ? (sortDirection === 'asc' ? ArrowUp : ArrowDown) : null
    return (
      <button className={sortButtonClassName} type="button" onClick={() => changeSort(key)}>
        {label}
        {Icon && <Icon className="size-3 text-blue-600" aria-hidden="true" />}
      </button>
    )
  }

  const columns: DataTableColumn<Finding>[] = [
    {
      key: 'title',
      header: sortableHeader('title', 'Title'),
      width: '24%',
      renderCell: (finding) => (
        <Link
          className={`${textLinkClassName} block overflow-hidden text-ellipsis`}
          to={`/findings/${finding.id}`}
        >
          {finding.title}
        </Link>
      ),
    },
    {
      key: 'severity',
      header: sortableHeader('severity', 'Severity'),
      width: '11%',
      renderCell: (finding) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-[13px] font-medium capitalize ${severityBadgeClasses[finding.severity]}`}
        >
          {finding.severity}
        </span>
      ),
      titleForRow: (finding) => finding.severity,
    },
    {
      key: 'category',
      header: sortableHeader('category', 'Category'),
      width: '18%',
      renderCell: (finding) => finding.category,
    },
    {
      key: 'cwe',
      header: sortableHeader('cwe', 'CWE'),
      width: '8%',
      renderCell: (finding) => finding.cwe,
    },
    {
      key: 'target',
      header: sortableHeader('target', 'Target'),
      width: '15%',
      renderCell: (finding) => targetById.get(finding.targetId)?.name ?? 'Removed target',
    },
    {
      key: 'status',
      header: sortableHeader('status', 'Status'),
      width: '11%',
      renderCell: (finding) => (
        <span className="capitalize">{finding.status.replace('_', ' ')}</span>
      ),
      titleForRow: (finding) => finding.status.replace('_', ' '),
    },
    {
      key: 'date',
      header: sortableHeader('date', 'Date'),
      width: '13%',
      renderCell: (finding) => formatDate(finding.discoveredAt),
      titleForRow: (finding) => formatDateTime(finding.discoveredAt),
    },
  ]

  const loading = findingsResource.status === 'loading' || targetsResource.status === 'loading'
  const error = findingsResource.error ?? targetsResource.error

  return (
    <AppLayout
      title="Findings"
      subtitle="Search, filter, and triage vulnerabilities from your scans."
      fitViewport
    >
      <section className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[10px] border border-slate-200 bg-white p-4 shadow-[var(--card-shadow)] sm:p-5">
        <div className="mb-3 grid shrink-0 grid-cols-2 items-end gap-3 xl:grid-cols-[minmax(0,1.6fr)_minmax(110px,0.55fr)_minmax(0,1.15fr)_minmax(110px,0.55fr)] max-[520px]:grid-cols-1">
          <label className="grid min-w-0 gap-[5px] text-sm font-medium text-slate-600">
            <span>Search</span>
            <FormInput
              className="w-full"
              type="search"
              placeholder="Search title, target, CWE…"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
              }}
            />
          </label>
          <label className="grid min-w-0 gap-[5px] text-sm font-medium text-slate-600">
            <span>Severity</span>
            <FormSelect
              className="w-full"
              value={severity}
              onChange={(event) => {
                setSeverity(event.target.value)
                setPage(1)
              }}
            >
              <option value="">All</option>
              {severityValues.map((value) => (
                <option className="capitalize" key={value} value={value}>
                  {value}
                </option>
              ))}
            </FormSelect>
          </label>
          <label className="grid min-w-0 gap-[5px] text-sm font-medium text-slate-600">
            <span>Category</span>
            <FormSelect
              className="w-full"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value)
                setPage(1)
              }}
            >
              <option value="">All</option>
              {categories.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </FormSelect>
          </label>
          <label className="grid min-w-0 gap-[5px] text-sm font-medium text-slate-600">
            <span>Status</span>
            <FormSelect
              className="w-full"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value)
                setPage(1)
              }}
            >
              <option value="">All</option>
              {statusValues.map((value) => (
                <option key={value} value={value}>
                  {value.replace('_', ' ')}
                </option>
              ))}
            </FormSelect>
          </label>
        </div>
        {(searchParams.get('scanId') || searchParams.get('targetId')) && (
          <p className="mb-2.5 text-sm text-slate-600">
            Showing a filtered findings view{' '}
            <button className={`${textButtonClassName} ml-2`} type="button" onClick={clearFilters}>
              Clear
            </button>
          </p>
        )}
        {error || loading ? (
          <ResourceState
            loading={loading}
            error={error}
            empty={false}
            onRetry={() => {
              findingsResource.reload()
              targetsResource.reload()
            }}
          />
        ) : !filteredFindings.length ? (
          <div className="grid justify-items-center px-4 py-7 text-center text-sm text-slate-600">
            <p className="mb-3">No findings match the selected search and filters.</p>
            <button className={secondaryButtonClassName} type="button" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <DataTable
              ariaLabel="Security findings"
              columns={columns}
              rows={visibleFindings}
              getRowKey={(finding) => finding.id}
              minWidth={1040}
              scrollClassName="min-h-0 flex-1 overflow-y-auto"
            />
            <footer className="mt-auto flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3.5 text-sm text-slate-600 max-[520px]:justify-center">
              <p className="m-0">
                Showing {Math.min((page - 1) * pageSize + 1, filteredFindings.length)}–
                {Math.min(page * pageSize, filteredFindings.length)} of {filteredFindings.length}{' '}
                findings
              </p>
              <nav
                className="flex items-center justify-end gap-3 max-[520px]:gap-[7px]"
                aria-label="Findings pages"
              >
                <button
                  className={secondaryButtonClassName}
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((value) => value - 1)}
                >
                  Previous
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button
                  className={secondaryButtonClassName}
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((value) => value + 1)}
                >
                  Next
                </button>
              </nav>
            </footer>
          </div>
        )}
      </section>
    </AppLayout>
  )
}
