// [Layer: LANDING_PAGE/Features/Pages/Home/Components]
// BookDetailModal.tsx -- Bibliographic book detail preview modal for the public landing page.
// DO NOT put business logic or API calls here.
import { FC } from 'react';

export interface BookDetailData {
  title: string;
  author: string;
  category: string;
  stock: string;
  isbn: string;
  synopsis: string;
  coverImage?: string;
}

interface BookDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: BookDetailData | null;
  onReserve: (book: BookDetailData) => void;
}

export const BookDetailModal: FC<BookDetailModalProps> = ({
  isOpen,
  onClose,
  book,
  onReserve,
}) => {
  if (!isOpen || !book) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fadeIn">
      <div className="max-w-2xl w-full bg-white/95 backdrop-blur-xl rounded-3xl p-space-xl shadow-2xl relative">
        <button
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          onClick={onClose}
          aria-label="Close modal"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
        <div className="flex flex-col sm:flex-row gap-space-lg items-start">
          <div className="w-full sm:w-48 h-64 rounded-2xl overflow-hidden bg-secondary-container shadow-md flex-shrink-0">
            <img
              className="w-full h-full object-cover"
              alt={book.title}
              src={
                book.coverImage ||
                'https://lh3.googleusercontent.com/aida-public/AB6AXuAcIeS2Woom5vrHVaF2Q1MlJ9H7qDaaLnIjiAKAIRfoQZz2__2lPUogwfJp2qUvBuIhMipDBa0GugWXUNhqh8it0yVHxVNCXHTlVxXgEFadBM2ki7MogVWhYIFX_Ku0OSjCUYUJBF8a8t3CyTUD0DeAKHHhRL_JBkLOkRMYna1S3f9k9BBvyMba4i8WgcY2rpm6BubN6ZT51-P217OBXL3Xuf4oPIFynbo3IJVPgjg5EM8u4cp6Kd8P'
              }
            />
          </div>
          <div className="flex-1">
            <span className="px-3 py-1 rounded-full bg-soft-blue text-primary font-caption text-caption font-semibold">
              {book.category}
            </span>
            <h3 className="font-headline-3 text-headline-3 text-text-primary font-bold mt-2">
              {book.title}
            </h3>
            <p className="font-body text-body text-text-secondary mb-3">{book.author}</p>
            <div className="flex items-center gap-3 mb-space-md">
              <span className="px-2.5 py-0.5 rounded-full bg-action-green/20 text-text-primary font-caption text-caption font-semibold">
                {book.stock}
              </span>
              <span className="font-caption text-caption text-text-secondary">
                ISBN: <span>{book.isbn}</span>
              </span>
            </div>
            <p className="font-small text-small text-text-secondary leading-relaxed mb-space-lg">
              {book.synopsis}
            </p>
            <div className="flex items-center gap-3">
              <button
                className="flex-1 py-3 px-5 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-body-medium font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                onClick={() => {
                  onClose();
                  onReserve(book);
                }}
              >
                <span className="material-symbols-outlined text-[20px]">bookmark_add</span>
                <span>Reserve This Copy</span>
              </button>
              <button
                className="py-3 px-5 rounded-xl bg-surface-container text-text-secondary hover:text-text-primary font-body-medium text-body-medium transition-colors cursor-pointer"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
