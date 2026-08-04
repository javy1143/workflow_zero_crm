import React, { useMemo } from 'react';
import { Account, Automation, Report } from '../types';
import { Download } from 'lucide-react';
import { FieldConfig, RecordBoard, SummaryMetric } from './RecordBoard';

interface LeanReportsTabProps {
  reports: Report[];
  accounts: Account[];
  automations: Automation[];
  onAddReport: (report: Omit<Report, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateReport: (id: string, updates: Partial<Omit<Report, 'id' | 'createdAt'>>) => Promise<void>;
  onDeleteReport: (id: string) => Promise<void>;
}

const cleanPdfText = (value: unknown) => String(value ?? '')
  .replace(/[^\x20-\x7E]/g, ' ')
  .replace(/\\/g, '\\\\')
  .replace(/\(/g, '\\(')
  .replace(/\)/g, '\\)');

const money = (value: unknown) => `$${Number(value || 0).toLocaleString()}`;

const rgb = (color: [number, number, number]) => color.map(value => (value / 255).toFixed(3)).join(' ');

const colors = {
  navy: [0, 19, 48] as [number, number, number],
  blue: [0, 104, 245] as [number, number, number],
  cyan: [8, 175, 203] as [number, number, number],
  fog: [244, 248, 252] as [number, number, number],
  line: [216, 226, 240] as [number, number, number],
  ink: [7, 19, 36] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
  green: [36, 138, 61] as [number, number, number],
  red: [182, 68, 0] as [number, number, number],
  white: [255, 255, 255] as [number, number, number]
};

const wrapText = (line: string, maxChars: number) => {
  const words = line.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  }

  if (current) lines.push(current);
  return lines.length ? lines : [''];
};

const text = (
  value: unknown,
  x: number,
  y: number,
  size = 10,
  font = 'F1',
  color: [number, number, number] = colors.ink
) => `BT ${rgb(color)} rg /${font} ${size} Tf ${x} ${y} Td (${cleanPdfText(value)}) Tj ET`;

const rect = (
  x: number,
  y: number,
  width: number,
  height: number,
  fill: [number, number, number],
  stroke?: [number, number, number]
) => {
  const fillCommand = `${rgb(fill)} rg ${x} ${y} ${width} ${height} re f`;
  const strokeCommand = stroke ? ` ${rgb(stroke)} RG ${x} ${y} ${width} ${height} re S` : '';
  return `q ${fillCommand}${strokeCommand} Q`;
};

const line = (x1: number, y1: number, x2: number, y2: number, color: [number, number, number] = colors.line) =>
  `q ${rgb(color)} RG 1 w ${x1} ${y1} m ${x2} ${y2} l S Q`;

type PdfSection = {
  title: string;
  body: string;
};

type PdfReportData = {
  title: string;
  accountName: string;
  reportType: string;
  reportingPeriod: string;
  status: string;
  createdDate: string;
  sentTo: string;
  automationName: string;
  metrics: { label: string; value: string }[];
  sections: PdfSection[];
};

const createPdfBlob = (data: PdfReportData) => {
  const pages: string[][] = [];
  let commands: string[] = [];
  let y = 0;

  const startPage = (pageNumber: number) => {
    commands = [
      rect(0, 0, 612, 792, colors.white),
      rect(0, 690, 612, 102, colors.navy),
      rect(0, 690, 612, 8, colors.cyan),
      text('WORKFLOW ZERO IT', 48, 748, 10, 'F2', colors.white),
      text(data.title, 48, 718, 24, 'F2', colors.white),
      text(data.reportType, 48, 700, 10, 'F1', [207, 232, 255]),
      text(data.reportingPeriod, 456, 748, 13, 'F2', colors.white),
      text(`Page ${pageNumber}`, 456, 730, 9, 'F1', [207, 232, 255])
    ];
    y = 650;
  };

  const finishPage = () => {
    commands.push(line(48, 48, 564, 48));
    commands.push(text('Prepared by Workflow Zero IT', 48, 30, 9, 'F1', colors.muted));
    commands.push(text(new Date().toLocaleDateString(), 488, 30, 9, 'F1', colors.muted));
    pages.push(commands);
  };

  const ensureSpace = (needed: number) => {
    if (y - needed < 72) {
      finishPage();
      startPage(pages.length + 1);
    }
  };

  const drawLabelValue = (label: string, value: string, x: number, yPos: number, width: number) => {
    commands.push(text(label.toUpperCase(), x, yPos, 8, 'F2', colors.muted));
    const wrapped = wrapText(value || 'Not set', Math.floor(width / 5.4));
    wrapped.slice(0, 2).forEach((wrappedLine, index) => {
      commands.push(text(wrappedLine, x, yPos - 14 - index * 12, 10, 'F1', colors.ink));
    });
  };

  const drawSection = (section: PdfSection) => {
    const bodyLines = wrapText(section.body || 'None recorded.', 88);
    const height = 38 + bodyLines.length * 13;
    ensureSpace(height + 12);
    commands.push(text(section.title, 48, y, 13, 'F2', colors.ink));
    commands.push(line(48, y - 8, 564, y - 8, colors.line));
    y -= 26;
    bodyLines.forEach(bodyLine => {
      commands.push(text(bodyLine, 48, y, 10, 'F1', colors.ink));
      y -= 13;
    });
    y -= 12;
  };

  startPage(1);

  commands.push(rect(48, 586, 516, 56, colors.fog, colors.line));
  drawLabelValue('Client', data.accountName, 64, 626, 170);
  drawLabelValue('Status', data.status, 242, 626, 100);
  drawLabelValue('Created', data.createdDate || 'Not set', 350, 626, 90);
  drawLabelValue('Sent To', data.sentTo || 'Not set', 448, 626, 100);

  y = 548;
  const cardWidth = 96;
  data.metrics.forEach((metric, index) => {
    const x = 48 + index * 105;
    commands.push(rect(x, y - 58, cardWidth, 58, colors.white, colors.line));
    commands.push(text(metric.label.toUpperCase(), x + 12, y - 18, 7, 'F2', colors.muted));
    commands.push(text(metric.value, x + 12, y - 42, 15, 'F2', index === 1 ? colors.red : colors.blue));
  });

  y = 450;
  if (data.automationName) {
    commands.push(rect(48, y - 34, 516, 34, colors.fog, colors.line));
    commands.push(text('Automation', 64, y - 14, 8, 'F2', colors.muted));
    commands.push(text(data.automationName, 128, y - 14, 10, 'F1', colors.ink));
    y -= 58;
  }

  data.sections.forEach(drawSection);
  finishPage();

  const objects: string[] = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    `<< /Type /Pages /Kids [${pages.map((_, index) => `${3 + index * 2} 0 R`).join(' ')}] /Count ${pages.length} >>`
  ];

  pages.forEach((pageLines, pageIndex) => {
    const pageObjectNumber = 3 + pageIndex * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    const stream = pageLines.join('\n');
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> >> >> /Contents ${contentObjectNumber} 0 R >>`);
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach(offset => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
};

const downloadPdf = (report: Report, accounts: Account[], automations: Automation[]) => {
  const account = accounts.find(item => item.id === report.accountId);
  const automation = automations.find(item => item.id === report.automationId);
  const title = `${account?.name || 'Client'} - ${report.reportingPeriod || 'Report'}`;
  const blob = createPdfBlob({
    title,
    accountName: account?.name || 'Unknown account',
    reportType: report.reportType || 'Monthly performance',
    reportingPeriod: report.reportingPeriod || 'Report',
    status: report.status || 'Draft',
    createdDate: report.createdDate || '',
    sentTo: report.sentTo || '',
    automationName: automation?.name || '',
    metrics: [
      { label: 'Successful Runs', value: String(report.successfulRuns ?? 0) },
      { label: 'Failed Runs', value: String(report.failedRuns ?? 0) },
      { label: 'Error Rate', value: report.errorRate || '0%' },
      { label: 'Hours Saved', value: String(report.hoursSaved ?? 0) },
      { label: 'Cost Savings', value: money(report.estimatedCostSavings) }
    ],
    sections: [
      { title: 'Issues Resolved', body: report.issuesResolved || 'None recorded.' },
      { title: 'Improvements Made', body: report.improvementsMade || 'None recorded.' },
      { title: 'Recommendations', body: report.recommendations || 'None recorded.' },
      { title: 'Client Action Items', body: report.clientActionItems || 'None recorded.' },
      { title: 'Next Steps', body: report.nextSteps || 'None recorded.' }
    ]
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${(account?.name || 'client').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${(report.reportingPeriod || 'report').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const LeanReportsTab: React.FC<LeanReportsTabProps> = ({
  reports,
  accounts,
  automations,
  onAddReport,
  onUpdateReport,
  onDeleteReport
}) => {
  const fields = useMemo<FieldConfig<Report>[]>(() => [
    { key: 'accountId', label: 'Account', type: 'select', required: true, section: 'Report' , options: accounts.map(account => ({ value: account.id, label: account.name })) },
    { key: 'automationId', label: 'Automation', type: 'select', section: 'Report', options: automations.map(automation => ({ value: automation.id, label: automation.name })) },
    { key: 'reportType', label: 'Type', type: 'select', required: true, section: 'Report', options: ['Monthly performance', 'Project status', 'ROI', 'Error report'] },
    { key: 'reportingPeriod', label: 'Period', required: true, section: 'Report', placeholder: 'June 2026' },
    { key: 'status', label: 'Status', type: 'select', required: true, section: 'Report', options: ['Draft', 'Ready', 'Sent', 'Reviewed', 'Follow-Up Needed'] },
    { key: 'createdDate', label: 'Created Date', type: 'date', required: true, section: 'Report' },
    { key: 'sentDate', label: 'Sent Date', type: 'date', section: 'Report' },
    { key: 'sentTo', label: 'Send To', section: 'Report' },
    { key: 'successfulRuns', label: 'Successful Runs', type: 'number', section: 'Metrics' },
    { key: 'failedRuns', label: 'Failed Runs', type: 'number', section: 'Metrics' },
    { key: 'errorRate', label: 'Error Rate', section: 'Metrics', placeholder: '0.7%' },
    { key: 'hoursSaved', label: 'Hours Saved', type: 'number', section: 'Metrics' },
    { key: 'estimatedCostSavings', label: 'Cost Savings', type: 'number', section: 'Metrics' },
    { key: 'issuesResolved', label: 'Issues Resolved', type: 'textarea', section: 'Client Summary' },
    { key: 'improvementsMade', label: 'Improvements Made', type: 'textarea', section: 'Client Summary' },
    { key: 'recommendations', label: 'Recommendations', type: 'textarea', section: 'Client Summary' },
    { key: 'clientActionItems', label: 'Client Action Items', type: 'textarea', section: 'Client Summary' },
    { key: 'nextSteps', label: 'Next Steps', type: 'textarea', section: 'Client Summary' }
  ], [accounts, automations]);

  const metrics = useMemo<SummaryMetric[]>(() => [
    { label: 'Reports', value: reports.length, tone: 'blue' },
    { label: 'Ready to Send', value: reports.filter(item => item.status === 'Ready').length, tone: 'cyan' },
    { label: 'Sent', value: reports.filter(item => item.status === 'Sent' || item.status === 'Reviewed').length, tone: 'green' },
    { label: 'Hours Saved', value: reports.reduce((sum, item) => sum + (Number(item.hoursSaved) || 0), 0), tone: 'green' }
  ], [reports]);

  return (
    <RecordBoard<Report>
      title="Reports"
      subtitle="Create a simple client update, then download it as a PDF you can send."
      addLabel="Create Report"
      records={reports}
      fields={fields}
      defaultRecord={{
        accountId: '',
        automationId: '',
        reportType: 'Monthly performance',
        reportingPeriod: '',
        status: 'Draft',
        createdDate: new Date().toISOString().slice(0, 10),
        sentDate: '',
        sentTo: '',
        successfulRuns: 0,
        failedRuns: 0,
        errorRate: '',
        hoursSaved: 0,
        estimatedCostSavings: 0,
        issuesResolved: '',
        improvementsMade: '',
        recommendations: '',
        clientActionItems: '',
        nextSteps: ''
      }}
      primaryField="reportingPeriod"
      secondaryFields={['accountId', 'reportType', 'hoursSaved', 'sentDate']}
      badgeField="status"
      filterField="status"
      filterLabel="Statuses"
      metrics={metrics}
      getRelatedLabel={(field, value) => {
        if (field === 'accountId') return accounts.find(account => account.id === value)?.name || '';
        if (field === 'automationId') return automations.find(automation => automation.id === value)?.name || '';
        return '';
      }}
      renderCardActions={(report) => (
        <button className="btn-secondary-outline" type="button" onClick={() => downloadPdf(report, accounts, automations)}>
          <Download size={14} />
          <span>Download PDF</span>
        </button>
      )}
      onAdd={onAddReport}
      onUpdate={onUpdateReport}
      onDelete={onDeleteReport}
    />
  );
};
