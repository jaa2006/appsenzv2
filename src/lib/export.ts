import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface ExportData {
  headers: string[];
  rows: any[];
}

export function exportToPDF({ headers, rows }: ExportData, filename: string): void {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text('Laporan Absensi', 14, 15);
  
  // Add date
  doc.setFontSize(10);
  doc.text(
    `Dicetak pada: ${format(new Date(), 'PPpp', { locale: id })}`,
    14,
    22
  );

  // Add table
  doc.autoTable({
    head: [headers],
    body: rows,
    startY: 30,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  doc.save(`${filename}.pdf`);
}

export function exportToExcel({ headers, rows }: ExportData, filename: string): void {
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Absensi');
  
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}