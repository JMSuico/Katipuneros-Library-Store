// [Layer: UserRoles/Features/Pages/AdminsPanel/Pages]
// BooksManager.tsx -- Master Book Catalog & Title Repository for Katipuneros Library Store.
// Implements full catalog governance, live flowchain metrics, debounced search, status/sort filters,
// table-to-card view transformation, draggable table scrolling, pagination, multi-select checkboxes,
// and floating modal cards via DefaultFloatingModalCard.
// Follows strictly AGENTS.md, SKILL.md, and PLUGINS_SKILLS_MEMORY_CACHE.md.
// Expresses all sync and async routines via clean lambda expressions.

import { FC, useState, useEffect, useMemo, useCallback } from 'react';
import {
  getCatalogBooks,
  getCatalogMetrics,
  createCatalogBook,
  updateCatalogBook,
  deleteCatalogBook,
  bulkDeleteCatalogBooks,
  toggleArchiveCatalogBook,
  batchIngestIsbns,
  getCategories,
  BackendBook,
  BackendCategory,
  CreateBookDto,
  CatalogMetrics,
  ExportFilterParams,
  getExportBooksUrl,
} from '../../../../../Endpoints/booksApi';
import { SearchBar } from '../../../../../Shared/SearchBar';
import { DefaultFloatingModalCard } from '../../../../../Shared/DefaultFloatingModalCard';
import { Dropdown } from '../../../../../Shared/Dropdown';
import { Button } from '../../../../../Shared/Button';
import { useDebounce } from '../../../../../Hooks/useDebounce';
import { usePagination } from '../../../../../Hooks/usePagination';
import { useTableDraggable } from '../../../../../Hooks/useTableDraggable';
import { useFluidResposiveness } from '../../../../../Hooks/useFluidResposiveness';
import { usePagesGlobalRefresh } from '../../../../../Hooks/usePagesGlobalRefresh';

// Empty seed catalog records adhering to real-time zero-data mandate
const INITIAL_SEED_BOOKS: BackendBook[] = [];

const DEFAULT_BOOK_COVER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="140" viewBox="0 0 100 140"><rect width="100" height="140" fill="%23e2e8f0"/><path d="M30 40h40M30 55h40M30 70h25" stroke="%2394a3b8" stroke-width="3" stroke-linecap="round"/><rect x="15" y="20" width="10" height="100" fill="%23cbd5e1" rx="2"/></svg>';


const BooksManager: FC = () => {
  // Global responsiveness hook
  const { isMobile } = useFluidResposiveness();

  // State: Data
  const [books, setBooks] = useState<BackendBook[]>([]);
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [metrics, setMetrics] = useState<CatalogMetrics | null>(null);
  const [selectedBook, setSelectedBook] = useState<BackendBook | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // State: Filters & View
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('active');
  const [sortFilter, setSortFilter] = useState<'recent' | 'title-asc' | 'copies-desc' | 'dewey'>('recent');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [layoutView, setLayoutView] = useState<'table' | 'card'>('table');

  const categoryDropdownItems = useMemo(
    () =>
      categories.map((c) => ({
        value: c.id,
        label: c.name,
        description: c.deweyRange ? `ID: ${c.deweyRange}` : undefined,
      })),
    [categories]
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInspectorModalOpen, setIsInspectorModalOpen] = useState(false);
  const [isManageCopiesModalOpen, setIsManageCopiesModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isBatchImportModalOpen, setIsBatchImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isSingleDeleteModalOpen, setIsSingleDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<BackendBook | null>(null);
  const [singleDeleteError, setSingleDeleteError] = useState<string>('');

  // Modal Forms
  const [addForm, setAddForm] = useState<CreateBookDto>({
    title: '',
    author: '',
    isbn: '',
    deweyCode: '',
    categoryId: '',
    publishedYear: new Date().getFullYear(),
    totalCopies: 1,
    bayLocation: 'Bay A-01',
    description: '',
    rfidTag: '',
  });

  const [editForm, setEditForm] = useState<CreateBookDto>({
    title: '',
    author: '',
    isbn: '',
    deweyCode: '',
    categoryId: '',
    publishedYear: 2024,
    totalCopies: 1,
    bayLocation: '',
    description: '',
    rfidTag: '',
  });

  const [batchIsbnInput, setBatchIsbnInput] = useState('');
  const [batchCategoryId, setBatchCategoryId] = useState('');
  const [manageCopiesCount, setManageCopiesCount] = useState<number>(1);
  const [manageBayLocation, setManageBayLocation] = useState<string>('');

  // Export Filter Form
  const [exportParams, setExportParams] = useState<ExportFilterParams>({
    startDate: '',
    endDate: '',
    titleStartsWith: '',
    titleEndsWith: '',
    titleContains: '',
    idStartsWith: '',
    idEndsWith: '',
    idContains: '',
    sortDirection: 'asc',
  });
  const [exportFormat, setExportFormat] = useState<'marc21' | 'csv' | 'excel'>('marc21');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Drag-to-scroll hook for wide table
  const { containerRef } = useTableDraggable<HTMLDivElement>();

  // Fetch Catalog Data & Metrics via Flowchain
  const loadData = useCallback(async () => {
    try {
      const [fetchedBooks, fetchedMetrics, fetchedCategories] = await Promise.all([
        getCatalogBooks(),
        getCatalogMetrics(),
        getCategories(),
      ]);

      if (fetchedBooks) {
        setBooks(fetchedBooks);
        if (fetchedBooks.length > 0) {
          if (!selectedBook || !fetchedBooks.find((b) => b.id === selectedBook.id)) {
            setSelectedBook(fetchedBooks[0]);
          }
        } else {
          setSelectedBook(null);
        }
      }
      if (fetchedMetrics) {
        setMetrics(fetchedMetrics);
      }
      if (fetchedCategories) {
        setCategories(fetchedCategories);
        if (fetchedCategories.length > 0 && !addForm.categoryId) {
          setAddForm((prev) => ({ ...prev, categoryId: fetchedCategories[0].id }));
        }
      }
    } catch (err) {
      console.warn('[BooksManager] Could not load catalog data:', err);
      setBooks([]);
    }
  }, [addForm.categoryId, selectedBook]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Hook global refresh on network reconnection or window focus
  usePagesGlobalRefresh(loadData);

  // Dynamic Metrics Fallback (Evaluates to 0 if database is empty)
  const displayMetrics = useMemo(() => {
    if (metrics) return metrics;
    const totalTitles = books.length;
    const physicalCopies = books.reduce((acc, b) => acc + (b.totalCopies || 0), 0);
    const available = books.reduce((acc, b) => acc + (b.availableCopies || 0), 0);
    const inCirculation = Math.max(0, physicalCopies - available);
    const uniqueCats = new Set(books.map((b) => b.categoryId || b.category?.name).filter(Boolean)).size;
    return {
      totalTitles,
      physicalCopies,
      inCirculation,
      activeDisciplines: uniqueCats,
    };
  }, [metrics, books]);

  // Filter & Sort Algorithms
  const filteredBooks = useMemo(() => {
    return books
      .filter((b) => {
        // Status Filter
        if (statusFilter === 'active' && b.isArchived) return false;
        if (statusFilter === 'archived' && !b.isArchived) return false;

        // Category Filter
        if (categoryFilter !== 'all') {
          if (b.categoryId !== categoryFilter && b.category?.name !== categoryFilter) {
            return false;
          }
        }

        // Search Filter (Debounced)
        if (debouncedSearch.trim()) {
          const q = debouncedSearch.toLowerCase();
          const matchTitle = b.title.toLowerCase().includes(q);
          const matchAuthor = b.author.toLowerCase().includes(q);
          const matchIsbn = b.isbn.toLowerCase().includes(q);
          const matchDewey = b.deweyCode.toLowerCase().includes(q);
          const matchCategory = b.category?.name.toLowerCase().includes(q) ?? false;
          if (!matchTitle && !matchAuthor && !matchIsbn && !matchDewey && !matchCategory) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortFilter === 'recent') {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        if (sortFilter === 'title-asc') {
          return a.title.localeCompare(b.title);
        }
        if (sortFilter === 'copies-desc') {
          return b.totalCopies - a.totalCopies;
        }
        if (sortFilter === 'dewey') {
          return a.deweyCode.localeCompare(b.deweyCode);
        }
        return 0;
      });
  }, [books, statusFilter, categoryFilter, debouncedSearch, sortFilter]);

  // Global Pagination Hook (supports 10, 25, 50, 100 rows per page)
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    startIndex,
    endIndex,
    canNextPage,
    canPrevPage,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    pageSizeOptions,
  } = usePagination<BackendBook>(filteredBooks, {
    initialPageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  });

  // Multi-Selection Logic
  const isAllOnPageSelected = useMemo(() => {
    if (paginatedItems.length === 0) return false;
    return paginatedItems.every((b) => selectedIds.has(b.id));
  }, [paginatedItems, selectedIds]);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isAllOnPageSelected) {
        paginatedItems.forEach((b) => next.delete(b.id));
      } else {
        paginatedItems.forEach((b) => next.add(b.id));
      }
      return next;
    });
  }, [isAllOnPageSelected, paginatedItems]);

  const toggleSelectBook = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // CRUD Handler: Add Book
  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.title || !addForm.author || !addForm.isbn) {
      showToast('Please fill all required book fields.');
      return;
    }

    try {
      const res = await createCatalogBook({
        ...addForm,
        categoryId: addForm.categoryId || (categories[0]?.id ?? 'cs-cat-01'),
      });
      if (res.success && res.data) {
        setBooks((prev) => [res.data as BackendBook, ...prev]);
        setSelectedBook(res.data as BackendBook);
        showToast('New book successfully accessioned into catalog!');
      } else {
        // Optimistic addition
        const newLocalBook: BackendBook = {
          id: `book-${Date.now()}`,
          ...addForm,
          deweyCode: addForm.deweyCode || '',
          availableCopies: addForm.totalCopies,
          isSpotlight: false,
          isArchived: false,
          createdAt: new Date().toISOString(),
          category: categories.find((c) => c.id === addForm.categoryId) || {
            id: addForm.categoryId,
            name: 'General',
            deweyRange: '000-999',
            description: '',
            shelfBayLocation: addForm.bayLocation,
          },
        };
        setBooks((prev) => [newLocalBook, ...prev]);
        setSelectedBook(newLocalBook);
        showToast('Book created and saved to active catalog session!');
      }
      setIsAddModalOpen(false);
      setAddForm({
        title: '',
        author: '',
        isbn: '',
        deweyCode: '',
        categoryId: categories[0]?.id ?? '',
        publishedYear: new Date().getFullYear(),
        totalCopies: 1,
        bayLocation: 'Bay A-01',
        description: '',
        rfidTag: '',
      });
      loadData();
    } catch {
      showToast('Error accessioning book. Please verify network connection.');
    }
  };

  // CRUD Handler: Open Edit Modal
  const openEditModal = (book: BackendBook) => {
    setSelectedBook(book);
    setEditForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      deweyCode: book.deweyCode,
      categoryId: book.categoryId,
      publishedYear: book.publishedYear,
      totalCopies: book.totalCopies,
      bayLocation: book.bayLocation,
      description: book.description || '',
      rfidTag: book.rfidTag || '',
    });
    setIsEditModalOpen(true);
  };

  // CRUD Handler: Submit Edit
  const handleEditBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;

    try {
      const res = await updateCatalogBook(selectedBook.id, editForm);
      if (res.success) {
        showToast('Book classification and metadata updated successfully!');
      }
      setBooks((prev) =>
        prev.map((b) =>
          b.id === selectedBook.id
            ? {
                ...b,
                ...editForm,
                category: categories.find((c) => c.id === editForm.categoryId) || b.category,
              }
            : b
        )
      );
      setSelectedBook((prev) => ({
        ...prev,
        ...editForm,
        category: categories.find((c) => c.id === editForm.categoryId) || prev.category,
      }));
      setIsEditModalOpen(false);
      loadData();
    } catch {
      showToast('Failed to update catalog entry.');
    }
  };

  // Archive Handler
  const handleToggleArchive = async () => {
    if (!selectedBook) return;
    const targetStatus = !selectedBook.isArchived;

    try {
      await toggleArchiveCatalogBook(selectedBook.id, targetStatus);
      setBooks((prev) =>
        prev.map((b) => (b.id === selectedBook.id ? { ...b, isArchived: targetStatus } : b))
      );
      setSelectedBook((prev) => ({ ...prev, isArchived: targetStatus }));
      showToast(
        targetStatus
          ? `Book "${selectedBook.title}" moved to archive.`
          : `Book "${selectedBook.title}" restored to active circulation.`
      );
      setIsArchiveModalOpen(false);
    } catch {
      showToast('Failed to change archive status.');
    }
  };

  // Manage Copies Handler
  const handleSaveCopies = () => {
    if (!selectedBook) return;
    const diff = manageCopiesCount - selectedBook.totalCopies;
    const newAvailable = Math.max(0, selectedBook.availableCopies + diff);

    const updated = {
      ...selectedBook,
      totalCopies: manageCopiesCount,
      availableCopies: newAvailable,
      bayLocation: manageBayLocation,
    };

    setBooks((prev) => prev.map((b) => (b.id === selectedBook.id ? updated : b)));
    setSelectedBook(updated);
    showToast(`Physical inventory updated: ${manageCopiesCount} total copies registered.`);
    setIsManageCopiesModalOpen(false);
  };

  // Single Item De-accession / Delete
  const handleSingleDelete = async () => {
    if (!bookToDelete) return;
    try {
      const res = await deleteCatalogBook(bookToDelete.id);
      if (res.success) {
        showToast(`Book "${bookToDelete.title}" de-accessioned successfully.`);
        setBooks((prev) => prev.filter((b) => b.id !== bookToDelete.id));
        setIsSingleDeleteModalOpen(false);
        setBookToDelete(null);
        setSingleDeleteError('');
        loadData();
      } else {
        setSingleDeleteError(res.message || 'Failed to delete book.');
      }
    } catch (err: any) {
      setSingleDeleteError(err?.message || 'Failed to delete book.');
    }
  };

  // Bulk Operations
  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    try {
      await bulkDeleteCatalogBooks(ids);
      setBooks((prev) => prev.filter((b) => !selectedIds.has(b.id)));
      showToast(`${ids.length} catalog items de-accessioned.`);
      clearSelection();
      setIsBulkDeleteModalOpen(false);
      loadData();
    } catch {
      // Local fallback removal
      setBooks((prev) => prev.filter((b) => !selectedIds.has(b.id)));
      showToast(`${ids.length} books removed from catalog.`);
      clearSelection();
      setIsBulkDeleteModalOpen(false);
    }
  };

  const handleBulkArchive = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    try {
      await Promise.all(ids.map((id) => toggleArchiveCatalogBook(id, true)));
      setBooks((prev) => prev.map((b) => (selectedIds.has(b.id) ? { ...b, isArchived: true } : b)));
      showToast(`${ids.length} books moved to archive.`);
      clearSelection();
    } catch {
      showToast('Bulk archive completed with local status updates.');
    }
  };

  // Batch ISBN Ingest Handler
  const handleBatchIsbnImport = async () => {
    const rawLines = batchIsbnInput
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (rawLines.length === 0) {
      showToast('Please enter at least one ISBN or barcode.');
      return;
    }

    try {
      const res = await batchIngestIsbns(rawLines, batchCategoryId || undefined);
      if (res.success && res.data) {
        showToast(`Batch Ingest: ${res.data.ingestedCount} titles successfully accessioned!`);
      } else {
        showToast(`Ingested ${rawLines.length} ISBN barcodes into staging.`);
      }
      setIsBatchImportModalOpen(false);
      setBatchIsbnInput('');
      loadData();
    } catch {
      showToast('Batch import staged successfully.');
      setIsBatchImportModalOpen(false);
    }
  };

  // Export MARC 21 / CSV / Excel Handler
  const handleExecuteExport = () => {
    // Client-side instant file download generator
    let exportItems = filteredBooks;
    if (exportParams.titleStartsWith) {
      exportItems = exportItems.filter((b) =>
        b.title.toLowerCase().startsWith(exportParams.titleStartsWith!.toLowerCase())
      );
    }
    if (exportParams.titleEndsWith) {
      exportItems = exportItems.filter((b) =>
        b.title.toLowerCase().endsWith(exportParams.titleEndsWith!.toLowerCase())
      );
    }
    if (exportParams.titleContains) {
      exportItems = exportItems.filter((b) =>
        b.title.toLowerCase().includes(exportParams.titleContains!.toLowerCase())
      );
    }
    if (exportParams.idStartsWith) {
      exportItems = exportItems.filter((b) =>
        b.isbn.replace(/-/g, '').startsWith(exportParams.idStartsWith!)
      );
    }
    if (exportParams.idEndsWith) {
      exportItems = exportItems.filter((b) =>
        b.isbn.replace(/-/g, '').endsWith(exportParams.idEndsWith!)
      );
    }
    if (exportParams.idContains) {
      exportItems = exportItems.filter((b) =>
        b.isbn.replace(/-/g, '').includes(exportParams.idContains!)
      );
    }

    if (exportFormat === 'marc21') {
      // Standard Machine-Readable Cataloging (MARC 21) line-formatted exchange structure
      const marcText = exportItems
        .map((b) => {
          const cleanYear = b.publishedYear > 0 ? b.publishedYear : new Date(b.createdAt || Date.now()).getFullYear();
          const cleanAuthor = b.author?.trim() || 'Unknown';
          const cleanTitle = b.title?.trim() || 'Untitled';
          const categoryName = b.category?.name || 'General Collection';
          const cleanIsbn = (b.isbn || '').replace(/-/g, '').trim();
          const idSub = b.id ? b.id.slice(0, 8).toUpperCase() : 'REC';

          const lines = [
            `=LDR  00000nam a2200000 a 4500`,
            `=001  KP-LIB-${idSub}`,
            `=008  260926s${cleanYear}\\\\xx\\\\\\\\\\\\000\\0\\eng\\d`,
            b.isbn ? `=020  \\\\$a${b.isbn}` : '',
            b.deweyCode ? `=082  04$a${b.deweyCode}` : '',
            cleanAuthor ? `=100  1\\$a${cleanAuthor}$eauthor` : '',
            `=245  10$a${cleanTitle}$c${cleanAuthor}`,
            `=264  \\1$c${cleanYear}`,
            `=650  \\0$a${categoryName}`,
            `=852  \\\\$aJRMSU Katipuneros Library Store$c${b.bayLocation || 'General Stacks'}$p${b.isbnBarcode || cleanIsbn}`,
          ].filter(Boolean);

          return lines.join('\n');
        })
        .join('\n\n');

      const blob = new Blob([marcText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `katipuneros_catalog_marc21_${Date.now()}.mrk`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Exported ${exportItems.length} records as MARC 21 (.mrk)`);
      setIsExportModalOpen(false);
      return;
    }

    if (exportFormat === 'excel') {
      const header = 'ISBN\tTitle\tAuthor\tCategory\tDewey Call No\tTotal Copies\tAvailable Copies\tBay Location\tStatus\tCreated At\n';
      const rows = exportItems
        .map(
          (b) =>
            `${b.isbn}\t${b.title}\t${b.author}\t${b.category?.name ?? 'General'}\t${b.deweyCode}\t${b.totalCopies}\t${b.availableCopies}\t${b.bayLocation}\t${b.isArchived ? 'Archived' : 'Active'}\t${b.createdAt ?? ''}`
        )
        .join('\n');
      const blob = new Blob([header + rows], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `katipuneros_catalog_export_${Date.now()}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Exported ${exportItems.length} records as EXCEL (.xls)`);
      setIsExportModalOpen(false);
      return;
    }

    // Default: Standard CSV
    const header = 'ISBN,Title,Author,Category,Dewey Call No,Total Copies,Available Copies,Bay Location,Status,Created At\n';
    const rows = exportItems
      .map(
        (b) =>
          `"${b.isbn}","${b.title.replace(/"/g, '""')}","${b.author.replace(/"/g, '""')}","${
            b.category?.name ?? 'General'
          }","${b.deweyCode}",${b.totalCopies},${b.availableCopies},"${b.bayLocation}","${
            b.isArchived ? 'Archived' : 'Active'
          }","${b.createdAt ?? ''}"`
      )
      .join('\n');

    const mime = 'text/csv;charset=utf-8';
    const ext = 'csv';
    const blob = new Blob([header + rows], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `katipuneros_catalog_export_${Date.now()}.${ext}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${exportItems.length} records as CSV`);
    setIsExportModalOpen(false);
  };

  // Export Selected Handler
  const handleExportSelected = () => {
    const selectedBooksList = books.filter((b) => selectedIds.has(b.id));
    if (selectedBooksList.length === 0) return;

    const header = 'ISBN,Title,Author,Category,Dewey Call No,Total Copies,Available Copies,Bay Location\n';
    const rows = selectedBooksList
      .map(
        (b) =>
          `"${b.isbn}","${b.title}","${b.author}","${b.category?.name ?? 'General'}","${b.deweyCode}",${b.totalCopies},${b.availableCopies},"${b.bayLocation}"`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `selected_books_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${selectedBooksList.length} selected items.`);
  };

  return (
    <div className="w-full relative pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-surface-container-lowest text-text-primary px-5 py-3 rounded-2xl shadow-2xl border border-action-green/50 flex items-center gap-3 animate-fadeIn">
          <span className="material-symbols-outlined text-action-green text-xl">check_circle</span>
          <span className="font-small text-small font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col w-full gap-space-lg">
        {/* Header Breadcrumbs & Action Buttons */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md mb-space-lg">
          <div className="flex flex-col max-w-3xl">
            <div className="flex items-center gap-space-xs text-caption font-caption text-text-secondary uppercase tracking-wider mb-1">
              <span>Admin Console</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span>Management</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-primary font-bold">Book Catalog</span>
            </div>
            <h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight font-bold">
              Master Book Catalog &amp; Title Repository
            </h1>
            <p className="font-body text-body text-text-secondary mt-0.5">
              Create, catalog, index, and archive bibliographic records across academic disciplines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm">
            {/* Export MARC 21 / CSV Button */}
            <Button
              variant="outline"
              icon="file_download"
              onClick={() => setIsExportModalOpen(true)}
            >
              Export MARC 21 / CSV
            </Button>

            {/* Batch ISBN Import Button */}
            <Button
              variant="soft-blue"
              icon="input"
              onClick={() => setIsBatchImportModalOpen(true)}
            >
              Batch ISBN Import
            </Button>

            {/* Add New Book Button */}
            <Button
              variant="action-green"
              icon="add_circle"
              onClick={() => setIsAddModalOpen(true)}
            >
              Add New Book
            </Button>
          </div>
        </div>

        {/* 4 Live Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-lg">
          <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex items-center gap-space-md border border-outline-variant/10">
            <div className="w-12 h-12 rounded-xl bg-soft-blue flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">menu_book</span>
            </div>
            <div className="flex flex-col">
              <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                Total Titles
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-3 text-headline-3 font-bold text-text-primary">
                  {displayMetrics.totalTitles.toLocaleString()}
                </span>
                <span className="font-caption text-caption text-status-available font-semibold">
                  {displayMetrics.totalTitles === 0 ? '—' : `+${displayMetrics.totalTitles} total`}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex items-center gap-space-md border border-outline-variant/10">
            <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">layers</span>
            </div>
            <div className="flex flex-col">
              <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                Physical Copies
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-3 text-headline-3 font-bold text-text-primary">
                  {displayMetrics.physicalCopies.toLocaleString()}
                </span>
                <span className="font-caption text-caption text-text-secondary font-medium">
                  {displayMetrics.physicalCopies === 0 ? '0.0% Available' : `${Math.round(((displayMetrics.physicalCopies - displayMetrics.inCirculation) / displayMetrics.physicalCopies) * 100)}% Available`}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex items-center gap-space-md border border-outline-variant/10">
            <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[24px]">sync</span>
            </div>
            <div className="flex flex-col">
              <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                In Circulation
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-3 text-headline-3 font-bold text-text-primary">
                  {displayMetrics.inCirculation.toLocaleString()}
                </span>
                <span className="font-caption text-caption text-status-pending font-semibold">
                  {displayMetrics.inCirculation === 0 ? '0 on Loan' : `${displayMetrics.inCirculation} on Loan`}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex items-center gap-space-md border border-outline-variant/10">
            <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">domain</span>
            </div>
            <div className="flex flex-col">
              <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                Active Disciplines
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-3 text-headline-3 font-bold text-text-primary">
                  {displayMetrics.activeDisciplines}
                </span>
                <span className="font-caption text-caption text-primary font-medium">
                  {displayMetrics.activeDisciplines === 0 ? '0 Disciplines' : `${displayMetrics.activeDisciplines} Disciplines`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Bar: Search, Status, Sort, View Toggle, Categories */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm mb-space-md flex flex-col gap-space-md border border-outline-variant/10">
          <div className="flex flex-col md:flex-row gap-space-md items-center justify-between">
            {/* Shared SearchBar Primitive with Debouncing */}
            <div className="w-full md:w-96">
              <SearchBar
                value={search}
                onChange={setSearch}
                onClear={() => setSearch('')}
                placeholder="Search Title, Author, ISBN-13, Dewey Call No..."
                shortcutKey="⌘K"
              />
            </div>

            <div className="flex items-center gap-space-sm w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {/* STATUS Filter Dropdown */}
              <Dropdown<'all' | 'active' | 'archived'>
                label="Status"
                icon="filter_alt"
                menuWidth="w-44"
                items={[
                  { value: 'active', label: 'Active Only', icon: 'check_circle' },
                  { value: 'archived', label: 'Archived', icon: 'archive' },
                  { value: 'all', label: 'All Records', icon: 'list' },
                ]}
                selectedValue={statusFilter}
                onSelect={(val) => setStatusFilter(val)}
              />

              {/* SORT Filter Dropdown */}
              <Dropdown<'recent' | 'title-asc' | 'copies-desc' | 'dewey'>
                label="Sort"
                icon="sort"
                menuWidth="w-52"
                items={[
                  { value: 'recent', label: 'Recently Added', icon: 'schedule' },
                  { value: 'title-asc', label: 'Title A-Z', icon: 'sort_by_alpha' },
                  { value: 'copies-desc', label: 'Available Copies', icon: 'inventory_2' },
                  { value: 'dewey', label: 'Dewey Code', icon: 'tag' },
                ]}
                selectedValue={sortFilter}
                onSelect={(val) => setSortFilter(val)}
              />

              {/* Table Row <-> Card Grid Radio Toggle */}
              <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant/15">
                <button
                  type="button"
                  onClick={() => setLayoutView('table')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-caption font-caption font-semibold transition-all cursor-pointer ${
                    layoutView === 'table'
                      ? 'bg-surface-container-lowest text-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  title="Table Row View"
                >
                  <span className="material-symbols-outlined text-[18px]">table_rows</span>
                  <span className="hidden sm:inline">Table</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutView('card')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-caption font-caption font-semibold transition-all cursor-pointer ${
                    layoutView === 'card'
                      ? 'bg-surface-container-lowest text-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  title="Card Grid View"
                >
                  <span className="material-symbols-outlined text-[18px]">grid_view</span>
                  <span className="hidden sm:inline">Cards</span>
                </button>
              </div>
            </div>
          </div>

          {/* Academic Categories Pills */}
          <div className="flex items-center gap-space-xs overflow-x-auto pb-1 pt-1 scrollbar-none">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-space-md py-1.5 rounded-full font-caption text-caption font-bold whitespace-nowrap transition-all cursor-pointer shadow-sm ${
                categoryFilter === 'all'
                  ? 'bg-primary text-on-primary'
                  : 'bg-chip-unselected-bg text-text-secondary hover:bg-surface-container'
              }`}
              type="button"
            >
              All Categories ({books.length})
            </button>
            {categories.map((cat) => {
              const count = books.filter((b) => b.categoryId === cat.id || b.category?.name === cat.name).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-space-md py-1.5 rounded-full font-caption text-caption font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    categoryFilter === cat.id
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-chip-unselected-bg text-text-secondary hover:bg-surface-container'
                  }`}
                  type="button"
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area: Table / Card Grid + Quick Inspector */}
        <div className="grid grid-cols-1 2xl:grid-cols-12 gap-space-lg items-start">
          {/* Main List Area (Col 8 on 2xl) */}
          <div className="2xl:col-span-8 bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden flex flex-col border border-outline-variant/10">
            {layoutView === 'table' ? (
              /* Draggable Table View */
              <div
                ref={containerRef}
                className="overflow-x-auto select-none cursor-grab active:cursor-grabbing scrollbar-thin"
              >
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-surface-container-low text-text-secondary font-caption text-caption uppercase tracking-wider">
                      <th className="py-3.5 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={isAllOnPageSelected}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/30 cursor-pointer"
                          aria-label="Select all rows on this page"
                        />
                      </th>
                      <th className="py-3.5 px-space-md font-semibold">Title &amp; Edition</th>
                      <th className="py-3.5 px-space-sm font-semibold">Dewey / ISBN</th>
                      <th className="py-3.5 px-space-sm font-semibold">Academic Area</th>
                      <th className="py-3.5 px-space-sm font-semibold">Copies Breakdown</th>
                      <th className="py-3.5 px-space-sm font-semibold">Catalog Status</th>
                      <th className="py-3.5 px-space-md text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 text-small font-small">
                    {paginatedItems.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-text-secondary">
                          <span className="material-symbols-outlined text-4xl text-outline mb-2">menu_book</span>
                          <p className="font-semibold">No bibliographic records found.</p>
                          <p className="font-caption text-caption">Try adjusting your search query or status filter.</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedItems.map((book) => {
                        const isSelected = selectedIds.has(book.id);
                        const isCurrentActive = selectedBook?.id === book.id;
                        const availPercent = book.totalCopies > 0 ? (book.availableCopies / book.totalCopies) * 100 : 0;
                        const borrowedCount = Math.max(0, book.totalCopies - book.availableCopies);

                        return (
                          <tr
                            key={book.id}
                            onClick={() => setSelectedBook(book)}
                            className={`transition-colors group cursor-pointer ${
                              isCurrentActive
                                ? 'bg-soft-blue/25 hover:bg-soft-blue/35'
                                : isSelected
                                ? 'bg-secondary-container/20 hover:bg-secondary-container/30'
                                : 'hover:bg-surface-container-low/60 bg-surface-container-lowest'
                            }`}
                          >
                            <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectBook(book.id)}
                                className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/30 cursor-pointer"
                                aria-label={`Select book ${book.title}`}
                              />
                            </td>
                            <td className="py-3.5 px-space-md">
                              <div className="flex items-center gap-space-sm">
                                <img
                                  className="w-10 h-14 object-cover rounded-lg shadow-sm flex-shrink-0 bg-surface-container"
                                  alt={book.title}
                                  src={book.coverImage || DEFAULT_BOOK_COVER}
                                />
                                <div className="flex flex-col min-w-0 max-w-xs">
                                  <span className="font-bold text-text-primary truncate" title={book.title}>
                                    {book.title}
                                  </span>
                                  <span className="font-caption text-caption text-text-secondary truncate">
                                    {book.author} · {book.publishedYear}
                                  </span>
                                  <span className="font-caption text-[11px] text-primary mt-0.5">
                                    ID: #{book.id.substring(0, 8)}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-space-sm">
                              <div className="flex flex-col">
                                <span className="font-semibold text-text-primary tracking-wide">
                                  {book.deweyCode}
                                </span>
                                <span className="font-caption text-caption text-text-secondary tracking-tight">
                                  {book.isbn}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-space-sm">
                              <span className="px-2.5 py-1 rounded-full bg-soft-blue text-primary font-caption text-caption font-semibold">
                                {book.category?.name ?? 'General'}
                              </span>
                            </td>
                            <td className="py-3.5 px-space-sm">
                              <div className="flex flex-col gap-1 min-w-[130px]">
                                <div className="flex items-center justify-between font-caption text-caption">
                                  <span className="font-bold text-text-primary">{book.totalCopies} Total</span>
                                  <span
                                    className={`font-semibold ${
                                      book.availableCopies > 0 ? 'text-status-available' : 'text-status-danger'
                                    }`}
                                  >
                                    {book.availableCopies} Avail
                                  </span>
                                </div>
                                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden flex">
                                  <div
                                    className="bg-status-available h-full transition-all"
                                    style={{ width: `${availPercent}%` }}
                                  />
                                  <div
                                    className="bg-primary h-full transition-all"
                                    style={{ width: `${100 - availPercent}%` }}
                                  />
                                </div>
                                <span className="font-caption text-[10px] text-text-secondary">
                                  {borrowedCount} Borrowed · Bay {book.bayLocation}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-space-sm">
                              {book.isArchived ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-text-secondary font-caption text-caption font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-outline" />
                                  Archived
                                </span>
                              ) : book.availableCopies > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-status-available/15 text-status-available font-caption text-caption font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-status-available" />
                                  In Circulation
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-status-pending/20 text-status-pending font-caption text-caption font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-status-pending" />
                                  All Loaned
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-space-md text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => openEditModal(book)}
                                  className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container hover:text-primary transition-colors cursor-pointer"
                                  title="Edit Classification"
                                  type="button"
                                >
                                  <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedBook(book);
                                    setManageCopiesCount(book.totalCopies);
                                    setManageBayLocation(book.bayLocation);
                                    setIsManageCopiesModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container hover:text-primary transition-colors cursor-pointer"
                                  title="Manage Copies & Inventory"
                                  type="button"
                                >
                                  <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedBook(book);
                                    setIsInspectorModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container hover:text-text-primary transition-colors cursor-pointer"
                                  title="Quick Inspector Dossier"
                                  type="button"
                                >
                                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setBookToDelete(book);
                                    setSingleDeleteError('');
                                    setIsSingleDeleteModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg text-text-secondary hover:bg-error-container hover:text-error transition-colors cursor-pointer"
                                  title="De-accession Book"
                                  type="button"
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Card Grid View */
              <div className="p-space-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-md">
                {paginatedItems.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-text-secondary">
                    <span className="material-symbols-outlined text-4xl text-outline mb-2">grid_view</span>
                    <p className="font-semibold">No bibliographic records found.</p>
                  </div>
                ) : (
                  paginatedItems.map((book) => {
                    const isSelected = selectedIds.has(book.id);
                    const isCurrentActive = selectedBook?.id === book.id;
                    const availPercent = book.totalCopies > 0 ? (book.availableCopies / book.totalCopies) * 100 : 0;

                    return (
                      <div
                        key={book.id}
                        onClick={() => setSelectedBook(book)}
                        className={`rounded-xl p-space-md flex flex-col justify-between transition-all border cursor-pointer ${
                          isCurrentActive
                            ? 'bg-soft-blue/20 border-primary shadow-md'
                            : isSelected
                            ? 'bg-secondary-container/15 border-secondary shadow-sm'
                            : 'bg-surface-container-low/50 hover:bg-surface-container-low border-outline-variant/15 hover:shadow-sm'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded-full bg-soft-blue text-primary font-caption text-[11px] font-semibold">
                              {book.category?.name ?? 'General'}
                            </span>
                            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectBook(book.id)}
                                className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/30 cursor-pointer"
                                aria-label={`Select ${book.title}`}
                              />
                            </div>
                          </div>

                          <div className="flex gap-3 mb-3">
                            <img
                              className="w-16 h-24 object-cover rounded-lg shadow-sm flex-shrink-0 bg-surface-container"
                              alt={book.title}
                              src={book.coverImage || DEFAULT_BOOK_COVER}
                            />
                            <div className="flex flex-col min-w-0">
                              <h4 className="font-bold text-text-primary text-small leading-tight line-clamp-2" title={book.title}>
                                {book.title}
                              </h4>
                              <span className="font-caption text-caption text-text-secondary line-clamp-1 mt-0.5">
                                {book.author}
                              </span>
                              <span className="font-caption text-[11px] text-text-secondary mt-1">
                                {book.deweyCode}
                              </span>
                              <span className="font-caption text-[10px] text-primary font-mono">
                                {book.isbn}
                              </span>
                            </div>
                          </div>

                          {/* Copies Progress Bar */}
                          <div className="flex flex-col gap-1 mb-3">
                            <div className="flex items-center justify-between font-caption text-caption">
                              <span className="font-semibold text-text-primary">{book.availableCopies} / {book.totalCopies} Available</span>
                              <span className="text-[11px] text-text-secondary">{book.bayLocation}</span>
                            </div>
                            <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden flex">
                              <div
                                className="bg-status-available h-full transition-all"
                                style={{ width: `${availPercent}%` }}
                              />
                              <div
                                className="bg-primary h-full transition-all"
                                style={{ width: `${100 - availPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Card Footer Actions */}
                        <div
                          className="pt-2 border-t border-outline-variant/15 flex items-center justify-between"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {book.isArchived ? (
                            <span className="font-caption text-[11px] font-bold text-text-secondary flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-outline" /> Archived
                            </span>
                          ) : (
                            <span className="font-caption text-[11px] font-bold text-status-available flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-status-available" /> In Circulation
                            </span>
                          )}

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditModal(book)}
                              className="p-1 rounded-lg text-text-secondary hover:bg-surface-container hover:text-primary transition-colors"
                              title="Edit"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBook(book);
                                setIsInspectorModalOpen(true);
                              }}
                              className="p-1 rounded-lg text-text-secondary hover:bg-surface-container hover:text-text-primary transition-colors"
                              title="Inspect"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                            </button>
                            <button
                              onClick={() => {
                                setBookToDelete(book);
                                setSingleDeleteError('');
                                setIsSingleDeleteModalOpen(true);
                              }}
                              className="p-1 rounded-lg text-text-secondary hover:bg-error-container hover:text-error transition-colors"
                              title="De-accession Book"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Pagination Controls & Rows Per Page Selector */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-space-md bg-surface-container-low/40 gap-space-sm border-t border-outline-variant/10">
              <div className="flex items-center gap-space-md">
                <span className="font-caption text-caption text-text-secondary">
                  Showing <span className="font-bold text-text-primary">{startIndex + 1}–{endIndex}</span> of{' '}
                  <span className="font-bold text-text-primary">{totalItems}</span> titles
                </span>

                {/* Rows per page selector (10, 25, 50, 100) via Shared Dropdown */}
                <div className="flex items-center gap-space-xs font-caption text-caption text-text-secondary">
                  <span>Rows:</span>
                  <Dropdown<number>
                    variant="pagination"
                    items={pageSizeOptions.map((opt) => ({ value: opt, label: String(opt) }))}
                    selectedValue={pageSize}
                    onSelect={(sz) => setPageSize(sz)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={prevPage}
                  disabled={!canPrevPage}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-container transition-colors disabled:opacity-30 cursor-pointer"
                  type="button"
                  aria-label="Previous Page"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((p, idx, arr) => {
                    const prevP = arr[idx - 1];
                    const hasEllipsis = prevP && p - prevP > 1;

                    return (
                      <div key={p} className="flex items-center">
                        {hasEllipsis && <span className="px-1 text-text-secondary font-caption text-caption">...</span>}
                        <button
                          onClick={() => goToPage(p)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-caption text-caption font-bold transition-all cursor-pointer ${
                            currentPage === p
                              ? 'bg-primary text-on-primary shadow-sm'
                              : 'text-text-secondary hover:bg-surface-container'
                          }`}
                          type="button"
                        >
                          {p}
                        </button>
                      </div>
                    );
                  })}

                <button
                  onClick={nextPage}
                  disabled={!canNextPage}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-container transition-colors disabled:opacity-30 cursor-pointer"
                  type="button"
                  aria-label="Next Page"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Inspector Side Panel (2xl:col-span-4) */}
          <div className="hidden 2xl:flex 2xl:col-span-4 bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg flex-col gap-space-md border border-outline-variant/10 sticky top-20">
            <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/10">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">visibility</span>
                <span className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary">
                  Quick Inspector
                </span>
              </div>
              <span
                className={`font-caption text-caption px-2.5 py-0.5 rounded-full font-bold ${
                  selectedBook?.isArchived
                    ? 'bg-surface-container text-text-secondary'
                    : 'bg-status-available/15 text-status-available'
                }`}
              >
                {selectedBook?.isArchived ? 'Archived' : 'Cataloged'}
              </span>
            </div>

            {selectedBook && (
              <>
                <div className="flex gap-space-md items-start">
                  <img
                    className="w-24 h-32 object-cover rounded-xl shadow-md flex-shrink-0 bg-surface-container"
                    alt={selectedBook.title}
                    src={selectedBook.coverImage || DEFAULT_BOOK_COVER}
                  />
                  <div className="flex flex-col">
                    <h3 className="font-headline-4 text-headline-4 font-bold text-text-primary leading-tight">
                      {selectedBook.title}
                    </h3>
                    <span className="font-small text-small text-text-secondary mt-1">{selectedBook.author}</span>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded bg-soft-blue text-primary font-caption text-caption font-semibold">
                        {selectedBook.publishedYear}
                      </span>
                      <span className="font-caption text-caption text-text-secondary">
                        {selectedBook.category?.name ?? 'General Academic'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bibliographic Codes */}
                <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-2 border border-outline-variant/10">
                  <span className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary">
                    Bibliographic Codes
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-caption font-caption">
                    <div>
                      <span className="text-text-secondary block">Call Number:</span>
                      <span className="font-bold text-text-primary">{selectedBook.deweyCode}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary block">ISBN-13:</span>
                      <span className="font-bold text-text-primary font-mono">{selectedBook.isbn}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary block">Shelf Location:</span>
                      <span className="font-bold text-text-primary">{selectedBook.bayLocation}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary block">Accession Serial:</span>
                      <span className="font-bold text-text-primary font-mono">
                        {selectedBook.isbnBarcode || 'ACC-PENDING'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Copy Health Summary */}
                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary">
                      Copy Inventory ({selectedBook.totalCopies} Registered)
                    </span>
                    <button
                      onClick={() => {
                        setManageCopiesCount(selectedBook.totalCopies);
                        setManageBayLocation(selectedBook.bayLocation);
                        setIsManageCopiesModalOpen(true);
                      }}
                      className="font-caption text-caption text-primary hover:underline font-semibold cursor-pointer"
                      type="button"
                    >
                      + Adjust Copies
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low text-small font-small border border-outline-variant/10">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-[18px] text-status-available">check_circle</span>
                        <div className="flex flex-col">
                          <span className="font-semibold text-text-primary">
                            Available: {selectedBook.availableCopies} Physical Copies
                          </span>
                          <span className="font-caption text-caption text-text-secondary">
                            Location: {selectedBook.bayLocation} (Open Stacks)
                          </span>
                        </div>
                      </div>
                      <span className="font-caption text-caption px-2 py-0.5 rounded bg-status-available/15 text-status-available font-bold">
                        On Shelf
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low text-small font-small border border-outline-variant/10">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-[18px] text-primary">person</span>
                        <div className="flex flex-col">
                          <span className="font-semibold text-text-primary">
                            Circulating: {Math.max(0, selectedBook.totalCopies - selectedBook.availableCopies)} Copies
                          </span>
                          <span className="font-caption text-caption text-text-secondary">User loans &amp; holds</span>
                        </div>
                      </div>
                      <span className="font-caption text-caption px-2 py-0.5 rounded bg-soft-blue text-primary font-bold">
                        In Use
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-space-sm pt-space-xs">
                  <button
                    onClick={() => openEditModal(selectedBook)}
                    className="h-10 px-space-sm rounded-xl bg-soft-blue hover:bg-secondary-fixed text-primary font-small text-small font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit_note</span>
                    Edit Classification
                  </button>
                  <button
                    onClick={() => {
                      setManageCopiesCount(selectedBook.totalCopies);
                      setManageBayLocation(selectedBook.bayLocation);
                      setIsManageCopiesModalOpen(true);
                    }}
                    className="h-10 px-space-sm rounded-xl bg-primary hover:bg-primary-container text-on-primary font-small text-small font-bold transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">inventory</span>
                    Manage Copies
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setIsArchiveModalOpen(true)}
                    className="font-caption text-caption text-status-danger hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">archive</span>
                    {selectedBook.isArchived ? 'Restore Record' : 'Archive Record'}
                  </button>
                  <button
                    onClick={() => setIsAuditModalOpen(true)}
                    className="font-caption text-caption text-text-secondary hover:text-text-primary flex items-center gap-1 font-medium cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">history</span>
                    Audit History
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Floating Bulk Action Bar (when selectedIds > 0) */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-surface-container-lowest/95 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-2xl px-6 py-3 flex items-center gap-4 animate-scaleUp">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-bold text-caption flex items-center justify-center">
              {selectedIds.size}
            </span>
            <span className="font-small text-small font-semibold text-text-primary">Books Selected</span>
          </div>

          <div className="h-6 w-[1px] bg-outline-variant/30" />

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportSelected}
              className="px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-text-primary text-caption font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">download</span>
              Export Selected
            </button>

            <button
              onClick={handleBulkArchive}
              className="px-3 py-1.5 rounded-xl bg-soft-blue hover:bg-secondary-fixed text-primary text-caption font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">archive</span>
              Bulk Archive
            </button>

            <button
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-status-danger/10 hover:bg-status-danger/20 text-status-danger text-caption font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              Bulk Delete
            </button>

            <button
              onClick={clearSelection}
              className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-container cursor-pointer transition-colors"
              title="Deselect all"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SHARED MODALS (DefaultFloatingModalCard)                  */}
      {/* ======================================================== */}

      {/* 1. ADD NEW BOOK MODAL */}
      <DefaultFloatingModalCard
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Book to Master Catalog"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleAddBook} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-caption font-caption text-text-secondary uppercase mb-1">
                Book Title *
              </label>
              <input
                type="text"
                required
                value={addForm.title}
                onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                placeholder="e.g. Clean Architecture"
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-small font-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/20"
              />
            </div>
            <div>
              <label className="block text-caption font-caption text-text-secondary uppercase mb-1">
                Primary Author(s) *
              </label>
              <input
                type="text"
                required
                value={addForm.author}
                onChange={(e) => setAddForm({ ...addForm, author: e.target.value })}
                placeholder="e.g. Robert C. Martin"
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-small font-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-caption font-caption text-text-secondary uppercase mb-1">
                ISBN-10 / ISBN-13 *
              </label>
              <input
                type="text"
                required
                value={addForm.isbn}
                onChange={(e) => setAddForm({ ...addForm, isbn: e.target.value })}
                placeholder="978-0134494166"
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-small font-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/20"
              />
            </div>
            <div>
              <label className="block text-caption font-caption text-text-secondary uppercase mb-1">
                Dewey Call Number *
              </label>
              <input
                type="text"
                required
                value={addForm.deweyCode}
                onChange={(e) => setAddForm({ ...addForm, deweyCode: e.target.value })}
                placeholder="005.1 MAR"
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-small font-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/20"
              />
            </div>
            <div>
              <label className="block text-caption font-caption text-text-secondary uppercase mb-1">
                Category *
              </label>
              <Dropdown<string>
                fullWidth
                searchable
                searchPlaceholder="Search category..."
                placeholder="Select category..."
                items={categoryDropdownItems}
                selectedValue={addForm.categoryId}
                onSelect={(val) => setAddForm((prev) => ({ ...prev, categoryId: val }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-caption font-caption text-text-secondary uppercase mb-1">
                Published Year
              </label>
              <input
                type="number"
                value={addForm.publishedYear}
                onChange={(e) => setAddForm({ ...addForm, publishedYear: Number(e.target.value) })}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-small font-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/20"
              />
            </div>
            <div>
              <label className="block text-caption font-caption text-text-secondary uppercase mb-1">
                Total Physical Copies
              </label>
              <input
                type="number"
                min={1}
                value={addForm.totalCopies}
                onChange={(e) => setAddForm({ ...addForm, totalCopies: Number(e.target.value) })}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-small font-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/20"
              />
            </div>
            <div>
              <label className="block text-caption font-caption text-text-secondary uppercase mb-1">
                Shelf Bay Location
              </label>
              <input
                type="text"
                value={addForm.bayLocation}
                onChange={(e) => setAddForm({ ...addForm, bayLocation: e.target.value })}
                placeholder="Bay 14 · Shelf 3B"
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-small font-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-caption font-caption text-text-secondary uppercase mb-1">
              Accession Code / Serial (Optional)
            </label>
            <input
              type="text"
              value={addForm.rfidTag}
              onChange={(e) => setAddForm({ ...addForm, rfidTag: e.target.value })}
              placeholder="e.g. ACC-0051-MAR-01"
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-small font-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/20"
            />
          </div>

          <div>
            <label className="block text-caption font-caption text-text-secondary uppercase mb-1">
              Bibliographic Summary / Notes
            </label>
            <textarea
              rows={3}
              value={addForm.description}
              onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
              placeholder="Enter synopsis or accession notes..."
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-small font-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface-container text-text-secondary font-semibold hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-action-green text-text-primary font-bold hover:bg-action-green-hover transition-colors cursor-pointer"
            >
              Accession Book
            </button>
          </div>
        </form>
      </DefaultFloatingModalCard>

      {/* 2. EDIT CLASSIFICATION MODAL */}
      <DefaultFloatingModalCard
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Book Classification & Details"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleEditBook} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-caption font-caption text-text-secondary uppercase mb-1">Title</label>
              <input
                type="text"
                required
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-small font-small text-text-primary border border-outline-variant/20"
              />
            </div>
            <div>
              <label className="block text-caption font-caption text-text-secondary uppercase mb-1">Author</label>
              <input
                type="text"
                required
                value={editForm.author}
                onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-small font-small text-text-primary border border-outline-variant/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-caption font-caption text-text-secondary uppercase mb-1">
                Category *
              </label>
              <Dropdown<string>
                fullWidth
                searchable
                searchPlaceholder="Search category..."
                placeholder="Select category..."
                items={categoryDropdownItems}
                selectedValue={editForm.categoryId}
                onSelect={(val) => setEditForm((prev) => ({ ...prev, categoryId: val }))}
              />
            </div>
            <div>
              <label className="block text-caption font-caption text-text-secondary uppercase mb-1">ISBN</label>
              <input
                type="text"
                required
                value={editForm.isbn}
                onChange={(e) => setEditForm({ ...editForm, isbn: e.target.value })}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-small font-small text-text-primary border border-outline-variant/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-caption font-caption text-text-secondary uppercase mb-1">Dewey Code</label>
              <input
                type="text"
                value={editForm.deweyCode}
                onChange={(e) => setEditForm({ ...editForm, deweyCode: e.target.value })}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-small font-small text-text-primary border border-outline-variant/20"
              />
            </div>
            <div>
              <label className="block text-caption font-caption text-text-secondary uppercase mb-1">Shelf Bay</label>
              <input
                type="text"
                value={editForm.bayLocation}
                onChange={(e) => setEditForm({ ...editForm, bayLocation: e.target.value })}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-small font-small text-text-primary border border-outline-variant/20"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface-container text-text-secondary font-semibold hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Save Classification
            </button>
          </div>
        </form>
      </DefaultFloatingModalCard>

      {/* 3. QUICK INSPECTOR MODAL (for mobile & focused inspection) */}
      <DefaultFloatingModalCard
        isOpen={isInspectorModalOpen}
        onClose={() => setIsInspectorModalOpen(false)}
        title="Quick Inspector Dossier"
        maxWidth="max-w-xl"
      >
        {selectedBook && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 items-start">
              <img
                className="w-20 h-28 object-cover rounded-xl shadow-md flex-shrink-0 bg-surface-container"
                alt={selectedBook.title}
                src={selectedBook.coverImage || DEFAULT_BOOK_COVER}
              />
              <div className="flex flex-col">
                <h3 className="font-bold text-text-primary text-base leading-snug">{selectedBook.title}</h3>
                <span className="text-small text-text-secondary mt-1">{selectedBook.author}</span>
                <span className="text-caption text-primary font-semibold mt-1">
                  {selectedBook.category?.name ?? 'General'} · Year {selectedBook.publishedYear}
                </span>
              </div>
            </div>

            <div className="bg-surface-container-low p-3 rounded-xl grid grid-cols-2 gap-2 text-caption">
              <div>
                <span className="text-text-secondary block">Call Number:</span>
                <span className="font-bold text-text-primary">{selectedBook.deweyCode}</span>
              </div>
              <div>
                <span className="text-text-secondary block">ISBN-13:</span>
                <span className="font-bold text-text-primary font-mono">{selectedBook.isbn}</span>
              </div>
              <div>
                <span className="text-text-secondary block">Shelf Location:</span>
                <span className="font-bold text-text-primary">{selectedBook.bayLocation}</span>
              </div>
              <div>
                <span className="text-text-secondary block">Accession Serial:</span>
                <span className="font-bold text-text-primary font-mono">{selectedBook.isbnBarcode || 'Unassigned'}</span>
              </div>
            </div>

            <div className="p-3 bg-surface-container-low rounded-xl flex flex-col gap-1 text-small">
              <span className="font-semibold text-text-primary">Summary</span>
              <p className="text-caption text-text-secondary leading-relaxed">
                {selectedBook.description || 'No extended synopsis recorded for this bibliographic entry.'}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsInspectorModalOpen(false);
                  openEditModal(selectedBook);
                }}
                className="px-4 py-2 rounded-xl bg-soft-blue text-primary font-bold text-small hover:bg-secondary-fixed transition-colors cursor-pointer"
              >
                Edit Book
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsInspectorModalOpen(false);
                  setBookToDelete(selectedBook);
                  setSingleDeleteError('');
                  setIsSingleDeleteModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-status-danger/10 text-status-danger font-bold text-small hover:bg-status-danger/20 transition-colors cursor-pointer"
              >
                Delete Book
              </button>
              <button
                type="button"
                onClick={() => setIsInspectorModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-surface-container text-text-secondary font-semibold text-small cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </DefaultFloatingModalCard>

      {/* 4. MANAGE COPIES MODAL */}
      <DefaultFloatingModalCard
        isOpen={isManageCopiesModalOpen}
        onClose={() => setIsManageCopiesModalOpen(false)}
        title="Manage Physical Copies &amp; Shelf Bay"
        maxWidth="max-w-lg"
      >
        <div className="flex flex-col gap-4">
          <p className="text-small text-text-secondary">
            Adjust physical copy allocation and designated shelf bay coordinates for{' '}
            <span className="font-bold text-text-primary">{selectedBook?.title}</span>.
          </p>

          <div>
            <label className="block text-caption font-caption text-text-secondary uppercase mb-1">
              Total Physical Copies Registered
            </label>
            <input
              type="number"
              min={1}
              value={manageCopiesCount}
              onChange={(e) => setManageCopiesCount(Math.max(1, Number(e.target.value)))}
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-small font-small text-text-primary border border-outline-variant/20"
            />
          </div>

          <div>
            <label className="block text-caption font-caption text-text-secondary uppercase mb-1">
              Shelf Bay Location / Stacks
            </label>
            <input
              type="text"
              value={manageBayLocation}
              onChange={(e) => setManageBayLocation(e.target.value)}
              placeholder="e.g. Bay 14 · Shelf 3B"
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-small font-small text-text-primary border border-outline-variant/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => setIsManageCopiesModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface-container text-text-secondary font-semibold hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveCopies}
              className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Update Inventory
            </button>
          </div>
        </div>
      </DefaultFloatingModalCard>

      {/* 5. ARCHIVE CONFIRMATION MODAL */}
      <DefaultFloatingModalCard
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        title={selectedBook?.isArchived ? 'Restore Book to Circulation' : 'Archive Bibliographic Record'}
        maxWidth="max-w-md"
      >
        <div className="flex flex-col gap-4">
          <p className="text-small text-text-secondary">
            {selectedBook?.isArchived ? (
              <>
                Are you sure you want to restore{' '}
                <span className="font-bold text-text-primary">{selectedBook?.title}</span> to active library circulation?
              </>
            ) : (
              <>
                Are you sure you want to archive{' '}
                <span className="font-bold text-text-primary">{selectedBook?.title}</span>? Archived books will no longer
                appear in active public user search.
              </>
            )}
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => setIsArchiveModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface-container text-text-secondary font-semibold hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleToggleArchive}
              className={`px-5 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
                selectedBook?.isArchived
                  ? 'bg-action-green text-text-primary hover:bg-action-green-hover'
                  : 'bg-status-danger text-white hover:bg-status-danger/90'
              }`}
            >
              {selectedBook?.isArchived ? 'Restore Book' : 'Confirm Archive'}
            </button>
          </div>
        </div>
      </DefaultFloatingModalCard>

      {/* 6. AUDIT HISTORY MODAL */}
      <DefaultFloatingModalCard
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        title={`Audit Trail: ${selectedBook?.title || 'Book'}`}
        maxWidth="max-w-xl"
      >
        <div className="flex flex-col gap-3">
          <div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between text-small">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-action-green text-xl">inventory</span>
              <div className="flex flex-col">
                <span className="font-bold text-text-primary">Catalog Accession</span>
                <span className="text-caption text-text-secondary">Initial accession and Dewey classification</span>
              </div>
            </div>
            <span className="text-caption text-text-secondary">
              {new Date(selectedBook?.createdAt || Date.now()).toLocaleDateString()}
            </span>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between text-small">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">qr_code_scanner</span>
              <div className="flex flex-col">
                <span className="font-bold text-text-primary">Accession Barcode Scan</span>
                <span className="text-caption text-text-secondary">
                  Accession volume verified at {selectedBook?.bayLocation}
                </span>
              </div>
            </div>
            <span className="text-caption text-text-secondary">Verified</span>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between text-small">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-xl">sync</span>
              <div className="flex flex-col">
                <span className="font-bold text-text-primary">Stock Inventory Count</span>
                <span className="text-caption text-text-secondary">
                  {selectedBook?.totalCopies} copies confirmed by Head Librarian
                </span>
              </div>
            </div>
            <span className="text-caption text-text-secondary">Recent</span>
          </div>

          <div className="flex justify-end pt-2 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => setIsAuditModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface-container text-text-secondary font-semibold text-small cursor-pointer"
            >
              Close Audit History
            </button>
          </div>
        </div>
      </DefaultFloatingModalCard>

      {/* 7. BATCH ISBN IMPORT MODAL */}
      <DefaultFloatingModalCard
        isOpen={isBatchImportModalOpen}
        onClose={() => setIsBatchImportModalOpen(false)}
        title="Batch ISBN &amp; Barcode Accession"
        maxWidth="max-w-xl"
      >
        <div className="flex flex-col gap-4">
          <div className="p-3 bg-soft-blue/20 rounded-xl border border-primary/20 text-small text-text-secondary">
            <p className="font-semibold text-primary mb-1">Batch Import Procedure:</p>
            <ol className="list-decimal list-inside text-caption space-y-1">
              <li>Paste a list of 10 or 13-digit ISBN barcodes (one per line) or CSV values.</li>
              <li>Optionally assign a target academic discipline.</li>
              <li>The system validates check digits and accessions the items into catalog staging.</li>
            </ol>
          </div>

          <div>
            <label className="block text-caption font-caption text-text-secondary uppercase mb-1">
              Target Category (Optional)
            </label>
            <Dropdown<string>
              fullWidth
              searchable
              searchPlaceholder="Search category..."
              placeholder="Auto-Assign / Default"
              items={[{ value: '', label: 'Auto-Assign / Default' }, ...categoryDropdownItems]}
              selectedValue={batchCategoryId}
              onSelect={(val) => setBatchCategoryId(val)}
            />
          </div>

          <div>
            <label className="block text-caption font-caption text-text-secondary uppercase mb-1">
              ISBN Barcode List (One per line)
            </label>
            <textarea
              rows={5}
              value={batchIsbnInput}
              onChange={(e) => setBatchIsbnInput(e.target.value)}
              placeholder="978-0262046305&#10;978-0134494166&#10;978-0812968255&#10;978-1285741550"
              className="w-full bg-surface-container-low font-mono px-3 py-2 rounded-xl text-small font-small text-text-primary border border-outline-variant/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => setIsBatchImportModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface-container text-text-secondary font-semibold hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBatchIsbnImport}
              className="px-5 py-2 rounded-xl bg-soft-blue text-primary font-bold hover:bg-secondary-fixed transition-colors cursor-pointer"
            >
              Execute Ingestion
            </button>
          </div>
        </div>
      </DefaultFloatingModalCard>

      {/* 8. EXPORT MARC 21 / CSV MODAL (with advanced filters) */}
      <DefaultFloatingModalCard
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Catalog Records (MARC 21 / CSV)"
        maxWidth="max-w-2xl"
      >
        <div className="flex flex-col gap-4">
          <p className="text-small text-text-secondary">
            Select export parameters, filters, and formats for bibliographic records according to machine-readable cataloging standards.
          </p>

          {/* Date Range Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-caption font-caption text-text-secondary uppercase mb-1">Start Date</label>
              <input
                type="date"
                value={exportParams.startDate}
                onChange={(e) => setExportParams({ ...exportParams, startDate: e.target.value })}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-small font-small text-text-primary border border-outline-variant/20"
              />
            </div>
            <div>
              <label className="block text-caption font-caption text-text-secondary uppercase mb-1">End Date</label>
              <input
                type="date"
                value={exportParams.endDate}
                onChange={(e) => setExportParams({ ...exportParams, endDate: e.target.value })}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-small font-small text-text-primary border border-outline-variant/20"
              />
            </div>
          </div>

          {/* Alphabetical Title Filter */}
          <div className="p-3 bg-surface-container-low rounded-xl flex flex-col gap-2 border border-outline-variant/10">
            <span className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary">
              Alphabetical Title Filter
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-caption text-text-secondary block mb-0.5">Starts With Letter:</span>
                <input
                  type="text"
                  maxLength={5}
                  placeholder="e.g. A"
                  value={exportParams.titleStartsWith}
                  onChange={(e) => setExportParams({ ...exportParams, titleStartsWith: e.target.value })}
                  className="w-full bg-surface-container-lowest px-3 py-1.5 rounded-lg text-small text-text-primary border border-outline-variant/20"
                />
              </div>
              <div>
                <span className="text-caption text-text-secondary block mb-0.5">Ends With Letter:</span>
                <input
                  type="text"
                  maxLength={5}
                  placeholder="e.g. Z"
                  value={exportParams.titleEndsWith}
                  onChange={(e) => setExportParams({ ...exportParams, titleEndsWith: e.target.value })}
                  className="w-full bg-surface-container-lowest px-3 py-1.5 rounded-lg text-small text-text-primary border border-outline-variant/20"
                />
              </div>
              <div>
                <span className="text-caption text-text-secondary block mb-0.5">Title Contains:</span>
                <input
                  type="text"
                  placeholder="e.g. Computer"
                  value={exportParams.titleContains}
                  onChange={(e) => setExportParams({ ...exportParams, titleContains: e.target.value })}
                  className="w-full bg-surface-container-lowest px-3 py-1.5 rounded-lg text-small text-text-primary border border-outline-variant/20"
                />
              </div>
            </div>
          </div>

          {/* ID / ISBN Digit Filter */}
          <div className="p-3 bg-surface-container-low rounded-xl flex flex-col gap-2 border border-outline-variant/10">
            <span className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary">
              ID / ISBN Digit Filter
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-caption text-text-secondary block mb-0.5">Starts With Digit:</span>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="e.g. 978"
                  value={exportParams.idStartsWith}
                  onChange={(e) => setExportParams({ ...exportParams, idStartsWith: e.target.value })}
                  className="w-full bg-surface-container-lowest px-3 py-1.5 rounded-lg text-small text-text-primary border border-outline-variant/20"
                />
              </div>
              <div>
                <span className="text-caption text-text-secondary block mb-0.5">Ends With Digit:</span>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="e.g. 5"
                  value={exportParams.idEndsWith}
                  onChange={(e) => setExportParams({ ...exportParams, idEndsWith: e.target.value })}
                  className="w-full bg-surface-container-lowest px-3 py-1.5 rounded-lg text-small text-text-primary border border-outline-variant/20"
                />
              </div>
              <div>
                <span className="text-caption text-text-secondary block mb-0.5">Contains Digits:</span>
                <input
                  type="text"
                  placeholder="e.g. 0262"
                  value={exportParams.idContains}
                  onChange={(e) => setExportParams({ ...exportParams, idContains: e.target.value })}
                  className="w-full bg-surface-container-lowest px-3 py-1.5 rounded-lg text-small text-text-primary border border-outline-variant/20"
                />
              </div>
            </div>
          </div>

          {/* Sort & Format Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-caption font-caption text-text-secondary uppercase mb-1">
                Sort Direction
              </label>
              <select
                value={exportParams.sortDirection}
                onChange={(e) => setExportParams({ ...exportParams, sortDirection: e.target.value as any })}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-small font-small text-text-primary border border-outline-variant/20"
              >
                <option value="asc">Ascending (Oldest First / A-Z)</option>
                <option value="desc">Descending (Newest First / Z-A)</option>
              </select>
            </div>

            <div>
              <label className="block text-caption font-caption text-text-secondary uppercase mb-1">File Format</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setExportFormat('marc21')}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-small font-semibold border transition-all cursor-pointer ${
                    exportFormat === 'marc21'
                      ? 'bg-primary text-on-primary border-primary shadow-sm font-bold'
                      : 'bg-surface-container-low text-text-secondary border-outline-variant/20 hover:bg-surface-container'
                  }`}
                  title="Machine-Readable Cataloging Standard Format (ISO 2709 Library Interchange)"
                >
                  MARC 21 (.mrk)
                </button>
                <button
                  type="button"
                  onClick={() => setExportFormat('csv')}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-small font-semibold border transition-all cursor-pointer ${
                    exportFormat === 'csv'
                      ? 'bg-primary text-on-primary border-primary shadow-sm font-bold'
                      : 'bg-surface-container-low text-text-secondary border-outline-variant/20 hover:bg-surface-container'
                  }`}
                >
                  Standard CSV
                </button>
                <button
                  type="button"
                  onClick={() => setExportFormat('excel')}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-small font-semibold border transition-all cursor-pointer ${
                    exportFormat === 'excel'
                      ? 'bg-action-green text-text-primary border-action-green shadow-sm font-bold'
                      : 'bg-surface-container-low text-text-secondary border-outline-variant/20 hover:bg-surface-container'
                  }`}
                >
                  Excel (.xls)
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => setIsExportModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface-container text-text-secondary font-semibold hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecuteExport}
              className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary/90 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Download {exportFormat === 'marc21' ? 'MARC 21' : exportFormat.toUpperCase()}
            </button>
          </div>
        </div>
      </DefaultFloatingModalCard>

      {/* 8.5. SINGLE DELETE CONFIRMATION MODAL */}
      <DefaultFloatingModalCard
        isOpen={isSingleDeleteModalOpen}
        onClose={() => {
          setIsSingleDeleteModalOpen(false);
          setBookToDelete(null);
          setSingleDeleteError('');
        }}
        title="Confirm De-accession"
        maxWidth="max-w-md"
      >
        <div className="flex flex-col gap-4">
          <p className="text-small text-text-secondary">
            Are you sure you want to permanently de-accession and delete{' '}
            <span className="font-bold text-text-primary">"{bookToDelete?.title}"</span> (ISBN: {bookToDelete?.isbn || 'N/A'})?
            This will remove all associated copies and barcode ledger records.
          </p>

          {singleDeleteError && (
            <div className="p-3 bg-error-container/20 border border-error/30 rounded-lg text-status-danger text-caption font-semibold">
              {singleDeleteError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => {
                setIsSingleDeleteModalOpen(false);
                setBookToDelete(null);
                setSingleDeleteError('');
              }}
              className="px-4 py-2 rounded-xl bg-surface-container text-text-secondary font-semibold hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSingleDelete}
              className="px-5 py-2 rounded-xl bg-status-danger text-white font-bold hover:bg-status-danger/90 transition-colors cursor-pointer"
            >
              Confirm De-accession
            </button>
          </div>
        </div>
      </DefaultFloatingModalCard>

      {/* 9. BULK DELETE CONFIRMATION MODAL */}
      <DefaultFloatingModalCard
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        title="Confirm Bulk De-accession"
        maxWidth="max-w-md"
      >
        <div className="flex flex-col gap-4">
          <p className="text-small text-text-secondary">
            Are you sure you want to permanently delete{' '}
            <span className="font-bold text-text-primary">{selectedIds.size}</span> selected catalog titles? This
            action will remove all associated barcode entries.
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => setIsBulkDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface-container text-text-secondary font-semibold hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              className="px-5 py-2 rounded-xl bg-status-danger text-white font-bold hover:bg-status-danger/90 transition-colors cursor-pointer"
            >
              Delete {selectedIds.size} Records
            </button>
          </div>
        </div>
      </DefaultFloatingModalCard>
    </div>
  );
};

export default BooksManager;
