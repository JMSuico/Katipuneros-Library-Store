// [Layer: Shared]
// BookCopyQrSticker.tsx -- Printable physical book inside-cover label with high-density QR code.
// Uses qrcode library for SVG generation, zero mock data, print-ready styling.
// DO NOT put HTTP calls or business mutations here.

import { FC, useState, useEffect } from 'react';
import QRCode from 'qrcode';

export interface BookCopyQrStickerProps {
  bookTitle: string;
  bookAuthor: string;
  deweyCode: string;
  copyNumber: number;
  accessionNumber: string;
  qrCodeData: string;
  bayLocation?: string;
  onPrint?: () => void;
}

export const BookCopyQrSticker: FC<BookCopyQrStickerProps> = ({
  bookTitle,
  bookAuthor,
  deweyCode,
  copyNumber,
  accessionNumber,
  qrCodeData,
  bayLocation,
}) => {
  const [qrSvg, setQrSvg] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    QRCode.toString(qrCodeData, {
      type: 'svg',
      margin: 1,
      width: 130,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((svg) => {
        if (isMounted) setQrSvg(svg);
      })
      .catch((err) => {
        console.error('Failed to generate QR code SVG:', err);
      });
    return () => {
      isMounted = false;
    };
  }, [qrCodeData]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=650,height=450');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Sticker - ${accessionNumber}</title>
          <style>
            @page {
              size: 3.5in 2in;
              margin: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #fff;
              color: #0f172a;
              -webkit-print-color-adjust: exact;
            }
            .sticker-card {
              width: 3.2in;
              height: 1.8in;
              border: 1.5px dashed #334155;
              border-radius: 6px;
              padding: 8px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              box-sizing: border-box;
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 1px solid #cbd5e1;
              padding-bottom: 3px;
              margin-bottom: 4px;
            }
            .lib-title {
              font-size: 8px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.8px;
              color: #1e3a8a;
            }
            .copy-badge {
              font-size: 8px;
              font-weight: 700;
              background: #e2e8f0;
              padding: 1px 4px;
              border-radius: 3px;
            }
            .body-grid {
              display: flex;
              align-items: center;
              gap: 8px;
              flex: 1;
            }
            .qr-wrap {
              width: 80px;
              height: 80px;
              flex-shrink: 0;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .qr-wrap svg {
              width: 100%;
              height: 100%;
            }
            .info-col {
              flex: 1;
              min-width: 0;
              display: flex;
              flex-direction: column;
              gap: 2px;
            }
            .book-title {
              font-size: 10px;
              font-weight: 800;
              line-height: 1.15;
              max-height: 24px;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .book-author {
              font-size: 8px;
              color: #475569;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .meta-row {
              font-size: 8px;
              color: #1e293b;
              font-family: monospace;
              display: flex;
              flex-direction: column;
              margin-top: 2px;
            }
            .acc-num {
              font-size: 9px;
              font-weight: 800;
              color: #1e3a8a;
            }
            .footer {
              font-size: 6.5px;
              color: #64748b;
              text-align: center;
              border-top: 0.5px solid #e2e8f0;
              padding-top: 2px;
            }
          </style>
        </head>
        <body>
          <div class="sticker-card">
            <div class="header">
              <span class="lib-title">Katipuneros Library System</span>
              <span class="copy-badge">Vol. #${copyNumber}</span>
            </div>
            <div class="body-grid">
              <div class="qr-wrap">${qrSvg}</div>
              <div class="info-col">
                <div class="book-title">${bookTitle}</div>
                <div class="book-author">By ${bookAuthor}</div>
                <div class="meta-row">
                  <span class="acc-num">${accessionNumber}</span>
                  <span>Call: ${deweyCode || '000 GEN'}</span>
                  <span>Bay: ${bayLocation || 'General Stacks'}</span>
                </div>
              </div>
            </div>
            <div class="footer">Property of Katipuneros Library • Scan at circulation desk to check-in/out</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-white text-slate-900 rounded-xl border border-slate-300 p-3 shadow-sm flex flex-col justify-between max-w-xs transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
        <span className="text-[10px] font-black uppercase tracking-wider text-primary">
          Katipuneros Library
        </span>
        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-700">
          Copy #{copyNumber}
        </span>
      </div>

      {/* Main Body */}
      <div className="flex items-center gap-3 py-2">
        <div
          className="w-20 h-20 flex-shrink-0 bg-white p-0.5 border border-slate-200 rounded flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
        <div className="flex flex-col min-w-0 flex-1">
          <h5 className="font-bold text-[12px] text-slate-900 leading-tight line-clamp-2">
            {bookTitle}
          </h5>
          <span className="text-[10px] text-slate-500 truncate mt-0.5">{bookAuthor}</span>
          <div className="mt-1 flex flex-col font-mono text-[10px] text-slate-700">
            <strong className="text-primary font-bold">{accessionNumber}</strong>
            <span className="text-[9px] text-slate-500">Call: {deweyCode || '000 GEN'}</span>
            <span className="text-[9px] text-slate-500">Shelf: {bayLocation || 'Stacks'}</span>
          </div>
        </div>
      </div>

      {/* Footer & Action */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <span className="text-[9px] text-slate-400">Institutional QR Label</span>
        <button
          type="button"
          onClick={handlePrint}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
        >
          <span className="material-symbols-outlined text-xs">print</span>
          <span>Print Sticker</span>
        </button>
      </div>
    </div>
  );
};
