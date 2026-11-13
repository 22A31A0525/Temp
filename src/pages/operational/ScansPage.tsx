import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { AppLayout } from '../../components/AppLayout'
import { FormSelect } from '../../components/FormControl'
import { DataTable, type DataTableColumn } from '../../components/DataTable'
import { ResourceState } from '../../components/ResourceState'
import {
  panelClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
  textLinkClassName,
} from '../../components/ui'
import { useApiResource } from '../../hooks/useApiResource'
import { mockApi, type Scan } from '../../data/mockApi'
import { formatDateTime, formatDuration } from '../../utils/format'

export function ScansPage() {
  const pageSize = 10
  const scansResource = useApiResource(mockApi.getScans)
  const targetsResource = useApiResource(mockApi.getTargets)
  const scansData = scansResource.data
  const reloadScans = scansResource.reload
  const [selectedTargetId, setSelectedTargetId] = useState('')
  const [page, setPage] = useState(1)
  const [creating, setCreating] = useState(false)
  const [actionError, setActionError] = useState('')
  const targetsById = new Map((targetsResource.data ?? []).map((target) => [target.id, target]))
  const statusDotClasses: Record<Scan['status'], string> = {
    queued: 'bg-amber-500',
    running: 'bg-blue-600 shadow-[0_0_0_3px_rgba(37,99,235,0.12)]',
    completed: 'bg-green-600',
    failed: 'bg-red-600',
  }

  useEffect(() => {
    const running = scansData?.filter((scan) => scan.status === 'running') ?? []
    if (!running.length) return
    let active = true
    const timer = window.setInterval(() => {
      void Promise.all(running.map((scan) => mockApi.advanceScan(scan.id)))
        .then(() => {
          if (active) reloadScans()
        })
        .catch((error: unknown) => {
          if (active)
            setActionError(
              error instanceof Error ? error.message : 'Unable to update scan progress.',
            )
        })
    }, 1400)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [scansData, reloadScans])

  async function startScan() {
    if (!selectedTargetId) return
    setActionError('')
    setCreating(true)
    try {
      await mockApi.createScan(selectedTargetId)
      setPage(1)
      scansResource.reload()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to start scan.')
    } finally {
      setCreating(false)
    }
  }

  const columns: DataTableColumn<Scan>[] = [
    {
      key: 'status',
      header: 'Status',
      width: '19%',
      renderCell: (scan) => (
        <div className="flex items-center gap-2">
          <span className={`size-[7px] shrink-0 rounded-full ${statusDotClasses[scan.status]}`} />
          {scan.status === 'running' ? (
            <div className="grid min-w-[85px] gap-1 text-[13px] text-slate-600">
              <span>Running · {scan.progress}%</span>
              <progress
                className="h-[5px] w-full accent-blue-600"
                max="100"
                value={scan.progress}
                aria-label={`Scan ${scan.id} progress`}
              />
            </div>
          ) : (
            <span className="capitalize">{scan.status}</span>
          )}
        </div>
      ),
      titleForRow: (scan) =>
        scan.status === 'running' ? `Running · ${scan.progress}%` : scan.status,
    },
    {
      key: 'target',
      header: 'Target',
      width: '24%',
      renderCell: (scan) => targetsById.get(scan.targetId)?.name ?? 'Removed target',
    },
    {
      key: 'started',
      header: 'Start time',
      width: '25%',
      renderCell: (scan) => formatDateTime(scan.startedAt),
    },
    {
      key: 'duration',
      header: 'Duration',
      width: '15%',
      renderCell: (scan) => formatDuration(scan.durationSec),
    },
    {
      key: 'findings',
      header: 'Findings',
      width: '17%',
      renderCell: (scan) => {
        const findingsCount = Object.values(scan.findingsCount).reduce(
          (sum, count) => sum + count,
          0,
        )
        return scan.status === 'completed' ? (
          <Link className={textLinkClassName} to={`/findings?scanId=${scan.id}`}>
            {findingsCount}
          </Link>
        ) : (
          findingsCount || '—'
        )
      },
      titleForRow: (scan) => {
        const findingsCount = Object.values(scan.findingsCount).reduce(
          (sum, count) => sum + count,
          0,
        )
        return scan.status === 'completed' || findingsCount ? String(findingsCount) : '—'
      },
    },
  ]

  const loadError = scansResource.error ?? targetsResource.error
  const loading = scansResource.status === 'loading' || targetsResource.status === 'loading'
  const totalScans = scansResource.data?.length ?? 0
  const totalPages = Math.max(1, Math.ceil(totalScans / pageSize))
  const visibleScans = scansResource.data?.slice((page - 1) * pageSize, page * pageSize) ?? []

  return (
    <AppLayout title="Scans" subtitle="">
      <section className={`mt-4 p-4 sm:p-5 ${panelClassName}`}>
        <div className="mb-3 flex items-center justify-between gap-4 max-[1023px]:items-start max-[1023px]:flex-col">
          <h2 className="m-0 text-[15px] font-semibold text-slate-700">Scan history</h2>
          <form
            className="flex w-[370px] max-w-full items-end gap-2 max-[1023px]:w-full"
            onSubmit={(event) => {
              event.preventDefault()
              void startScan()
            }}
          >
            <label
              className="grid min-w-0 flex-1 gap-1 text-xs font-medium text-slate-600"
              htmlFor="scan-target"
            >
              <span>Target</span>
              <FormSelect
                className="min-w-0"
                id="scan-target"
                value={selectedTargetId}
                onChange={(event) => setSelectedTargetId(event.target.value)}
                disabled={!targetsResource.data?.length}
                required
              >
                <option value="" disabled>
                  Select target
                </option>
                {targetsResource.data?.map((target) => (
                  <option key={target.id} value={target.id}>
                    {target.name}
                  </option>
                ))}
              </FormSelect>
            </label>
            <button
              className={primaryButtonClassName}
              type="submit"
              disabled={creating || !selectedTargetId}
            >
              <Plus className="size-[15px]" />
              {creating ? 'Starting…' : 'Start scan'}
            </button>
          </form>
        </div>
        {actionError && (
          <p className="my-2.5 text-sm text-red-700" role="alert">
            {actionError}
          </p>
        )}
        {scansResource.data && !scansResource.data.length && scansResource.status === 'success' ? (
          <div className="px-4 py-7 text-center text-sm text-slate-600">
            <p className="mb-0">No scans yet.</p>
          </div>
        ) : (
          <>
            <ResourceState
              loading={loading}
              error={loadError}
              empty={false}
              onRetry={() => {
                scansResource.reload()
                targetsResource.reload()
              }}
            />
            {scansResource.data && targetsResource.data && (
              <>
                <DataTable
                  ariaLabel="Scan runs"
                  columns={columns}
                  rows={visibleScans}
                  getRowKey={(scan) => scan.id}
                  minWidth={900}
                />
                {totalPages > 1 && (
                  <footer className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-sm text-slate-600 max-[520px]:justify-center">
                    <p className="m-0">
                      Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalScans)} of{' '}
                      {totalScans} scans
                    </p>
                    <nav className="flex items-center gap-3" aria-label="Scan history pages">
                      <button
                        className={secondaryButtonClassName}
                        type="button"
                        disabled={page === 1}
                        onClick={() => setPage((current) => current - 1)}
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
                        onClick={() => setPage((current) => current + 1)}
                      >
                        Next
                      </button>
                    </nav>
                  </footer>
                )}
              </>
            )}
          </>
        )}
        {targetsResource.data?.length === 0 && targetsResource.status === 'success' && (
          <p className="mb-0 mt-3 text-sm text-slate-600">
            Add a target before starting a scan.{' '}
            <Link className={textLinkClassName} to="/targets">
              Go to targets
            </Link>
          </p>
        )}
      </section>
    </AppLayout>
  )
}
