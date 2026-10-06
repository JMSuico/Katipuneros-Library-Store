// [Layer: LANDING_PAGE/Features/Pages/Home/Components]
// ReservationModal.tsx -- Self-contained book reservation dialog with date calculator and voucher receipt.
// DO NOT put business logic or API calls here.
import { FC, useState } from 'react';
import { BookDetailData } from './BookDetailModal';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: BookDetailData | null;
}

export const ReservationModal: FC<ReservationModalProps> = ({ isOpen, onClose, book }) => {
  const [borrowDuration, setBorrowDuration] = useState(7);
  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');

  if (!isOpen || !book) return null;

  const getReturnDateString = () => {
    if (!pickupDate) return 'Select a date';
    const pDate = new Date(pickupDate);
    pDate.setDate(pDate.getDate() + borrowDuration);
    return pDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = 'KP-' + Math.floor(1000 + Math.random() * 9000);
    setVoucherCode(code);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fadeIn">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-3xl p-space-xl shadow-2xl relative">
        <button
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          onClick={handleReset}
          aria-label="Close modal"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {!isSubmitted ? (
          <div>
            <div className="flex items-center gap-3 mb-space-md">
              <div className="w-12 h-12 rounded-2xl bg-action-green/20 flex items-center justify-center text-text-primary">
                <span className="material-symbols-outlined text-[24px]">bookmark_added</span>
              </div>
              <div>
                <h3 className="font-headline-4 text-headline-4 text-text-primary font-bold">Reserve Book</h3>
                <p className="font-small text-small text-text-secondary truncate max-w-xs">
                  {book.title} ({book.category}) - {book.author}
                </p>
              </div>
            </div>

            <form className="space-y-space-md" onSubmit={handleSubmit}>
              <div>
                <label className="block font-caption text-caption font-semibold text-text-primary mb-1">
                  Preferred Pickup Date
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-text-primary font-body text-small focus:outline-none focus:bg-white shadow-inner"
                  type="date"
                  value={pickupDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setPickupDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block font-caption text-caption font-semibold text-text-primary mb-1">
                  Borrow Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[7, 14, 21].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setBorrowDuration(days)}
                      className={`py-2.5 rounded-xl font-small text-small font-semibold transition-all cursor-pointer ${
                        borrowDuration === days
                          ? 'bg-action-green text-text-primary shadow-sm'
                          : 'bg-surface-container text-text-secondary hover:bg-white'
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-soft-blue/60 flex items-center justify-between">
                <span className="font-caption text-caption text-text-secondary">Expected Return Date:</span>
                <span className="font-small text-small text-primary font-bold">{getReturnDateString()}</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low text-text-secondary font-caption text-caption flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary">info</span>
                <span>Books are reserved for 72 hours from the scheduled pickup date.</span>
              </div>

              <button
                className="w-full py-3.5 px-6 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-body-medium font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                type="submit"
              >
                <span className="material-symbols-outlined text-[20px]">check</span>
                <span>Confirm Reservation</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-action-green/30 text-text-primary mx-auto flex items-center justify-center mb-space-md">
              <span className="material-symbols-outlined text-[36px]">task_alt</span>
            </div>
            <h3 className="font-headline-3 text-headline-3 text-text-primary font-bold mb-1">
              Reservation Submitted
            </h3>
            <p className="font-caption text-caption uppercase tracking-wider text-status-pending font-bold mb-3">
              Status: Pending Approval
            </p>
            <p className="font-small text-small text-text-secondary mb-space-lg">
              Your reservation voucher has been generated. Our circulation team will hold the book under voucher code{' '}
              <strong className="text-primary">{voucherCode}</strong>.
            </p>
            <button
              className="w-full py-3 px-6 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-body-medium font-semibold transition-colors cursor-pointer"
              onClick={handleReset}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
