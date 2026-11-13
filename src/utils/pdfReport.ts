import { jsPDF } from 'jspdf'
import type { Finding, Report, Scan } from '../data/mockApi'
import { formatDateTime, formatDuration } from './format'

export function downloadScanReportPdf(report: Report, scan: Scan, findings: Finding[]) {
  const document = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin = 44
  const pageWidth = document.internal.pageSize.getWidth()
  const pageHeight = document.internal.pageSize.getHeight()
  const contentWidth = pageWidth - margin * 2
  let y = margin

  function writeLines(
    lines: string[],
    options: {
      fontSize?: number
      bold?: boolean
      color?: [number, number, number]
      gap?: number
    } = {},
  ) {
    const fontSize = options.fontSize ?? 10
    const lineHeight = fontSize * 1.45
    document.setFont('helvetica', options.bold ? 'bold' : 'normal')
    document.setFontSize(fontSize)
    document.setTextColor(...(options.color ?? [51, 65, 85]))
    for (const line of lines) {
      if (y + lineHeight > pageHeight - margin) {
        document.addPage()
        y = margin
      }
      document.text(line, margin, y)
      y += lineHeight
    }
    y += options.gap ?? 0
  }

  function writeParagraph(label: string, value: string) {
    writeLines([label], { fontSize: 9, bold: true, color: [71, 85, 105], gap: 2 })
    writeLines(document.splitTextToSize(value || 'Not provided', contentWidth), {
      fontSize: 9,
      gap: 7,
    })
  }

  function writeSection(title: string) {
    y += 6
    writeLines([title], { fontSize: 12, bold: true, color: [30, 41, 59], gap: 7 })
  }

  document.setProperties({
    title: `Security scan report - ${report.scanId}`,
    subject: `Findings for ${report.target}`,
    creator: 'Website Scanner',
  })

  writeLines(['Security Scan Report'], { fontSize: 20, bold: true, color: [30, 64, 175], gap: 5 })
  writeLines([`${report.target}  |  Scan ${report.scanId}`], { fontSize: 11, bold: true, gap: 3 })
  writeLines([`Generated ${formatDateTime(report.createdAt)}`], {
    fontSize: 9,
    color: [100, 116, 139],
    gap: 10,
  })

  const counts = findings.reduce<Record<string, number>>((summary, finding) => {
    summary[finding.severity] = (summary[finding.severity] ?? 0) + 1
    return summary
  }, {})

  writeSection('Scan summary')
  writeParagraph('Started', formatDateTime(scan.startedAt))
  writeParagraph('Duration', formatDuration(scan.durationSec))
  writeParagraph('Findings', String(findings.length))
  writeParagraph(
    'Severity',
    ['critical', 'high', 'medium', 'low', 'info']
      .map((severity) => `${severity}: ${counts[severity] ?? 0}`)
      .join('  |  '),
  )

  writeSection('Findings')
  if (!findings.length) {
    writeLines(['No findings were recorded for this scan.'], {
      fontSize: 9,
      color: [71, 85, 105],
      gap: 8,
    })
  }

  findings.forEach((finding, index) => {
    writeLines([`${index + 1}. ${finding.title}`], {
      fontSize: 11,
      bold: true,
      color: [30, 41, 59],
      gap: 3,
    })
    writeParagraph(
      'Severity / status',
      `${finding.severity}  |  ${finding.status.replace('_', ' ')}`,
    )
    writeParagraph('Category / CWE', `${finding.category}  |  ${finding.cwe}`)
    writeParagraph('Location', finding.location)
    writeParagraph('Description', finding.description)
    writeParagraph('Request evidence', finding.evidence.request)
    writeParagraph('Response evidence', finding.evidence.response)
    writeParagraph('Remediation', finding.remediation)
  })

  const pageCount = document.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    document.setPage(page)
    document.setFont('helvetica', 'normal')
    document.setFontSize(8)
    document.setTextColor(100, 116, 139)
    document.text(`Scan ${report.scanId}  |  Page ${page} of ${pageCount}`, margin, pageHeight - 22)
  }

  document.save(`security-report-${report.scanId}.pdf`)
}
