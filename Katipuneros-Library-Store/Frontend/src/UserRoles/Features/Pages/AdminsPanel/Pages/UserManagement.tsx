// [Layer: UserRoles/Features/Pages/AdminsPanel/Pages]
// UserManagement.tsx -- Admin User Directory & User Governance.
// Connects to Endpoints/Admin/userApi.ts for user governance and status management.
// Utilizes global hooks: useDebounce, usePagination, useTableDraggable, and useFluidResposiveness.
// Adheres strictly to AGENTS.md and SKILL.md flow chains and uses DefaultFloatingModalCard for all modals.
// Expresses all sync and async routines via clean lambda expressions.

import { FC, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  getAdminUsersList,
  toggleUserStatus,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  bulkDeleteAdminUsers,
  AdminUserRecord,
} from '../../../../../Endpoints/Admin/userApi';
import { useDebounce } from '../../../../../Hooks/useDebounce';
import { usePagination } from '../../../../../Hooks/usePagination';
import { useTableDraggable } from '../../../../../Hooks/useTableDraggable';
import { useFluidResposiveness } from '../../../../../Hooks/useFluidResposiveness';
import { usePagesGlobalRefresh } from '../../../../../Hooks/usePagesGlobalRefresh';
import { DefaultFloatingModalCard } from '../../../../../Shared/DefaultFloatingModalCard';
import { SearchBar } from '../../../../../Shared/SearchBar';
import { Button } from '../../../../../Shared/Button';
import { Dropdown } from '../../../../../Shared/Dropdown';
import { RadioButton, RadioGroup } from '../../../../../Shared/RadioButton';
import { exportToCsv, exportToXlsx } from '../../../../../Libs/spreadsheetExport';

// Extended User Record preserving all rich source HTML details
export interface UserItem {
  id: string;
  name: string;
  fullName: string;
  firstName?: string;
  middleName?: string;
  surname?: string;
  age?: string;
  address?: string;
  phone?: string;
  username?: string;
  email: string;
  role: 'Customer' | 'Cashier' | 'Admin';
  roleDetail: string;
  status: 'active' | 'suspended' | 'pending';
  isActive: boolean;
  isProtected?: boolean;
  libraryCardNumber: string;
  department: string;
  joinedDate: string;
  lastLogin: string;
  loans: string;
  holds: string;
  fines: string;
  avatarUrl?: string;
  initials?: string;
  rfid?: string;
}

// Empty initial seed users adhering to zero-data mandate
const INITIAL_SEED_PATRONS: UserItem[] = [];
/*
  {
    id: 'KP-77401',
    name: 'Sofia Morales',
    fullName: 'Sofia Morales',
    email: 's.morales@upk.edu.ph',
    role: 'Customer',
    roleDetail: 'Customer (Undergrad)',
    status: 'active',
    isActive: true,
    libraryCardNumber: '#KP-77401',
    department: 'College of Engineering & IT (BS CS Yr 3)',
    joinedDate: '2022-08-14',
    lastLogin: 'Today, 09:22 AM',
    loans: '2/4',
    holds: '1',
    fines: '₱0.00 clear',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1xp1xbV7PvMd-4u431pvisRoSQqgcNI_2LD4BKKJenSt3S4TXi_FtWeXBwImNk8xPjpNVRmqRAfRabD7iGGxCTBCtPqa7xLzIUJVJXYPG1JmF12Y5DuJlIZhxwF2puWsjNT8n_qQ81NJRcEkRl3ISx2hjUxCITTySKn3x8Iou6qaOkI558bS3vaCxqLuaEz6Ux4_SthnbFQjZTVSKD7P2BJbh5wIb6n7BQqr3Dbu3bbo7kKpOi-BH',
    rfid: 'RF-9821-KP77',
  },
  {
    id: 'KP-10294',
    name: 'Dr. Leandro Santos',
    fullName: 'Dr. Leandro Santos',
    email: 'l.santos@dept.upk.edu.ph',
    role: 'Customer',
    roleDetail: 'Faculty Scholar',
    status: 'active',
    isActive: true,
    libraryCardNumber: '#KP-10294',
    department: 'Department of History & Humanities',
    joinedDate: '2018-09-01',
    lastLogin: 'Yesterday, 04:15 PM',
    loans: '6/10',
    holds: '0',
    fines: '₱0.00 clear',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_xpduNAxwlpU8pLZZZuZhiovo2-d0eTyS95uGUYpQmIBRsbyjh5zPSBH6Yx6Do5yRCKlg7-TpRTRyl1ZAqZM2Wio-93suN9hfr0mqZ8TOmpko45DkyfuY1BDpNAjXbhveefsSalRw3JLkubCp8EWLKuR0wliNHSH06sI8q1HhsGLlWc9hnGmUucLOa7dpJpp-Knnq5H7zSmJJOqQZN1ck9HSAwwCkN4E7t1Kuy5aCHbfFRMVHkma3',
    rfid: 'RF-1029-KP10',
  },
  {
    id: 'KP-88219',
    name: 'Marco Valencia',
    fullName: 'Marco Valencia',
    email: 'm.valencia@upk.edu.ph',
    role: 'Customer',
    roleDetail: 'Customer (Undergrad)',
    status: 'suspended',
    isActive: false,
    libraryCardNumber: '#KP-88219',
    department: 'College of Arts & Sciences',
    joinedDate: '2023-11-11',
    lastLogin: '12 days ago',
    loans: '1/4 (Overdue)',
    holds: '0',
    fines: '₱340.00 Overdue',
    initials: 'MV',
    rfid: 'RF-8821-KP88',
  },
  {
    id: 'KP-00442',
    name: 'Rowena Tan',
    fullName: 'Rowena Tan',
    email: 'rtan.staff@upk.edu.ph',
    role: 'Cashier',
    roleDetail: 'Cashier Desk 01',
    status: 'active',
    isActive: true,
    libraryCardNumber: '#KP-00442',
    department: 'Circulation & Terminal Desk',
    joinedDate: '2021-01-10',
    lastLogin: 'Active Now',
    loans: 'Shift: 08:00 - 17:00',
    holds: '0',
    fines: 'Terminal POS #3',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4SoVGR6Rt9c6IcnqTWYXTSZv_B9ER2BakTvgQ1CdMlgB16IVHVvJBjdwtyJgZYeQ8AavcijWwu0VR6B08e7HFeyQnnBXaNuVkTQRQuaPAEwegLOMgrLYQHiiljnIh47KQ01pBGK3nZKjDrHu3WBFt7YrpBWqWIffoVl4wqtoFTC53bf3IN39LdrB7aIGWSnJXSV3_pzdDeu9anNHlbPgUjXpDdG4588Yx-sIpD-sTwF_zLTQNpoAv',
    rfid: 'RF-0044-STAF',
  },
  {
    id: 'KP-77983',
    name: 'Alyssa Gomez',
    fullName: 'Alyssa Gomez',
    email: 'a.gomez.new@upk.edu.ph',
    role: 'Customer',
    roleDetail: 'Customer (Freshman)',
    status: 'pending',
    isActive: false,
    libraryCardNumber: '#KP-77983',
    department: 'School of Economics',
    joinedDate: '2024-10-24',
    lastLogin: 'Never logged in',
    loans: '0/4',
    holds: '0',
    fines: 'Awaiting ID badge scan',
    initials: 'AG',
    rfid: 'RF-PENDING',
  },
  {
    id: 'KP-00018',
    name: 'Gabriel Reyes',
    fullName: 'Gabriel Reyes',
    email: 'g.reyes.admin@upk.edu.ph',
    role: 'Admin',
    roleDetail: 'Admin Supervisor',
    status: 'active',
    isActive: true,
    libraryCardNumber: '#KP-00018',
    department: 'Information Services & Cataloging',
    joinedDate: '2019-02-01',
    lastLogin: '2 hours ago',
    loans: 'Level 4 Super',
    holds: '0',
    fines: '2FA Secured',
    initials: 'GR',
    rfid: 'RF-ROOT-ADM1',
  },
];
*/

const UserManagement: FC = () => {
  // 1. Data states
  const [users, setPatrons] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch real-time users from backend
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const records = await getAdminUsersList();
      if (records && records.length > 0) {
        const mapped: UserItem[] = records.map((r) => ({
          id: r.id,
          name: r.fullName || r.name,
          fullName: r.fullName || r.name,
          firstName: r.firstName,
          middleName: r.middleName,
          surname: r.lastName,
          age: r.age,
          address: r.currentAddress,
          phone: r.phoneNumber,
          username: r.username,
          email: r.email,
          role: r.role,
          roleDetail: r.role === 'Admin' ? 'System Administrator' : r.role === 'Cashier' ? 'Circulation Cashier' : 'Academic User',
          status: r.status,
          isActive: r.isActive,
          isProtected: r.isProtected ?? false,
          libraryCardNumber: r.libraryCardNumber || `#KP-${r.id.slice(0, 5)}`,
          department: r.department || 'General',
          joinedDate: r.joinedDate,
          lastLogin: 'Active session',
          loans: '0/4',
          holds: '0',
          fines: '₱0.00 clear',
          initials: (r.fullName || r.name)
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase(),
          rfid: `RF-${r.id.slice(0, 4).toUpperCase()}`,
        }));
        setPatrons(mapped);
      } else {
        // Real-time empty state: database has no users, leave empty!
        setPatrons([]);
      }
    } catch (err) {
      console.warn('[UserManagement] Real-time data fetch notice:', err);
      setPatrons([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Hook global refresh on network reconnection or window focus
  usePagesGlobalRefresh(loadUsers);

  // 2. Filter & Search states
  const [rawSearch, setRawSearch] = useState<string>('');
  const debouncedSearch = useDebounce<string>(rawSearch, 300);
  const [roleScope, setRoleScope] = useState<'All' | 'Customer' | 'Cashier' | 'Admin'>('All');
  const [accountState, setAccountState] = useState<'All' | 'Active' | 'Inactive' | 'Suspended'>('All');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  // 3. Sorting states
  const [sortColumn, setSortColumn] = useState<'name' | 'id' | 'role' | 'status' | 'date'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeSortKey, setActiveSortKey] = useState<string>('name-asc');

  const handleSortSelect = (val: string) => {
    setActiveSortKey(val);
    if (val === 'name-asc') {
      setSortColumn('name');
      setSortDirection('asc');
    } else if (val === 'name-desc') {
      setSortColumn('name');
      setSortDirection('desc');
    } else if (val === 'date-desc') {
      setSortColumn('date');
      setSortDirection('desc');
    } else if (val === 'id-asc') {
      setSortColumn('id');
      setSortDirection('asc');
    } else if (val === 'role-asc') {
      setSortColumn('role');
      setSortDirection('asc');
    }
  };

  // 4. Selection & Bulk action states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 5. Modal dialog states (using DefaultFloatingModalCard)
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState<boolean>(false);
  const [isSingleDeleteModalOpen, setIsSingleDeleteModalOpen] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);
  const [singleDeleteError, setSingleDeleteError] = useState<string>('');
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [activePatron, setActivePatron] = useState<UserItem | null>(null);

  // Form states for Add / Edit
  const [formFirstName, setFormFirstName] = useState<string>('');
  const [formMiddleName, setFormMiddleName] = useState<string>('');
  const [formSurname, setFormSurname] = useState<string>('');
  const [formAge, setFormAge] = useState<string>('');
  const [formAddress, setFormAddress] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formUsername, setFormUsername] = useState<string>('');
  const [formPassword, setFormPassword] = useState<string>('');
  const [formConfirmPassword, setFormConfirmPassword] = useState<string>('');
  const [formAvatarUrl, setFormAvatarUrl] = useState<string>('');
  const [formRole, setFormRole] = useState<'Customer' | 'Cashier' | 'Admin'>('Customer');
  const [formDepartment, setFormDepartment] = useState<string>('');
  const [formCardNumber, setFormCardNumber] = useState<string>('');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  // Eye visibility toggles & error messages
  const [showAddPassword, setShowAddPassword] = useState<boolean>(false);
  const [showAddConfirmPassword, setShowAddConfirmPassword] = useState<boolean>(false);
  const [showEditPassword, setShowEditPassword] = useState<boolean>(false);
  const [showEditConfirmPassword, setShowEditConfirmPassword] = useState<boolean>(false);
  const [addFormError, setAddFormError] = useState<string>('');
  const [editFormError, setEditFormError] = useState<string>('');

  // Drag and drop image upload states and references
  const [isDraggingPicture, setIsDraggingPicture] = useState<boolean>(false);
  const [isEditDraggingPicture, setIsEditDraggingPicture] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  // Email format validator (@gmail.com, @yahoo.com, or institutional domain)
  const validateEmailFormat = (email: string): boolean => {
    const trimmed = email.trim();
    if (!trimmed.includes('@')) return false;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(trimmed);
  };

  // Unique ascending Library Card Number auto-suggestion
  const getNextSuggestedCardNumber = useCallback((existingUsers: UserItem[], role: string = 'Customer') => {
    const prefix = role === 'Admin' ? 'KP-ADM' : role === 'Cashier' ? 'KP-CSH' : 'KP-LIB';
    const year = 2026;
    const nums: number[] = [];
    existingUsers.forEach((u) => {
      const match = u.libraryCardNumber?.match(/(\d{4,6})/g);
      if (match) {
        match.forEach((m) => {
          const parsed = parseInt(m, 10);
          if (parsed > 1000 && parsed !== 2026) nums.push(parsed);
        });
      }
    });
    const nextNum = nums.length > 0 ? Math.max(...nums) + 1 : 73320;
    return `${prefix}-${year}-${nextNum.toString().padStart(5, '0')}`;
  }, []);

  // Export Modal Filter States
  const [exportStartDate, setExportStartDate] = useState<string>('');
  const [exportEndDate, setExportEndDate] = useState<string>('');
  const [exportAlphaType, setExportAlphaType] = useState<'all' | 'start' | 'end' | 'contains'>('all');
  const [exportAlphaLetter, setExportAlphaLetter] = useState<string>('A');
  const [exportIdType, setExportIdType] = useState<'all' | 'start' | 'end' | 'contains'>('all');
  const [exportIdDigit, setExportIdDigit] = useState<string>('1');
  const [exportSortDir, setExportSortDir] = useState<'asc' | 'desc'>('desc');
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx'>('csv');

  // Hooks: Drag-to-scroll & Fluid responsiveness
  const { containerRef, isDragging } = useTableDraggable<HTMLDivElement>();
  const { isMobile, isTablet } = useFluidResposiveness();



  // Filtering & Sorting Pipeline
  const filteredAndSortedPatrons = useMemo(() => {
    let result = [...users];

    // 1. Search filter
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.libraryCardNumber.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q)
      );
    }

    // 2. Role Scope filter
    if (roleScope !== 'All') {
      result = result.filter((p) => p.role === roleScope);
    }

    // 3. Account State filter
    if (accountState === 'Active') {
      result = result.filter((p) => p.status === 'active');
    } else if (accountState === 'Inactive') {
      result = result.filter((p) => p.status === 'pending');
    } else if (accountState === 'Suspended') {
      result = result.filter((p) => p.status === 'suspended');
    }

    // 4. Sorting
    result.sort((a, b) => {
      let valA = '';
      let valB = '';
      if (sortColumn === 'name') {
        valA = a.fullName.toLowerCase();
        valB = b.fullName.toLowerCase();
      } else if (sortColumn === 'id') {
        valA = a.libraryCardNumber.toLowerCase();
        valB = b.libraryCardNumber.toLowerCase();
      } else if (sortColumn === 'role') {
        valA = a.role.toLowerCase();
        valB = b.role.toLowerCase();
      } else if (sortColumn === 'status') {
        valA = a.status.toLowerCase();
        valB = b.status.toLowerCase();
      } else if (sortColumn === 'date') {
        valA = a.joinedDate;
        valB = b.joinedDate;
      }
      const comparison = valA.localeCompare(valB);
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [users, debouncedSearch, roleScope, accountState, sortColumn, sortDirection]);

  // Pagination hook
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
  } = usePagination(filteredAndSortedPatrons, { initialPageSize: 10 });

  // Counts for metric badges strictly adhering to ADMIN DATA SHOW FORMULA.md
  // Metric 1.1: Active Users (Borrower users active in good standing)
  const activeCount = useMemo(
    () => users.filter((p) => (p.role === 'Customer' || !p.role) && (p.isActive || p.status === 'active')).length,
    [users]
  );
  // Metric 1.2: On-Hold / Fines (Users with suspended status or active hold flags)
  const suspendedCount = useMemo(
    () => users.filter((p) => !p.isActive || p.status === 'suspended' || (p.holds && parseInt(p.holds) > 0)).length,
    [users]
  );
  // Metric 1.3: Staff Desks (Operational staff accounts: Cashier and Admin)
  const staffCount = useMemo(
    () => users.filter((p) => (p.role === 'Cashier' || p.role === 'Admin') && (p.isActive || p.status === 'active')).length,
    [users]
  );

  const customerCount = useMemo(() => users.filter((p) => p.role === 'Customer').length, [users]);
  const cashierCount = useMemo(() => users.filter((p) => p.role === 'Cashier').length, [users]);
  const adminCount = useMemo(() => users.filter((p) => p.role === 'Admin').length, [users]);

  // Checkbox handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const eligibleIds = paginatedItems.filter((item) => !item.isProtected).map((item) => item.id);
      setSelectedIds(eligibleIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    const targetUser = users.find((u) => u.id === id);
    if (targetUser?.isProtected) return; // Immune CLI root account cannot be selected for bulk operations
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Sorting header click
  const handleHeaderSort = (col: 'name' | 'id' | 'role' | 'status' | 'date') => {
    if (sortColumn === col) {
      const nextDir = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(nextDir);
      setActiveSortKey(`${col}-${nextDir}`);
    } else {
      setSortColumn(col);
      setSortDirection('asc');
      setActiveSortKey(`${col}-asc`);
    }
  };

  // Open modals
  const openAddModal = () => {
    setFormFirstName('');
    setFormMiddleName('');
    setFormSurname('');
    setFormAge('');
    setFormAddress('');
    setFormPhone('');
    setFormEmail('');
    setFormUsername('');
    setFormPassword('');
    setFormConfirmPassword('');
    setFormAvatarUrl('');
    setShowAddPassword(false);
    setShowAddConfirmPassword(false);
    setAddFormError('');
    setFormRole('Customer');
    setFormDepartment('');
    setFormCardNumber(getNextSuggestedCardNumber(users, 'Customer'));
    setFormIsActive(true);
    setIsAddModalOpen(true);
  };

  const openEditModal = (p: UserItem) => {
    setActivePatron(p);
    setFormFirstName(p.firstName || '');
    setFormMiddleName(p.middleName || '');
    setFormSurname(p.surname || '');
    setFormAge(p.age || '');
    setFormAddress(p.address || '');
    setFormPhone(p.phone || '');
    setFormEmail(p.email);
    setFormUsername(p.username || '');
    setFormPassword('');
    setFormConfirmPassword('');
    setFormAvatarUrl(p.avatarUrl || '');
    setShowEditPassword(false);
    setShowEditConfirmPassword(false);
    setEditFormError('');
    setFormDepartment(p.department);
    setFormCardNumber(p.libraryCardNumber.replace('#', ''));
    setFormRole(p.role);
    setFormIsActive(p.isActive);
    setIsEditModalOpen(true);
  };

  const openViewModal = (p: UserItem) => {
    setActivePatron(p);
    setIsViewModalOpen(true);
  };

  const openSuspendModal = (p: UserItem) => {
    setActivePatron(p);
    setIsSuspendModalOpen(true);
  };

  // Submit Add User
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddFormError('');

    if (!formFirstName.trim() || !formSurname.trim() || !formUsername.trim()) {
      setAddFormError('First Name, Surname, and Username are required.');
      return;
    }

    if (!validateEmailFormat(formEmail)) {
      setAddFormError('Institutional Email must contain a valid domain (e.g. @gmail.com, @yahoo.com, or institutional domain).');
      return;
    }

    if (!formPassword) {
      setAddFormError('Password is required.');
      return;
    }

    if (formPassword !== formConfirmPassword) {
      setAddFormError('Password and Confirm Password do not match.');
      return;
    }

    try {
      const roleNum = formRole === 'Admin' ? 3 : formRole === 'Cashier' ? 2 : 1;
      const res = await createAdminUser({
        firstName: formFirstName.trim(),
        middleName: formMiddleName.trim() || undefined,
        lastName: formSurname.trim(),
        username: formUsername.trim(),
        email: formEmail.trim(),
        password: formPassword,
        role: roleNum,
        department: formDepartment.trim() || undefined,
        libraryCardNumber: formCardNumber.trim() || undefined,
        age: formAge.trim() || undefined,
        currentAddress: formAddress.trim() || undefined,
        phoneNumber: formPhone.trim() || undefined,
      });

      if (!res || !res.success) {
        setAddFormError(res?.message || res?.errors?.[0] || 'Failed to create user. Please check details.');
        return;
      }

      setIsAddModalOpen(false);
      await loadUsers();
    } catch (err: any) {
      console.error('Failed to create user:', err);
      setAddFormError(err?.message || 'Failed to create user. Please check details.');
    }
  };

  // Submit Edit User
  const handleUpdateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditFormError('');
    if (!activePatron) return;

    if (!formFirstName.trim() || !formSurname.trim() || !formUsername.trim()) {
      setEditFormError('First Name, Surname, and Username are required.');
      return;
    }

    if (!validateEmailFormat(formEmail)) {
      setEditFormError('Institutional Email must contain a valid domain (e.g. @gmail.com, @yahoo.com, or institutional domain).');
      return;
    }

    if (formPassword && formPassword !== formConfirmPassword) {
      setEditFormError('NEW Password and Confirm Password do not match.');
      return;
    }

    try {
      const roleNum = formRole === 'Admin' ? 3 : formRole === 'Cashier' ? 2 : 1;
      const updateData: any = {
        firstName: formFirstName.trim(),
        middleName: formMiddleName.trim() || undefined,
        lastName: formSurname.trim(),
        username: formUsername.trim(),
        department: formDepartment.trim() || undefined,
        libraryCardNumber: formCardNumber.trim(),
        age: formAge.trim() || undefined,
        currentAddress: formAddress.trim() || undefined,
        phoneNumber: formPhone.trim() || undefined,
        role: roleNum,
        isActive: formIsActive,
      };
      if (formPassword) {
        updateData.password = formPassword;
      }
      const res = await updateAdminUser(activePatron.id, updateData);

      if (!res || !res.success) {
        setEditFormError(res?.message || res?.errors?.[0] || 'Failed to update user.');
        return;
      }

      setIsEditModalOpen(false);
      await loadUsers();
    } catch (err: any) {
      console.error('Failed to update user:', err);
      setEditFormError(err?.message || 'Failed to update user.');
    }
  };

  // Submit Suspend / Toggle Status
  const handleConfirmSuspend = async () => {
    if (!activePatron) return;
    if (activePatron.isProtected && activePatron.isActive) {
      alert('Protected CLI root accounts cannot be suspended via the Web UI.');
      return;
    }
    const nextActive = !activePatron.isActive;

    try {
      const res = await toggleUserStatus(activePatron.id, nextActive);
      if (!res || !res.success) {
        alert(res?.message || res?.errors?.[0] || 'Failed to update user status.');
        return;
      }
      setPatrons((prev) =>
        prev.map((p) =>
          p.id === activePatron.id
            ? {
                ...p,
                isActive: nextActive,
                status: nextActive ? 'active' : 'suspended',
              }
            : p
        )
      );
      setIsSuspendModalOpen(false);
      await loadUsers();
    } catch (err: any) {
      console.error('Failed to toggle status:', err);
      alert(err?.message || 'Failed to toggle status.');
    }
  };

  // Submit Single Delete
  const handleConfirmSingleDelete = async () => {
    if (!userToDelete) return;
    if (userToDelete.isProtected) {
      setSingleDeleteError('Protected CLI root account cannot be deleted via the Web UI. Administrative CLI terminal authority is required.');
      return;
    }
    try {
      const res = await deleteAdminUser(userToDelete.id);
      if (!res || !res.success) {
        setSingleDeleteError(res?.message || res?.errors?.[0] || 'Failed to delete user account.');
        return;
      }
      setPatrons((prev) => prev.filter((p) => p.id !== userToDelete.id));
      setSelectedIds((prev) => prev.filter((id) => id !== userToDelete.id));
      setIsSingleDeleteModalOpen(false);
      setUserToDelete(null);
      await loadUsers();
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      setSingleDeleteError(err?.message || 'Failed to delete user account.');
    }
  };

  // Submit Bulk Delete
  const handleConfirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await bulkDeleteAdminUsers(selectedIds);
      if (!res || !res.success) {
        alert(res?.message || res?.errors?.[0] || 'Failed to bulk delete user accounts.');
        return;
      }
      setPatrons((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      setSelectedIds([]);
      setIsBulkDeleteModalOpen(false);
      await loadUsers();
    } catch (err: any) {
      console.error('Bulk deletion failed:', err);
      alert(err?.message || 'Bulk deletion failed.');
    }
  };

  // Advanced Export Generation
  const handleExecuteExport = () => {
    let dataset = [...users];

    // Filter by dates
    if (exportStartDate) {
      dataset = dataset.filter((p) => p.joinedDate >= exportStartDate);
    }
    if (exportEndDate) {
      dataset = dataset.filter((p) => p.joinedDate <= exportEndDate);
    }

    // Filter by Alphabetical letter
    if (exportAlphaType === 'start' && exportAlphaLetter) {
      dataset = dataset.filter((p) =>
        p.fullName.toLowerCase().startsWith(exportAlphaLetter.toLowerCase())
      );
    } else if (exportAlphaType === 'end' && exportAlphaLetter) {
      dataset = dataset.filter((p) =>
        p.fullName.toLowerCase().endsWith(exportAlphaLetter.toLowerCase())
      );
    } else if (exportAlphaType === 'contains' && exportAlphaLetter) {
      dataset = dataset.filter((p) =>
        p.fullName.toLowerCase().includes(exportAlphaLetter.toLowerCase())
      );
    }

    // Filter by ID digit
    if (exportIdType === 'start' && exportIdDigit) {
      dataset = dataset.filter((p) =>
        p.libraryCardNumber.replace('#KP-', '').startsWith(exportIdDigit)
      );
    } else if (exportIdType === 'end' && exportIdDigit) {
      dataset = dataset.filter((p) =>
        p.libraryCardNumber.replace('#KP-', '').endsWith(exportIdDigit)
      );
    } else if (exportIdType === 'contains' && exportIdDigit) {
      dataset = dataset.filter((p) =>
        p.libraryCardNumber.includes(exportIdDigit)
      );
    }

    // Sort order
    if (exportSortDir === 'asc') {
      dataset.sort((a, b) => a.joinedDate.localeCompare(b.joinedDate));
    } else {
      dataset.sort((a, b) => b.joinedDate.localeCompare(a.joinedDate));
    }

    // Build export dataset (genuine CSV or real Office Open XML .xlsx workbook)
    const headers = ['User ID', 'Full Name', 'Email', 'Role', 'Department', 'Status', 'Registration Date', 'Active Loans'];
    const rows = dataset.map((p) => [
      p.libraryCardNumber,
      p.fullName,
      p.email,
      p.role,
      p.department,
      p.status,
      p.joinedDate,
      p.loans,
    ]);

    const baseName = `katipuneros_users_${new Date().toISOString().slice(0, 10)}`;
    if (exportFormat === 'xlsx') {
      exportToXlsx(`${baseName}.xlsx`, 'Users', headers, rows);
    } else {
      exportToCsv(`${baseName}.csv`, headers, rows);
    }
    setIsExportModalOpen(false);
  };

  const selectableVisibleItems = useMemo(
    () => paginatedItems.filter((item) => !item.isProtected),
    [paginatedItems]
  );

  const allVisibleSelected =
    selectableVisibleItems.length > 0 &&
    selectableVisibleItems.every((item) => selectedIds.includes(item.id));

  return (
    <div className="w-full pb-16">
      <div className="flex flex-col gap-space-lg w-full">
        {/* Top Metadata & Header Title */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-space-xs font-caption text-caption text-text-secondary uppercase tracking-widest">
              <span>Admin Console</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span>Management</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-primary font-semibold">Users</span>
            </div>
            <h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight font-bold">
              User Account Directory &amp; Governance
            </h1>
            <p className="font-body text-body text-text-secondary max-w-2xl">
              Manage user credentials, institutional affiliation, circulation clearances, and role authorizations across the academic repository.
            </p>
          </div>

          {/* Quick Operational Metrics Strip */}
          <div className="flex items-center gap-space-sm bg-surface-container-lowest p-1.5 rounded-xl shadow-sm self-start lg:self-auto border border-white/5">
            <div className="px-space-md py-1.5 flex flex-col items-center">
              <span className="font-caption text-caption text-text-secondary">Active Users</span>
              <span className="font-headline-4 text-headline-4 text-primary font-bold">
                {activeCount.toLocaleString()}
              </span>
            </div>
            <div className="w-px h-8 bg-surface-container"></div>
            <div className="px-space-md py-1.5 flex flex-col items-center">
              <span className="font-caption text-caption text-text-secondary">On-Hold / Fines</span>
              <span className="font-headline-4 text-headline-4 text-status-danger font-bold">
                {suspendedCount.toLocaleString()}
              </span>
            </div>
            <div className="w-px h-8 bg-surface-container"></div>
            <div className="px-space-md py-1.5 flex flex-col items-center">
              <span className="font-caption text-caption text-text-secondary">Staff Desks</span>
              <span className="font-headline-4 text-headline-4 text-secondary font-bold">
                {staffCount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Search, View Toggle, and Export Controls */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-md border border-white/5">
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-space-md">
            {/* Search Bar as Shared Primitive with Debouncing */}
            <div className="w-full xl:max-w-md">
              <SearchBar
                value={rawSearch}
                onChange={setRawSearch}
                onClear={() => setRawSearch('')}
                placeholder="Search user by name, ID (#KP-77401), email..."
                shortcutKey="⌘K"
              />
            </div>

            {/* Middle Controls: Status & Sort Dropdowns + View Mode Toggle + Actions */}
            <div className="flex flex-wrap items-center justify-start xl:justify-end gap-space-sm w-full xl:w-auto min-w-0">
              {/* STATUS Filter Dropdown via Shared/Dropdown */}
              <Dropdown
                items={[
                  { value: 'All', label: 'All Statuses', icon: 'filter_alt' },
                  { value: 'Active', label: 'Active Only', icon: 'check_circle' },
                  { value: 'Suspended', label: 'Suspended / Holds', icon: 'block', danger: true },
                  { value: 'Inactive', label: 'Inactive / Pending', icon: 'schedule' },
                ]}
                selectedValue={accountState}
                onSelect={(val) => setAccountState(val as any)}
                label="Status"
                icon="filter_alt"
              />

              {/* SORT Filter Dropdown via Shared/Dropdown */}
              <Dropdown
                items={[
                  { value: 'name-asc', label: 'Full Name (A–Z)', icon: 'sort_by_alpha' },
                  { value: 'name-desc', label: 'Full Name (Z–A)', icon: 'sort_by_alpha' },
                  { value: 'date-desc', label: 'Recently Registered', icon: 'history' },
                  { value: 'id-asc', label: 'Library Card ID', icon: 'badge' },
                  { value: 'role-asc', label: 'Role Scope', icon: 'manage_accounts' },
                ]}
                selectedValue={activeSortKey}
                onSelect={handleSortSelect}
                label="Sort"
                icon="sort"
              />

              {/* Radio buttons for Table Row <-> Card view toggle */}
              <div
                className="flex flex-shrink-0 items-center whitespace-nowrap bg-surface-container-low p-1 rounded-full border border-outline-variant/20 shadow-inner"
                role="radiogroup"
                aria-label="View layout toggle"
              >
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`flex flex-shrink-0 items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-caption font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  aria-checked={viewMode === 'table'}
                  role="radio"
                >
                  <span className="material-symbols-outlined text-[18px]">view_list</span>
                  <span>Table</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('card')}
                  className={`flex flex-shrink-0 items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-caption font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    viewMode === 'card'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  aria-checked={viewMode === 'card'}
                  role="radio"
                >
                  <span className="material-symbols-outlined text-[18px]">grid_view</span>
                  <span>Cards</span>
                </button>
              </div>

              {/* Export Modal Trigger via Shared/Button */}
              <Button
                variant="secondary"
                icon="file_download"
                onClick={() => setIsExportModalOpen(true)}
              >
                Export CSV / Excel
              </Button>

              {/* Add User Modal Trigger via Shared/Button */}
              <Button
                variant="action-green"
                icon="person_add"
                onClick={openAddModal}
              >
                Add User
              </Button>
            </div>
          </div>

          {/* Segmented Category Filters */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-sm pt-space-xs border-t border-outline-variant/10">
            {/* Role Scope Filter Pills */}
            <div className="flex flex-wrap items-center gap-space-xs">
              <span className="font-caption text-caption text-text-secondary mr-2 uppercase tracking-wider font-semibold">
                Role Scope:
              </span>
              <button
                type="button"
                onClick={() => setRoleScope('All')}
                className={`px-3.5 py-1.5 rounded-full font-caption text-caption font-semibold transition-all cursor-pointer ${
                  roleScope === 'All'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-chip-unselected-bg text-text-secondary hover:bg-surface-container hover:text-text-primary'
                }`}
              >
                All ({users.length})
              </button>
              <button
                type="button"
                onClick={() => setRoleScope('Customer')}
                className={`px-3.5 py-1.5 rounded-full font-caption text-caption font-semibold transition-all cursor-pointer ${
                  roleScope === 'Customer'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-chip-unselected-bg text-text-secondary hover:bg-surface-container hover:text-text-primary'
                }`}
              >
                Customers / Users ({customerCount})
              </button>
              <button
                type="button"
                onClick={() => setRoleScope('Cashier')}
                className={`px-3.5 py-1.5 rounded-full font-caption text-caption font-semibold transition-all cursor-pointer ${
                  roleScope === 'Cashier'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-chip-unselected-bg text-text-secondary hover:bg-surface-container hover:text-text-primary'
                }`}
              >
                Cashiers ({cashierCount})
              </button>
              <button
                type="button"
                onClick={() => setRoleScope('Admin')}
                className={`px-3.5 py-1.5 rounded-full font-caption text-caption font-semibold transition-all cursor-pointer ${
                  roleScope === 'Admin'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-chip-unselected-bg text-text-secondary hover:bg-surface-container hover:text-text-primary'
                }`}
              >
                Administrators ({adminCount})
              </button>
            </div>

            {/* Account State Filter Pills */}
            <div className="flex flex-wrap items-center gap-space-xs">
              <span className="font-caption text-caption text-text-secondary mr-2 uppercase tracking-wider font-semibold">
                Account State:
              </span>
              <button
                type="button"
                onClick={() => setAccountState('All')}
                className={`px-3 py-1 rounded-full font-caption text-caption font-semibold transition-all cursor-pointer ${
                  accountState === 'All'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-low text-text-secondary hover:text-text-primary'
                }`}
              >
                All States
              </button>
              <button
                type="button"
                onClick={() => setAccountState('Active')}
                className={`px-3 py-1 rounded-full font-caption text-caption font-semibold transition-all cursor-pointer ${
                  accountState === 'Active'
                    ? 'bg-soft-blue text-primary shadow-sm'
                    : 'bg-surface-container-low text-text-secondary hover:text-text-primary'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setAccountState('Inactive')}
                className={`px-3 py-1 rounded-full font-caption text-caption font-semibold transition-all cursor-pointer ${
                  accountState === 'Inactive'
                    ? 'bg-surface-container text-text-primary shadow-sm'
                    : 'bg-surface-container-low text-text-secondary hover:text-text-primary'
                }`}
              >
                Inactive / Pending ({users.filter((p) => p.status === 'pending').length})
              </button>
              <button
                type="button"
                onClick={() => setAccountState('Suspended')}
                className={`px-3 py-1 rounded-full font-caption text-caption font-semibold transition-all cursor-pointer ${
                  accountState === 'Suspended'
                    ? 'bg-error-container text-on-error-container shadow-sm'
                    : 'bg-surface-container-low text-status-danger hover:bg-error-container/40'
                }`}
              >
                Suspended / Hold ({suspendedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Floating Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="sticky top-20 z-30 bg-[#164E63] text-white p-space-md rounded-xl shadow-xl flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-space-md">
              <span className="material-symbols-outlined text-action-green text-2xl">check_circle</span>
              <span className="font-small text-small font-bold">
                {selectedIds.length} {selectedIds.length === 1 ? 'user' : 'users'} selected
              </span>
            </div>
            <div className="flex items-center gap-space-sm">
              <Button
                variant="danger"
                size="sm"
                icon="delete"
                onClick={() => setIsBulkDeleteModalOpen(true)}
              >
                Bulk Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 hover:text-white"
                onClick={() => setSelectedIds([])}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        )}

        {/* Main Content Area: Table View or Card Grid View */}
        {viewMode === 'table' ? (
          /* Draggable Table View */
          <div className="relative w-full bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col border border-white/5">
            <div
              ref={containerRef}
              className={`overflow-x-auto ${isDragging ? 'select-none' : ''}`}
            >
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-surface-container-low text-text-secondary font-caption text-caption uppercase tracking-wider select-none">
                    <th className="py-3.5 px-space-md w-12 text-center">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={handleSelectAll}
                        className="rounded border-outline-variant text-primary focus:ring-primary cursor-pointer w-4 h-4"
                        aria-label="Select all rows"
                      />
                    </th>
                    <th
                      className="py-3.5 px-space-md font-semibold cursor-pointer hover:text-text-primary transition-colors"
                      onClick={() => handleHeaderSort('id')}
                    >
                      <div className="flex items-center gap-1">
                        <span>User ID</span>
                        {sortColumn === 'id' && (
                          <span className="material-symbols-outlined text-[16px]">
                            {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="py-3.5 px-space-md font-semibold cursor-pointer hover:text-text-primary transition-colors"
                      onClick={() => handleHeaderSort('name')}
                    >
                      <div className="flex items-center gap-1">
                        <span>User / User Details</span>
                        {sortColumn === 'name' && (
                          <span className="material-symbols-outlined text-[16px]">
                            {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="py-3.5 px-space-md font-semibold cursor-pointer hover:text-text-primary transition-colors"
                      onClick={() => handleHeaderSort('role')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Institutional Role</span>
                        {sortColumn === 'role' && (
                          <span className="material-symbols-outlined text-[16px]">
                            {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="py-3.5 px-space-md font-semibold cursor-pointer hover:text-text-primary transition-colors"
                      onClick={() => handleHeaderSort('status')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Account Status</span>
                        {sortColumn === 'status' && (
                          <span className="material-symbols-outlined text-[16px]">
                            {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="py-3.5 px-space-md font-semibold cursor-pointer hover:text-text-primary transition-colors"
                      onClick={() => handleHeaderSort('date')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Registration &amp; Login</span>
                        {sortColumn === 'date' && (
                          <span className="material-symbols-outlined text-[16px]">
                            {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="py-3.5 px-space-md font-semibold">Active Circulation</th>
                    <th className="py-3.5 px-space-md font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-text-secondary">
                        <span className="material-symbols-outlined text-4xl mb-2 text-text-secondary/60">person_search</span>
                        <p className="font-small text-small font-semibold">No users match the selected criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((p) => {
                      const isSelected = selectedIds.includes(p.id);
                      return (
                        <tr
                          key={p.id}
                          className={`transition-colors group ${
                            isSelected
                              ? 'bg-soft-blue/40 hover:bg-soft-blue/60'
                              : p.status === 'suspended'
                              ? 'bg-error-container/20 hover:bg-error-container/30'
                              : 'hover:bg-surface-container-low'
                          }`}
                        >
                          <td className="py-3.5 px-space-md text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={p.isProtected}
                              onChange={() => handleSelectRow(p.id)}
                              className={`rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 ${
                                p.isProtected ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                              }`}
                              aria-label={p.isProtected ? `Protected account: ${p.fullName}` : `Select ${p.fullName}`}
                              title={p.isProtected ? 'Protected CLI Account (Cannot be bulk deleted)' : `Select ${p.fullName}`}
                            />
                          </td>
                          <td className="py-3.5 px-space-md font-small text-small font-bold text-primary">
                            {p.libraryCardNumber}
                          </td>
                          <td className="py-3.5 px-space-md">
                            <div className="flex items-center gap-space-sm">
                              {p.avatarUrl ? (
                                <img
                                  className="w-9 h-9 rounded-full object-cover shadow-sm flex-shrink-0"
                                  src={p.avatarUrl}
                                  alt={p.fullName}
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-small flex items-center justify-center flex-shrink-0">
                                  {p.initials || p.fullName.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-small text-small font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
                                    {p.fullName}
                                  </span>
                                  {p.isProtected && (
                                    <span
                                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                      title="Protected CLI Root Account (Manageable via terminal CLI only)"
                                    >
                                      <span className="material-symbols-outlined text-[12px]">shield</span>
                                      CLI ROOT
                                    </span>
                                  )}
                                </div>
                                <span className="font-caption text-caption text-text-secondary truncate">
                                  {p.email}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-space-md">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-caption text-caption font-semibold bg-secondary-container text-on-secondary-container">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  p.role === 'Admin'
                                    ? 'bg-secondary'
                                    : p.role === 'Cashier'
                                    ? 'bg-tertiary'
                                    : 'bg-primary'
                                }`}
                              ></span>
                              {p.roleDetail}
                            </span>
                          </td>
                          <td className="py-3.5 px-space-md">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-caption text-caption font-semibold ${
                                p.status === 'active'
                                  ? 'bg-status-available/15 text-status-available'
                                  : p.status === 'suspended'
                                  ? 'bg-error-container text-on-error-container'
                                  : 'bg-status-pending/20 text-status-pending'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  p.status === 'active'
                                    ? 'bg-status-available'
                                    : p.status === 'suspended'
                                    ? 'bg-error'
                                    : 'bg-status-pending'
                                }`}
                              ></span>
                              {p.status === 'active'
                                ? 'Active'
                                : p.status === 'suspended'
                                ? 'Suspended / Hold'
                                : 'Pending Verification'}
                            </span>
                          </td>
                          <td className="py-3.5 px-space-md">
                            <div className="flex flex-col">
                              <span className="font-small text-small text-text-primary">{p.joinedDate}</span>
                              <span className="font-caption text-caption text-text-secondary">{p.lastLogin}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-space-md">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-caption text-caption text-text-secondary">
                                Loans: <strong className="text-text-primary">{p.loans}</strong>
                              </span>
                              <span
                                className={`font-caption text-[11px] font-semibold ${
                                  p.fines.includes('Overdue') ? 'text-status-danger' : 'text-status-available'
                                }`}
                              >
                                {p.fines}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-space-md text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => openViewModal(p)}
                                className="p-1.5 rounded-lg text-primary hover:bg-surface-container transition-colors cursor-pointer"
                                title="Inspect Profile"
                              >
                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditModal(p)}
                                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-container transition-colors cursor-pointer"
                                title="Edit Credentials"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit_square</span>
                              </button>
                              <button
                                type="button"
                                disabled={p.isProtected}
                                onClick={() => !p.isProtected && openSuspendModal(p)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  p.isProtected
                                    ? 'opacity-30 cursor-not-allowed text-text-secondary'
                                    : p.isActive
                                    ? 'text-status-danger hover:bg-error-container/40 cursor-pointer'
                                    : 'text-status-available hover:bg-status-available/10 cursor-pointer'
                                }`}
                                title={
                                  p.isProtected
                                    ? 'Protected CLI Root Account (Cannot be suspended via Web UI)'
                                    : p.isActive
                                    ? 'Suspend User'
                                    : 'Reactivate User'
                                }
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  {p.isProtected ? 'lock' : p.isActive ? 'block' : 'lock_reset'}
                                </span>
                              </button>
                              <button
                                type="button"
                                disabled={p.isProtected}
                                onClick={() => {
                                  if (p.isProtected) return;
                                  setUserToDelete(p);
                                  setSingleDeleteError('');
                                  setIsSingleDeleteModalOpen(true);
                                }}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  p.isProtected
                                    ? 'opacity-30 cursor-not-allowed text-text-secondary'
                                    : 'text-text-secondary hover:text-status-danger hover:bg-error-container/30 cursor-pointer'
                                }`}
                                title={p.isProtected ? 'Protected CLI Root Account (Manageable via CLI only)' : 'Delete User'}
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  {p.isProtected ? 'verified_user' : 'delete'}
                                </span>
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

            {/* Pagination Controls Footer */}
            <div className="p-space-md bg-surface-container-lowest border-t border-outline-variant/10 flex flex-col sm:flex-row items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-md">
                <span className="font-small text-small text-text-secondary">
                  Showing <strong className="text-text-primary">{totalItems === 0 ? 0 : startIndex + 1}–{endIndex}</strong> of{' '}
                  <strong className="text-text-primary">{totalItems.toLocaleString()}</strong> registered accounts
                </span>
                <div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption">
                  <span>Rows:</span>
                  <Dropdown<number>
                    variant="pagination"
                    items={pageSizeOptions.map((opt) => ({ value: opt, label: String(opt) }))}
                    selectedValue={pageSize}
                    onSelect={(sz) => setPageSize(sz)}
                  />
                </div>
              </div>

              {/* Page Buttons */}
              <div className="flex items-center gap-space-xs">
                <button
                  type="button"
                  onClick={() => goToPage(1)}
                  disabled={!canPrevPage}
                  className={`p-1.5 rounded-lg transition-colors ${
                    canPrevPage
                      ? 'text-text-secondary hover:bg-surface-container cursor-pointer'
                      : 'text-outline-variant cursor-not-allowed'
                  }`}
                  title="First Page"
                >
                  <span className="material-symbols-outlined text-[20px]">keyboard_double_arrow_left</span>
                </button>
                <button
                  type="button"
                  onClick={prevPage}
                  disabled={!canPrevPage}
                  className={`p-1.5 rounded-lg transition-colors ${
                    canPrevPage
                      ? 'text-text-secondary hover:bg-surface-container cursor-pointer'
                      : 'text-outline-variant cursor-not-allowed'
                  }`}
                  title="Previous Page"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>

                {/* Page Pill Indicators */}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pNum = i + 1;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => goToPage(pNum)}
                      className={`w-8 h-8 rounded-lg font-caption text-caption font-bold flex items-center justify-center transition-colors cursor-pointer ${
                        currentPage === pNum
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'text-text-secondary hover:bg-surface-container'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                {totalPages > 5 && <span className="px-1 text-text-secondary font-caption text-caption">...</span>}

                <button
                  type="button"
                  onClick={nextPage}
                  disabled={!canNextPage}
                  className={`p-1.5 rounded-lg transition-colors ${
                    canNextPage
                      ? 'text-text-secondary hover:bg-surface-container cursor-pointer'
                      : 'text-outline-variant cursor-not-allowed'
                  }`}
                  title="Next Page"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
                <button
                  type="button"
                  onClick={() => goToPage(totalPages)}
                  disabled={!canNextPage}
                  className={`p-1.5 rounded-lg transition-colors ${
                    canNextPage
                      ? 'text-text-secondary hover:bg-surface-container cursor-pointer'
                      : 'text-outline-variant cursor-not-allowed'
                  }`}
                  title="Last Page"
                >
                  <span className="material-symbols-outlined text-[20px]">keyboard_double_arrow_right</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Card Grid View */
          <div className="flex flex-col gap-space-md">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
              {paginatedItems.length === 0 ? (
                <div className="col-span-full py-12 text-center text-text-secondary bg-surface-container-lowest rounded-xl">
                  <span className="material-symbols-outlined text-4xl mb-2 text-text-secondary/60">person_search</span>
                  <p className="font-small text-small font-semibold">No users match the selected criteria.</p>
                </div>
              ) : (
                paginatedItems.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      className={`relative bg-surface-container-lowest p-space-md rounded-2xl border transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/20 bg-soft-blue/20'
                          : 'border-outline-variant/20 hover:border-outline-variant/40'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-space-sm mb-space-sm">
                        <div className="flex items-center gap-space-sm">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={p.isProtected}
                            onChange={() => handleSelectRow(p.id)}
                            className={`rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 mt-1 ${
                              p.isProtected ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            aria-label={p.isProtected ? `Protected account: ${p.fullName}` : `Select ${p.fullName}`}
                            title={p.isProtected ? 'Protected CLI Account (Cannot be bulk deleted)' : `Select ${p.fullName}`}
                          />
                          {p.avatarUrl ? (
                            <img
                              className="w-12 h-12 rounded-full object-cover shadow-sm flex-shrink-0"
                              src={p.avatarUrl}
                              alt={p.fullName}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-headline-4 flex items-center justify-center flex-shrink-0">
                              {p.initials || p.fullName.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-headline-4 text-small font-bold text-text-primary truncate">
                                {p.fullName}
                              </span>
                              {p.isProtected && (
                                <span
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                  title="Protected CLI Root Account (Manageable via terminal CLI only)"
                                >
                                  <span className="material-symbols-outlined text-[12px]">shield</span>
                                  CLI ROOT
                                </span>
                              )}
                            </div>
                            <span className="font-caption text-caption text-text-secondary truncate">
                              {p.email}
                            </span>
                            <span className="font-caption text-[11px] font-mono text-primary font-bold mt-0.5">
                              {p.libraryCardNumber}
                            </span>
                          </div>
                        </div>

                        {/* Status Chip */}
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-caption text-[11px] font-bold ${
                            p.status === 'active'
                              ? 'bg-status-available/15 text-status-available'
                              : p.status === 'suspended'
                              ? 'bg-error-container text-on-error-container'
                              : 'bg-status-pending/20 text-status-pending'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.status === 'active'
                                ? 'bg-status-available'
                                : p.status === 'suspended'
                                ? 'bg-error'
                                : 'bg-status-pending'
                            }`}
                          />
                          {p.status === 'active' ? 'Active' : p.status === 'suspended' ? 'Suspended' : 'Pending'}
                        </span>
                      </div>

                      {/* Card Body Information */}
                      <div className="bg-surface-container-low/60 p-space-sm rounded-xl flex flex-col gap-1.5 mb-space-sm text-caption">
                        <div className="flex items-center justify-between text-text-secondary">
                          <span>Role:</span>
                          <span className="font-semibold text-text-primary">{p.roleDetail}</span>
                        </div>
                        <div className="flex items-center justify-between text-text-secondary">
                          <span>Department:</span>
                          <span className="font-semibold text-text-primary truncate max-w-[180px]">{p.department}</span>
                        </div>
                        <div className="flex items-center justify-between text-text-secondary">
                          <span>Circulation:</span>
                          <span className="font-semibold text-text-primary">Loans: {p.loans}</span>
                        </div>
                        <div className="flex items-center justify-between text-text-secondary">
                          <span>Ledger:</span>
                          <span
                            className={`font-semibold ${
                              p.fines.includes('Overdue') ? 'text-status-danger' : 'text-status-available'
                            }`}
                          >
                            {p.fines}
                          </span>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="flex items-center justify-between pt-space-xs border-t border-outline-variant/10">
                        <span className="font-caption text-[11px] text-text-secondary">
                          Joined {p.joinedDate}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openViewModal(p)}
                            className="p-1.5 rounded-lg text-primary hover:bg-surface-container transition-colors cursor-pointer"
                            title="Inspect Profile"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-container transition-colors cursor-pointer"
                            title="Edit Credentials"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit_square</span>
                          </button>
                          <button
                            type="button"
                            disabled={p.isProtected}
                            onClick={() => !p.isProtected && openSuspendModal(p)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              p.isProtected
                                ? 'opacity-30 cursor-not-allowed text-text-secondary'
                                : p.isActive
                                ? 'text-status-danger hover:bg-error-container/40 cursor-pointer'
                                : 'text-status-available hover:bg-status-available/10 cursor-pointer'
                            }`}
                            title={
                              p.isProtected
                                ? 'Protected CLI Root Account (Cannot be suspended via Web UI)'
                                : p.isActive
                                ? 'Suspend User'
                                : 'Reactivate User'
                            }
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {p.isProtected ? 'lock' : p.isActive ? 'block' : 'lock_reset'}
                            </span>
                          </button>
                          <button
                            type="button"
                            disabled={p.isProtected}
                            onClick={() => {
                              if (p.isProtected) return;
                              setUserToDelete(p);
                              setSingleDeleteError('');
                              setIsSingleDeleteModalOpen(true);
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              p.isProtected
                                ? 'opacity-30 cursor-not-allowed text-text-secondary'
                                : 'text-text-secondary hover:text-status-danger hover:bg-error-container/30 cursor-pointer'
                            }`}
                            title={p.isProtected ? 'Protected CLI Root Account (Manageable via CLI only)' : 'Delete User'}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {p.isProtected ? 'verified_user' : 'delete'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Controls for Card View */}
            <div className="p-space-md bg-surface-container-lowest rounded-xl border border-outline-variant/10 flex flex-col sm:flex-row items-center justify-between gap-space-md shadow-sm">
              <div className="flex items-center gap-space-md">
                <span className="font-small text-small text-text-secondary">
                  Showing <strong className="text-text-primary">{totalItems === 0 ? 0 : startIndex + 1}–{endIndex}</strong> of{' '}
                  <strong className="text-text-primary">{totalItems.toLocaleString()}</strong> registered accounts
                </span>
                <div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption">
                  <span>Rows:</span>
                  <Dropdown<number>
                    variant="pagination"
                    items={pageSizeOptions.map((opt) => ({ value: opt, label: String(opt) }))}
                    selectedValue={pageSize}
                    onSelect={(sz) => setPageSize(sz)}
                  />
                </div>
              </div>

              {/* Page Buttons */}
              <div className="flex items-center gap-space-xs">
                <button
                  type="button"
                  onClick={() => goToPage(1)}
                  disabled={!canPrevPage}
                  className={`p-1.5 rounded-lg transition-colors ${
                    canPrevPage
                      ? 'text-text-secondary hover:bg-surface-container cursor-pointer'
                      : 'text-outline-variant cursor-not-allowed'
                  }`}
                  title="First Page"
                >
                  <span className="material-symbols-outlined text-[20px]">keyboard_double_arrow_left</span>
                </button>
                <button
                  type="button"
                  onClick={prevPage}
                  disabled={!canPrevPage}
                  className={`p-1.5 rounded-lg transition-colors ${
                    canPrevPage
                      ? 'text-text-secondary hover:bg-surface-container cursor-pointer'
                      : 'text-outline-variant cursor-not-allowed'
                  }`}
                  title="Previous Page"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pNum = i + 1;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => goToPage(pNum)}
                      className={`w-8 h-8 rounded-lg font-caption text-caption font-bold flex items-center justify-center transition-colors cursor-pointer ${
                        currentPage === pNum
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'text-text-secondary hover:bg-surface-container'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={nextPage}
                  disabled={!canNextPage}
                  className={`p-1.5 rounded-lg transition-colors ${
                    canNextPage
                      ? 'text-text-secondary hover:bg-surface-container cursor-pointer'
                      : 'text-outline-variant cursor-not-allowed'
                  }`}
                  title="Next Page"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
                <button
                  type="button"
                  onClick={() => goToPage(totalPages)}
                  disabled={!canNextPage}
                  className={`p-1.5 rounded-lg transition-colors ${
                    canNextPage
                      ? 'text-text-secondary hover:bg-surface-container cursor-pointer'
                      : 'text-outline-variant cursor-not-allowed'
                  }`}
                  title="Last Page"
                >
                  <span className="material-symbols-outlined text-[20px]">keyboard_double_arrow_right</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SHARED MODALS (USING DefaultFloatingModalCard)                            */}
      {/* ========================================================================= */}

      {/* 1. ADD USER MODAL */}
      <DefaultFloatingModalCard
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Institutional User"
        maxWidth="max-w-2xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-space-md py-2 rounded-full bg-surface-container text-text-secondary hover:text-text-primary font-small text-small font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-user-form"
              className="px-space-lg py-2 rounded-full bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-bold shadow-sm cursor-pointer"
            >
              Create Account
            </button>
          </>
        }
      >
        <form id="add-user-form" onSubmit={handleCreateUserSubmit} className="flex flex-col gap-space-md">
          {addFormError && (
            <div className="p-3 rounded-xl bg-error-container/40 text-on-error-container text-small font-semibold border border-status-danger/30 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-status-danger">error</span>
              <span>{addFormError}</span>
            </div>
          )}

          {/* UPLOAD PICTURE (WITH DRAGGABLE FUNCTIONS) */}
          <div className="flex flex-col gap-1.5">
            <label className="block font-caption text-caption text-text-secondary font-semibold uppercase">
              Upload Picture (Draggable)
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingPicture(true);
              }}
              onDragLeave={() => setIsDraggingPicture(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingPicture(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  const file = e.dataTransfer.files[0];
                  const reader = new FileReader();
                  reader.onload = (uploadEvent) => {
                    setFormAvatarUrl(uploadEvent.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDraggingPicture
                  ? 'border-primary bg-primary/10 scale-[1.01]'
                  : 'border-outline-variant/40 hover:border-primary/50 bg-surface-container-low'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onload = (uploadEvent) => {
                      setFormAvatarUrl(uploadEvent.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {formAvatarUrl ? (
                <div className="relative group">
                  <img
                    src={formAvatarUrl}
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover shadow-md border-2 border-primary"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white text-[20px]">edit</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-text-secondary">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
                  </div>
                  <span className="font-small text-small font-semibold text-text-primary">
                    Drag and drop profile picture here, or click to browse
                  </span>
                  <span className="font-caption text-caption text-text-secondary">
                    PNG, JPG, or WEBP (Max 5MB)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Full Name : FIRST NAME, MIDDLENAME, SURNAME */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
            <div>
              <label className="block font-caption text-caption text-text-secondary font-semibold uppercase mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formFirstName}
                onChange={(e) => setFormFirstName(e.target.value)}
                placeholder="Maria"
                className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block font-caption text-caption text-text-secondary font-semibold uppercase mb-1">
                Middle Name
              </label>
              <input
                type="text"
                value={formMiddleName}
                onChange={(e) => setFormMiddleName(e.target.value)}
                placeholder="Clara"
                className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block font-caption text-caption text-text-secondary font-semibold uppercase mb-1">
                Surname *
              </label>
              <input
                type="text"
                required
                value={formSurname}
                onChange={(e) => setFormSurname(e.target.value)}
                placeholder="Santos"
                className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* AGE, ADDRESS, PHONE */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
            <div>
              <label className="block font-caption text-caption text-text-secondary font-semibold uppercase mb-1">
                Age
              </label>
              <input
                type="number"
                value={formAge}
                onChange={(e) => setFormAge(e.target.value)}
                placeholder="21"
                className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-caption text-caption text-text-secondary font-semibold uppercase mb-1">
                Address
              </label>
              <input
                type="text"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder="123 Katipunan St, Barangay Bayanihan"
                className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <label className="block font-caption text-caption text-text-secondary font-semibold uppercase mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+63 917 123 4567"
                className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block font-caption text-caption text-text-secondary font-semibold uppercase mb-1">
                Institutional Email *
              </label>
              <input
                type="email"
                required
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="m.clara@gmail.com, @yahoo.com"
                className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <label className="block font-caption text-caption text-text-secondary font-semibold uppercase mb-1">
                Username * (Required)
              </label>
              <input
                type="text"
                required
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
                placeholder="mariaclara"
                className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block font-caption text-caption text-text-secondary font-semibold uppercase mb-1">
                Institutional Role
              </label>
              <select
                value={formRole}
                onChange={(e) => {
                  const newRole = e.target.value as any;
                  setFormRole(newRole);
                  setFormCardNumber(getNextSuggestedCardNumber(users, newRole));
                }}
                className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="Customer">Customer (Student / Patron)</option>
                <option value="Cashier">Cashier (Circulation Desk)</option>
                <option value="Admin">Administrator</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <label className="block font-caption text-caption text-text-secondary font-semibold uppercase mb-1">
                Academic Department / Affiliation
              </label>
              <input
                type="text"
                value={formDepartment}
                onChange={(e) => setFormDepartment(e.target.value)}
                placeholder="College of Engineering & Architecture"
                className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-caption text-caption text-text-secondary font-semibold uppercase">
                  Library Card Number
                </label>
                <span className="font-caption text-[11px] text-action-green font-medium">
                  Auto-suggested unused ID
                </span>
              </div>
              <input
                type="text"
                value={formCardNumber}
                onChange={(e) => setFormCardNumber(e.target.value)}
                placeholder="Auto-suggests if blank"
                className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Password & Confirm Password with Eye Visibility Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <label className="block font-caption text-caption text-text-secondary font-semibold uppercase mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showAddPassword ? 'text' : 'password'}
                  required
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Enter secure password"
                  className="w-full bg-surface-container-low px-space-md pr-10 py-2.5 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowAddPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary cursor-pointer p-1"
                  title={showAddPassword ? 'Hide Password' : 'Show Password'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showAddPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
            <div>
              <label className="block font-caption text-caption text-text-secondary font-semibold uppercase mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showAddConfirmPassword ? 'text' : 'password'}
                  required
                  value={formConfirmPassword}
                  onChange={(e) => setFormConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full bg-surface-container-low px-space-md pr-10 py-2.5 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowAddConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary cursor-pointer p-1"
                  title={showAddConfirmPassword ? 'Hide Password' : 'Show Password'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showAddConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </DefaultFloatingModalCard>

      {/* 2. EDIT USER CREDENTIALS MODAL */}
      <DefaultFloatingModalCard
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User Credentials"
        maxWidth="max-w-2xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-space-md py-2 rounded-full bg-surface-container text-text-secondary hover:text-text-primary font-small text-small font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-user-form"
              className="px-space-lg py-2 rounded-full bg-primary hover:bg-primary/90 text-on-primary font-small text-small font-bold shadow-sm cursor-pointer"
            >
              Save Changes
            </button>
          </>
        }
      >
        <form id="edit-user-form" onSubmit={handleUpdateUserSubmit} className="flex flex-col gap-space-md">
          {editFormError && (
            <div className="p-3 rounded-xl bg-error-container/40 text-on-error-container text-small font-semibold border border-status-danger/30 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-status-danger">error</span>
              <span>{editFormError}</span>
            </div>
          )}

          {/* UPLOAD PICTURE (WITH DRAGGABLE FUNCTIONS WITH EDIT ICON) */}
          <div className="flex flex-col gap-1.5">
            <label className="block font-caption text-caption text-text-secondary font-semibold uppercase">
              Upload Picture (Draggable with Edit Icon)
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsEditDraggingPicture(true);
              }}
              onDragLeave={() => setIsEditDraggingPicture(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsEditDraggingPicture(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  const file = e.dataTransfer.files[0];
                  const reader = new FileReader();
                  reader.onload = (uploadEvent) => {
                    setFormAvatarUrl(uploadEvent.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              onClick={() => editFileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isEditDraggingPicture
                  ? 'border-primary bg-primary/10 scale-[1.01]'
                  : 'border-outline-variant/40 hover:border-primary/50 bg-surface-container-low'
              }`}
            >
              <input
                ref={editFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onload = (uploadEvent) => {
                      setFormAvatarUrl(uploadEvent.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {formAvatarUrl ? (
                <div className="relative group">
                  <img
                    src={formAvatarUrl}
                    alt="User Avatar"
                    className="w-20 h-20 rounded-full object-cover shadow-md border-2 border-primary"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white text-[20px]">edit</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full shadow-md">
                    <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-text-secondary">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary relative">
                    <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
                    <span className="material-symbols-outlined text-[14px] absolute -bottom-1 -right-1 bg-primary text-white p-0.5 rounded-full">
                      edit
                    </span>
                  </div>
                  <span className="font-small text-small font-semibold text-text-primary">
                    Drag and drop new photo here, or click to replace
                  </span>
                  <span className="font-caption text-caption text-text-secondary">
                    PNG, JPG, or WEBP (Max 5MB)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* FIRST NAME, MIDDLENAME, SURNAME */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
            <div>
              <label className="block font-caption text-caption text-text-secondary font-semibold uppercase mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formFirstName}
                onChange={(e) => setFormFirstName(e.target.value)}
                className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block font-caption text-caption text-text-secondary font-semibold uppercase mb-1">
                Middle Name
              </label>
              <input
                type="text"
                value={formMiddleName}
                onChange={(e) => setFormMiddleName(e.target.value)}
                className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block font-caption text-caption text-text-secondary font-semibold uppercase mb-1">
                Surname *
              </label>
              <input
                type="text"
                required
                value={formSurname}
                onChange={(e) => setFormSurname(e.target.value)}
                className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* AGE, ADDRESS, PHONE */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
            <div>
              <label className="block font-caption text-caption text-text-secondary font-semibold uppercase mb-1">
                Age
              </label>
              <input
                type="number"
                value={formAge}
                onChange={(e) => setFormAge(e.target.value)}
                className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-caption text-caption text-text-secondary font-semibold uppercase mb-1">
                Address
              </label>
              <input
                type="text"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <label className="block font-caption text-caption text-text-secondary font-semibold uppercase mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block font-caption text-caption text-text-secondary font-semibold uppercase mb-1">
                Institutional Email *
              </label>
              <input
                type="email"
                required
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="user@gmail.com, @yahoo.com"
                className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <label className="block font-caption text-caption text-text-secondary font-semibold uppercase mb-1">
                Username * (Required)
              </label>
              <input
                type="text"
                required
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
                className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block font-caption text-caption text-text-secondary font-semibold uppercase mb-1">
                Institutional Role
              </label>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as any)}
                className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="Customer">Customer (Student / Patron)</option>
                <option value="Cashier">Cashier (Circulation Desk)</option>
                <option value="Admin">Administrator</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <label className="block font-caption text-caption text-text-secondary font-semibold uppercase mb-1">
                Department
              </label>
              <input
                type="text"
                value={formDepartment}
                onChange={(e) => setFormDepartment(e.target.value)}
                className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-caption text-caption text-text-secondary font-semibold uppercase">
                  Library Card Number
                </label>
                <span className="font-caption text-[11px] text-action-green font-medium">
                  Primary Unique Card ID
                </span>
              </div>
              <input
                type="text"
                value={formCardNumber}
                onChange={(e) => setFormCardNumber(e.target.value)}
                className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* NEW Password & Confirm Password with Eye Visibility Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <label className="block font-caption text-caption text-text-secondary font-semibold uppercase mb-1">
                NEW Password (Optional)
              </label>
              <div className="relative">
                <input
                  type={showEditPassword ? 'text' : 'password'}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="w-full bg-surface-container-low px-space-md pr-10 py-2.5 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowEditPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary cursor-pointer p-1"
                  title={showEditPassword ? 'Hide Password' : 'Show Password'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showEditPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
            <div>
              <label className="block font-caption text-caption text-text-secondary font-semibold uppercase mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showEditConfirmPassword ? 'text' : 'password'}
                  value={formConfirmPassword}
                  onChange={(e) => setFormConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-surface-container-low px-space-md pr-10 py-2.5 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowEditConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary cursor-pointer p-1"
                  title={showEditConfirmPassword ? 'Hide Password' : 'Show Password'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showEditConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Account Standing Toggle */}
          <div className="flex items-center justify-between p-space-md bg-surface-container-low rounded-xl">
            <div className="flex flex-col">
              <span className="font-small text-small font-semibold text-text-primary">Account Standing</span>
              <span className="font-caption text-caption text-text-secondary">
                Toggle active circulation and borrowing privileges
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-action-green"></div>
            </label>
          </div>
        </form>
      </DefaultFloatingModalCard>

      {/* 3. VIEW USER INFORMATION (VIEWONLY) MODAL */}
      <DefaultFloatingModalCard
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="VIEW USER INFORMATION (VIEWONLY)"
        maxWidth="max-w-2xl"
        footer={
          <button
            type="button"
            onClick={() => setIsViewModalOpen(false)}
            className="px-space-lg py-2 rounded-full bg-primary text-on-primary font-small text-small font-bold cursor-pointer"
          >
            Close
          </button>
        }
      >
        {activePatron && (
          <div className="flex flex-col gap-space-lg">
            {/* Header info */}
            <div className="flex flex-col gap-space-md bg-surface-container-low p-space-md rounded-2xl">
              <div className="flex items-center gap-space-md">
                {activePatron.avatarUrl ? (
                  <img
                    className="w-16 h-16 rounded-full object-cover shadow-md flex-shrink-0"
                    src={activePatron.avatarUrl}
                    alt={activePatron.fullName}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/20 text-primary font-bold text-headline-2 flex items-center justify-center flex-shrink-0">
                    {activePatron.initials || activePatron.fullName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="font-headline-4 text-headline-4 font-bold text-text-primary">
                      FULLNAME: {activePatron.firstName || ''} {activePatron.middleName ? activePatron.middleName + ' ' : ''}{activePatron.surname || activePatron.name}
                    </h3>
                  </div>
                  <span className="font-caption text-caption bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded font-bold self-start mt-1">
                    Library Card Number: {activePatron.libraryCardNumber}
                  </span>
                  <span className="font-small text-small text-text-secondary mt-1">
                    Username: @{activePatron.username || 'unknown'}
                  </span>
                  <span className="font-small text-small text-text-secondary">
                    Institutional Email: {activePatron.email}
                  </span>
                  <span className="font-caption text-caption text-primary font-medium mt-0.5">
                    Department: {activePatron.department}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2 border-t border-outline-variant/30 pt-4">
                <div>
                  <span className="font-caption text-caption text-text-secondary uppercase font-semibold">AGE</span>
                  <p className="font-small text-text-primary font-medium">{activePatron.age || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-caption text-caption text-text-secondary uppercase font-semibold">PHONE</span>
                  <p className="font-small text-text-primary font-medium">{activePatron.phone || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-caption text-caption text-text-secondary uppercase font-semibold">ADDRESS</span>
                  <p className="font-small text-text-primary font-medium">{activePatron.address || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Standby Formula Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-1 border border-outline-variant/20">
                <span className="font-caption text-caption text-primary uppercase font-bold tracking-wider">
                  Circulation Quota (Standby Formula)
                </span>
                <span className="font-small text-small text-text-secondary">
                  If user sales books on that day:
                </span>
                <div className="mt-1 p-2 bg-surface-container-lowest rounded-lg font-mono text-caption text-text-primary">
                  Daily Quota = Base (5) - Active Loans ({activePatron.loans || '0/4'}) + Daily Sales (0)
                </div>
                <span className="font-caption text-[11px] text-action-green font-semibold mt-1">
                  Status: Standby Formula Active (Auto-computes with daily sales ledger)
                </span>
              </div>

              <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-1 border border-outline-variant/20">
                <span className="font-caption text-caption text-primary uppercase font-bold tracking-wider">
                  On-Time Return Rate (Standby Formula)
                </span>
                <span className="font-small text-small text-text-secondary">
                  Daily Rate: ₱120.00 | Overtime: 20 min
                </span>
                <div className="mt-1 p-2 bg-surface-container-lowest rounded-lg font-mono text-caption text-text-primary">
                  Rate/Hr = ₱120 / 8h = ₱15.00/h<br/>
                  20 min OT = (20/60) × ₱15.00 = ₱5.00 (500 cents)
                </div>
                <span className="font-caption text-[11px] text-action-green font-semibold mt-1">
                  Status: 100% On-Time (Standby Rate Calculator Ready)
                </span>
              </div>
            </div>

            {/* Account Standing: LEAVE ONLY THIS ONE */}
            <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-2 border border-outline-variant/20">
              <div className="flex items-center justify-between">
                <span className="font-small text-small text-text-primary font-semibold">Account Standing:</span>
                <span
                  className={`font-caption text-caption px-3 py-1 rounded-full font-bold ${
                    activePatron.isActive
                      ? 'bg-status-available/20 text-status-available'
                      : 'bg-error-container text-on-error-container'
                  }`}
                >
                  {activePatron.isActive ? 'Active Privilege' : 'Suspended Privilege'}
                </span>
              </div>
            </div>
          </div>
        )}
      </DefaultFloatingModalCard>

      {/* 4. SUSPEND USER PRIVILEGES CONFIRMATION MODAL */}
      <DefaultFloatingModalCard
        isOpen={isSuspendModalOpen}
        onClose={() => setIsSuspendModalOpen(false)}
        title={activePatron?.isActive ? 'Suspend user Privileges' : 'Reactivate user Privileges'}
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsSuspendModalOpen(false)}
              className="px-space-md py-2 rounded-full bg-surface-container text-text-secondary hover:text-text-primary font-small text-small font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmSuspend}
              className={`px-space-lg py-2 rounded-full font-small text-small font-bold text-white shadow-sm cursor-pointer ${
                activePatron?.isActive ? 'bg-status-danger hover:bg-status-danger/80' : 'bg-primary hover:bg-primary/90'
              }`}
            >
              {activePatron?.isActive ? 'Confirm Suspension' : 'Confirm Reactivation'}
            </button>
          </>
        }
      >
        {activePatron && (
          <div className="flex flex-col gap-space-md text-text-secondary">
            <p className="font-small text-small">
              Are you sure you want to suspend all circulation and borrowing privileges for{' '}
              <strong className="text-text-primary">{activePatron.fullName}</strong> ({activePatron.libraryCardNumber})?
            </p>
            <p className="font-caption text-caption text-status-danger bg-error-container/20 p-space-sm rounded-lg">
              Notice: Suspended users will be immediately blocked from borrowing physical repository materials and reserving items at terminal desks.
            </p>
          </div>
        )}
      </DefaultFloatingModalCard>

      {/* 5. CONFIRM SINGLE USER DELETION MODAL */}
      <DefaultFloatingModalCard
        isOpen={isSingleDeleteModalOpen}
        onClose={() => {
          setIsSingleDeleteModalOpen(false);
          setUserToDelete(null);
          setSingleDeleteError('');
        }}
        title="Confirm user Deletion"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setIsSingleDeleteModalOpen(false);
                setUserToDelete(null);
                setSingleDeleteError('');
              }}
              className="px-space-md py-2 rounded-full bg-surface-container text-text-secondary hover:text-text-primary font-small text-small font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmSingleDelete}
              className="px-space-lg py-2 rounded-full bg-status-danger hover:bg-status-danger/80 text-white font-small text-small font-bold shadow-sm cursor-pointer"
            >
              Delete Account
            </button>
          </>
        }
      >
        {userToDelete && (
          <div className="flex flex-col gap-3">
            <p className="font-small text-small text-text-secondary">
              Are you sure you want to permanently delete user{' '}
              <strong className="text-text-primary font-bold">{userToDelete.fullName}</strong> ({userToDelete.libraryCardNumber})?
              This action cannot be undone.
            </p>
            {singleDeleteError && (
              <div className="p-3 bg-error-container/20 border border-error/30 rounded-lg text-status-danger text-caption font-semibold">
                {singleDeleteError}
              </div>
            )}
          </div>
        )}
      </DefaultFloatingModalCard>

      {/* 5.5. CONFIRM BULK DELETION MODAL */}
      <DefaultFloatingModalCard
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        title="Confirm Bulk Deletion"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsBulkDeleteModalOpen(false)}
              className="px-space-md py-2 rounded-full bg-surface-container text-text-secondary hover:text-text-primary font-small text-small font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmBulkDelete}
              className="px-space-lg py-2 rounded-full bg-status-danger hover:bg-status-danger/80 text-white font-small text-small font-bold shadow-sm cursor-pointer"
            >
              Delete {selectedIds.length} {selectedIds.length === 1 ? 'Account' : 'Accounts'}
            </button>
          </>
        }
      >
        <p className="font-small text-small text-text-secondary">
          Are you sure you want to permanently delete{' '}
          <strong className="text-status-danger font-bold">{selectedIds.length}</strong> selected user accounts?
          This action cannot be undone.
        </p>
      </DefaultFloatingModalCard>

      {/* 6. ADVANCED CSV / EXCEL EXPORT MODAL */}
      <DefaultFloatingModalCard
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export User Directory"
        maxWidth="max-w-xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsExportModalOpen(false)}
              className="px-space-md py-2 rounded-full bg-surface-container text-text-secondary hover:text-text-primary font-small text-small font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecuteExport}
              className="px-space-lg py-2 rounded-full bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-bold shadow-sm cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Download Export</span>
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-space-md text-text-primary">
          {/* Date Range Selection */}
          <div className="flex flex-col gap-1">
            <span className="font-caption text-caption text-text-secondary font-semibold uppercase tracking-wider">
              1. Date Range Filter
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mt-1">
              <div>
                <label className="block font-caption text-caption text-text-secondary mb-1">Start Date</label>
                <input
                  type="date"
                  value={exportStartDate}
                  onChange={(e) => setExportStartDate(e.target.value)}
                  className="w-full bg-surface-container-low px-space-md py-2 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-caption text-caption text-text-secondary mb-1">End Date</label>
                <input
                  type="date"
                  value={exportEndDate}
                  onChange={(e) => setExportEndDate(e.target.value)}
                  className="w-full bg-surface-container-low px-space-md py-2 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Alphabetical Name Filter */}
          <div className="flex flex-col gap-1 pt-space-xs border-t border-outline-variant/10">
            <span className="font-caption text-caption text-text-secondary font-semibold uppercase tracking-wider">
              2. Alphabetical Name Filter
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mt-1">
              <select
                value={exportAlphaType}
                onChange={(e) => setExportAlphaType(e.target.value as any)}
                className="bg-surface-container-low px-space-md py-2 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none"
              >
                <option value="all">All Names</option>
                <option value="start">Starts with letter</option>
                <option value="end">Ends with letter</option>
                <option value="contains">Contains letter</option>
              </select>
              {exportAlphaType !== 'all' && (
                <input
                  type="text"
                  maxLength={1}
                  value={exportAlphaLetter}
                  onChange={(e) => setExportAlphaLetter(e.target.value.toUpperCase())}
                  placeholder="Letter (e.g. A)"
                  className="bg-surface-container-low px-space-md py-2 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none uppercase"
                />
              )}
            </div>
          </div>

          {/* ID Digit Filter */}
          <div className="flex flex-col gap-1 pt-space-xs border-t border-outline-variant/10">
            <span className="font-caption text-caption text-text-secondary font-semibold uppercase tracking-wider">
              3. ID Digit Filter
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mt-1">
              <select
                value={exportIdType}
                onChange={(e) => setExportIdType(e.target.value as any)}
                className="bg-surface-container-low px-space-md py-2 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none"
              >
                <option value="all">All IDs</option>
                <option value="start">ID starts with digit</option>
                <option value="end">ID ends with digit</option>
                <option value="contains">ID contains digit</option>
              </select>
              {exportIdType !== 'all' && (
                <input
                  type="text"
                  maxLength={2}
                  value={exportIdDigit}
                  onChange={(e) => setExportIdDigit(e.target.value)}
                  placeholder="Digit (e.g. 1)"
                  className="bg-surface-container-low px-space-md py-2 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none"
                />
              )}
            </div>
          </div>

          {/* Sort Order & Format Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-xs border-t border-outline-variant/10">
            <div>
              <span className="block font-caption text-caption text-text-secondary font-semibold uppercase tracking-wider mb-1">
                Sort Direction
              </span>
              <select
                value={exportSortDir}
                onChange={(e) => setExportSortDir(e.target.value as any)}
                className="w-full bg-surface-container-low px-space-md py-2 rounded-xl font-small text-small text-text-primary border border-outline-variant/30 focus:outline-none"
              >
                <option value="desc">Descending (Newest to Oldest)</option>
                <option value="asc">Ascending (Oldest to Newest)</option>
              </select>
            </div>
            <div>
              <span className="block font-caption text-caption text-text-secondary font-semibold uppercase tracking-wider mb-1">
                File Format
              </span>
              <div className="flex items-center gap-space-md mt-1.5">
                <label className="flex items-center gap-2 cursor-pointer font-small text-small">
                  <input
                    type="radio"
                    name="format"
                    checked={exportFormat === 'csv'}
                    onChange={() => setExportFormat('csv')}
                    className="text-primary focus:ring-primary"
                  />
                  <span>CSV (.csv)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-small text-small">
                  <input
                    type="radio"
                    name="format"
                    checked={exportFormat === 'xlsx'}
                    onChange={() => setExportFormat('xlsx')}
                    className="text-primary focus:ring-primary"
                  />
                  <span>Excel (.xlsx)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </DefaultFloatingModalCard>
    </div>
  );
};

export default UserManagement;
