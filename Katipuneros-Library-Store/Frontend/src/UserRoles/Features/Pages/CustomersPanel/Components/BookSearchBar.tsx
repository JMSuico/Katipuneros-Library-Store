// [Layer: UserRoles/Features/Pages/CustomersPanel/Components]
// BookSearchBar.tsx -- Customer search bar and quick filter component.
// DO NOT put business logic or API calls here.
import { FC, useState } from 'react';

interface BookSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const BookSearchBar: FC<BookSearchBarProps> = ({
  onSearch,
  placeholder = 'Search catalog by title, author, or subject...',
}) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center w-full">
        <span className="material-symbols-outlined absolute left-3.5 text-text-secondary text-lg">
          search
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 rounded-full bg-surface-container-highest/60 focus:bg-white text-text-primary placeholder:text-text-secondary font-small text-small outline-none border border-outline-variant/30 focus:border-primary transition-all"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              setValue('');
              onSearch('');
            }}
            className="absolute right-3 text-text-secondary hover:text-text-primary"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        )}
      </div>
    </form>
  );
};

export default BookSearchBar;
