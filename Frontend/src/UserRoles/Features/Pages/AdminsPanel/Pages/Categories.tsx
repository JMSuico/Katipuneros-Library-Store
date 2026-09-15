// [Layer: UserRoles/Features/Pages/AdminsPanel/Pages]
// Categories.tsx -- Admin Book Categories and Dewey Classes
// Converted directly from SidebarCategoriesPage/code.html.
// DO NOT put business logic or direct API calls here.
import { FC, useEffect } from 'react';

const Categories: FC = () => {
  useEffect(() => {
    const document: any = window.document;
    const w = window as any;
    try {
(function() {
    const modal = document.getElementById('addCategoryModal');
    const openBtn = document.getElementById('openCreateModal');
    const closeBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelModalBtn');
    const form = document.getElementById('categoryForm');
    const exportBtn = document.getElementById('exportMenuBtn');
    const exportDrop = document.getElementById('exportDropdown');
    const searchInput = document.getElementById('categorySearchInput');
    const rows = document.querySelectorAll('.category-row');
    const chips = document.querySelectorAll('.filter-chip');

    const toggleModal = (show) => {
      if (!modal) return;
      if (show) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      } else {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    };

    if (openBtn) openBtn.addEventListener('click', () => toggleModal(true));
    if (closeBtn) closeBtn.addEventListener('click', () => toggleModal(false));
    if (cancelBtn) cancelBtn.addEventListener('click', () => toggleModal(false));

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) toggleModal(false);
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        toggleModal(false);
      });
    }

    if (exportBtn && exportDrop) {
      exportBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        exportDrop.classList.toggle('hidden');
      });

      document.addEventListener('click', () => {
        exportDrop.classList.add('hidden');
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        rows.forEach(row => {
          const text = row.textContent.toLowerCase();
          row.style.display = text.includes(query) ? '' : 'none';
        });
      });
    }

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => {
          c.classList.remove('bg-primary', 'text-on-primary');
          c.classList.add('bg-surface-container-low', 'text-text-secondary');
        });
        chip.classList.remove('bg-surface-container-low', 'text-text-secondary');
        chip.classList.add('bg-primary', 'text-on-primary');
      });
    });

    rows.forEach(row => {
      row.addEventListener('click', () => {
        rows.forEach(r => r.classList.remove('bg-soft-blue/25'));
        row.classList.add('bg-soft-blue/25');
      });
    });
  })();

    } catch (err) {
      console.error("UI interaction script error:", err);
    }
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-xl">
<div className="flex flex-col">
<div className="flex items-center gap-space-xs text-caption font-caption text-text-secondary uppercase tracking-wider mb-1">
<span className="">Admin Console</span>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="">Management</span>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="text-primary font-bold">Categories</span>
</div>
<h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight">Academic Disciplines &amp; Catalog Classification</h1>
<p className="font-small text-small text-text-secondary mt-0.5">Manage hierarchical ontology, Dewey Decimal ranges, and physical repository bay allocations.</p>
</div>
<div className="flex items-center flex-wrap gap-space-sm">
<div className="relative flex-grow sm:flex-grow-0">
<button className="h-11 px-space-md bg-surface-container-lowest text-primary font-small text-small font-semibold rounded-xl shadow-sm hover:bg-soft-blue flex items-center gap-space-xs transition-colors" id="exportMenuBtn" type="button">
<span className="material-symbols-outlined text-[18px]">ios_share</span>
<span className="">Export Schema</span>
<span className="material-symbols-outlined text-[16px]">expand_more</span>
</button>
<div className="hidden absolute right-0 mt-1 w-48 bg-surface-container-lowest shadow-xl rounded-xl p-1 z-30" id="exportDropdown">
<button className="w-full text-left px-space-sm py-2 rounded-lg text-text-primary hover:bg-surface-container font-caption text-caption flex items-center gap-space-xs" type="button">
<span className="material-symbols-outlined text-[16px] text-text-secondary">data_object</span>
<span className="">JSON Concordance</span>
</button>
<button className="w-full text-left px-space-sm py-2 rounded-lg text-text-primary hover:bg-surface-container font-caption text-caption flex items-center gap-space-xs" type="button">
<span className="material-symbols-outlined text-[16px] text-text-secondary">table_view</span>
<span className="">CSV Master Index</span>
</button>
</div>
</div>
<button className="h-11 px-space-lg bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-bold rounded-xl shadow-sm flex items-center gap-space-xs transition-all transform active:scale-95" id="openCreateModal" type="button">
<span className="material-symbols-outlined text-[20px] font-bold">add</span>
<span className="">Add Category</span>
</button>
</div>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md mb-space-xl">
<div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
<div className="flex items-start justify-between">
<div>
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Total Disciplines</span>
<div className="flex items-baseline gap-space-xs mt-1">
<span className="font-headline-2 text-headline-2 text-text-primary tracking-tight font-bold">42</span>
<span className="font-caption text-caption text-status-available font-bold uppercase">Active Class</span>
</div>
</div>
<div className="w-10 h-10 rounded-xl bg-soft-blue text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">category</span>
</div>
</div>
<div className="flex items-center gap-space-xs mt-4 font-caption text-caption text-text-secondary">
<span className="material-symbols-outlined text-[16px] text-primary">verified</span>
<span className="">10 main Dewey classes aligned</span>
</div>
</div>
<div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
<div className="flex items-start justify-between">
<div>
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Indexed Titles</span>
<div className="flex items-baseline gap-space-xs mt-1">
<span className="font-headline-2 text-headline-2 text-text-primary tracking-tight font-bold">1,248</span>
<span className="font-caption text-caption text-primary font-semibold">Volumes</span>
</div>
</div>
<div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">menu_book</span>
</div>
</div>
<div className="flex items-center gap-space-xs mt-4 font-caption text-caption text-text-secondary">
<span className="material-symbols-outlined text-[16px] text-status-available">trending_up</span>
<span className="">+38 cataloged this cycle</span>
</div>
</div>
<div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
<div className="flex items-start justify-between">
<div>
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Physical Holdings</span>
<div className="flex items-baseline gap-space-xs mt-1">
<span className="font-headline-2 text-headline-2 text-text-primary tracking-tight font-bold">4,892</span>
<span className="font-caption text-caption text-text-secondary">Assets</span>
</div>
</div>
<div className="w-10 h-10 rounded-xl bg-surface-container text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">inventory_2</span>
</div>
</div>
<div className="flex items-center gap-space-xs mt-4 font-caption text-caption text-text-secondary">
<span className="material-symbols-outlined text-[16px] text-secondary">domain</span>
<span className="">3 Library wings across 4 floors</span>
</div>
</div>
<div className="bg-primary text-on-primary p-space-lg rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
<div className="flex items-start justify-between">
<div>
<span className="font-caption text-caption text-primary-fixed uppercase tracking-wider font-semibold">Classification Standard</span>
<p className="font-headline-4 text-headline-4 font-bold text-on-primary mt-1 tracking-tight leading-snug">DDC 23 &amp; LoC</p>
</div>
<div className="w-10 h-10 rounded-xl bg-on-primary/10 text-on-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">hub</span>
</div>
</div>
<div className="flex items-center justify-between mt-3 pt-2">
<span className="font-caption text-caption text-primary-fixed">Concordance Accuracy</span>
<span className="font-caption text-caption font-bold bg-action-green text-text-primary px-2 py-0.5 rounded-full">99.4%</span>
</div>
</div>
</div>
<div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
<div className="xl:col-span-8 flex flex-col gap-space-md">
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-space-md">
<div className="relative w-full sm:w-80">
<span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">search</span>
<input className="w-full bg-surface-container-low pl-10 pr-space-md py-2 rounded-xl font-small text-small text-text-primary placeholder:text-text-secondary focus:outline-none focus:bg-surface-bright focus:shadow-sm transition-all" id="categorySearchInput" placeholder="Search call code, discipline, keyword..." type="text" />
</div>
<div className="flex items-center gap-space-xs w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
<button className="filter-chip active px-3 py-1.5 rounded-full font-caption text-caption font-semibold bg-primary text-on-primary transition-colors whitespace-nowrap" type="button">All Classes (42)</button>
<button className="filter-chip px-3 py-1.5 rounded-full font-caption text-caption font-semibold bg-surface-container-low text-text-secondary hover:text-text-primary transition-colors whitespace-nowrap" type="button">STEM Ranges</button>
<button className="filter-chip px-3 py-1.5 rounded-full font-caption text-caption font-semibold bg-surface-container-low text-text-secondary hover:text-text-primary transition-colors whitespace-nowrap" type="button">Humanities</button>
<button className="filter-chip px-3 py-1.5 rounded-full font-caption text-caption font-semibold bg-surface-container-low text-text-secondary hover:text-text-primary transition-colors whitespace-nowrap" type="button">Filipiniana</button>
</div>
</div>
<div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container text-text-secondary font-caption text-caption uppercase tracking-wider select-none">
<th className="py-space-md px-space-md font-semibold">Call Range</th>
<th className="py-space-md px-space-md font-semibold">Category / Field Name</th>
<th className="py-space-md px-space-sm font-semibold text-center">Sub-Fields</th>
<th className="py-space-md px-space-sm font-semibold text-right">Titles</th>
<th className="py-space-md px-space-sm font-semibold text-right">Copies</th>
<th className="py-space-md px-space-md font-semibold">Circulation</th>
<th className="py-space-md px-space-sm font-semibold text-center">Status</th>
<th className="py-space-md px-space-md font-semibold text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container-low font-small text-small text-text-primary" id="categoriesTableBody">
<tr className="category-row hover:bg-surface-container-low/70 transition-colors cursor-pointer bg-soft-blue/25" data-range="000-099">
<td className="py-3.5 px-space-md">
<span className="font-caption text-caption font-mono font-bold px-2 py-1 bg-surface-container rounded text-primary">000 - 099</span>
</td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col">
<span className="font-small text-small font-bold text-text-primary">Computer Science, Information &amp; General Works</span>
<span className="font-caption text-caption text-text-secondary">LoC: QA75.5 - QA76.9, Z1000+</span>
</div>
</td>
<td className="py-3.5 px-space-sm text-center">
<span className="px-2 py-0.5 rounded-full bg-surface-container font-caption text-caption font-medium">14</span>
</td>
<td className="py-3.5 px-space-sm text-right font-medium">312</td>
<td className="py-3.5 px-space-sm text-right font-medium">1,420</td>
<td className="py-3.5 px-space-md">
<div className="flex items-center gap-space-xs">
<div className="w-16 h-2 rounded-full bg-surface-container overflow-hidden">
<div className="h-full bg-action-green rounded-full" style={{ width: '82%' }}></div>
</div>
<span className="font-caption text-caption font-bold text-text-primary">82%</span>
</div>
</td>
<td className="py-3.5 px-space-sm text-center">
<span className="inline-flex items-center px-2 py-0.5 rounded-full font-caption text-caption font-bold bg-status-available/20 text-status-available">Active</span>
</td>
<td className="py-3.5 px-space-md text-right">
<div className="flex items-center justify-end gap-1">
<button className="p-1.5 rounded-lg hover:bg-surface-container text-primary transition-colors" title="Inspect" type="button">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="p-1.5 rounded-lg hover:bg-surface-container text-text-secondary transition-colors" title="Edit" type="button">
<span className="material-symbols-outlined text-[18px]">edit</span>
</button>
<button className="p-1.5 rounded-lg hover:bg-error-container text-error transition-colors" title="Archive" type="button">
<span className="material-symbols-outlined text-[18px]">archive</span>
</button>
</div>
</td>
</tr>
<tr className="category-row hover:bg-surface-container-low/70 transition-colors cursor-pointer" data-range="100-199">
<td className="py-3.5 px-space-md">
<span className="font-caption text-caption font-mono font-bold px-2 py-1 bg-surface-container rounded text-primary">100 - 199</span>
</td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col">
<span className="font-small text-small font-bold text-text-primary">Philosophy &amp; Psychology</span>
<span className="font-caption text-caption text-text-secondary">LoC: B, BC, BD, BF</span>
</div>
</td>
<td className="py-3.5 px-space-sm text-center">
<span className="px-2 py-0.5 rounded-full bg-surface-container font-caption text-caption font-medium">8</span>
</td>
<td className="py-3.5 px-space-sm text-right font-medium">184</td>
<td className="py-3.5 px-space-sm text-right font-medium">620</td>
<td className="py-3.5 px-space-md">
<div className="flex items-center gap-space-xs">
<div className="w-16 h-2 rounded-full bg-surface-container overflow-hidden">
<div className="h-full bg-primary-container rounded-full" style={{ width: '65%' }}></div>
</div>
<span className="font-caption text-caption font-bold text-text-primary">65%</span>
</div>
</td>
<td className="py-3.5 px-space-sm text-center">
<span className="inline-flex items-center px-2 py-0.5 rounded-full font-caption text-caption font-bold bg-status-available/20 text-status-available">Active</span>
</td>
<td className="py-3.5 px-space-md text-right">
<div className="flex items-center justify-end gap-1">
<button className="p-1.5 rounded-lg hover:bg-surface-container text-text-secondary hover:text-primary transition-colors" title="Inspect" type="button">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="p-1.5 rounded-lg hover:bg-surface-container text-text-secondary transition-colors" title="Edit" type="button">
<span className="material-symbols-outlined text-[18px]">edit</span>
</button>
<button className="p-1.5 rounded-lg hover:bg-error-container text-error transition-colors" title="Archive" type="button">
<span className="material-symbols-outlined text-[18px]">archive</span>
</button>
</div>
</td>
</tr>
<tr className="category-row hover:bg-surface-container-low/70 transition-colors cursor-pointer" data-range="300-399">
<td className="py-3.5 px-space-md">
<span className="font-caption text-caption font-mono font-bold px-2 py-1 bg-surface-container rounded text-primary">300 - 399</span>
</td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col">
<span className="font-small text-small font-bold text-text-primary">Social Sciences, Law &amp; Governance</span>
<span className="font-caption text-caption text-text-secondary">LoC: H, J, K, L</span>
</div>
</td>
<td className="py-3.5 px-space-sm text-center">
<span className="px-2 py-0.5 rounded-full bg-surface-container font-caption text-caption font-medium">12</span>
</td>
<td className="py-3.5 px-space-sm text-right font-medium">220</td>
<td className="py-3.5 px-space-sm text-right font-medium">840</td>
<td className="py-3.5 px-space-md">
<div className="flex items-center gap-space-xs">
<div className="w-16 h-2 rounded-full bg-surface-container overflow-hidden">
<div className="h-full bg-action-green rounded-full" style={{ width: '74%' }}></div>
</div>
<span className="font-caption text-caption font-bold text-text-primary">74%</span>
</div>
</td>
<td className="py-3.5 px-space-sm text-center">
<span className="inline-flex items-center px-2 py-0.5 rounded-full font-caption text-caption font-bold bg-status-available/20 text-status-available">Active</span>
</td>
<td className="py-3.5 px-space-md text-right">
<div className="flex items-center justify-end gap-1">
<button className="p-1.5 rounded-lg hover:bg-surface-container text-text-secondary hover:text-primary transition-colors" title="Inspect" type="button">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="p-1.5 rounded-lg hover:bg-surface-container text-text-secondary transition-colors" title="Edit" type="button">
<span className="material-symbols-outlined text-[18px]">edit</span>
</button>
<button className="p-1.5 rounded-lg hover:bg-error-container text-error transition-colors" title="Archive" type="button">
<span className="material-symbols-outlined text-[18px]">archive</span>
</button>
</div>
</td>
</tr>
<tr className="category-row hover:bg-surface-container-low/70 transition-colors cursor-pointer" data-range="500-599">
<td className="py-3.5 px-space-md">
<span className="font-caption text-caption font-mono font-bold px-2 py-1 bg-surface-container rounded text-primary">500 - 599</span>
</td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col">
<span className="font-small text-small font-bold text-text-primary">Natural Sciences &amp; Mathematics</span>
<span className="font-caption text-caption text-text-secondary">LoC: Q, QA, QB, QC, QD</span>
</div>
</td>
<td className="py-3.5 px-space-sm text-center">
<span className="px-2 py-0.5 rounded-full bg-surface-container font-caption text-caption font-medium">16</span>
</td>
<td className="py-3.5 px-space-sm text-right font-medium">260</td>
<td className="py-3.5 px-space-sm text-right font-medium">1,012</td>
<td className="py-3.5 px-space-md">
<div className="flex items-center gap-space-xs">
<div className="w-16 h-2 rounded-full bg-surface-container overflow-hidden">
<div className="h-full bg-primary-container rounded-full" style={{ width: '69%' }}></div>
</div>
<span className="font-caption text-caption font-bold text-text-primary">69%</span>
</div>
</td>
<td className="py-3.5 px-space-sm text-center">
<span className="inline-flex items-center px-2 py-0.5 rounded-full font-caption text-caption font-bold bg-status-available/20 text-status-available">Active</span>
</td>
<td className="py-3.5 px-space-md text-right">
<div className="flex items-center justify-end gap-1">
<button className="p-1.5 rounded-lg hover:bg-surface-container text-text-secondary hover:text-primary transition-colors" title="Inspect" type="button">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="p-1.5 rounded-lg hover:bg-surface-container text-text-secondary transition-colors" title="Edit" type="button">
<span className="material-symbols-outlined text-[18px]">edit</span>
</button>
<button className="p-1.5 rounded-lg hover:bg-error-container text-error transition-colors" title="Archive" type="button">
<span className="material-symbols-outlined text-[18px]">archive</span>
</button>
</div>
</td>
</tr>
<tr className="category-row hover:bg-surface-container-low/70 transition-colors cursor-pointer" data-range="800-899">
<td className="py-3.5 px-space-md">
<span className="font-caption text-caption font-mono font-bold px-2 py-1 bg-surface-container rounded text-primary">800 - 899</span>
</td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col">
<span className="font-small text-small font-bold text-text-primary">Literature, Rhetoric &amp; Filipiniana</span>
<span className="font-caption text-caption text-text-secondary">LoC: P, PL, PN, PR, PS</span>
</div>
</td>
<td className="py-3.5 px-space-sm text-center">
<span className="px-2 py-0.5 rounded-full bg-surface-container font-caption text-caption font-medium">10</span>
</td>
<td className="py-3.5 px-space-sm text-right font-medium">272</td>
<td className="py-3.5 px-space-sm text-right font-medium">1,000</td>
<td className="py-3.5 px-space-md">
<div className="flex items-center gap-space-xs">
<div className="w-16 h-2 rounded-full bg-surface-container overflow-hidden">
<div className="h-full bg-action-green rounded-full" style={{ width: '88%' }}></div>
</div>
<span className="font-caption text-caption font-bold text-text-primary">88%</span>
</div>
</td>
<td className="py-3.5 px-space-sm text-center">
<span className="inline-flex items-center px-2 py-0.5 rounded-full font-caption text-caption font-bold bg-status-available/20 text-status-available">Active</span>
</td>
<td className="py-3.5 px-space-md text-right">
<div className="flex items-center justify-end gap-1">
<button className="p-1.5 rounded-lg hover:bg-surface-container text-text-secondary hover:text-primary transition-colors" title="Inspect" type="button">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="p-1.5 rounded-lg hover:bg-surface-container text-text-secondary transition-colors" title="Edit" type="button">
<span className="material-symbols-outlined text-[18px]">edit</span>
</button>
<button className="p-1.5 rounded-lg hover:bg-error-container text-error transition-colors" title="Archive" type="button">
<span className="material-symbols-outlined text-[18px]">archive</span>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
<div className="p-space-md bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-space-sm">
<span className="font-caption text-caption text-text-secondary">Showing 5 of 42 categorized academic ranges</span>
<div className="flex items-center gap-space-xs">
<button className="w-8 h-8 rounded-lg bg-surface-container text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors disabled={true}:opacity-50" disabled={true} type="button">
<span className="material-symbols-outlined text-[16px]">chevron_left</span>
</button>
<button className="w-8 h-8 rounded-lg bg-primary text-on-primary font-caption text-caption font-bold flex items-center justify-center" type="button">1</button>
<button className="w-8 h-8 rounded-lg bg-surface-container text-text-secondary hover:text-text-primary font-caption text-caption font-bold flex items-center justify-center" type="button">2</button>
<button className="w-8 h-8 rounded-lg bg-surface-container text-text-secondary hover:text-text-primary font-caption text-caption font-bold flex items-center justify-center" type="button">3</button>
<button className="w-8 h-8 rounded-lg bg-surface-container text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors" type="button">
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
</button>
</div>
</div>
</div>
</div>
<div className="xl:col-span-4 flex flex-col gap-space-md sticky top-20">
<div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg relative overflow-hidden">
<div className="flex items-center justify-between mb-space-md">
<div className="flex items-center gap-space-xs">
<span className="w-2.5 h-2.5 rounded-full bg-action-green"></span>
<span className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary">Inspector Drawer</span>
</div>
<span className="font-caption text-caption px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-semibold">Live Branch</span>
</div>
<div className="mb-space-md">
<div className="flex items-baseline justify-between mb-1">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Sub-Class Target</span>
<span className="font-caption text-caption font-mono font-bold text-primary">DDC 004 - 006</span>
</div>
<h2 className="font-headline-3 text-headline-3 text-text-primary tracking-tight">Computer Science &amp; Artificial Intelligence</h2>
<p className="font-small text-small text-text-secondary mt-1">Core computing discipline encompassing algorithms, computational theory, machine intelligence, and systems architectures.</p>
</div>
<div className="relative h-32 rounded-xl overflow-hidden mb-space-md bg-surface-container">
<img className="w-full h-full object-cover" data-alt="A tranquil, high-ceiling modern university library research wing with oak reading desks, organized teal architectural book shelving bays, and natural morning sunlight casting soft geometric shadows on clean concrete floors." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrd31r1qbA3j8ldCY7gXlPsrazH2syTpsLfzuWRDXDHSAd09EoDsDYENbgtvgIbvCxGOaf5d13fQsKhqFPGXCl364oSzqtnIArJ1V77uyTN9fVR3ZREIKiWyRh0EtPmYw2tYT8TDODNHBmmMWB90gEyhlljSD0YGG0p9dk-8Mj2r0jQerSdzUgdAq0dMxMPufy8E7xV-Tw-b9DG3ZEVSifVk8hiYI7t3eAjdlkVRd_xyuUrd6weJbN" />
<div className="absolute inset-0 bg-gradient-to-t from-text-primary/80 via-text-primary/20 to-transparent flex items-end p-space-md">
<div className="flex items-center gap-space-xs text-on-primary">
<span className="material-symbols-outlined text-[18px]">pin_drop</span>
<span className="font-caption text-caption font-semibold tracking-wide">Wing B, Floor 2, Bays 12-18</span>
</div>
</div>
</div>
<div className="space-y-space-md">
<div>
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold block mb-2">Leading Subject Headings</span>
<div className="flex flex-wrap gap-1.5">
<span className="px-2.5 py-1 rounded-lg bg-surface-container font-caption text-caption font-medium text-text-primary">Algorithms &amp; Complexity</span>
<span className="px-2.5 py-1 rounded-lg bg-surface-container font-caption text-caption font-medium text-text-primary">Distributed Systems</span>
<span className="px-2.5 py-1 rounded-lg bg-surface-container font-caption text-caption font-medium text-text-primary">Software Engineering</span>
<span className="px-2.5 py-1 rounded-lg bg-secondary-container font-caption text-caption font-bold text-on-secondary-container">AI / Machine Learning</span>
<span className="px-2.5 py-1 rounded-lg bg-surface-container font-caption text-caption font-medium text-text-primary">Neural Networks</span>
</div>
</div>
<div className="grid grid-cols-2 gap-space-sm p-space-sm bg-surface-container-low rounded-xl">
<div className="p-2">
<span className="font-caption text-caption text-text-secondary block">Reserved Shelves</span>
<span className="font-headline-4 text-headline-4 font-bold text-text-primary">6 Bays</span>
</div>
<div className="p-2">
<span className="font-caption text-caption text-text-secondary block">Digital Equivalents</span>
<span className="font-headline-4 text-headline-4 font-bold text-primary">248 PDFs</span>
</div>
</div>
<div>
<div className="flex justify-between items-center mb-1">
<span className="font-caption text-caption text-text-secondary">Bay Saturation (Asset Capacity)</span>
<span className="font-caption text-caption font-bold text-text-primary">82% Full</span>
</div>
<div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
<div className="h-full bg-action-green rounded-full" style={{ width: '82%' }}></div>
</div>
</div>
<div className="pt-space-sm flex flex-col gap-space-xs">
<button className="w-full h-11 bg-primary text-on-primary font-small text-small font-semibold rounded-xl hover:bg-primary-container shadow-sm flex items-center justify-center gap-space-xs transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]">rule</span>
<span className="">Edit Category Rules</span>
</button>
<button className="w-full h-11 bg-surface-container text-text-primary font-small text-small font-semibold rounded-xl hover:bg-surface-variant flex items-center justify-center gap-space-xs transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]">alt_route</span>
<span className="">Manage Cross-References</span>
</button>
</div>
</div>
</div>
<div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-xl bg-soft-blue text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">sync</span>
</div>
<div className="flex flex-col">
<span className="font-small text-small font-bold text-text-primary">Automated MARC Sync</span>
<span className="font-caption text-caption text-text-secondary">Last synchronized: 14 mins ago</span>
</div>
</div>
<button className="p-2 rounded-lg hover:bg-surface-container text-primary transition-colors" title="Sync now" type="button">
<span className="material-symbols-outlined text-[20px]">refresh</span>
</button>
</div>
</div>
</div>
<div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 hidden items-center justify-center p-space-md" id="addCategoryModal">
<div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
<div className="p-space-lg flex items-center justify-between bg-surface-container-low">
<div className="flex items-center gap-space-sm">
<div className="w-9 h-9 rounded-xl bg-action-green text-text-primary flex items-center justify-center font-bold">
<span className="material-symbols-outlined text-[20px]">library_add</span>
</div>
<div className="flex flex-col">
<span className="font-headline-4 text-headline-4 font-bold text-text-primary">Add Academic Discipline</span>
<span className="font-caption text-caption text-text-secondary">Map new Dewey range and sub-fields</span>
</div>
</div>
<button className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors" id="closeModalBtn" type="button">
<span className="material-symbols-outlined text-[18px]">close</span>
</button>
</div>
<form className="p-space-lg flex flex-col gap-space-md" id="categoryForm">
<div>
<label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary block mb-1">Call Range (Dewey/LoC)</label>
<div className="grid grid-cols-2 gap-space-sm">
<input className="bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary focus:outline-none focus:bg-surface-bright transition-all" placeholder="e.g. 700 - 799" required={true} type="text" />
<input className="bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary focus:outline-none focus:bg-surface-bright transition-all" placeholder="LoC (e.g. N, NA, NK)" type="text" />
</div>
</div>
<div>
<label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary block mb-1">Discipline / Category Name</label>
<input className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary focus:outline-none focus:bg-surface-bright transition-all" placeholder="e.g. The Arts &amp; Fine Recreation" required={true} type="text" />
</div>
<div className="grid grid-cols-2 gap-space-sm">
<div>
<label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary block mb-1">Primary Wing</label>
<select className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary focus:outline-none focus:bg-surface-bright transition-all">
<option>Wing A (Main Hall)</option>
<option>Wing B (STEM &amp; Tech)</option>
<option>Wing C (Filipiniana)</option>
</select>
</div>
<div>
<label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary block mb-1">Stack Bays</label>
<input className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary focus:outline-none focus:bg-surface-bright transition-all" placeholder="e.g. Bays 01-08" type="text" />
</div>
</div>
<div>
<label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary block mb-1">Initial Sub-Fields (Comma Separated)</label>
<textarea className="w-full bg-surface-container-low p-space-md rounded-xl font-small text-small text-text-primary focus:outline-none focus:bg-surface-bright transition-all resize-none" placeholder="e.g. Architecture, Painting, Sculpture, Photography" rows={2}></textarea>
</div>
<div className="pt-space-sm flex items-center justify-end gap-space-sm">
<button className="px-space-lg py-2.5 rounded-xl text-text-secondary hover:text-text-primary font-small text-small font-medium transition-colors" id="cancelModalBtn" type="button">Cancel</button>
<button className="px-space-xl py-2.5 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-bold shadow-sm transition-all" type="submit">Save Category</button>
</div>
</form>
</div>
</div>
</div>

    </div>
  );
};

export default Categories;
