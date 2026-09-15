// [Layer: UserRoles/Features/Pages/CashiersPanel/Components]
// ReceiptCard.tsx -- Transaction and fine settlement official receipt card display.
// DO NOT put business logic or API calls here.
import { FC } from 'react';

export interface ReceiptData {
  receiptNo: string;
  patronName: string;
  patronId: string;
  amount: number;
  paymentMethod: string;
  cashierName: string;
  station: string;
  date: string;
}

interface ReceiptCardProps {
  receipt: ReceiptData;
  onPrint?: () => void;
  onClose?: () => void;
}

export const ReceiptCard: FC<ReceiptCardProps> = ({ receipt, onPrint, onClose }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-outline-variant/40 shadow-lg max-w-md w-full mx-auto font-mono text-small">
      <div className="text-center pb-4 border-b border-dashed border-outline-variant/40">
        <h4 className="font-bold text-base uppercase">KATIPUNEROS LIBRARY STORE</h4>
        <p className="text-caption text-text-secondary">Circulation &amp; Cashier Desk</p>
        <p className="text-caption text-text-secondary">Official Receipt: {receipt.receiptNo}</p>
      </div>

      <div className="py-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-text-secondary">Date:</span>
          <span>{receipt.date}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Patron:</span>
          <span>{receipt.patronName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Patron ID:</span>
          <span>{receipt.patronId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Terminal:</span>
          <span>{receipt.station}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Cashier:</span>
          <span>{receipt.cashierName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Method:</span>
          <span className="uppercase">{receipt.paymentMethod}</span>
        </div>
      </div>

      <div className="py-3 border-t border-b border-dashed border-outline-variant/40 flex justify-between font-bold text-base">
        <span>TOTAL PAID:</span>
        <span>₱{receipt.amount.toFixed(2)}</span>
      </div>

      <div className="text-center pt-4 text-caption text-text-secondary">
        <p>Thank you for keeping your account in good standing.</p>
        <p>JRMSU Katipunan Library System</p>
      </div>

      <div className="flex gap-2 mt-6 not-sr-only">
        {onPrint && (
          <button
            onClick={onPrint}
            className="flex-1 py-2 px-3 rounded-xl bg-primary text-white font-sans font-semibold text-small cursor-pointer"
          >
            Print
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="flex-1 py-2 px-3 rounded-xl bg-surface-container text-text-primary font-sans font-semibold text-small cursor-pointer"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
};

export default ReceiptCard;
