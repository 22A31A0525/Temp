export type Environment = 'staging' | 'production' | 'dev'
export type ScanStatus = 'queued' | 'running' | 'completed' | 'failed'
export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'
export type FindingStatus = 'open' | 'confirmed' | 'resolved' | 'false_positive'

export type Target = {
  id: string
  name: string
  url: string
  environment: Environment
  authenticated: boolean
  lastScannedAt: string | null
  openFindings: number
}

type TargetInput = Omit<Target, 'id' | 'lastScannedAt' | 'openFindings'> & {
  credentials?: { username: string; password: string }
}

export type FindingCounts = Record<FindingSeverity, number>

export type Scan = {
  id: string
  targetId: string
  status: ScanStatus
  progress: number
  startedAt: string
  durationSec: number | null
  findingsCount: FindingCounts
}

export type Finding = {
  id: string
  scanId: string
  targetId: string
  title: string
  severity: FindingSeverity
  category: string
  cwe: string
  status: FindingStatus
  location: string
  description: string
  evidence: { request: string; response: string }
  remediation: string
  discoveredAt: string
}

export type Report = {
  id: string
  scanId: string
  target: string
  createdAt: string
  findings: number
  format: 'pdf'
}

const targets: Target[] = [
  {
    id: 'tgt_01',
    name: 'Acme Store',
    url: 'https://shop.example.com',
    environment: 'staging',
    authenticated: true,
    lastScannedAt: '2026-02-18T09:12:00Z',
    openFindings: 7,
  },
  {
    id: 'tgt_02',
    name: 'Customer Portal',
    url: 'https://portal.example.com',
    environment: 'production',
    authenticated: false,
    lastScannedAt: '2026-02-17T15:40:00Z',
    openFindings: 6,
  },
  {
    id: 'tgt_03',
    name: 'Public API',
    url: 'https://api.example.com',
    environment: 'production',
    authenticated: false,
    lastScannedAt: '2026-02-16T12:15:00Z',
    openFindings: 8,
  },
  {
    id: 'tgt_04',
    name: 'Marketing Site',
    url: 'https://www.example.com',
    environment: 'production',
    authenticated: false,
    lastScannedAt: '2026-02-15T10:30:00Z',
    openFindings: 5,
  },
  {
    id: 'tgt_05',
    name: 'Admin Console',
    url: 'https://admin.example.com',
    environment: 'staging',
    authenticated: true,
    lastScannedAt: '2026-02-14T08:20:00Z',
    openFindings: 7,
  },
  {
    id: 'tgt_06',
    name: 'Partner API',
    url: 'https://partner-api.example.com',
    environment: 'dev',
    authenticated: false,
    lastScannedAt: '2026-02-13T16:05:00Z',
    openFindings: 7,
  },
]

const findingTemplates = [
  {
    title: 'SQL injection in product search',
    severity: 'critical',
    category: 'A03: Injection',
    cwe: 'CWE-89',
    location: 'GET /search?q=',
    description: 'User input in the q parameter reaches the database query unsanitised.',
    request: 'GET /search?q=test%27 HTTP/1.1',
    response: "HTTP/1.1 500 ... SQL syntax error near ''...",
    remediation: 'Use parameterised queries. Validate and encode input.',
  },
  {
    title: 'Missing access control on account endpoint',
    severity: 'high',
    category: 'A01: Broken Access Control',
    cwe: 'CWE-862',
    location: 'GET /api/account/{id}',
    description:
      'An authenticated user can access another account by changing the account identifier.',
    request: 'GET /api/account/1042 HTTP/1.1',
    response: 'HTTP/1.1 200 OK ... account data returned',
    remediation:
      'Enforce authorization checks against the authenticated user for every account request.',
  },
  {
    title: 'Cross-site scripting in profile name',
    severity: 'high',
    category: 'A03: Injection',
    cwe: 'CWE-79',
    location: 'GET /profile?name=',
    description: 'The profile name is reflected into HTML without output encoding.',
    request: 'GET /profile?name=%3Cscript%3E HTTP/1.1',
    response: 'HTTP/1.1 200 OK ... unescaped input in response body',
    remediation:
      'Apply context-aware output encoding and use a restrictive content security policy.',
  },
  {
    title: 'Weak transport security configuration',
    severity: 'medium',
    category: 'A02: Cryptographic Failures',
    cwe: 'CWE-319',
    location: 'TLS configuration',
    description: 'The endpoint permits connections that do not enforce modern transport security.',
    request: 'TLS handshake: legacy protocol offered',
    response: 'Server accepted legacy protocol negotiation',
    remediation: 'Disable legacy protocol versions and enforce HTTPS with modern TLS settings.',
  },
  {
    title: 'Outdated server component detected',
    severity: 'medium',
    category: 'A06: Vulnerable and Outdated Components',
    cwe: 'CWE-1104',
    location: 'HTTP response headers',
    description:
      'A server response identifies a software component version that is no longer maintained.',
    request: 'HEAD / HTTP/1.1',
    response: 'HTTP/1.1 200 OK ... Server: example/1.2',
    remediation:
      'Upgrade the affected component to a supported version and remove version disclosures.',
  },
  {
    title: 'Missing security response header',
    severity: 'low',
    category: 'A05: Security Misconfiguration',
    cwe: 'CWE-693',
    location: 'GET /',
    description: 'The response is missing a recommended browser security policy header.',
    request: 'GET / HTTP/1.1',
    response: 'HTTP/1.1 200 OK ... policy header absent',
    remediation: 'Configure appropriate security headers for the application and its content.',
  },
  {
    title: 'Verbose error response reveals internals',
    severity: 'low',
    category: 'A05: Security Misconfiguration',
    cwe: 'CWE-209',
    location: 'POST /api/session',
    description: 'An error response includes implementation details useful for reconnaissance.',
    request: 'POST /api/session with invalid payload',
    response: 'HTTP/1.1 400 ... internal parser detail returned',
    remediation:
      'Return generic client errors and keep implementation details in protected server logs.',
  },
  {
    title: 'Insufficient password policy controls',
    severity: 'medium',
    category: 'A07: Identification and Authentication Failures',
    cwe: 'CWE-521',
    location: 'POST /register',
    description:
      'The registration flow accepts credentials that do not meet a reasonable strength policy.',
    request: 'POST /register password=12345678',
    response: 'HTTP/1.1 201 Created',
    remediation: 'Apply a documented password policy and protect accounts with rate limits.',
  },
  {
    title: 'Sensitive workflow lacks abuse protections',
    severity: 'high',
    category: 'A04: Insecure Design',
    cwe: 'CWE-799',
    location: 'POST /api/checkout',
    description: 'A sensitive operation can be repeated without an effective business-flow limit.',
    request: 'POST /api/checkout repeated 25 times',
    response: 'HTTP/1.1 200 OK ... operation accepted',
    remediation: 'Define abuse cases and apply server-side quotas and workflow validation.',
  },
  {
    title: 'Cross-origin policy is overly permissive',
    severity: 'medium',
    category: 'A05: Security Misconfiguration',
    cwe: 'CWE-942',
    location: 'OPTIONS /api/*',
    description:
      'Cross-origin responses trust origins more broadly than required by the application.',
    request: 'Origin: https://untrusted.example',
    response: 'Access-Control-Allow-Origin: *',
    remediation:
      'Allow only explicitly trusted origins and limit credentialed cross-origin access.',
  },
  {
    title: 'Untrusted package source accepted',
    severity: 'high',
    category: 'A08: Software and Data Integrity Failures',
    cwe: 'CWE-829',
    location: 'Build dependency configuration',
    description:
      'A dependency is retrieved from a source that is not constrained by an integrity policy.',
    request: 'Dependency fetched from an unverified registry',
    response: 'Package resolved without a pinned integrity value',
    remediation: 'Use trusted registries, lock dependency versions, and verify package integrity.',
  },
  {
    title: 'Security events lack sufficient audit detail',
    severity: 'low',
    category: 'A09: Security Logging and Monitoring Failures',
    cwe: 'CWE-778',
    location: 'POST /api/authenticate',
    description:
      'Authentication failures do not produce sufficient audit events for investigation.',
    request: 'POST /api/authenticate with invalid credentials',
    response: 'HTTP/1.1 401 ... no corresponding audit event',
    remediation:
      'Record authentication and security events with useful context, while excluding secrets.',
  },
  {
    title: 'Untrusted redirect parameter',
    severity: 'info',
    category: 'A01: Broken Access Control',
    cwe: 'CWE-601',
    location: 'GET /redirect?next=',
    description: 'A redirect parameter accepts external destinations without validation.',
    request: 'GET /redirect?next=https://outside.example HTTP/1.1',
    response: 'HTTP/1.1 302 Location: https://outside.example',
    remediation: 'Restrict redirects to an allowlist of relative paths or trusted destinations.',
  },
  {
    title: 'Server-side request accepts arbitrary host',
    severity: 'critical',
    category: 'A10: Server-Side Request Forgery',
    cwe: 'CWE-918',
    location: 'POST /api/preview',
    description:
      'A server-side fetch operation accepts untrusted URLs without restricting destinations.',
    request: 'POST /api/preview url=http://127.0.0.1/',
    response: 'HTTP/1.1 200 ... response from internal address returned',
    remediation:
      'Use an allowlist, block private and link-local ranges, and validate resolved addresses.',
  },
] as const

const scanSeed: Omit<Scan, 'findingsCount'>[] = [
  {
    id: 'scan_118',
    targetId: 'tgt_01',
    status: 'completed',
    progress: 100,
    startedAt: '2026-02-18T09:00:00Z',
    durationSec: 742,
  },
  {
    id: 'scan_117',
    targetId: 'tgt_02',
    status: 'completed',
    progress: 100,
    startedAt: '2026-02-17T15:20:00Z',
    durationSec: 610,
  },
  {
    id: 'scan_116',
    targetId: 'tgt_03',
    status: 'completed',
    progress: 100,
    startedAt: '2026-02-16T12:00:00Z',
    durationSec: 805,
  },
  {
    id: 'scan_115',
    targetId: 'tgt_04',
    status: 'completed',
    progress: 100,
    startedAt: '2026-02-15T10:15:00Z',
    durationSec: 465,
  },
  {
    id: 'scan_114',
    targetId: 'tgt_05',
    status: 'completed',
    progress: 100,
    startedAt: '2026-02-14T08:00:00Z',
    durationSec: 932,
  },
  {
    id: 'scan_113',
    targetId: 'tgt_06',
    status: 'completed',
    progress: 100,
    startedAt: '2026-02-13T15:45:00Z',
    durationSec: 530,
  },
  {
    id: 'scan_112',
    targetId: 'tgt_01',
    status: 'completed',
    progress: 100,
    startedAt: '2026-02-12T13:10:00Z',
    durationSec: 690,
  },
  {
    id: 'scan_111',
    targetId: 'tgt_02',
    status: 'failed',
    progress: 42,
    startedAt: '2026-02-11T11:00:00Z',
    durationSec: 300,
  },
  {
    id: 'scan_110',
    targetId: 'tgt_03',
    status: 'completed',
    progress: 100,
    startedAt: '2026-02-12T08:30:00Z',
    durationSec: 584,
  },
  {
    id: 'scan_109',
    targetId: 'tgt_04',
    status: 'completed',
    progress: 100,
    startedAt: '2026-02-10T09:15:00Z',
    durationSec: 427,
  },
]

const findings: Finding[] = Array.from({ length: 48 }, (_, index) => {
  const template = findingTemplates[index % findingTemplates.length]
  const targetIndex = index % targets.length
  const targetScans = scanSeed.filter(
    (item) => item.targetId === targets[targetIndex].id && item.status === 'completed',
  )
  const scan =
    targetScans[Math.floor(index / targets.length) % targetScans.length] ??
    scanSeed.find((item) => item.targetId === targets[targetIndex].id) ??
    scanSeed[0]
  const discoveredAt = new Date(
    Date.UTC(2026, 1, 18 - (index % 28), 9, (index * 7) % 60),
  ).toISOString()
  return {
    id: `fnd_${5231 + index}`,
    scanId: scan.id,
    targetId: targets[targetIndex].id,
    title: template.title,
    severity: template.severity,
    category: template.category,
    cwe: template.cwe,
    status: index % 13 === 0 ? 'resolved' : index % 9 === 0 ? 'confirmed' : 'open',
    location: template.location,
    description: template.description,
    evidence: { request: template.request, response: template.response },
    remediation: template.remediation,
    discoveredAt,
  }
})

for (const target of targets) {
  target.openFindings = findings.filter(
    (finding) => finding.targetId === target.id && finding.status === 'open',
  ).length
}

const scans: Scan[] = scanSeed.map((scan) => {
  const relatedFindings = findings.filter((finding) => finding.scanId === scan.id)
  const findingsCount: FindingCounts = {
    critical: relatedFindings.filter((finding) => finding.severity === 'critical').length,
    high: relatedFindings.filter((finding) => finding.severity === 'high').length,
    medium: relatedFindings.filter((finding) => finding.severity === 'medium').length,
    low: relatedFindings.filter((finding) => finding.severity === 'low').length,
    info: relatedFindings.filter((finding) => finding.severity === 'info').length,
  }
  return { ...scan, findingsCount }
})

const firstReportScan = scans.find((scan) => scan.id === 'scan_118')
const reports: Report[] = [
  {
    id: 'rpt_09',
    scanId: 'scan_118',
    target: 'Acme Store',
    createdAt: '2026-02-18T10:00:00Z',
    findings: findings.filter((finding) => finding.scanId === firstReportScan?.id).length,
    format: 'pdf',
  },
]

let nextTargetId = 7
let nextScanId = 119
let nextReportId = 10
let nextFindingId = 5279
const targetCredentials = new Map<string, { username: string; password: string }>()

function clone<T>(value: T): T {
  return structuredClone(value)
}

async function request<T>(read: () => T): Promise<T> {
  return clone(read())
}

export const mockApi = {
  getTargets: () => request(() => targets),
  getScans: () => request(() => scans),
  getFindings: () => request(() => findings),
  getFinding: (id: string) =>
    request(() => {
      const finding = findings.find((item) => item.id === id)
      if (!finding) throw new Error('Finding not found.')
      return finding
    }),
  getReports: () => request(() => reports),
  addTarget: (input: TargetInput) =>
    request(() => {
      const target: Target = {
        id: `tgt_${String(nextTargetId++).padStart(2, '0')}`,
        name: input.name,
        url: input.url,
        environment: input.environment,
        authenticated: input.authenticated,
        lastScannedAt: null,
        openFindings: 0,
      }
      targets.unshift(target)
      if (input.authenticated && input.credentials) {
        targetCredentials.set(target.id, input.credentials)
      }
      return target
    }),
  updateTarget: (id: string, input: TargetInput) =>
    request(() => {
      const index = targets.findIndex((target) => target.id === id)
      if (index < 0) throw new Error('Target not found.')
      targets[index] = {
        ...targets[index],
        name: input.name,
        url: input.url,
        environment: input.environment,
        authenticated: input.authenticated,
      }
      if (!input.authenticated) {
        targetCredentials.delete(id)
      } else if (input.credentials?.username && input.credentials.password) {
        targetCredentials.set(id, input.credentials)
      }
      return targets[index]
    }),
  removeTarget: (id: string) =>
    request(() => {
      const index = targets.findIndex((target) => target.id === id)
      if (index < 0) throw new Error('Target not found.')
      targets.splice(index, 1)
      targetCredentials.delete(id)
    }),
  createScan: (targetId: string) =>
    request(() => {
      if (!targets.some((target) => target.id === targetId))
        throw new Error('Choose a valid target.')
      const scan: Scan = {
        id: `scan_${nextScanId++}`,
        targetId,
        status: 'running',
        progress: 5,
        startedAt: new Date().toISOString(),
        durationSec: null,
        findingsCount: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
      }
      scans.unshift(scan)
      return scan
    }),
  advanceScan: (id: string) =>
    request(() => {
      const scan = scans.find((item) => item.id === id)
      if (!scan || scan.status !== 'running') return
      scan.progress = Math.min(100, scan.progress + 30)
      if (scan.progress === 100) {
        scan.status = 'completed'
        scan.durationSec = Math.max(
          1,
          Math.floor((Date.now() - new Date(scan.startedAt).getTime()) / 1000),
        )
        const target = targets.find((item) => item.id === scan.targetId)
        if (target) target.lastScannedAt = new Date().toISOString()
        for (const templateIndex of [0, 1, 3, 5]) {
          const template = findingTemplates[templateIndex]
          findings.push({
            id: `fnd_${nextFindingId++}`,
            scanId: scan.id,
            targetId: scan.targetId,
            title: template.title,
            severity: template.severity,
            category: template.category,
            cwe: template.cwe,
            status: 'open',
            location: template.location,
            description: template.description,
            evidence: { request: template.request, response: template.response },
            remediation: template.remediation,
            discoveredAt: new Date().toISOString(),
          })
        }
        const relatedFindings = findings.filter((finding) => finding.scanId === scan.id)
        scan.findingsCount = {
          critical: relatedFindings.filter((item) => item.severity === 'critical').length,
          high: relatedFindings.filter((item) => item.severity === 'high').length,
          medium: relatedFindings.filter((item) => item.severity === 'medium').length,
          low: relatedFindings.filter((item) => item.severity === 'low').length,
          info: relatedFindings.filter((item) => item.severity === 'info').length,
        }
        if (target) {
          target.openFindings = findings.filter(
            (item) => item.targetId === target.id && item.status === 'open',
          ).length
        }
      }
      return scan
    }),
  updateFindingStatus: (id: string, status: FindingStatus) =>
    request(() => {
      const finding = findings.find((item) => item.id === id)
      if (!finding) throw new Error('Finding not found.')
      finding.status = status
      const target = targets.find((item) => item.id === finding.targetId)
      if (target) {
        target.openFindings = findings.filter(
          (item) => item.targetId === target.id && item.status === 'open',
        ).length
      }
      return finding
    }),
  createReport: (scanId: string) =>
    request(() => {
      const scan = scans.find((item) => item.id === scanId && item.status === 'completed')
      if (!scan) throw new Error('Choose a completed scan to generate a report.')
      const target = targets.find((item) => item.id === scan.targetId)
      const report: Report = {
        id: `rpt_${String(nextReportId++).padStart(2, '0')}`,
        scanId,
        target: target?.name ?? 'Unknown target',
        createdAt: new Date().toISOString(),
        findings: findings.filter((finding) => finding.scanId === scan.id).length,
        format: 'pdf',
      }
      reports.unshift(report)
      return report
    }),
}
