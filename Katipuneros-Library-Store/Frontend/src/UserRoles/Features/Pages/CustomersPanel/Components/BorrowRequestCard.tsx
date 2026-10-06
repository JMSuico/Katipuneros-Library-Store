// [Layer: UserRoles/Features/Pages/CustomersPanel/Components]
// BorrowRequestCard.tsx -- Component displaying customer active borrow loan status and due dates.
// DO NOT put business logic or API calls here.
import { FC } from 'react';

export interface BorrowRecord {
  id: string;
  bookTitle: string;
  author: string;
  borrowDate: string;
  dueDate: string;
  daysRemaining: number;
  status: 'active' | 'overdue' | 'returned';
  coverImage?: string;
}

interface BorrowRequestCardProps {
  record: BorrowRecord;
  onRenew?: (id: string) => void;
}

export const BorrowRequestCard: FC<BorrowRequestCardProps> = ({ record, onRenew }) => {
  const isOverdue = record.daysRemaining < 0;

  return (
    <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/30 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {record.coverImage && (
          <img
            src={record.coverImage}
            alt={record.bookTitle}
            className="w-12 h-16 object-cover rounded-lg shadow-sm"
          />
        )}
        <div className="flex flex-col">
          <h4 className="font-small text-small font-bold text-text-primary leading-tight">
            {record.bookTitle}
          </h4>
          <span className="font-caption text-caption text-text-secondary">{record.author}</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-caption text-caption text-text-secondary">
              Due: {record.dueDate}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full font-caption text-caption font-bold ${
                isOverdue
                  ? 'bg-status-danger text-white'
                  : 'bg-soft-blue text-primary'
              }`}
            >
              {isOverdue ? `${Math.abs(record.daysRemaining)}d Overdue` : `${record.daysRemaining}d Left`}
            </span>
          </div>
        </div>
      </div>

      {onRenew && !isOverdue && (
        <button
          onClick={() => onRenew(record.id)}
          className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-small text-small font-medium transition-colors cursor-pointer"
        >
          Renew Loan
        </button>
      )}
    </div>
  );
};

export default BorrowRequestCard;
