import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

export interface AnalyticsExportData {
  totalScans: number;
  uniqueUsers: number;
  peakHour: {
    hour: number;
    count: number;
  };
  peakDay: {
    day: string;
    count: number;
  };
  deviceStats: Record<string, number>;
  browserStats: Record<string, number>;
  geoData?: Array<{
    city: string;
    country: string;
    count: number;
  }>;
}

export interface ScanRecord {
  scannedAt: Date;
  deviceType?: string | null;
  browser?: string | null;
  os?: string | null;
  city?: string | null;
  country?: string | null;
  ipAddress?: string | null;
}

export interface TimeSeriesItem {
  date: string;
  count: number;
}

export function exportAnalyticsToPDF(data: AnalyticsExportData, qrCodeName: string) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text(`QR Code Analytics: ${qrCodeName}`, 20, 20);

  // Summary Stats
  doc.setFontSize(12);
  doc.text(`Total Scans: ${data.totalScans}`, 20, 35);
  doc.text(`Unique Users: ${data.uniqueUsers}`, 20, 42);
  doc.text(`Peak Hour: ${data.peakHour.hour}:00 (${data.peakHour.count} scans)`, 20, 49);
  doc.text(`Peak Day: ${data.peakDay.day} (${data.peakDay.count} scans)`, 20, 56);

  // Device Stats Table
  autoTable(doc, {
    startY: 70,
    head: [['Device Type', 'Scans', 'Percentage']],
    body: Object.entries(data.deviceStats).map(([device, count]) => [
      device,
      String(count),
      `${((count / data.totalScans) * 100).toFixed(1)}%`,
    ]),
  });

  // Browser Stats Table
  const docWithTable = doc as jsPDF & { lastAutoTable?: { finalY: number } };
  autoTable(doc, {
    startY: (docWithTable.lastAutoTable?.finalY || 70) + 10,
    head: [['Browser', 'Scans', 'Percentage']],
    body: Object.entries(data.browserStats).map(([browser, count]) => [
      browser,
      String(count),
      `${((count / data.totalScans) * 100).toFixed(1)}%`,
    ]),
  });

  // Geographic Data Table
  if (data.geoData && data.geoData.length > 0) {
    autoTable(doc, {
      startY: (docWithTable.lastAutoTable?.finalY || 70) + 10,
      head: [['Location', 'Scans']],
      body: data.geoData.slice(0, 10).map((location) => [
        `${location.city}, ${location.country}`,
        String(location.count),
      ]),
    });
  }

  return doc;
}

export function exportAnalyticsToCSV(scans: ScanRecord[]) {
  const csv = Papa.unparse(
    scans.map((scan) => ({
      Date: new Date(scan.scannedAt).toLocaleString(),
      'Device Type': scan.deviceType || 'unknown',
      Browser: scan.browser || 'unknown',
      OS: scan.os || 'unknown',
      City: scan.city || 'unknown',
      Country: scan.country || 'unknown',
      IP: scan.ipAddress || 'unknown',
    }))
  );

  return csv;
}

export function exportTimeSeriesCSV(timeSeriesData: TimeSeriesItem[]) {
  const csv = Papa.unparse(
    timeSeriesData.map((item) => ({
      Date: item.date,
      'Total Scans': item.count,
    }))
  );

  return csv;
}
