import { useMemo, useState, type FormEvent } from 'react'
import { ClipboardList, Eye, EyeOff, ScanSearch, ShieldCheck, Target } from 'lucide-react'
import { Link, Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { FormInput, FormSelect } from './components/FormControl'
import { DataTable, type DataTableColumn } from './components/DataTable'
import {
  iconButtonClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
  textLinkClassName,
} from './components/ui'
import {
  FindingDetailPage,
  FindingsPage,
  ReportsPage,
  ScansPage,
  SettingsPage,
  TargetsPage,
} from './pages/OperationalPages'
import { NotFoundPage } from './pages/NotFoundPage'
import { mockApi, type Finding } from './data/mockApi'
import { useApiResource } from './hooks/useApiResource'
import { formatDateTime } from './utils/format'

type TrendRange = '3m' | '6m' | '12m'
type TrendPoint = {
  date: string
  label: string
  critical: number
  high: number
  medium: number
  low: number
  info: number
}

const severityColors = {
  critical: 'var(--color-severity-critical)',
  high: 'var(--color-severity-high)',
  medium: 'var(--color-severity-medium)',
  low: 'var(--color-severity-low)',
} as const

const severityLabels = [
  { key: 'critical', label: 'Critical', color: severityColors.critical },
  { key: 'high', label: 'High', color: severityColors.high },
  { key: 'medium', label: 'Medium', color: severityColors.medium },
  { key: 'low', label: 'Low', color: severityColors.low },
  { key: 'info', label: 'Info', color: 'var(--color-severity-info)' },
] as const

type SeverityKey = (typeof severityLabels)[number]['key']

function isTrendRange(value: string): value is TrendRange {
  return value === '3m' || value === '6m' || value === '12m'
}

function buildTrend(findings: Finding[], range: TrendRange): TrendPoint[] {
  const monthCount = range === '3m' ? 3 : range === '6m' ? 6 : 12
  const latestFindingTimestamp = findings.reduce((latest, finding) => {
    const discoveredAt = new Date(finding.discoveredAt).getTime()
    return Number.isNaN(discoveredAt) ? latest : Math.max(latest, discoveredAt)
  }, 0)
  const currentMonth = latestFindingTimestamp ? new Date(latestFindingTimestamp) : new Date()
  currentMonth.setUTCDate(1)
  currentMonth.setUTCHours(0, 0, 0, 0)
  const start = new Date(currentMonth)
  start.setUTCMonth(start.getUTCMonth() - monthCount + 1)

  return Array.from({ length: monthCount }, (_, index) => {
    const bucketStart = new Date(start)
    bucketStart.setUTCMonth(start.getUTCMonth() + index)
    const bucketEnd = new Date(bucketStart)
    bucketEnd.setUTCMonth(bucketEnd.getUTCMonth() + 1)
    const bucketFindings = findings.filter((finding) => {
      const discoveredAt = new Date(finding.discoveredAt).getTime()
      return discoveredAt >= bucketStart.getTime() && discoveredAt < bucketEnd.getTime()
    })
    return {
      date: new Intl.DateTimeFormat(undefined, {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(bucketStart),
      label: new Intl.DateTimeFormat(undefined, { month: 'short', timeZone: 'UTC' }).format(
        bucketStart,
      ),
      critical: bucketFindings.filter((finding) => finding.severity === 'critical').length,
      high: bucketFindings.filter((finding) => finding.severity === 'high').length,
      medium: bucketFindings.filter((finding) => finding.severity === 'medium').length,
      low: bucketFindings.filter((finding) => finding.severity === 'low').length,
      info: bucketFindings.filter((finding) => finding.severity === 'info').length,
    }
  })
}

function LoginPage() {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [loginError, setLoginError] = useState('')
  const navigate = useNavigate()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '')
      .trim()
      .toLowerCase()
    const password = String(formData.get('password') ?? '')

    if (email !== 'analyst@example.com' || password !== 'SecureScan123!') {
      setLoginError('Email or password is incorrect. Please try again.')
      return
    }
    sessionStorage.setItem('dashboard-authenticated', 'demo-token')
    navigate('/dashboard')
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-blue-50 px-5 py-8 max-[480px]:px-4 max-[480px]:py-5">
      <section
        className="w-full max-w-[440px] rounded-2xl border border-blue-100 bg-white p-10 shadow-[var(--card-shadow)] max-[480px]:px-6 max-[480px]:py-8"
        aria-labelledby="login-title"
      >
        <div
          className="mx-auto flex w-fit max-w-full items-center gap-2.5 text-gray-900 no-underline"
          aria-label="Website Scanner"
        >
          <span
            className="grid size-[38px] shrink-0 place-items-center text-blue-600"
            aria-hidden="true"
          >
            <ShieldCheck className="size-[27px]" />
          </span>
          <span className="text-sm font-semibold tracking-tight leading-[1.4]">
            Website Scanner
          </span>
        </div>
        <div className="mt-8 text-center">
          <h1
            className="m-0 text-[clamp(24px,5vw,27px)] font-semibold leading-[1.3] tracking-tight text-slate-700"
            id="login-title"
          >
            Welcome back
          </h1>
        </div>
        <form className="mt-7 grid gap-[18px]" onSubmit={handleSubmit}>
          <div className="grid gap-[9px]">
            <label className="text-sm font-medium text-slate-700" htmlFor="email">
              Email address
            </label>
            <FormInput
              className="w-full"
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              defaultValue="analyst@example.com"
              aria-invalid={Boolean(loginError)}
              aria-describedby={loginError ? 'login-error' : undefined}
              onChange={() => setLoginError('')}
              required
            />
          </div>
          <div className="grid gap-[9px]">
            <label className="text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <FormInput
                className="w-full pr-[50px]"
                id="password"
                name="password"
                type={passwordVisible ? 'text' : 'password'}
                autoComplete="current-password"
                defaultValue="SecureScan123!"
                aria-invalid={Boolean(loginError)}
                aria-describedby={loginError ? 'login-error' : undefined}
                onChange={() => setLoginError('')}
                required
              />
              <button
                className={`absolute right-1.5 top-1/2 -translate-y-1/2 ${iconButtonClassName}`}
                type="button"
                onClick={() => setPasswordVisible((visible) => !visible)}
                aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                aria-pressed={passwordVisible}
              >
                {passwordVisible ? (
                  <EyeOff size={20} aria-hidden="true" />
                ) : (
                  <Eye size={20} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
          {loginError && (
            <p
              className="-mt-1 mb-0 text-sm leading-relaxed text-red-700"
              id="login-error"
              role="alert"
            >
              {loginError}
            </p>
          )}
          <button className={`mt-1 ${primaryButtonClassName}`} type="submit">
            Sign in
          </button>
        </form>
      </section>
    </main>
  )
}

function DashboardPage() {
  const resource = useApiResource(() =>
    Promise.all([mockApi.getTargets(), mockApi.getScans(), mockApi.getFindings()]),
  )
  const [trendRange, setTrendRange] = useState<TrendRange>('12m')
  const [hoveredSeverity, setHoveredSeverity] = useState<SeverityKey | null>(null)
  const [targets, scans, findings] = resource.data ?? [[], [], []]
  const openFindings = findings.filter((finding) => finding.status === 'open')
  const severityLevels = severityLabels.map((level) => ({
    ...level,
    count: openFindings.filter((finding) => finding.severity === level.key).length,
  }))
  const trend = useMemo(() => buildTrend(findings, trendRange), [findings, trendRange])
  const trendTotals = trend.map(
    (point) => point.critical + point.high + point.medium + point.low + point.info,
  )
  const trendAxisMaximum = Math.max(4, Math.ceil(Math.max(...trendTotals, 1) / 4) * 4)
  const trendTicks = Array.from(
    { length: 5 },
    (_, index) => trendAxisMaximum - (index * trendAxisMaximum) / 4,
  )
  const trendChart = { left: 48, right: 580, top: 12, bottom: 146, height: 134 }
  const slotWidth = (trendChart.right - trendChart.left) / Math.max(1, trend.length)
  const barWidth = Math.min(68, slotWidth * 0.68)
  const totalOpenBySeverity = severityLevels.reduce((sum, level) => sum + level.count, 0)
  const circumference = 2 * Math.PI * 55
  let offset = 0
  const donutSegments = severityLevels.map((level) => {
    const length = totalOpenBySeverity ? (level.count / totalOpenBySeverity) * circumference : 0
    const segment = { ...level, length, offset }
    offset += length
    return segment
  })
  const targetById = new Map(targets.map((target) => [target.id, target]))
  const recentRows = [...scans]
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .slice(0, 4)
    .map((scan) => {
      const target = targetById.get(scan.targetId)
      return {
        id: scan.id,
        target: target?.name ?? 'Removed target',
        scanId: scan.id,
        startedAt: scan.startedAt,
        status: scan.status,
        findings: Object.values(scan.findingsCount).reduce((sum, count) => sum + count, 0),
      }
    })
  const recentColumns: DataTableColumn<(typeof recentRows)[number]>[] = [
    { key: 'target', header: 'Target', width: '35%', renderCell: (row) => row.target },
    {
      key: 'date',
      header: 'Date & time',
      width: '31%',
      renderCell: (row) => formatDateTime(row.startedAt),
    },
    {
      key: 'findings',
      header: 'Findings',
      width: '16%',
      renderCell: (row) =>
        row.status === 'completed' ? (
          <Link className={textLinkClassName} to={`/findings?scanId=${row.scanId}`}>
            {row.findings}
          </Link>
        ) : (
          row.findings || '—'
        ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '18%',
      renderCell: (row) => <span className="capitalize">{row.status}</span>,
    },
  ]

  return (
    <AppLayout title="Dashboard" subtitle="">
      {resource.status === 'loading' && (
        <p className="px-4 py-7 text-center text-sm text-slate-600" role="status">
          Loading dashboard data…
        </p>
      )}
      {resource.error && (
        <div className="px-4 py-7 text-center text-sm text-red-700" role="alert">
          <p className="mb-3">{resource.error.message}</p>
          <button className={secondaryButtonClassName} type="button" onClick={resource.reload}>
            Try again
          </button>
        </div>
      )}
      {resource.data && (
        <>
          <section
            className="grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-4"
            aria-label="Security metrics"
          >
            <Link
              className="block min-w-0 rounded-[10px] border border-slate-200 bg-white p-3 text-inherit no-underline shadow-[var(--card-shadow)] transition-colors hover:border-blue-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              to="/targets"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 break-words text-sm leading-snug text-slate-600">
                  Targets
                </span>
                <Target className="size-[18px] shrink-0 text-blue-600" />
              </div>
              <p className="mb-0 mt-2 text-2xl font-semibold leading-none tracking-tight text-slate-800">
                {targets.length}
              </p>
            </Link>
            <Link
              className="block min-w-0 rounded-[10px] border border-slate-200 bg-white p-3 text-inherit no-underline shadow-[var(--card-shadow)] transition-colors hover:border-blue-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              to="/scans"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 break-words text-sm leading-snug text-slate-600">
                  Scans
                </span>
                <ScanSearch className="size-[18px] shrink-0 text-blue-600" />
              </div>
              <p className="mb-0 mt-2 text-2xl font-semibold leading-none tracking-tight text-slate-800">
                {scans.length}
              </p>
            </Link>
            <Link
              className="block min-w-0 rounded-[10px] border border-slate-200 bg-white p-3 text-inherit no-underline shadow-[var(--card-shadow)] transition-colors hover:border-blue-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              to="/findings?status=open"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 break-words text-sm leading-snug text-slate-600">
                  Open findings
                </span>
                <ClipboardList className="size-[18px] shrink-0 text-blue-600" />
              </div>
              <p className="mb-0 mt-2 text-2xl font-semibold leading-none tracking-tight text-slate-800">
                {openFindings.length}
              </p>
            </Link>
            <Link
              className="block min-w-0 rounded-[10px] border border-slate-200 bg-white p-3 text-inherit no-underline shadow-[var(--card-shadow)] transition-colors hover:border-blue-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              to="/findings?severity=critical"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 break-words text-sm leading-snug text-slate-600">
                  Critical
                </span>
                <ShieldCheck className="size-[18px] shrink-0 text-blue-600" />
              </div>
              <p className="mb-0 mt-2 text-2xl font-semibold leading-none tracking-tight text-slate-800">
                {openFindings.filter((finding) => finding.severity === 'critical').length}
              </p>
            </Link>
          </section>

          <section
            className="mt-3 grid min-w-0 grid-cols-1 items-stretch gap-3 xl:grid-cols-[minmax(300px,0.95fr)_minmax(0,1.05fr)]"
            aria-label="Findings analytics"
          >
            <article className="flex min-h-[280px] min-w-0 flex-col rounded-[10px] border border-slate-200 bg-white p-3 shadow-[var(--card-shadow)]">
              <section className="flex min-w-0 flex-1 flex-col" aria-labelledby="severity-title">
                <h2
                  className="m-0 text-sm font-medium leading-relaxed text-slate-800"
                  id="severity-title"
                >
                  Open Findings by Severity
                </h2>
                <div className="relative mx-auto grid size-44 place-items-center">
                  <svg
                    viewBox="0 0 160 160"
                    className="block size-full overflow-visible [transform:rotate(-90deg)]"
                    role="group"
                    aria-label={`Open findings by severity: ${severityLevels.map((level) => `${level.label} ${level.count}`).join(', ')}`}
                  >
                    <circle
                      className="fill-none [stroke-width:19]"
                      cx="80"
                      cy="80"
                      r="55"
                      style={{ stroke: 'var(--color-chart-track)' }}
                    />
                    {donutSegments
                      .filter((segment) => segment.count > 0)
                      .map((segment) => (
                        <circle
                          key={segment.key}
                          className="cursor-pointer fill-none [stroke-width:19] [stroke-linecap:butt] transition-[filter,stroke-width] duration-150 hover:[filter:brightness(.86)] focus-visible:[stroke-width:22]"
                          cx="80"
                          cy="80"
                          r="55"
                          stroke={segment.color}
                          strokeDasharray={`${Math.max(0, segment.length - 2)} ${circumference - Math.max(0, segment.length - 2)}`}
                          strokeDashoffset={-segment.offset}
                          onMouseEnter={() => setHoveredSeverity(segment.key)}
                          onMouseLeave={() => setHoveredSeverity(null)}
                          onFocus={() => setHoveredSeverity(segment.key)}
                          onBlur={() => setHoveredSeverity(null)}
                          tabIndex={0}
                          role="img"
                          aria-label={`${segment.label}: ${segment.count} open findings`}
                        >
                          <title>{`${segment.label}: ${segment.count} open findings`}</title>
                        </circle>
                      ))}
                  </svg>
                  <div
                    className="pointer-events-none absolute flex w-[76px] flex-col items-center justify-center gap-0.5 text-center text-slate-800"
                    aria-live="polite"
                  >
                    <strong className="text-2xl font-semibold leading-none">
                      {hoveredSeverity
                        ? severityLevels.find((level) => level.key === hoveredSeverity)?.count
                        : totalOpenBySeverity}
                    </strong>
                    <span className="text-[11px] leading-tight text-slate-500">
                      {hoveredSeverity
                        ? severityLevels.find((level) => level.key === hoveredSeverity)?.label
                        : 'Open findings'}
                    </span>
                  </div>
                </div>
                <ul className="mt-auto flex min-w-0 list-none flex-wrap items-center justify-start gap-x-3 gap-y-2 border-t border-slate-100 px-0 pb-[3px] pt-2.5">
                  {severityLevels.map((level) => (
                    <li className="shrink-0" key={level.key}>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                        <i
                          className="size-[9px] shrink-0 rounded-full"
                          style={{ backgroundColor: level.color }}
                        />
                        {level.label}
                        <span>{` (${level.count})`}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </article>

            <article className="flex min-h-[280px] min-w-0 flex-col rounded-[10px] border border-slate-200 bg-white p-3 shadow-[var(--card-shadow)]">
              <section className="flex min-w-0 flex-1 flex-col" aria-labelledby="trend-title">
                <div className="flex min-w-0 flex-wrap items-center justify-between gap-2.5">
                  <h2
                    className="m-0 text-sm font-medium leading-relaxed text-slate-800"
                    id="trend-title"
                  >
                    Findings Over Time
                  </h2>
                  <label className="w-[148px] max-w-full shrink-0">
                    <span className="sr-only">Timeline</span>
                    <FormSelect
                      className="cursor-pointer"
                      value={trendRange}
                      onChange={(event) => {
                        if (isTrendRange(event.target.value)) setTrendRange(event.target.value)
                      }}
                    >
                      <option value="3m">3 months</option>
                      <option value="6m">6 months</option>
                      <option value="12m">12 months</option>
                    </FormSelect>
                  </label>
                </div>
                <svg
                  className="mt-2 block h-auto w-full overflow-hidden"
                  viewBox="0 0 600 174"
                  role="group"
                  aria-label={`Findings by severity in the last ${trendRange === '3m' ? '3 months' : trendRange === '6m' ? '6 months' : '12 months'}`}
                >
                  {trendTicks.map((tick, index) => {
                    const y = trendChart.top + index * (trendChart.height / 4)
                    return (
                      <g key={tick}>
                        <line
                          className="[stroke-dasharray:3_4] [stroke-width:1.2]"
                          x1={trendChart.left}
                          x2={trendChart.right}
                          y1={y}
                          y2={y}
                          style={{ stroke: 'var(--color-chart-grid)' }}
                        />
                        <text
                          className="[font-family:inherit] [font-size:12px]"
                          x="40"
                          y={y + 4}
                          textAnchor="end"
                          style={{ fill: 'var(--color-chart-label)' }}
                        >
                          {tick}
                        </text>
                      </g>
                    )
                  })}
                  {trend.map((point, index) => {
                    const x = trendChart.left + index * slotWidth + (slotWidth - barWidth) / 2
                    const total =
                      point.critical + point.high + point.medium + point.low + point.info
                    let currentY = trendChart.bottom
                    const segments = severityLabels.map((level) => ({
                      ...level,
                      count: point[level.key],
                    }))
                    const pointSummary = `${point.date}: ${total} findings. ${severityLabels.map((level) => `${level.label} ${point[level.key]}`).join(', ')}`
                    return (
                      <g
                        className="group cursor-pointer outline-none focus-visible:drop-shadow-[0_0_2px_rgba(37,99,235,0.8)]"
                        key={`${point.date}-${index}`}
                        tabIndex={0}
                        role="img"
                        aria-label={pointSummary}
                      >
                        <title>{pointSummary}</title>
                        {segments.map((segment) => {
                          const height = (segment.count / trendAxisMaximum) * trendChart.height
                          currentY -= height
                          return (
                            <rect
                              className="transition-[filter,opacity] group-hover:brightness-90 group-focus-visible:brightness-90"
                              key={segment.key}
                              x={x}
                              y={currentY}
                              width={barWidth}
                              height={height}
                              fill={segment.color}
                            />
                          )
                        })}
                        <text
                          className="[font-family:inherit] [font-size:12px]"
                          x={x + barWidth / 2}
                          y={trendChart.bottom + 18}
                          textAnchor="middle"
                          style={{ fill: 'var(--color-chart-label)' }}
                        >
                          {point.label}
                        </text>
                      </g>
                    )
                  })}
                </svg>
                <ul className="mt-auto flex list-none flex-wrap items-center gap-x-3 gap-y-2 px-0 pt-3">
                  {severityLevels.map((level) => (
                    <li className="shrink-0" key={level.key}>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                        <i
                          className="size-[9px] shrink-0 rounded-full"
                          style={{ backgroundColor: level.color }}
                        />
                        {level.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </article>
          </section>

          <section className="mt-3 rounded-[10px] border border-slate-200 bg-white p-3 shadow-[var(--card-shadow)] sm:px-4 sm:pb-1">
            <div className="mb-2 flex items-center justify-between gap-4">
              <h2 className="m-0 text-[15px] font-semibold text-slate-700">Recent scans</h2>
              <Link
                className="text-sm text-blue-600 no-underline hover:text-blue-700 hover:underline"
                to="/scans"
              >
                View all
              </Link>
            </div>
            {recentRows.length ? (
              <DataTable
                ariaLabel="Recent scans"
                columns={recentColumns}
                rows={recentRows}
                getRowKey={(row) => row.id}
                minWidth={760}
              />
            ) : (
              <p className="px-4 py-7 text-center text-sm text-slate-600">
                No scans have been run yet.
              </p>
            )}
          </section>
        </>
      )}
    </AppLayout>
  )
}

function ProtectedRoutes() {
  return sessionStorage.getItem('dashboard-authenticated') ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  )
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoutes />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/targets" element={<TargetsPage />} />
        <Route path="/scans" element={<ScansPage />} />
        <Route path="/findings" element={<FindingsPage />} />
        <Route path="/findings/:findingId" element={<FindingDetailPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
