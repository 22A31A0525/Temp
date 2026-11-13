import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { AppLayout } from '../../components/AppLayout'
import { FormSelect } from '../../components/FormControl'
import { ResourceState } from '../../components/ResourceState'
import { panelClassName, textLinkClassName } from '../../components/ui'
import { useApiResource } from '../../hooks/useApiResource'
import { mockApi, type FindingStatus } from '../../data/mockApi'
import { formatDateTime } from '../../utils/format'
import { severityBadgeClasses, statusValues } from './constants'

export function FindingDetailPage() {
  const { findingId = '' } = useParams()
  const resource = useApiResource(() => mockApi.getFinding(findingId))
  const targetsResource = useApiResource(mockApi.getTargets)
  const [updating, setUpdating] = useState(false)
  const [actionError, setActionError] = useState('')

  async function updateStatus(nextStatus: FindingStatus) {
    setUpdating(true)
    setActionError('')
    try {
      await mockApi.updateFindingStatus(findingId, nextStatus)
      resource.reload()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to update finding status.')
    } finally {
      setUpdating(false)
    }
  }

  const finding = resource.data
  const target = targetsResource.data?.find((item) => item.id === finding?.targetId)

  return (
    <AppLayout title="Finding detail" subtitle="">
      <ResourceState
        loading={resource.status === 'loading'}
        error={resource.error}
        empty={false}
        onRetry={resource.reload}
      />
      {finding && targetsResource.error && (
        <ResourceState
          loading={false}
          error={targetsResource.error}
          empty={false}
          onRetry={targetsResource.reload}
        />
      )}
      {finding && targetsResource.status === 'loading' && (
        <ResourceState loading error={null} empty={false} onRetry={targetsResource.reload} />
      )}
      {finding && targetsResource.data && (
        <div className="mx-auto max-w-[900px]">
          <Link
            className={`${textLinkClassName} mb-3 inline-flex items-center gap-1.5`}
            to="/findings"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Findings
          </Link>
          <article className={`p-4 sm:p-5 ${panelClassName}`}>
            <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
              <div className="min-w-0">
                <p className="m-0 text-xs font-medium text-slate-500">
                  {finding.category} <span aria-hidden="true">·</span> {finding.cwe}
                </p>
                <h2 className="mb-0 mt-1.5 break-words text-xl font-semibold leading-snug text-slate-800">
                  {finding.title}
                </h2>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${severityBadgeClasses[finding.severity]}`}
                >
                  {finding.severity}
                </span>
                <label className="sr-only" htmlFor="finding-status">
                  Finding status
                </label>
                <FormSelect
                  className="min-h-9 w-auto py-1"
                  id="finding-status"
                  value={finding.status}
                  disabled={updating}
                  onChange={(event) => void updateStatus(event.target.value as FindingStatus)}
                >
                  {statusValues.map((value) => (
                    <option key={value} value={value}>
                      {value.replace('_', ' ')}
                    </option>
                  ))}
                </FormSelect>
              </div>
            </header>

            <dl className="mt-4 grid grid-cols-3 gap-4 rounded-md bg-slate-50 px-3 py-2.5 max-[520px]:grid-cols-1">
              <div className="min-w-0">
                <dt className="mb-0.5 text-xs text-slate-500">Target</dt>
                <dd className="m-0 break-words text-sm font-medium text-slate-700">
                  {target?.name ?? 'Removed target'}
                  {target && (
                    <span className="mt-0.5 block overflow-hidden text-ellipsis whitespace-nowrap text-xs font-normal text-slate-500">
                      {target.url}
                    </span>
                  )}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="mb-0.5 text-xs text-slate-500">Location</dt>
                <dd className="m-0 break-words text-sm text-slate-700">{finding.location}</dd>
              </div>
              <div className="min-w-0">
                <dt className="mb-0.5 text-xs text-slate-500">Discovered</dt>
                <dd className="m-0 break-words text-sm text-slate-700">
                  {formatDateTime(finding.discoveredAt)}
                </dd>
              </div>
            </dl>

            <section className="pt-4" aria-labelledby="finding-description">
              <h3 className="mb-1 text-sm font-semibold text-slate-800" id="finding-description">
                Description
              </h3>
              <p className="m-0 text-sm leading-relaxed text-slate-600">{finding.description}</p>
            </section>

            <section className="pt-4" aria-labelledby="finding-evidence">
              <h3 className="mb-2 text-sm font-semibold text-slate-800" id="finding-evidence">
                Evidence
              </h3>
              <div className="grid grid-cols-2 gap-2.5 max-[520px]:grid-cols-1">
                <section className="min-w-0" aria-label="Request evidence">
                  <h4 className="mb-1 text-xs font-medium text-slate-500">Request</h4>
                  <pre className="m-0 max-h-48 min-h-14 overflow-auto whitespace-pre-wrap break-words rounded-md bg-slate-50 p-2.5 font-mono text-xs leading-relaxed text-slate-700">
                    {finding.evidence.request}
                  </pre>
                </section>
                <section className="min-w-0" aria-label="Response evidence">
                  <h4 className="mb-1 text-xs font-medium text-slate-500">Response</h4>
                  <pre className="m-0 max-h-48 min-h-14 overflow-auto whitespace-pre-wrap break-words rounded-md bg-slate-50 p-2.5 font-mono text-xs leading-relaxed text-slate-700">
                    {finding.evidence.response}
                  </pre>
                </section>
              </div>
            </section>

            <section className="pt-4" aria-labelledby="finding-remediation">
              <h3 className="mb-1 text-sm font-semibold text-slate-800" id="finding-remediation">
                Remediation
              </h3>
              <p className="m-0 text-sm leading-relaxed text-slate-600">{finding.remediation}</p>
            </section>

            {actionError && (
              <p className="mb-0 mt-3 text-sm text-red-700" role="alert">
                {actionError}
              </p>
            )}
          </article>
        </div>
      )}
    </AppLayout>
  )
}
