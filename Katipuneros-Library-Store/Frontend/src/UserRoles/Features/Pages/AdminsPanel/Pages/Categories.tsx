// [Layer: UserRoles/Features/Pages/AdminsPanel/Pages]
// Categories.tsx -- Admin Book Categories and Dewey Classes
// Real-time integration with .NET 10 Categories and Books Web API.
// Strictly adheres to real-time data mandate: if database is empty, renders 0 / empty state.
// Obeying all shared component, hooks, and no-static-data rules from AGENTS.md & Ideas to prompt.txt.

import React, { FC, useState, useEffect, useMemo, useCallback } from 'react';
import { getCategories, getCatalogBooks, BackendCategory, BackendBook } from '../../../../../Endpoints/booksApi';
import { adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '../../../../../Endpoints/Admin/cmsApi';
import { usePagesGlobalRefresh } from '../../../../../Hooks/usePagesGlobalRefresh';
import { useDebounce } from '../../../../../Hooks/useDebounce';
import { usePagination } from '../../../../../Hooks/usePagination';
import { DefaultFloatingModalCard } from '../../../../../Shared/DefaultFloatingModalCard';
import { SearchBar } from '../../../../../Shared/SearchBar';
import { Dropdown, DropdownItem } from '../../../../../Shared/Dropdown';

const EXPORT_OPTIONS: DropdownItem<'json' | 'csv'>[] = [
  { value: 'json', label: 'JSON Concordance', icon: 'data_object' },
  { value: 'csv', label: 'CSV Master Index', icon: 'table_view' },
];

const PAGE_SIZE_OPTIONS: DropdownItem<number>[] = [
  { value: 10, label: '10 rows per page' },
  { value: 25, label: '25 rows per page' },
  { value: 50, label: '50 rows per page' },
  { value: 100, label: '100 rows per page' },
];

const Categories: FC = () => {
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [books, setBooks] = useState<BackendBook[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 250);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'stem' | 'humanities' | 'filipiniana'>('all');

  // Modal State (Add)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formName, setFormName] = useState<string>('');
  const [formSubFields, setFormSubFields] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Edit Modal State
  const [editingCategory, setEditingCategory] = useState<BackendCategory | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editFormName, setEditFormName] = useState<string>('');
  const [editFormSubFields, setEditFormSubFields] = useState<string>('');
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load Real Data from Endpoints
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [catsData, booksData] = await Promise.all([
        getCategories(),
        getCatalogBooks(),
      ]);
      setCategories(catsData || []);
      setBooks(booksData || []);
      if (catsData && catsData.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(catsData[0].id);
      }
    } catch (err) {
      console.error('Failed to load categories or books from API ledger:', err);
      setCategories([]);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Hook global refresh on network reconnection or window focus
  usePagesGlobalRefresh(loadData);

  // Compute Metrics strictly using formulas defined in ADMIN DATA SHOW FORMULA.md
  // Metric 3.1: Total Disciplines
  const totalDisciplines = categories.length;

  // Metric 3.2: Indexed Titles (Books with valid CategoryId)
  const indexedTitles = useMemo(
    () => books.filter((b) => b.categoryId && b.categoryId !== '00000000-0000-0000-0000-000000000000').length,
    [books]
  );

  // Metric 3.3: Physical Holdings (Sum of TotalCopies for classified titles)
  const physicalHoldings = useMemo(
    () =>
      books
        .filter((b) => b.categoryId && b.categoryId !== '00000000-0000-0000-0000-000000000000')
        .reduce((acc, b) => acc + (b.totalCopies || 0), 0),
    [books]
  );

  // Metric 3.4: Classification Standard
  const classificationStandard = categories.length > 0 ? 'Institution Taxonomy' : '—';

  // Metric 3.5: Concordance Accuracy (Percentage of titles with valid category association)
  const concordanceAccuracy = useMemo(() => {
    if (books.length === 0) return '0.0%';
    const conforming = books.filter(
      (b) => b.categoryId && b.categoryId !== '00000000-0000-0000-0000-000000000000'
    ).length;
    return `${((conforming / books.length) * 100).toFixed(1)}%`;
  }, [books]);

  // Filter & Search Logic with Debounce
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const q = debouncedSearchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        c.name.toLowerCase().includes(q) ||
        c.deweyRange.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (activeFilter === 'stem') {
        return /computer|science|technology|math|engineering|physics|biology|it|stem/i.test(
          c.name + ' ' + (c.description || '')
        );
      }
      if (activeFilter === 'humanities') {
        return /philosophy|religion|art|literature|history|social|music|language/i.test(
          c.name + ' ' + (c.description || '')
        );
      }
      if (activeFilter === 'filipiniana') {
        return /filipiniana|philippine|rizal|tagalog|katipunan/i.test(c.name + ' ' + (c.description || ''));
      }

      return true;
    });
  }, [categories, debouncedSearchQuery, activeFilter]);

  // Pagination hook integration
  const pagination = usePagination(filteredCategories, {
    initialPage: 1,
    initialPageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  });

  // Selected Category Object
  const selectedCategory = useMemo(() => {
    return categories.find((c) => c.id === selectedCategoryId) || (categories.length > 0 ? categories[0] : null);
  }, [categories, selectedCategoryId]);

  // Books in selected category
  const selectedCategoryBooks = useMemo(() => {
    if (!selectedCategory) return [];
    return books.filter((b) => b.categoryId === selectedCategory.id || (b.category && b.category.id === selectedCategory.id));
  }, [books, selectedCategory]);

  const selectedCategoryCopies = useMemo(() => {
    return selectedCategoryBooks.reduce((acc, b) => acc + (b.totalCopies || 0), 0);
  }, [selectedCategoryBooks]);

  const selectedBaySaturation = useMemo(() => {
    if (selectedCategoryCopies === 0) return 0;
    const estimatedCapacity = Math.max(selectedCategoryCopies * 1.25, 20);
    return Math.min(100, Math.round((selectedCategoryCopies / estimatedCapacity) * 100));
  }, [selectedCategoryCopies]);

  // Form Submit Handler
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Please enter a category name.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const res = await adminCreateCategory({
        name: formName.trim(),
        description: formSubFields.trim(),
      });

      if (res.success) {
        setIsModalOpen(false);
        setFormName('');
        setFormSubFields('');
        await loadData();
        setToast({ message: 'Category registered successfully.', type: 'success' });
      } else {
        setFormError(res.message || 'Failed to register category.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while saving.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Category Triggers & Handlers
  const handleOpenEditModal = (c: BackendCategory) => {
    setEditingCategory(c);
    setEditFormName(c.name || '');
    setEditFormSubFields(c.description || '');
    setEditFormError(null);
    setIsEditModalOpen(true);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!editFormName.trim()) {
      setEditFormError('Please enter a category name.');
      return;
    }

    try {
      setIsEditSubmitting(true);
      setEditFormError(null);

      const res = await adminUpdateCategory(editingCategory.id, {
        name: editFormName.trim(),
        description: editFormSubFields.trim(),
      });

      if (res.success) {
        setIsEditModalOpen(false);
        setEditingCategory(null);
        await loadData();
        setToast({ message: 'Category updated successfully.', type: 'success' });
      } else {
        setEditFormError(res.message || 'Failed to update category.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while updating.';
      setEditFormError(msg);
    } finally {
      setIsEditSubmitting(false);
    }
  };

  // Delete Category Trigger
  const handleDeleteCategory = (id: string, name: string) => {
    setCategoryToDelete({ id, name });
  };

  // Confirm Delete Category Handler
  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      const res = await adminDeleteCategory(categoryToDelete.id);
      if (res.success) {
        if (selectedCategoryId === categoryToDelete.id) {
          setSelectedCategoryId(null);
        }
        await loadData();
        setToast({ message: 'Discipline category de-accessioned.', type: 'success' });
      } else {
        setToast({ message: res.message || 'Failed to remove category.', type: 'error' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during deletion.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setIsDeleting(false);
      setCategoryToDelete(null);
    }
  };

  // Export handlers
  const handleExportSelect = (type: 'json' | 'csv') => {
    if (type === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(categories, null, 2));
      const dl = document.createElement('a');
      dl.setAttribute('href', dataStr);
      dl.setAttribute('download', `katipuneros_taxonomy_${new Date().toISOString().slice(0, 10)}.json`);
      dl.click();
      setToast({ message: 'JSON Concordance exported.', type: 'success' });
    } else if (type === 'csv') {
      const headers = ['ID', 'CategoryCode', 'Name', 'SubjectHeadings'];
      const rows = categories.map((c) => [
        `"${c.id}"`,
        `"${c.deweyRange}"`,
        `"${c.name.replace(/"/g, '""')}"`,
        `"${(c.description || '').replace(/"/g, '""')}"`,
      ]);
      const csvContent =
        'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const dl = document.createElement('a');
      dl.setAttribute('href', encodeURI(csvContent));
      dl.setAttribute('download', `katipuneros_taxonomy_${new Date().toISOString().slice(0, 10)}.csv`);
      dl.click();
      setToast({ message: 'CSV Master Index exported.', type: 'success' });
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
        {/* Toast Feedback Alert */}
        {toast && (
          <div
            className={`p-space-sm rounded-xl font-small text-small flex items-center gap-space-xs transition-all shadow-md mb-space-md ${
              toast.type === 'success'
                ? 'bg-action-green/20 text-text-primary border border-action-green/40'
                : 'bg-error-container text-error border border-error/40'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {toast.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{toast.message}</span>
          </div>
        )}

        {/* Header Breadcrumb & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-xl">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs text-caption font-caption text-text-secondary uppercase tracking-wider mb-1">
              <span>Admin Console</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span>Management</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-primary font-bold">Categories</span>
            </div>
            <h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight font-bold">
              Academic Disciplines &amp; Catalog Classification
            </h1>
            <p className="font-small text-small text-text-secondary mt-0.5">
              Manage hierarchical ontology, Dewey Decimal ranges, and physical repository bay allocations.
            </p>
          </div>
          <div className="flex items-center flex-wrap gap-space-sm">
            {/* Shared Dropdown for Export Schema */}
            <Dropdown<'json' | 'csv'>
              items={EXPORT_OPTIONS}
              onSelect={handleExportSelect}
              trigger={
                <button
                  className="h-11 px-space-md bg-surface-container-lowest text-primary font-small text-small font-semibold rounded-xl shadow-sm hover:bg-soft-blue flex items-center gap-space-xs transition-colors cursor-pointer border border-outline-variant/15"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">ios_share</span>
                  <span>Export Schema</span>
                  <span className="material-symbols-outlined text-[16px]">expand_more</span>
                </button>
              }
            />
            <button
              className="h-11 px-space-lg bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-bold rounded-xl shadow-sm flex items-center gap-space-xs transition-all transform active:scale-95 cursor-pointer"
              id="openCreateModal"
              type="button"
              onClick={() => {
                setFormError(null);
                setIsModalOpen(true);
              }}
            >
              <span className="material-symbols-outlined text-[20px] font-bold">add</span>
              <span>Add Category</span>
            </button>
          </div>
        </div>

        {/* 4 Real-Time KPI Cards strictly calculated from real ledger data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md mb-space-xl">
          {/* Card 1: Total Disciplines */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                  Total Disciplines
                </span>
                <div className="flex items-baseline gap-space-xs mt-1">
                  <span className="font-headline-2 text-headline-2 text-text-primary tracking-tight font-bold">
                    {totalDisciplines}
                  </span>
                  <span className="font-caption text-caption text-status-available font-bold uppercase">
                    {totalDisciplines > 0 ? 'Active Class' : 'Empty'}
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-soft-blue text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">category</span>
              </div>
            </div>
            <div className="flex items-center gap-space-xs mt-4 font-caption text-caption text-text-secondary">
              <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
              <span>{totalDisciplines > 0 ? `${totalDisciplines} classifications cataloged` : 'No categories in ledger'}</span>
            </div>
          </div>

          {/* Card 2: Indexed Titles */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                  Indexed Titles
                </span>
                <div className="flex items-baseline gap-space-xs mt-1">
                  <span className="font-headline-2 text-headline-2 text-text-primary tracking-tight font-bold">
                    {indexedTitles.toLocaleString()}
                  </span>
                  <span className="font-caption text-caption text-primary font-semibold">Volumes</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">menu_book</span>
              </div>
            </div>
            <div className="flex items-center gap-space-xs mt-4 font-caption text-caption text-text-secondary">
              <span className="material-symbols-outlined text-[16px] text-status-available">trending_up</span>
              <span>{books.length > 0 ? `${books.length} total titles on file` : 'No titles cataloged'}</span>
            </div>
          </div>

          {/* Card 3: Physical Holdings */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                  Physical Holdings
                </span>
                <div className="flex items-baseline gap-space-xs mt-1">
                  <span className="font-headline-2 text-headline-2 text-text-primary tracking-tight font-bold">
                    {physicalHoldings.toLocaleString()}
                  </span>
                  <span className="font-caption text-caption text-text-secondary">Assets</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-surface-container text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">inventory_2</span>
              </div>
            </div>
            <div className="flex items-center gap-space-xs mt-4 font-caption text-caption text-text-secondary">
              <span className="material-symbols-outlined text-[16px] text-secondary">domain</span>
              <span>{physicalHoldings > 0 ? 'Active repository bay allocations' : 'Stacks empty'}</span>
            </div>
          </div>

          {/* Card 4: Classification Standard & Concordance */}
          <div className="bg-primary text-on-primary p-space-lg rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-caption text-caption text-primary-fixed uppercase tracking-wider font-semibold">
                  Classification Standard
                </span>
                <p className="font-headline-4 text-headline-4 font-bold text-on-primary mt-1 tracking-tight leading-snug">
                  {classificationStandard}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-on-primary/10 text-on-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">hub</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-2">
              <span className="font-caption text-caption text-primary-fixed">Concordance Accuracy</span>
              <span className="font-caption text-caption font-bold bg-action-green text-text-primary px-2 py-0.5 rounded-full">
                {concordanceAccuracy}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content: Table on Left (8 cols) + Inspector Drawer on Right (4 cols) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
          <div className="xl:col-span-8 flex flex-col gap-space-md">
            {/* Search and Filters with Shared SearchBar and useDebounce */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-space-md border border-outline-variant/15">
              <div className="w-full sm:w-80">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search call code, discipline, keyword..."
                  shortcutKey="⌘K"
                />
              </div>
              <div className="flex items-center gap-space-xs w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <button
                  className={`px-3 py-1.5 rounded-full font-caption text-caption font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-low text-text-secondary hover:text-text-primary'
                  }`}
                  type="button"
                  onClick={() => setActiveFilter('all')}
                >
                  All Classes ({categories.length})
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full font-caption text-caption font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    activeFilter === 'stem'
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-low text-text-secondary hover:text-text-primary'
                  }`}
                  type="button"
                  onClick={() => setActiveFilter('stem')}
                >
                  STEM Ranges
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full font-caption text-caption font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    activeFilter === 'humanities'
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-low text-text-secondary hover:text-text-primary'
                  }`}
                  type="button"
                  onClick={() => setActiveFilter('humanities')}
                >
                  Humanities
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full font-caption text-caption font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    activeFilter === 'filipiniana'
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-low text-text-secondary hover:text-text-primary'
                  }`}
                  type="button"
                  onClick={() => setActiveFilter('filipiniana')}
                >
                  Filipiniana
                </button>
              </div>
            </div>

            {/* Real-Time Table */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/15">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container text-text-secondary font-caption text-caption uppercase tracking-wider select-none">
                      <th className="py-space-md px-space-md font-semibold">Category ID</th>
                      <th className="py-space-md px-space-md font-semibold">Category Name</th>
                      <th className="py-space-md px-space-sm font-semibold text-center">Subject Headings</th>
                      <th className="py-space-md px-space-md font-semibold">Circulation</th>
                      <th className="py-space-md px-space-sm font-semibold text-center">Status</th>
                      <th className="py-space-md px-space-md font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-low font-small text-small text-text-primary" id="categoriesTableBody">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-text-secondary">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[32px] animate-spin text-primary">sync</span>
                            <span>Synchronizing classification taxonomy with database...</span>
                          </div>
                        </td>
                      </tr>
                    ) : pagination.paginatedItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-text-secondary font-small">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[40px] text-text-secondary/40">category</span>
                            <p className="font-semibold text-text-primary">
                              {categories.length === 0 ? 'No Categories Registered' : 'No matching categories found'}
                            </p>
                            <p className="text-caption text-text-secondary max-w-sm">
                              {categories.length === 0
                                ? 'The ledger is empty. Click "+ Add Category" above to register real-time categories and subject headings.'
                                : 'No categories match the active search or filter criteria.'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      pagination.paginatedItems.map((c) => {
                        const catBooks = books.filter((b) => b.categoryId === c.id || (b.category && b.category.id === c.id));
                        const titlesCount = catBooks.length;
                        const copiesCount = catBooks.reduce((sum, b) => sum + (b.totalCopies || 0), 0);
                        const availCopies = catBooks.reduce((sum, b) => sum + (b.availableCopies || 0), 0);
                        const circCount = Math.max(0, copiesCount - availCopies);
                        const circRate = copiesCount > 0 ? Math.round((circCount / copiesCount) * 100) : 0;
                        const subFieldsList = c.description
                          ? c.description
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean)
                          : [];
                        const isSelected = selectedCategory?.id === c.id;

                        return (
                          <tr
                            key={c.id}
                            className={`category-row hover:bg-surface-container-low/70 transition-colors cursor-pointer ${
                              isSelected ? 'bg-soft-blue/25 font-medium' : ''
                            }`}
                            onClick={() => setSelectedCategoryId(c.id)}
                          >
                            <td className="py-3.5 px-space-md">
                              <span className="font-caption text-caption font-mono font-bold px-2 py-1 bg-surface-container rounded text-primary">
                                {c.deweyRange}
                              </span>
                            </td>
                            <td className="py-3.5 px-space-md">
                              <span className="font-small text-small font-bold text-text-primary">{c.name}</span>
                            </td>
                            <td className="py-3.5 px-space-sm text-center">
                              <span className="px-2 py-0.5 rounded-full bg-surface-container font-caption text-caption font-medium">
                                {subFieldsList.length > 0 ? subFieldsList.length : '—'}
                              </span>
                            </td>
                            <td className="py-3.5 px-space-md">
                              <div className="flex items-center gap-space-xs">
                                <div className="w-16 h-2 rounded-full bg-surface-container overflow-hidden">
                                  <div
                                    className="h-full bg-action-green rounded-full transition-all"
                                    style={{ width: `${circRate}%` }}
                                  ></div>
                                </div>
                                <span className="font-caption text-caption font-bold text-text-primary">{circRate}%</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-space-sm text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full font-caption text-caption font-bold bg-status-available/20 text-status-available">
                                Active
                              </span>
                            </td>
                            <td className="py-3.5 px-space-md text-right">
                              <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                <button
                                  className="p-1.5 rounded-lg hover:bg-surface-container text-primary transition-colors cursor-pointer"
                                  title="Inspect in drawer"
                                  type="button"
                                  onClick={() => setSelectedCategoryId(c.id)}
                                >
                                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                                </button>
                                <button
                                  className="p-1.5 rounded-lg hover:bg-surface-container text-text-secondary hover:text-primary transition-colors cursor-pointer"
                                  title="Edit Classification"
                                  type="button"
                                  onClick={() => handleOpenEditModal(c)}
                                >
                                  <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button
                                  className="p-1.5 rounded-lg hover:bg-error-container text-error transition-colors cursor-pointer"
                                  title="Archive / Remove"
                                  type="button"
                                  onClick={() => handleDeleteCategory(c.id, c.name)}
                                >
                                  <span className="material-symbols-outlined text-[18px]">archive</span>
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

              {/* Table Footer with Shared Pagination and Page Size Dropdown */}
              <div className="p-space-md bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-space-md border-t border-surface-container-low">
                <div className="flex items-center gap-space-md">
                  <span className="font-caption text-caption text-text-secondary">
                    {filteredCategories.length === 0
                      ? '0 records found'
                      : `Showing ${pagination.startIndex + 1}–${pagination.endIndex} of ${filteredCategories.length} categorized academic ranges`}
                  </span>
                  {/* Page Size Selector */}
                  <div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption">
                    <span>Rows:</span>
                    <Dropdown<number>
                      variant="pagination"
                      items={PAGE_SIZE_OPTIONS}
                      selectedValue={pagination.pageSize}
                      onSelect={(val) => pagination.setPageSize(val)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-space-xs">
                  <button
                    className="w-8 h-8 rounded-lg bg-surface-container text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    disabled={!pagination.canPrevPage}
                    onClick={pagination.prevPage}
                    type="button"
                    title="Previous page"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                  </button>
                  <span className="px-3 py-1 rounded-lg bg-surface-container-low font-caption text-caption font-semibold text-text-primary">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    className="w-8 h-8 rounded-lg bg-surface-container text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    disabled={!pagination.canNextPage}
                    onClick={pagination.nextPage}
                    type="button"
                    title="Next page"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Inspector Drawer */}
          <div className="xl:col-span-4 flex flex-col gap-space-md sticky top-20">
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg relative overflow-hidden border border-outline-variant/15">
              <div className="flex items-center justify-between mb-space-md">
                <div className="flex items-center gap-space-xs">
                  <span className={`w-2.5 h-2.5 rounded-full ${selectedCategory ? 'bg-action-green' : 'bg-surface-container'}`}></span>
                  <span className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary">
                    Inspector Drawer
                  </span>
                </div>
                <span className="font-caption text-caption px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-semibold">
                  {selectedCategory ? 'Live Branch' : 'Ledger Stacks'}
                </span>
              </div>

              {selectedCategory ? (
                <>
                  <div className="mb-space-md">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                        Category ID
                      </span>
                      <span className="font-caption text-caption font-mono font-bold text-primary px-2 py-0.5 rounded bg-surface-container">
                        {selectedCategory.deweyRange}
                      </span>
                    </div>
                    <h2 className="font-headline-3 text-headline-3 text-text-primary tracking-tight font-bold">
                      {selectedCategory.name}
                    </h2>
                    <p className="font-small text-small text-text-secondary mt-1">
                      Institutional academic taxonomy category.
                    </p>
                  </div>

                  <div className="space-y-space-md">
                    <div>
                      <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold block mb-2">
                        Subject Headings
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCategory.description ? (
                          selectedCategory.description.split(',').map((h, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-lg bg-surface-container font-caption text-caption font-medium text-text-primary"
                            >
                              {h.trim()}
                            </span>
                          ))
                        ) : (
                          <span className="text-caption text-text-secondary italic">No subject headings registered</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-space-sm p-space-sm bg-surface-container-low rounded-xl">
                      <div className="p-2">
                        <span className="font-caption text-caption text-text-secondary block">Classified Titles</span>
                        <span className="font-headline-4 text-headline-4 font-bold text-text-primary">
                          {selectedCategoryBooks.length}
                        </span>
                      </div>
                      <div className="p-2">
                        <span className="font-caption text-caption text-text-secondary block">Total Physical Copies</span>
                        <span className="font-headline-4 text-headline-4 font-bold text-primary">
                          {selectedCategoryCopies}
                        </span>
                      </div>
                    </div>

                    <div className="pt-space-sm flex flex-col gap-space-xs">
                      <button
                        className="w-full h-11 bg-primary text-on-primary font-small text-small font-semibold rounded-xl hover:bg-primary-container shadow-sm flex items-center justify-center gap-space-xs transition-colors cursor-pointer"
                        type="button"
                        onClick={() =>
                          setToast({
                            message: `Category: ${selectedCategory.name} (${selectedCategory.deweyRange})`,
                            type: 'success',
                          })
                        }
                      >
                        <span className="material-symbols-outlined text-[18px]">rule</span>
                        <span>Category Overview</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-16 flex flex-col items-center justify-center text-center text-text-secondary">
                  <span className="material-symbols-outlined text-[44px] text-text-secondary/40 mb-2">touch_app</span>
                  <p className="font-bold text-text-primary">No Category Selected</p>
                  <p className="font-caption text-caption mt-1 max-w-xs">
                    {categories.length === 0
                      ? 'Once categories are created in the database, select a row to inspect its details.'
                      : 'Select any category from the table to inspect details.'}
                  </p>
                </div>
              )}
            </div>

            {/* Sync status card */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex items-center justify-between border border-outline-variant/15">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-xl bg-soft-blue text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">sync</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-small text-small font-bold text-text-primary">Automated Classification Sync</span>
                  <span className="font-caption text-caption text-text-secondary">
                    {categories.length > 0 ? `Active ledger: ${categories.length} classes` : 'Awaiting data ingress'}
                  </span>
                </div>
              </div>
              <button
                className="p-2 rounded-lg hover:bg-surface-container text-primary transition-colors cursor-pointer"
                title="Sync now"
                type="button"
                onClick={loadData}
              >
                <span className="material-symbols-outlined text-[20px]">refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Add Academic Discipline Modal */}
        <DefaultFloatingModalCard
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add Academic Discipline"
          maxWidth="max-w-lg"
          footer={
            <div className="flex items-center justify-end gap-space-sm w-full">
              <button
                className="px-space-lg py-2.5 rounded-xl text-text-secondary hover:text-text-primary font-small text-small font-medium transition-colors cursor-pointer"
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-space-xl py-2.5 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                type="submit"
                form="categoryForm"
                disabled={isSubmitting}
              >
                {isSubmitting && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
                <span>Register Category</span>
              </button>
            </div>
          }
        >
          <form className="flex flex-col gap-space-md" id="categoryForm" onSubmit={handleCreateCategory}>
            {formError && (
              <div className="p-space-sm bg-error-container text-error rounded-xl text-caption font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">warning</span>
                <span>{formError}</span>
              </div>
            )}

            <div>
              <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary block mb-1">
                Category Name *
              </label>
              <input
                className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary focus:outline-none focus:bg-surface-bright transition-all border border-outline-variant/15"
                placeholder="e.g. The Arts & Fine Recreation"
                required={true}
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            <div>
              <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary block mb-1">
                Subject Headings (Comma Separated)
              </label>
              <textarea
                className="w-full bg-surface-container-low p-space-md rounded-xl font-small text-small text-text-primary focus:outline-none focus:bg-surface-bright transition-all resize-none border border-outline-variant/15"
                placeholder="e.g. Architecture, Painting, Sculpture, Photography"
                rows={3}
                value={formSubFields}
                onChange={(e) => setFormSubFields(e.target.value)}
              ></textarea>
            </div>
          </form>
        </DefaultFloatingModalCard>

        {/* Edit Categories Modal */}
        <DefaultFloatingModalCard
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Categories: ${editingCategory?.name || ''}`}
          maxWidth="max-w-lg"
          footer={
            <div className="flex items-center justify-end gap-space-sm w-full">
              <button
                className="px-space-lg py-2.5 rounded-xl text-text-secondary hover:text-text-primary font-small text-small font-medium transition-colors cursor-pointer"
                type="button"
                disabled={isEditSubmitting}
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-space-xl py-2.5 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                type="submit"
                form="editCategoryForm"
                disabled={isEditSubmitting}
              >
                {isEditSubmitting && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
                <span>Update Category</span>
              </button>
            </div>
          }
        >
          <form className="flex flex-col gap-space-md" id="editCategoryForm" onSubmit={handleUpdateCategory}>
            {editFormError && (
              <div className="p-space-sm bg-error-container text-error rounded-xl text-caption font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">warning</span>
                <span>{editFormError}</span>
              </div>
            )}

            <div>
              <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary block mb-1">
                Category Name *
              </label>
              <input
                className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary focus:outline-none focus:bg-surface-bright transition-all border border-outline-variant/15"
                placeholder="e.g. The Arts & Fine Recreation"
                required={true}
                type="text"
                value={editFormName}
                onChange={(e) => setEditFormName(e.target.value)}
              />
            </div>

            <div>
              <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary block mb-1">
                Subject Headings (Comma Separated)
              </label>
              <textarea
                className="w-full bg-surface-container-low p-space-md rounded-xl font-small text-small text-text-primary focus:outline-none focus:bg-surface-bright transition-all resize-none border border-outline-variant/15"
                placeholder="e.g. Architecture, Painting, Sculpture, Photography"
                rows={3}
                value={editFormSubFields}
                onChange={(e) => setEditFormSubFields(e.target.value)}
              ></textarea>
            </div>
          </form>
        </DefaultFloatingModalCard>

        {/* Delete Discipline Confirmation Modal */}
        <DefaultFloatingModalCard
          isOpen={!!categoryToDelete}
          onClose={() => setCategoryToDelete(null)}
          title="Remove Discipline Category"
          maxWidth="max-w-md"
          footer={
            <div className="flex items-center justify-end gap-space-sm w-full">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="px-space-md py-2 rounded-xl bg-surface-container text-text-secondary hover:text-text-primary font-small text-small font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteCategory}
                disabled={isDeleting}
                className="px-space-lg py-2 rounded-xl bg-status-danger hover:bg-status-danger/80 text-white font-small text-small font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {isDeleting && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
                <span>Remove Category</span>
              </button>
            </div>
          }
        >
          <p className="font-small text-small text-text-secondary leading-relaxed">
            Are you sure you want to remove the discipline{' '}
            <strong className="text-text-primary font-bold">"{categoryToDelete?.name}"</strong>?
            Books currently associated with this category will require reclassification.
          </p>
        </DefaultFloatingModalCard>
      </div>
    </div>
  );
};

export default Categories;
