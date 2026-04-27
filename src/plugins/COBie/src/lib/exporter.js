/** Génère le xlsx COBie en mémoire avec exceljs (équivalent JS d'openpyxl). */
import ExcelJS from "exceljs";
import { SHEET_HEADERS } from "./extractor.js";

const SHEET_COLORS = {
  Facility: "FFFFD700",
  Floor:    "FFC0C0C0",
  Space:    "FFADD8E6",
  Zone:     "FF90EE90",
  Type:     "FFFFA07A",
  Component:"FF87CEEB",
  System:   "FFDDA0DD",
  Attribute:"FFF5DEB3",
};

const THIN_BORDER = {
  top: { style: "thin" },
  left: { style: "thin" },
  bottom: { style: "thin" },
  right: { style: "thin" },
};

function writeSheet(ws, headers, rows, color) {
  // Header row
  ws.addRow(headers);
  const headerRow = ws.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FF000000" } };
  headerRow.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  headerRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
    cell.border = THIN_BORDER;
  });

  // Data rows
  for (const row of rows) {
    const values = headers.map((h) => {
      const v = row[h];
      if (v === null || v === undefined) return "";
      if (typeof v === "object") return JSON.stringify(v);
      return v;
    });
    const r = ws.addRow(values);
    r.alignment = { vertical: "top", wrapText: false };
    r.eachCell((cell) => { cell.border = THIN_BORDER; });
  }

  // Column widths (header + max content, capped at 60).
  for (let i = 0; i < headers.length; i++) {
    let max = headers[i].length;
    for (const row of rows) {
      const v = row[headers[i]];
      const len = v === null || v === undefined ? 0 : String(v).length;
      if (len > max) max = len;
    }
    ws.getColumn(i + 1).width = Math.min(max + 2, 60);
  }

  ws.views = [{ state: "frozen", ySplit: 1 }];
}

/**
 * @param {Record<string, object[]>} sheets
 * @returns {Promise<Blob>} xlsx blob (browser-friendly)
 */
export async function buildXlsxBlob(sheets) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "BIMData COBie Plugin";
  wb.created = new Date();

  for (const [name, rows] of Object.entries(sheets)) {
    const headers = SHEET_HEADERS[name] || (rows[0] ? Object.keys(rows[0]) : []);
    const color = SHEET_COLORS[name] || "FFFFFFFF";
    const ws = wb.addWorksheet(name);
    writeSheet(ws, headers, rows, color);
  }

  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
