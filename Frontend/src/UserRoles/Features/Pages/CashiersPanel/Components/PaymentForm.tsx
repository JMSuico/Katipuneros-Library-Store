// [Layer: UserRoles/Features/Pages/CashiersPanel/Components]
// PaymentForm.tsx -- Fine settlement and circulation fee payment form component.
// DO NOT put business logic or direct API calls here.
import { FC, useState } from 'react';

interface PaymentFormProps {
  patronName: string;
  patronId: string;
  amountDue: number;
  onSuccess: (receipt: { receiptNo: string; amount: number; method: string }) => void;
  onCancel: () => void;
}

export const PaymentForm: FC<PaymentFormProps> = ({
  patronName,
  patronId,
  amountDue,
  onSuccess,
  onCancel,
}) => {
  const [method, setMethod] = useState<'cash' | 'gcash' | 'maya'>('cash');
  const [amountTendered, setAmountTendered] = useState(amountDue.toString());
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess({
      receiptNo: `OR-${Date.now().toString().slice(-6)}`,
      amount: Number(amountTendered) || amountDue,
      method,
    });
  };

  const change = Math.max(0, (Number(amountTendered) || 0) - amountDue);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 rounded-xl bg-surface-container-low flex justify-between items-center">
        <div>
          <span className="font-caption text-caption text-text-secondary">Patron</span>
          <p className="font-small text-small font-bold text-text-primary">{patronName}</p>
          <span className="font-caption text-caption text-text-secondary font-mono">{patronId}</span>
        </div>
        <div className="text-right">
          <span className="font-caption text-caption text-text-secondary">Total Due</span>
          <p className="font-headline-3 text-headline-3 text-status-danger font-bold">
            ₱{amountDue.toFixed(2)}
          </p>
        </div>
      </div>

      <div>
        <label className="block font-caption text-caption font-semibold text-text-primary mb-1">
          Payment Method
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['cash', 'gcash', 'maya'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m)}
              className={`py-2 px-3 rounded-xl border text-center font-small text-small font-bold uppercase transition-all cursor-pointer ${
                method === m
                  ? 'border-primary bg-primary text-white shadow-sm'
                  : 'border-outline-variant/30 hover:bg-surface-container'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-caption text-caption font-semibold text-text-primary mb-1">
          Amount Tendered (PHP)
        </label>
        <input
          type="number"
          step="0.01"
          min={amountDue}
          value={amountTendered}
          onChange={(e) => setAmountTendered(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low text-text-primary font-small text-small focus:outline-none focus:bg-white shadow-inner"
          required
        />
      </div>

      {method === 'cash' && change > 0 && (
        <div className="p-3 rounded-xl bg-action-green/20 flex justify-between items-center">
          <span className="font-small text-small text-text-primary font-semibold">Change to return:</span>
          <span className="font-small text-small text-text-primary font-bold">₱{change.toFixed(2)}</span>
        </div>
      )}

      <div>
        <label className="block font-caption text-caption font-semibold text-text-primary mb-1">
          Cashier Note / Remarks
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Cleared 2 days overdue"
          className="w-full px-4 py-2 rounded-xl bg-surface-container-low text-text-primary font-small text-small focus:outline-none focus:bg-white shadow-inner"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 px-4 rounded-xl bg-surface-container text-text-secondary hover:text-text-primary font-small text-small font-semibold transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-3 px-4 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-bold transition-all shadow-md cursor-pointer"
        >
          Confirm &amp; Print Receipt
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
