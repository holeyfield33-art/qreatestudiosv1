import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

export function exportAnalyticsToPDF(data: any, qrCodeName: string) {
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
    body: Object.entries(data.deviceStats).map(([device, count]: any) => [
      device,
      count,
      `${((count / data.totalScans) * 100).toFixed(1)}%`,
    ]),
  });

  // Browser Stats Table
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [['Browser', 'Scans', 'Percentage']],
    body: Object.entries(data.browserStats).map(([browser, count]: any) => [
      browser,
      count,
      `${((count / data.totalScans) * 100).toFixed(1)}%`,
    ]),
  });

  // Geographic Data Table
  if (data.geoData && data.geoData.length > 0) {
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Location', 'Scans']],
      body: data.geoData.slice(0, 10).map((location: any) => [
        `${location.city}, ${location.country}`,
        location.count,
      ]),
    });
  }

  return doc;
}

export function exportAnalyticsToCSV(scans: any[]) {
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

export function exportTimeSeriesCSV(timeSeriesData: any[]) {
  const csv = Papa.unparse(
    timeSeriesData.map((item) => ({
      Date: item.date,
      'Total Scans': item.count,
    }))
  );

  return csv;
}
