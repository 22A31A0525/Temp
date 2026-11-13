import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppLayout } from '../../components/AppLayout'
import { DataTable, type DataTableColumn } from '../../components/DataTable'
import { FormSelect } from '../../components/FormControl'
import { ResourceState } from '../../components/ResourceState'
import {
  panelClassName,
  primaryButtonClassName,
  textButtonClassName,
  textLinkClassName,
} from '../../components/ui'
import { useApiResource } from '../../hooks/useApiResource'
import { mockApi, type Report } from '../../data/mockApi'
import { formatDateTime } from '../../utils/format'

export function ReportsPage() {
  const reportsResource = useApiResource(mockApi.getReports)
  const scansResource = useApiResource(mockApi.getScans)
  const findingsResource = useApiResource(mockApi.getFindings)
  const [selectedScanId, setSelectedScanId] = useState('')
  const [generating, setGenerating] = useState(false)
  const [actionError, setActionError] = useState('')
  const [downloadMessage, setDownloadMessage] = useState('')
  const [downloadingReportId, setDownloadingReportId] = useState<string | null>(null)
  const completedScans = (scansResource.data ?? []).filter((scan) => scan.status === 'completed')

  useEffect(() => {
    if (completedScans.length && !selectedScanId) setSelectedScanId(completedScans[0].id)
  }, [completedScans, selectedScanId])

  async function generateReport() {
    setActionError('')
    setGenerating(true)
    try {
      await mockApi.createReport(selectedScanId)
      reportsResource.reload()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to generate report.')
    } finally {
      setGenerating(false)
    }
  }

  async function downloadReport(report: Report) {
    setActionError('')
    setDownloadMessage('')
    const scan = scansResource.data?.find((item) => item.id === report.scanId)
    if (!scan) {
      setActionError(`Cannot download report: scan ${report.scanId} is unavailable.`)
      return
    }
    const scanFindings = (findingsResource.data ?? []).filter(
      (finding) => finding.scanId === report.scanId,
    )
    setDownloadingReportId(report.id)
    try {
      const { downloadScanReportPdf } = await import('../../utils/pdfReport')
      downloadScanReportPdf(report, scan, scanFindings)
      setDownloadMessage(`Downloaded ${report.scanId} report.`)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to create the PDF report.')
    } finally {
      setDownloadingReportId(null)
    }
  }

  const columns: DataTableColumn<Report>[] = [
    { key: 'target', header: 'Target', width: '23%', renderCell: (report) => report.target },
    {
      key: 'scan',
      header: 'Scan',
      width: '18%',
      renderCell: (report) => (
        <Link className={textLinkClassName} to={`/findings?scanId=${report.scanId}`}>
          {report.scanId}
        </Link>
      ),
      titleForRow: (report) => report.scanId,
    },
    {
      key: 'created',
      header: 'Generated',
      width: '25%',
      renderCell: (report) => formatDateTime(report.createdAt),
    },
    { key: 'findings', header: 'Findings', width: '12%', renderCell: (report) => report.findings },
    {
      key: 'download',
      header: 'Report',
      width: '22%',
      renderCell: (report) => (
        <button
          className={textButtonClassName}
          type="button"
          onClick={() => void downloadReport(report)}
          disabled={downloadingReportId !== null}
        >
          {downloadingReportId === report.id ? 'Preparing PDF…' : 'Download PDF'}
        </button>
      ),
    },
  ]

  return (
    <AppLayout title="Reports" subtitle="Generate and download reports for completed scans.">
      <section className={`mt-4 p-4 sm:p-5 ${panelClassName}`}>
        <div className="mb-3 flex items-center justify-between gap-4 max-[1279px]:items-start max-[1279px]:flex-col">
          <div>
            <h2 className="m-0 text-[15px] font-semibold text-slate-700">Generated reports</h2>
            <p className="mb-0 mt-1 text-sm text-slate-600">PDF reports from completed scan runs</p>
          </div>
          <form
            className="flex w-[360px] max-w-full items-center gap-2 max-[1279px]:w-full"
            onSubmit={(event) => {
              event.preventDefault()
              void generateReport()
            }}
          >
            <label className="sr-only" htmlFor="report-scan">
              Scan to report
            </label>
            <FormSelect
              className="min-w-0 flex-1"
              id="report-scan"
              value={selectedScanId}
              onChange={(event) => setSelectedScanId(event.target.value)}
              disabled={!completedScans.length}
            >
              {completedScans.map((scan) => (
                <option key={scan.id} value={scan.id}>
                  {scan.id}
                </option>
              ))}
            </FormSelect>
            <button
              className={`${primaryButtonClassName} shrink-0 whitespace-nowrap`}
              type="submit"
              disabled={generating || !selectedScanId}
            >
              {generating ? 'Generating…' : 'Generate report'}
            </button>
          </form>
        </div>
        {actionError && (
          <p className="my-2.5 text-sm text-red-700" role="alert">
            {actionError}
          </p>
        )}
        {downloadMessage && (
          <p
            className="flex items-center justify-between gap-3 rounded-md bg-green-50 px-3 py-2.5 text-sm text-green-800"
            role="status"
          >
            {downloadMessage}
            <button
              className={textButtonClassName}
              type="button"
              onClick={() => setDownloadMessage('')}
            >
              Dismiss
            </button>
          </p>
        )}
        {reportsResource.data &&
        !reportsResource.data.length &&
        reportsResource.status === 'success' ? (
          <div className="px-4 py-7 text-center text-sm text-slate-600">
            <p className="mb-0">No reports generated yet.</p>
          </div>
        ) : (
          <>
            <ResourceState
              loading={
                reportsResource.status === 'loading' ||
                scansResource.status === 'loading' ||
                findingsResource.status === 'loading'
              }
              error={reportsResource.error ?? scansResource.error ?? findingsResource.error}
              empty={false}
              onRetry={() => {
                reportsResource.reload()
                scansResource.reload()
                findingsResource.reload()
              }}
            />
            {reportsResource.data && scansResource.data && findingsResource.data && (
              <DataTable
                ariaLabel="Generated reports"
                columns={columns}
                rows={reportsResource.data}
                getRowKey={(report) => report.id}
                minWidth={900}
              />
            )}
          </>
        )}
      </section>
    </AppLayout>
  )
}
