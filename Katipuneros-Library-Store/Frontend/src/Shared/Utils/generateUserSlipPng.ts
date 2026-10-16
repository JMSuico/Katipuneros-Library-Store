// [Layer: Shared/Utils]
// generateUserSlipPng.ts -- Official Client-Side Pickup Slip PNG Generator.
// Uses HTML5 Canvas (800x1000px) and qrcode to produce high-resolution,
// heritage-styled Katipuneros Library Store Pickup Verification Slips.
// Triggers direct browser download as Katipuneros_Pickup_Slip_{id.slice(0,8)}.png.

import QRCode from 'qrcode';
import { CustomerReservationRecord } from '../../Endpoints/Customer/reservationApi';

/**
 * Interface supporting full or partial reservation records for slip generation.
 */
export interface UserSlipReservationData {
  id: string;
  book?: {
    id?: string;
    title?: string;
    author?: string;
    isbn?: string;
    deweyCode?: string;
    coverImage?: string;
  };
  reservationDate?: string;
  expiryDate?: string;
  fulfilledDate?: string;
  counterBay?: string;
  lockerBay?: string;
  lockerPin?: string;
  accessionPassCode?: string;
  pickupBranch?: string;
  queuePosition?: number;
  [key: string]: unknown;
}

/**
 * Helper to draw rounded rectangles on canvas.
 */
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

/**
 * Helper to wrap text into multiple lines given maxWidth.
 */
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
 * Generates an official, high-resolution (800x1000px) Katipuneros Library Store
 * Pickup Slip and triggers an instant browser download.
 *
 * @param reservation The reservation record to generate the slip for.
 */
export async function generateUserSlipPng(
  reservation: UserSlipReservationData | CustomerReservationRecord
): Promise<void> {
  if (!reservation || !reservation.id) {
    throw new Error('Valid reservation record required to generate pickup slip.');
  }

  // Pre-load web fonts if browser font API is available
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await document.fonts.ready;
    } catch {
      // Graceful fallback to system fonts
    }
  }

  const width = 800;
  const height = 1000;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to acquire 2D context from canvas.');
  }

  const reservationId = reservation.id;
  const shortId = reservationId.slice(0, 8).toUpperCase();
  const expressCode = `SCAN-BAY-${reservationId.slice(0, 6).toUpperCase()}`;

  const assignedBay = reservation.lockerBay
    ? `Counter Bay ${reservation.lockerBay}`
    : reservation.counterBay || 'Bay 01 Counter';

  const pickupPin = reservation.lockerPin || reservation.accessionPassCode || '7429';
  const pickupBranch = reservation.pickupBranch || 'Katipuneros Central Stacks';
  const bookTitle = reservation.book?.title || 'Academic Reserved Volume';
  const bookAuthor = reservation.book?.author || 'Catalog Contributor';
  const deweyCode = reservation.book?.deweyCode || '899.211 R69';
  const isbn = reservation.book?.isbn || 'N/A';
  const queuePos = reservation.queuePosition || 1;

  const expiryFormatted = reservation.expiryDate
    ? new Date(reservation.expiryDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Within 48 Hours';

  const nowFormatted = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // ---------------------------------------------------------------------------
  // 1. BASE BACKGROUND & HERITAGE FRAMING
  // ---------------------------------------------------------------------------
  // Warm ivory background
  ctx.fillStyle = '#FAF8F5';
  ctx.fillRect(0, 0, width, height);

  // Outer primary border
  ctx.strokeStyle = '#18323D';
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // Inner antique gold border
  ctx.strokeStyle = '#D9A85C';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(26, 26, width - 52, height - 52);

  // Corner decorative marks (Heritage corner brackets)
  const drawCornerAccent = (cx: number, cy: number) => {
    ctx.fillStyle = '#D9A85C';
    ctx.fillRect(cx - 3, cy - 3, 6, 6);
  };
  drawCornerAccent(32, 32);
  drawCornerAccent(width - 32, 32);
  drawCornerAccent(32, height - 32);
  drawCornerAccent(width - 32, height - 32);

  // ---------------------------------------------------------------------------
  // 2. HERITAGE ARCHIVE HEADER
  // ---------------------------------------------------------------------------
  ctx.textAlign = 'center';

  // Archival subtitle
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillStyle = '#8C6E32';
  ctx.fillText('EST. 1892 • HISTORICAL ARCHIVE & CIRCULATION REPOSITORY', width / 2, 54);

  // Main institution title
  ctx.font = 'bold 22px "Times New Roman", Georgia, serif';
  ctx.fillStyle = '#18323D';
  ctx.fillText('KATIPUNEROS HISTORICAL ARCHIVE & BOOK STORE', width / 2, 82);

  // Official badge pill
  drawRoundedRect(ctx, (width - 340) / 2, 98, 340, 26, 13, '#00658A');
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('OFFICIAL HOLD PICKUP & VERIFICATION SLIP', width / 2, 115);

  // Meta timestamp line
  ctx.font = '10px Inter, sans-serif';
  ctx.fillStyle = '#647982';
  ctx.fillText(`ISSUED: ${nowFormatted}   •   DISPATCH BAY: MAIN CIRCULATION`, width / 2, 142);

  // Header separator line with center ornament
  ctx.strokeStyle = '#DDE4E5';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(45, 154);
  ctx.lineTo(width / 2 - 20, 154);
  ctx.moveTo(width / 2 + 20, 154);
  ctx.lineTo(width - 45, 154);
  ctx.stroke();

  // Diamond center ornament
  ctx.fillStyle = '#D9A85C';
  ctx.beginPath();
  ctx.moveTo(width / 2, 149);
  ctx.lineTo(width / 2 + 5, 154);
  ctx.lineTo(width / 2, 159);
  ctx.lineTo(width / 2 - 5, 154);
  ctx.closePath();
  ctx.fill();

  // ---------------------------------------------------------------------------
  // 3. SECTION: RESERVATION & CATALOG DETAILS
  // ---------------------------------------------------------------------------
  const s1Y = 166;
  const s1H = 158;
  drawRoundedRect(ctx, 45, s1Y, 710, s1H, 8, '#FFFFFF', '#DDE4E5', 1);

  // Section 1 Header strip
  drawRoundedRect(ctx, 45, s1Y, 710, 30, 8, '#F4FBFC', '#DDE4E5', 1);
  ctx.textAlign = 'left';
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillStyle = '#00658A';
  ctx.fillText('1. RESERVATION & CATALOG RECORD', 60, s1Y + 19);

  ctx.textAlign = 'right';
  ctx.font = 'bold 12px "Courier New", monospace';
  ctx.fillStyle = '#18323D';
  ctx.fillText(`RESERVATION #${shortId}`, 740, s1Y + 19);

  // Left column: Book Title & Author
  ctx.textAlign = 'left';
  ctx.font = 'bold 9px Inter, sans-serif';
  ctx.fillStyle = '#647982';
  ctx.fillText('VOLUME TITLE', 60, s1Y + 50);

  ctx.font = 'bold 16px Inter, sans-serif';
  ctx.fillStyle = '#18323D';
  const titleLines = wrapText(ctx, bookTitle, 430);
  const firstTwoTitleLines = titleLines.slice(0, 2);
  let titleY = s1Y + 70;
  firstTwoTitleLines.forEach((line) => {
    ctx.fillText(line, 60, titleY);
    titleY += 20;
  });

  ctx.font = 'bold 9px Inter, sans-serif';
  ctx.fillStyle = '#647982';
  ctx.fillText('AUTHOR / CONTRIBUTOR', 60, s1Y + 115);

  ctx.font = '13px Inter, sans-serif';
  ctx.fillStyle = '#31647A';
  ctx.fillText(bookAuthor, 60, s1Y + 131);

  ctx.font = '10px Inter, sans-serif';
  ctx.fillStyle = '#647982';
  ctx.fillText(`Branch: ${pickupBranch}`, 60, s1Y + 148);

  // Right column: Call Number & ISBN Box
  drawRoundedRect(ctx, 515, s1Y + 40, 225, 106, 6, '#EEF5F6', '#BFC8CF', 1);
  ctx.textAlign = 'left';

  ctx.font = 'bold 9px Inter, sans-serif';
  ctx.fillStyle = '#647982';
  ctx.fillText('CALL NUMBER / DEWEY CODE', 527, s1Y + 58);

  ctx.font = 'bold 15px "Courier New", monospace';
  ctx.fillStyle = '#00658A';
  ctx.fillText(deweyCode, 527, s1Y + 78);

  ctx.strokeStyle = '#BFC8CF';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(527, s1Y + 89);
  ctx.lineTo(728, s1Y + 89);
  ctx.stroke();

  ctx.font = '10px "Courier New", monospace';
  ctx.fillStyle = '#40484E';
  ctx.fillText(`ISBN: ${isbn}`, 527, s1Y + 107);

  ctx.font = '10px Inter, sans-serif';
  ctx.fillStyle = '#40484E';
  ctx.fillText(`Queue Priority: Position #${queuePos}`, 527, s1Y + 125);

  // ---------------------------------------------------------------------------
  // 4. SECTION: STAGING & PHYSICAL HANDOVER
  // ---------------------------------------------------------------------------
  const s2Y = 336;
  const s2H = 112;
  drawRoundedRect(ctx, 45, s2Y, 710, s2H, 8, '#FFFFFF', '#DDE4E5', 1);

  // Section 2 Header strip
  drawRoundedRect(ctx, 45, s2Y, 710, 28, 8, '#F4FBFC', '#DDE4E5', 1);
  ctx.textAlign = 'left';
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillStyle = '#00658A';
  ctx.fillText('2. STAGING & HANDOVER PROTOCOL', 60, s2Y + 18);

  // Col 1: Assigned Bay
  drawRoundedRect(ctx, 58, s2Y + 36, 215, 66, 6, '#F0FDF4', '#86EFAC', 1);
  ctx.font = 'bold 9px Inter, sans-serif';
  ctx.fillStyle = '#166534';
  ctx.fillText('ASSIGNED STAGING BAY', 70, s2Y + 52);
  ctx.font = 'bold 17px Inter, sans-serif';
  ctx.fillStyle = '#14532D';
  ctx.fillText(assignedBay, 70, s2Y + 74);
  ctx.font = '9px Inter, sans-serif';
  ctx.fillStyle = '#15803D';
  ctx.fillText('Ready for circulation counter release', 70, s2Y + 92);

  // Col 2: 4-Digit Pickup PIN
  drawRoundedRect(ctx, 292, s2Y + 36, 215, 66, 6, '#EFF6FF', '#93C5FD', 1);
  ctx.font = 'bold 9px Inter, sans-serif';
  ctx.fillStyle = '#1E40AF';
  ctx.fillText('4-DIGIT PICKUP PIN', 304, s2Y + 52);
  ctx.font = 'bold 22px "Courier New", monospace';
  ctx.fillStyle = '#1D4ED8';
  ctx.fillText(pickupPin, 304, s2Y + 76);
  ctx.font = '9px Inter, sans-serif';
  ctx.fillStyle = '#2563EB';
  ctx.fillText('Present to front desk verification staff', 304, s2Y + 92);

  // Col 3: Lending Term
  drawRoundedRect(ctx, 526, s2Y + 36, 215, 66, 6, '#FAF5FF', '#D8B4FE', 1);
  ctx.font = 'bold 9px Inter, sans-serif';
  ctx.fillStyle = '#6B21A8';
  ctx.fillText('CIRCULATION LOAN PERIOD', 538, s2Y + 52);
  ctx.font = 'bold 17px Inter, sans-serif';
  ctx.fillStyle = '#581C87';
  ctx.fillText('14 Calendar Days', 538, s2Y + 74);
  ctx.font = '9px Inter, sans-serif';
  ctx.fillStyle = '#7E22CE';
  ctx.fillText('Commences upon physical handover', 538, s2Y + 92);

  // ---------------------------------------------------------------------------
  // 5. SECTION: HIGH-CONTRAST SCANNABLE QR CODE & EXPRESSCODE
  // ---------------------------------------------------------------------------
  const s3Y = 460;
  const s3H = 268;
  drawRoundedRect(ctx, 45, s3Y, 710, s3H, 8, '#FFFFFF', '#DDE4E5', 1);

  // Header strip
  drawRoundedRect(ctx, 45, s3Y, 710, 28, 8, '#F4FBFC', '#DDE4E5', 1);
  ctx.textAlign = 'left';
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillStyle = '#00658A';
  ctx.fillText('3. RAPID EXPRESS DESK SCANNER & BARCODE VERIFICATION', 60, s3Y + 18);

  // Generate QR Code via qrcode onto an offscreen canvas
  const qrSize = 144;
  const qrX = (width - qrSize) / 2;
  const qrY = s3Y + 38;

  // Frame around QR code
  drawRoundedRect(ctx, qrX - 6, qrY - 6, qrSize + 12, qrSize + 12, 4, '#FFFFFF', '#0F172A', 1.5);

  const qrCanvas = document.createElement('canvas');
  await QRCode.toCanvas(qrCanvas, expressCode, {
    width: qrSize,
    margin: 1,
    color: {
      dark: '#0A192F',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'H',
  });
  ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

  // Prominent ExpressCode text box below QR
  const codeBoxW = 360;
  const codeBoxH = 38;
  const codeBoxX = (width - codeBoxW) / 2;
  const codeBoxY = s3Y + 196;

  drawRoundedRect(ctx, codeBoxX, codeBoxY, codeBoxW, codeBoxH, 6, '#EEF5F6', '#00658A', 1.5);

  ctx.textAlign = 'center';
  ctx.font = 'bold 19px "Courier New", monospace';
  ctx.fillStyle = '#18323D';
  ctx.fillText(expressCode, width / 2, codeBoxY + 25);

  ctx.font = '10px Inter, sans-serif';
  ctx.fillStyle = '#647982';
  ctx.fillText('Scan QR code at the circulation kiosk or provide Express Code at the desk', width / 2, s3Y + 252);

  // ---------------------------------------------------------------------------
  // 6. SECTION: 48-HOUR RETENTION WINDOW & RETURN INSTRUCTIONS
  // ---------------------------------------------------------------------------
  const s4Y = 740;
  const s4H = 138;
  drawRoundedRect(ctx, 45, s4Y, 710, s4H, 8, '#FFFDF5', '#FDE68A', 1.5);

  // Left warning accent bar
  ctx.fillStyle = '#D9A85C';
  ctx.fillRect(45, s4Y, 6, s4H);

  ctx.textAlign = 'left';
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillStyle = '#92400E';
  ctx.fillText('4. 48-HOUR RETENTION WINDOW & RETURN PROTOCOL', 64, s4Y + 22);

  // Bullet 1: 48-hour retention
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.fillStyle = '#78350F';
  ctx.fillText(`• RETENTION WINDOW (EXPIRES ${expiryFormatted.toUpperCase()}):`, 64, s4Y + 44);
  ctx.font = '10px Inter, sans-serif';
  ctx.fillText(
    'This volume will be held at your assigned counter bay for exactly 48 hours.',
    76,
    s4Y + 58
  );
  ctx.fillText(
    'Uncollected holds are automatically cancelled and restocked to stacks.',
    76,
    s4Y + 71
  );

  // Bullet 2: Lending term
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.fillText('• 14-DAY LENDING DURATION:', 64, s4Y + 90);
  ctx.font = '10px Inter, sans-serif';
  ctx.fillText(
    'Standard borrowing duration is 14 calendar days beginning at desk handover.',
    76,
    s4Y + 103
  );

  // Bullet 3: Returns
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.fillText('• RETURN INSTRUCTIONS:', 64, s4Y + 119);
  ctx.font = '10px Inter, sans-serif';
  ctx.fillText(
    'Return volume to the Main Circulation Desk or deposit in 24/7 Automated Book Drop.',
    76,
    s4Y + 132
  );

  // ---------------------------------------------------------------------------
  // 7. FOOTER & AUTHENTICITY STAMP
  // ---------------------------------------------------------------------------
  ctx.strokeStyle = '#DDE4E5';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(45, 892);
  ctx.lineTo(width - 45, 892);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.fillStyle = '#18323D';
  ctx.fillText('KATIPUNEROS HISTORICAL ARCHIVE & BOOK STORE', 45, 912);
  ctx.font = '9px Inter, sans-serif';
  ctx.fillStyle = '#647982';
  ctx.fillText('Automated Hold Staging & Accession Ledger System • Official Document Copy', 45, 926);

  ctx.textAlign = 'right';
  ctx.font = 'bold 10px "Courier New", monospace';
  ctx.fillStyle = '#18323D';
  ctx.fillText(`DOCUMENT REF: ${shortId}`, width - 45, 912);
  ctx.font = '9px Inter, sans-serif';
  ctx.fillStyle = '#647982';
  ctx.fillText('Non-transferable • Present student or faculty ID upon pickup', width - 45, 926);

  ctx.textAlign = 'center';
  ctx.font = 'bold 9px Inter, sans-serif';
  ctx.fillStyle = '#00658A';
  ctx.fillText('VERIFIED AUTHENTIC LIBRARY SLIP • KEEP AS PROOF OF RESERVATION', width / 2, 952);

  // ---------------------------------------------------------------------------
  // 8. CONVERT CANVAS TO PNG & TRIGGER DOWNLOAD
  // ---------------------------------------------------------------------------
  const filename = `Katipuneros_Pickup_Slip_${shortId}.png`;

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/png');
  });

  if (!blob) {
    throw new Error('Failed to generate pickup slip PNG blob.');
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
