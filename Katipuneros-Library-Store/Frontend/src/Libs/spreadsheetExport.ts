// [Layer: Libs]
// spreadsheetExport.ts -- Shared client-side CSV & genuine Office Open XML (.xlsx) file generators.
// Produces real ZIP-packaged SpreadsheetML workbooks so Microsoft Excel opens them without
// "file format or file extension is not valid" errors. Zero third-party dependencies.
// DO NOT put UI rendering or API calls here.

export type SpreadsheetCell = string | number | boolean | null | undefined;

// ---------- Generic browser download ----------
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// ---------- CSV (RFC 4180 + UTF-8 BOM so Excel renders ₱ and accents correctly) ----------
const escapeCsv = (value: SpreadsheetCell): string => {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const buildCsvBlob = (headers: string[], rows: SpreadsheetCell[][]): Blob => {
  const lines = [headers, ...rows].map((r) => r.map(escapeCsv).join(','));
  return new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
};

export const exportToCsv = (filename: string, headers: string[], rows: SpreadsheetCell[][]): void =>
  downloadBlob(buildCsvBlob(headers, rows), filename.endsWith('.csv') ? filename : `${filename}.csv`);

// ---------- Minimal ZIP (STORE method) writer ----------
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

const crc32 = (data: Uint8Array): number => {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) c = CRC_TABLE[(c ^ data[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const buildZip = (files: { name: string; content: string }[]): Uint8Array => {
  const encoder = new TextEncoder();
  const now = new Date();
  const dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2)) & 0xffff;
  const dosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xffff;

  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  files.forEach((file) => {
    const nameBytes = encoder.encode(file.name);
    const data = encoder.encode(file.content);
    const crc = crc32(data);

    const local = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x0800, true);
    lv.setUint16(8, 0, true);
    lv.setUint16(10, dosTime, true);
    lv.setUint16(12, dosDate, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, data.length, true);
    lv.setUint32(22, data.length, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);
    local.set(nameBytes, 30);
    localParts.push(local, data);

    const central = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, dosTime, true);
    cv.setUint16(14, dosDate, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint32(42, offset, true);
    central.set(nameBytes, 46);
    centralParts.push(central);

    offset += local.length + data.length;
  });

  const centralSize = centralParts.reduce((sum, p) => sum + p.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);

  const all = [...localParts, ...centralParts, end];
  const output = new Uint8Array(all.reduce((sum, p) => sum + p.length, 0));
  let pos = 0;
  all.forEach((p) => {
    output.set(p, pos);
    pos += p.length;
  });
  return output;
};

// ---------- SpreadsheetML (.xlsx) builder ----------
const escapeXml = (text: string): string =>
  text
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const columnLetter = (index: number): string => {
  let n = index + 1;
  let label = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    label = String.fromCharCode(65 + rem) + label;
    n = Math.floor((n - 1) / 26);
  }
  return label;
};

const buildCell = (value: SpreadsheetCell, ref: string, isHeader: boolean): string => {
  const style = isHeader ? ' s="1"' : '';
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `<c r="${ref}"${style}><v>${value}</v></c>`;
  }
  const text = value === null || value === undefined ? '' : String(value);
  return `<c r="${ref}"${style} t="inlineStr"><is><t xml:space="preserve">${escapeXml(text)}</t></is></c>`;
};

const sanitizeSheetName = (name: string): string =>
  (name.replace(/[[\]:*?/\\]/g, ' ').trim() || 'Sheet1').slice(0, 31);

export const buildXlsxBlob = (sheetName: string, headers: string[], rows: SpreadsheetCell[][]): Blob => {
  const allRows: SpreadsheetCell[][] = [headers, ...rows];
  const sheetRows = allRows
    .map((row, rIdx) => {
      const cells = row.map((val, cIdx) => buildCell(val, `${columnLetter(cIdx)}${rIdx + 1}`, rIdx === 0)).join('');
      return `<row r="${rIdx + 1}">${cells}</row>`;
    })
    .join('');

  const colWidths = headers
    .map((h, i) => {
      const longest = allRows.reduce((max, r) => Math.max(max, String(r[i] ?? '').length), h.length);
      return `<col min="${i + 1}" max="${i + 1}" width="${Math.min(60, Math.max(10, longest + 2))}" customWidth="1"/>`;
    })
    .join('');

  const xmlHead = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  const files = [
    {
      name: '[Content_Types].xml',
      content:
        `${xmlHead}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
        '</Types>',
    },
    {
      name: '_rels/.rels',
      content:
        `${xmlHead}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
        '</Relationships>',
    },
    {
      name: 'xl/workbook.xml',
      content:
        `${xmlHead}<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
        `<sheets><sheet name="${escapeXml(sanitizeSheetName(sheetName))}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      content:
        `${xmlHead}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
        '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
        '</Relationships>',
    },
    {
      name: 'xl/styles.xml',
      content:
        `${xmlHead}<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
        '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>' +
        '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>' +
        '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
        '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
        '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
        '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>' +
        '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
        '</styleSheet>',
    },
    {
      name: 'xl/worksheets/sheet1.xml',
      content:
        `${xmlHead}<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
        `${colWidths ? `<cols>${colWidths}</cols>` : ''}<sheetData>${sheetRows}</sheetData></worksheet>`,
    },
  ];

  return new Blob([buildZip(files).buffer as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
};

export const exportToXlsx = (
  filename: string,
  sheetName: string,
  headers: string[],
  rows: SpreadsheetCell[][]
): void =>
  downloadBlob(buildXlsxBlob(sheetName, headers, rows), filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
