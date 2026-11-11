// [Layer: Shared/Utils]
// generateReturnSlipPng.ts -- Official Client-Side Return Slip PNG Generator.
// Uses HTML5 Canvas (800x1020px) and qrcode to produce high-resolution,
// distinctive, and authoritative Katipuneros Library Store Official Return Slips.
// Triggers direct browser download as Katipuneros_OFFICIAL_RETURN_PASS_{id.slice(0,8)}.png.

import QRCode from 'qrcode';
import { CustomerLoanRecord } from '../../Endpoints/Customer/borrowApi';
import { BackendBorrowing } from '../../Endpoints/Admin/borrowingsApi';

export interface ReturnSlipLoanData {
  id: string;
  gatePassCode?: string;
  loanCode?: string;
  patronName?: string;
  patronLibraryId?: string;
  book?: {
    id?: string;
    title?: string;
    author?: string;
    isbn?: string;
    deweyCode?: string;
    coverImage?: string;
  };
  bookTitle?: string;
  bookBarcode?: string;
  bookCallNumber?: string;
  borrowDate?: string;
  dueDate?: string;
  returnDate?: string;
  renewalCount?: number;
  [key: string]: unknown;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill?: string,
  stroke?: string,
  lineWidth: number = 1
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
  ctx.restore();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Generates an official, high-resolution (800x1020px) Katipuneros Library Store
 * Return Slip and triggers an instant browser download.
 *
 * Dedicated strictly for returning books:
 * - Unmistakable Crimson & Navy Circulation theme (visually distinct from pickup slip)
 * - Prominent "FOR BOOK RETURN ONLY • NOT VALID FOR PICKUP" watermark & badges
 * - Return ExpressCode RET-BAY-XXXXXX and High-Contrast Optical QR with quiet zone
 * - Physical Condition Inspection Matrix & Librarian Discharge Stamp Box
 *
 * @param loan The active loan record to generate the return slip for.
 */
export async function generateReturnSlipPng(
  loan: ReturnSlipLoanData | CustomerLoanRecord | BackendBorrowing
): Promise<void> {
  if (!loan || !loan.id) {
    throw new Error('Valid loan record required to generate return slip.');
  }

  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await document.fonts.ready;
    } catch {
      // Graceful font fallback
    }
  }

  const width = 800;
  const height = 1020;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to acquire 2D context from canvas.');
  }

  const loanId = loan.id;
  const shortLoanId = loanId.slice(0, 8).toUpperCase();
  const expressReturnCode = `RET-BAY-${loanId.slice(0, 6).toUpperCase()}`;
  const returnReference = `RET-TXN-${shortLoanId}`;
  const returnPin = String(
    (parseInt(loanId.replace(/[^0-9a-f]/gi, '').slice(-4) || '1a2b', 16) % 9000) + 1000
  );
  const gatePassCode =
    (loan as CustomerLoanRecord).gatePassCode ||
    (loan as BackendBorrowing).loanCode ||
    `KP-TXN-${shortLoanId}`;

  const bookTitle =
    (loan as CustomerLoanRecord).book?.title ||
    (loan as BackendBorrowing).bookTitle ||
    'Circulation Volume';

  const bookAuthor =
    (loan as CustomerLoanRecord).book?.author || 'Catalog Contributor';

  const deweyCode =
    (loan as CustomerLoanRecord).book?.deweyCode ||
    (loan as BackendBorrowing).bookCallNumber ||
    'Stacks Section';

  const bookBarcode =
    (loan as CustomerLoanRecord).book?.isbn ||
    (loan as BackendBorrowing).bookBarcode ||
    'N/A';

  const patronName =
    (loan as BackendBorrowing).patronName || 'Authorized Patron';

  const patronLibraryId =
    (loan as BackendBorrowing).patronLibraryId || 'KP-PATRON';

  const borrowFormatted = loan.borrowDate
    ? new Date(loan.borrowDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Active Loan';

  const dueFormatted = loan.dueDate
    ? new Date(loan.dueDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Standard Term';

  const nowFormatted = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // ---------------------------------------------------------------------------
  // 1. BASE BACKGROUND & HIGH-AUTHORITY CIRCULATION FRAMING
  // ---------------------------------------------------------------------------
  // Crisp Arctic White Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Outer primary border (Deep Slate Navy #0F172A)
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 3;
  ctx.strokeRect(18, 18, width - 36, height - 36);

  // Inner structural frame (Deep Crimson #991B1B)
  ctx.strokeStyle = '#991B1B';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(24, 24, width - 48, height - 48);

  // Corner security marks
  const drawCornerTick = (cx: number, cy: number) => {
    ctx.fillStyle = '#991B1B';
    ctx.fillRect(cx - 3, cy - 3, 6, 6);
  };
  drawCornerTick(30, 30);
  drawCornerTick(width - 30, 30);
  drawCornerTick(30, height - 30);
  drawCornerTick(width - 30, height - 30);

  // Prominent diagonal watermark across center (Subtle rose)
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate((-22 * Math.PI) / 180);
  ctx.textAlign = 'center';
  ctx.font = 'bold 32px "Courier New", monospace';
  ctx.fillStyle = 'rgba(239, 68, 68, 0.06)';
  ctx.fillText('FOR BOOK RETURN ONLY • CIRCULATION DISCHARGE', 0, -40);
  ctx.fillText('NOT VALID FOR BORROWING PICKUP', 0, 40);
  ctx.restore();

  // ---------------------------------------------------------------------------
  // 2. HEADER BLOCK (Solid Crimson Authority Banner)
  // ---------------------------------------------------------------------------
  ctx.textAlign = 'center';

  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText('EST. 1892 • OFFICIAL CIRCULATION DESK REPOSITORY & BOOK STORE', width / 2, 46);

  ctx.font = 'bold 22px "Times New Roman", Georgia, serif';
  ctx.fillStyle = '#0F172A';
  ctx.fillText('KATIPUNEROS HISTORICAL ARCHIVE & BOOK STORE', width / 2, 72);

  // Distinct Return Crimson Pill Badge
  drawRoundedRect(ctx, (width - 480) / 2, 86, 480, 26, 13, '#991B1B');
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('OFFICIAL BOOK RETURN & CIRCULATION DISCHARGE PASS', width / 2, 103);

  // Subheader routing stamp (Clear warning)
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.fillStyle = '#B91C1C';
  ctx.fillText('RESTRICTED USE: FOR RETURNING BORROWED MATERIALS ONLY • INVALID FOR PICKUP', width / 2, 126);

  ctx.font = '10px Inter, sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText(`ISSUED: ${nowFormatted}   •   CIRCULATION RETURN TERMINAL`, width / 2, 142);

  // Separator rule
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 152);
  ctx.lineTo(width - 40, 152);
  ctx.stroke();

  // ---------------------------------------------------------------------------
  // 3. SECTION 1: VOLUME DETAILS & HOLDER REPOSITORY
  // ---------------------------------------------------------------------------
  const s1Y = 162;
  const s1H = 126;
  drawRoundedRect(ctx, 40, s1Y, 720, s1H, 8, '#FFFFFF', '#CBD5E1', 1);

  // Strip header
  drawRoundedRect(ctx, 40, s1Y, 720, 26, 8, '#EFF6FF', '#CBD5E1', 1);
  ctx.textAlign = 'left';
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillStyle = '#1E40AF';
  ctx.fillText('1. CHECKED-OUT PHYSICAL VOLUME & PATRON REGISTRY', 55, s1Y + 17);

  // Book Title
  ctx.font = 'bold 16px "Times New Roman", Georgia, serif';
  ctx.fillStyle = '#0F172A';
  const titleLines = wrapText(ctx, bookTitle, 470);
  const titleY = s1Y + 48;
  ctx.fillText(titleLines[0] || 'Unknown Volume', 55, titleY);
  if (titleLines[1]) {
    ctx.fillText(titleLines[1], 55, titleY + 18);
  }

  // Author & Accession
  ctx.font = '11px Inter, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText(`by ${bookAuthor}   •   Dewey: ${deweyCode}`, 55, titleY + 34);

  ctx.font = '10px Inter, sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText(`Accession / ISBN: ${bookBarcode}`, 55, titleY + 50);

  // Right column: Patron Record Card
  const patronBoxX = 545;
  const patronBoxY = s1Y + 34;
  drawRoundedRect(ctx, patronBoxX, patronBoxY, 205, 82, 6, '#F8FAFC', '#E2E8F0', 1);

  ctx.font = 'bold 9px Inter, sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText('ACTIVE BORROWING PATRON', patronBoxX + 10, patronBoxY + 16);

  ctx.font = 'bold 13px Inter, sans-serif';
  ctx.fillStyle = '#0F172A';
  ctx.fillText(patronName.slice(0, 22), patronBoxX + 10, patronBoxY + 34);

  ctx.font = '10px "Courier New", monospace';
  ctx.fillStyle = '#475569';
  ctx.fillText(`Card: ${patronLibraryId}`, patronBoxX + 10, patronBoxY + 50);

  ctx.font = 'bold 9px Inter, sans-serif';
  ctx.fillStyle = '#16A34A';
  ctx.fillText('• Physical Loan in Possession', patronBoxX + 10, patronBoxY + 68);

  // ---------------------------------------------------------------------------
  // 4. SECTION 2: DISCHARGE CREDENTIALS, 4-DIGIT PIN & DEADLINES
  // ---------------------------------------------------------------------------
  const s2Y = 298;
  const s2H = 104;
  drawRoundedRect(ctx, 40, s2Y, 720, s2H, 8, '#FFFFFF', '#CBD5E1', 1);

  drawRoundedRect(ctx, 40, s2Y, 720, 26, 8, '#F0FDF4', '#CBD5E1', 1);
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillStyle = '#166534';
  ctx.fillText('2. CIRCULATION DISCHARGE CREDENTIALS, 4-DIGIT RETURN PIN & DEADLINES', 55, s2Y + 17);

  // Col 1: Return ExpressCode
  drawRoundedRect(ctx, 50, s2Y + 34, 165, 60, 6, '#EFF6FF', '#BFDBFE', 1);
  ctx.font = 'bold 9px Inter, sans-serif';
  ctx.fillStyle = '#1D4ED8';
  ctx.fillText('RETURN EXPRESS CODE', 58, s2Y + 48);
  ctx.font = 'bold 15px "Courier New", monospace';
  ctx.fillStyle = '#1E3A8A';
  ctx.fillText(expressReturnCode, 58, s2Y + 68);
  ctx.font = '8.5px Inter, sans-serif';
  ctx.fillStyle = '#3B82F6';
  ctx.fillText('Quote at Return Desk', 58, s2Y + 84);

  // Col 2: 4-Digit Return PIN
  drawRoundedRect(ctx, 225, s2Y + 34, 155, 60, 6, '#F0FDF4', '#86EFAC', 1.5);
  ctx.font = 'bold 9px Inter, sans-serif';
  ctx.fillStyle = '#15803D';
  ctx.fillText('RETURN SECURITY PIN', 233, s2Y + 48);
  ctx.font = 'bold 20px "Courier New", monospace';
  ctx.fillStyle = '#166534';
  ctx.fillText(returnPin, 233, s2Y + 70);
  ctx.font = '8.5px Inter, sans-serif';
  ctx.fillStyle = '#16A34A';
  ctx.fillText('4-Digit Return PIN', 233, s2Y + 84);

  // Col 3: Return Reference / GatePass
  drawRoundedRect(ctx, 390, s2Y + 34, 175, 60, 6, '#F8FAFC', '#E2E8F0', 1);
  ctx.font = 'bold 9px Inter, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('RETURN REFERENCE', 398, s2Y + 48);
  ctx.font = 'bold 13px "Courier New", monospace';
  ctx.fillStyle = '#0F172A';
  ctx.fillText(returnReference, 398, s2Y + 68);
  ctx.font = '8.5px Inter, sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText(`Pass: ${gatePassCode.slice(0, 14)}`, 398, s2Y + 84);

  // Col 4: Return Due Date
  drawRoundedRect(ctx, 575, s2Y + 34, 175, 60, 6, '#FEF2F2', '#FECACA', 1);
  ctx.font = 'bold 9px Inter, sans-serif';
  ctx.fillStyle = '#B91C1C';
  ctx.fillText('RETURN DEADLINE', 583, s2Y + 48);
  ctx.font = 'bold 14px Inter, sans-serif';
  ctx.fillStyle = '#991B1B';
  ctx.fillText(dueFormatted, 583, s2Y + 68);
  ctx.font = '8.5px Inter, sans-serif';
  ctx.fillStyle = '#DC2626';
  ctx.fillText('₱15/day fine past date', 583, s2Y + 84);

  // ---------------------------------------------------------------------------
  // 5. SECTION 3: OPTICAL QR SCANNER (EXTRA LARGE WITH GUARANTEED QUIET ZONE)
  // ---------------------------------------------------------------------------
  const s3Y = 412;
  const s3H = 264;
  drawRoundedRect(ctx, 40, s3Y, 720, s3H, 8, '#FFFFFF', '#CBD5E1', 1);

  drawRoundedRect(ctx, 40, s3Y, 720, 26, 8, '#FEF2F2', '#CBD5E1', 1);
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillStyle = '#991B1B';
  ctx.fillText('3. CASHIER OPTICAL SCANNER & 24/7 DROP BOX QR CLEARANCE', 55, s3Y + 17);

  // Outer framing card for QR code with clean white quiet zone
  const qrCardW = 200;
  const qrCardH = 175;
  const qrCardX = (width - qrCardW) / 2;
  const qrCardY = s3Y + 34;

  drawRoundedRect(ctx, qrCardX, qrCardY, qrCardW, qrCardH, 6, '#FFFFFF', '#0F172A', 1.5);

  // Corner Crosshair Reticles around QR Card
  const reticleLen = 10;
  ctx.strokeStyle = '#991B1B';
  ctx.lineWidth = 2.5;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(qrCardX - 4, qrCardY + reticleLen);
  ctx.lineTo(qrCardX - 4, qrCardY - 4);
  ctx.lineTo(qrCardX + reticleLen, qrCardY - 4);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(qrCardX + qrCardW - reticleLen, qrCardY - 4);
  ctx.lineTo(qrCardX + qrCardW + 4, qrCardY - 4);
  ctx.lineTo(qrCardX + qrCardW + 4, qrCardY + reticleLen);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(qrCardX - 4, qrCardY + qrCardH - reticleLen);
  ctx.lineTo(qrCardX - 4, qrCardY + qrCardH + 4);
  ctx.lineTo(qrCardX + reticleLen, qrCardY + qrCardH + 4);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(qrCardX + qrCardW - reticleLen, qrCardY + qrCardH + 4);
  ctx.lineTo(qrCardX + qrCardW + 4, qrCardY + qrCardH + 4);
  ctx.lineTo(qrCardX + qrCardW + 4, qrCardY + qrCardH - reticleLen);
  ctx.stroke();

  // QR Code generation with margin: 4 (standard quiet zone)
  const qrSize = 150;
  const qrX = (width - qrSize) / 2;
  const qrY = qrCardY + 12;

  const qrCanvas = document.createElement('canvas');
  await QRCode.toCanvas(qrCanvas, expressReturnCode, {
    width: qrSize,
    margin: 4,
    color: {
      dark: '#0A0F1D',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'H',
  });
  ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

  // Return Code Box below QR
  const codeBoxW = 480;
  const codeBoxH = 36;
  const codeBoxX = (width - codeBoxW) / 2;
  const codeBoxY = s3Y + 216;

  drawRoundedRect(ctx, codeBoxX, codeBoxY, codeBoxW, codeBoxH, 6, '#FEF2F2', '#DC2626', 1.5);

  ctx.textAlign = 'center';
  ctx.font = 'bold 15px "Courier New", monospace';
  ctx.fillStyle = '#991B1B';
  ctx.fillText(`${expressReturnCode}  •  PIN: ${returnPin}  •  ${returnReference}`, width / 2, codeBoxY + 23);

  // ---------------------------------------------------------------------------
  // 6. SECTION 4: CONDITION INSPECTION CHECKLIST & STAFF STAMP (UNIQUE TO RETURN)
  // ---------------------------------------------------------------------------
  const s4Y = 686;
  const s4H = 138;
  drawRoundedRect(ctx, 40, s4Y, 720, s4H, 8, '#FFFFFF', '#CBD5E1', 1);

  drawRoundedRect(ctx, 40, s4Y, 720, 26, 8, '#F0FDF4', '#CBD5E1', 1);
  ctx.textAlign = 'left';
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillStyle = '#166534';
  ctx.fillText('4. PHYSICAL BOOK CONDITION AUDIT & STAFF DISCHARGE CLEARANCE', 55, s4Y + 17);

  // Left Checklist Box (4 criteria with drawn checkboxes)
  const checkItems = [
    'Spine & Binding: Structural integrity verified without separation',
    'Pages Intact: Complete leaf count; free of ink annotations / defacement',
    'Environmental: Zero liquid immersion, discoloration, or mold signs',
    'Accession & Barcode: University property tag legible and verified',
  ];

  ctx.font = '10px Inter, sans-serif';
  ctx.fillStyle = '#334155';

  checkItems.forEach((item, idx) => {
    const itemY = s4Y + 44 + idx * 22;
    // Draw checkbox square
    drawRoundedRect(ctx, 55, itemY - 11, 14, 14, 2, '#FFFFFF', '#059669', 1.5);
    // Draw checkmark
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(58, itemY - 4);
    ctx.lineTo(61, itemY - 1);
    ctx.lineTo(66, itemY - 8);
    ctx.stroke();

    ctx.fillText(item, 76, itemY);
  });

  // Right Side: Official Librarian Stamp Box
  const stampBoxX = 525;
  const stampBoxY = s4Y + 34;
  drawRoundedRect(ctx, stampBoxX, stampBoxY, 225, 94, 6, '#FFFBEB', '#D97706', 1);

  ctx.font = 'bold 9px Inter, sans-serif';
  ctx.fillStyle = '#B45309';
  ctx.fillText('CIRCULATION CLEARANCE STAMP', stampBoxX + 10, stampBoxY + 16);

  ctx.font = '9px Inter, sans-serif';
  ctx.fillStyle = '#78350F';
  ctx.fillText('Staff ID / Signature: _________________', stampBoxX + 10, stampBoxY + 36);
  ctx.fillText('Date / Time Audited: __________________', stampBoxX + 10, stampBoxY + 54);

  // Clearance badge status
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.fillStyle = '#059669';
  ctx.fillText('[✓] CLEARED & DISCHARGED', stampBoxX + 10, stampBoxY + 76);

  // ---------------------------------------------------------------------------
  // 7. SECTION 5: 3-OPTION RETURN INSTRUCTIONS
  // ---------------------------------------------------------------------------
  const s5Y = 834;
  const s5H = 112;
  drawRoundedRect(ctx, 40, s5Y, 720, s5H, 8, '#F8FAFC', '#E2E8F0', 1);

  ctx.fillStyle = '#991B1B';
  ctx.fillRect(40, s5Y, 5, s5H);

  ctx.textAlign = 'left';
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillStyle = '#0F172A';
  ctx.fillText('5. 3 CONVENIENT METHODS TO COMPLETE BOOK RETURN:', 56, s5Y + 20);

  ctx.font = '10px Inter, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText(
    '• OPTION 1 (BY SCAN): Present this QR code to the cashier optical scanner or 24/7 drop box lens.',
    56,
    s5Y + 38
  );
  ctx.fillText(
    `• OPTION 2 (BY INPUT): Type Return ExpressCode (${expressReturnCode}) or Gate Pass (${gatePassCode}) at desk.`,
    56,
    s5Y + 54
  );
  ctx.fillText(
    '• OPTION 3 (BY SLIP IMAGE / ROSTER): Upload this downloaded PNG directly into the cashier circulation terminal.',
    56,
    s5Y + 70
  );
  ctx.font = 'bold 9px Inter, sans-serif';
  ctx.fillStyle = '#059669';
  ctx.fillText(
    'Upon inspection clearance, an official Discharge Receipt is recorded to clear all circulation liabilities.',
    56,
    s5Y + 90
  );

  // ---------------------------------------------------------------------------
  // 8. FOOTER
  // ---------------------------------------------------------------------------
  ctx.textAlign = 'center';
  ctx.font = '9px Inter, sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText(
    `KATIPUNEROS REPOSITORY CIRCULATION DESK • OFFICIAL RETURN DOCUMENT • LOAN ID: ${loanId}`,
    width / 2,
    height - 30
  );

  // Trigger download as Katipuneros_OFFICIAL_RETURN_PASS_{shortLoanId}.png
  const dataUrl = canvas.toDataURL('image/png');
  const downloadLink = document.createElement('a');
  downloadLink.href = dataUrl;
  downloadLink.download = `Katipuneros_OFFICIAL_RETURN_PASS_${shortLoanId}.png`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
