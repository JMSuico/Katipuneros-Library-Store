// [Layer: Endpoints/Admin]
// inventoryApi.ts -- API client for administrative physical stacks inventory and asset registry.
// Dispatches requests to /api/admin/inventory endpoints on .NET 10 Web API.
// ALL methods strictly use expression-bodied lambda expressions (=>).
// DO NOT put business logic or UI rendering here.

import { apiRequest } from '../apiClient';

export interface PhysicalInventoryItem {
  id: string;
  barcode: string;
  accessionBarcode?: string;
  rfidTag?: string;
  title: string;
  edition: string;
  deweyCode: string;
  bayLocation: string;
  wing: string;
  condition: 'Mint / Good' | 'Good' | 'Fair' | 'Spine Damaged' | 'Critical Wear';
  conditionStatus: 'good' | 'fair' | 'wear' | 'damaged';
  status: 'Available' | 'Staged Hold' | 'On Loan' | 'In Maintenance' | 'Lost / Discrepancy';
  custodyDetails: string;
  acquiredDate: string;
  labelDescription?: string;
  isAuditRequired?: boolean;
}

export interface InventoryMetricsDto {
  totalRegistered: number;
  onShelfActive: number;
  onShelfPercentage: number;
  circulatingLoan: number;
  circulatingPercentage: number;
  stagedForHolds: number;
  stagedPercentage: number;
  inMaintenance: number;
  maintenancePercentage: number;
  lostDiscrepancy: number;
  lostPercentage: number;
}

export interface UpdateInventoryStatusPayload {
  status: 'Available' | 'Staged Hold' | 'On Loan' | 'In Maintenance' | 'Lost / Discrepancy';
  condition?: 'Mint / Good' | 'Good' | 'Fair' | 'Spine Damaged' | 'Critical Wear';
  rationale?: string;
}

export interface AddLabelDescriptionPayload {
  labelDescription: string;
  spineNote?: string;
  markForPrintQueue?: boolean;
}

export interface IngestBarcodesPayload {
  bookTitle: string;
  deweyCode?: string;
  bayLocation: string;
  barcodes: string[];
}

export interface AdvancedInventoryExportFilter {
  startDate?: string;
  endDate?: string;
  alphabeticalFilter?: 'all' | 'starts_with' | 'ends_with' | 'contains';
  alphabeticalLetter?: string;
  idFilter?: 'all' | 'starts_with' | 'ends_with' | 'contains';
  idDigit?: string;
  sortDirection?: 'asc' | 'desc';
  format?: 'csv' | 'excel';
}

export interface ReplacementItem {
  id: string;
  barcode: string;
  title: string;
  deweyCode: string;
  currentWearCycles: number;
  cycleThreshold: number;
  wearSeverity: 'Critical' | 'Severe' | 'Moderate';
  estimatedCost: number;
  preservationWing: string;
}

// Empty default inventory records adhering to real-time zero-data mandate
const DEFAULT_INVENTORY_ITEMS: PhysicalInventoryItem[] = [];
/*
  {
    id: 'inv-001',
    barcode: '#KP-BC-4491-01',
    rfidTag: 'E200-983A-11',
    title: 'Clean Code: Handbook of Agile Software Craftsmanship',
    edition: '1st Ed. Robert C. Martin',
    deweyCode: '005.133 MAR',
    bayLocation: 'Bay 14, Shelf 3B',
    wing: 'Stacks South',
    condition: 'Mint / Good',
    conditionStatus: 'good',
    status: 'Available',
    custodyDetails: 'Public shelf inventory',
    acquiredDate: 'Jan 2023',
    labelDescription: 'Pristine accession condition. Shelf tag printed.',
  },
  {
    id: 'inv-002',
    barcode: '#KP-BC-4491-02',
    rfidTag: 'E200-983A-12',
    title: 'Clean Code: Handbook of Agile Software Craftsmanship',
    edition: '1st Ed. Robert C. Martin',
    deweyCode: '005.133 MAR',
    bayLocation: 'Locker Bay 01 C-02',
    wing: 'Central Staging',
    condition: 'Good',
    conditionStatus: 'good',
    status: 'Staged Hold',
    custodyDetails: 'User #KP-RES-00918',
    acquiredDate: 'Jan 2023',
    labelDescription: 'Assigned to smart locker pickup.',
  },
  {
    id: 'inv-003',
    barcode: '#KP-BC-4491-03',
    rfidTag: 'E200-983A-13',
    title: 'Clean Code: Handbook of Agile Software Craftsmanship',
    edition: '1st Ed. Robert C. Martin',
    deweyCode: '005.133 MAR',
    bayLocation: 'Off-Campus Loan',
    wing: 'External Lending',
    condition: 'Good',
    conditionStatus: 'good',
    status: 'On Loan',
    custodyDetails: 'User Jhon Doe • Due Nov 09',
    acquiredDate: 'Jan 2023',
  },
  {
    id: 'inv-004',
    barcode: '#KP-BC-4491-05',
    rfidTag: 'E200-983A-15',
    title: 'Clean Code: Handbook of Agile Software Craftsmanship',
    edition: '1st Ed. Robert C. Martin',
    deweyCode: '005.133 MAR',
    bayLocation: 'Bindery Lab Rm 102',
    wing: 'Preservation Wing',
    condition: 'Spine Damaged',
    conditionStatus: 'damaged',
    status: 'In Maintenance',
    custodyDetails: 'Thermal Re-binding',
    acquiredDate: 'Jan 2023',
    labelDescription: 'Dispatched to Preservation Suite for spine adhesive curation.',
  },
  {
    id: 'inv-005',
    barcode: '#KP-BC-1049-04',
    rfidTag: 'E200-771B-04',
    title: 'SICP (2nd Ed. MIT Press)',
    edition: 'Structure & Interpretation',
    deweyCode: '005.1 ABE',
    bayLocation: 'Special Reserve Bay 02',
    wing: 'Vault Wing',
    condition: 'Fair',
    conditionStatus: 'fair',
    status: 'On Loan',
    custodyDetails: 'Faculty Aris Thorne',
    acquiredDate: 'Feb 2022',
  },
  {
    id: 'inv-006',
    barcode: '#KP-BC-2091-01',
    rfidTag: 'E200-512C-09',
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    edition: '1st Ed. Erich Gamma et al.',
    deweyCode: '005.117 GOF',
    bayLocation: 'Bay 08, Shelf 2A',
    wing: 'Stacks North',
    condition: 'Mint / Good',
    conditionStatus: 'good',
    status: 'Available',
    custodyDetails: 'Public shelf inventory',
    acquiredDate: 'Mar 2023',
  },
  {
    id: 'inv-007',
    barcode: '#KP-BC-3382-07',
    rfidTag: 'E200-119F-88',
    title: 'Introduction to Algorithms (CLRS)',
    edition: '4th Ed. Cormen, Leiserson',
    deweyCode: '518.1 COR',
    bayLocation: 'Bay 04, Shelf 1C',
    wing: 'Stacks North',
    condition: 'Critical Wear',
    conditionStatus: 'wear',
    status: 'Lost / Discrepancy',
    custodyDetails: 'Physical audit discrepancy detected',
    acquiredDate: 'Oct 2021',
    isAuditRequired: true,
  },
  {
    id: 'inv-008',
    barcode: '#KP-BC-5521-02',
    rfidTag: 'E200-884D-22',
    title: 'Artificial Intelligence: A Modern Approach',
    edition: '4th Ed. Russell & Norvig',
    deweyCode: '006.3 RUS',
    bayLocation: 'Bay 12, Shelf 4B',
    wing: 'Stacks South',
    condition: 'Mint / Good',
    conditionStatus: 'good',
    status: 'Available',
    custodyDetails: 'Public shelf inventory',
    acquiredDate: 'May 2023',
  },
];
*/

const EMPTY_METRICS: InventoryMetricsDto = {
  totalRegistered: 0,
  onShelfActive: 0,
  onShelfPercentage: 0,
  circulatingLoan: 0,
  circulatingPercentage: 0,
  stagedForHolds: 0,
  stagedPercentage: 0,
  inMaintenance: 0,
  maintenancePercentage: 0,
  lostDiscrepancy: 0,
  lostPercentage: 0,
};

// Asynchronous Endpoint Stubs using clean arrow function lambdas (=>)
export const getInventoryItemsList = async (): Promise<PhysicalInventoryItem[]> =>
  (await apiRequest<PhysicalInventoryItem[]>('/admin/inventory/audit'))?.data ?? [];

export const getInventoryMetrics = async (): Promise<InventoryMetricsDto> =>
  (await apiRequest<InventoryMetricsDto>('/admin/inventory/metrics'))?.data ?? EMPTY_METRICS;

export const getReplacementList = async (): Promise<ReplacementItem[]> =>
  (await apiRequest<ReplacementItem[]>('/admin/inventory/replacements'))?.data ?? [];

export const updateInventoryItemStatus = async (id: string, payload: UpdateInventoryStatusPayload) =>
  await apiRequest<object>(`/admin/inventory/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const addInventoryLabelDescription = async (id: string, payload: AddLabelDescriptionPayload) =>
  await apiRequest<object>(`/admin/inventory/${id}/label`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const ingestPhysicalBarcodes = async (payload: IngestBarcodesPayload) =>
  await apiRequest<object>('/admin/inventory/barcodes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const bulkDeleteInventoryItems = async (ids: string[]) =>
  await apiRequest<object>('/admin/inventory/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });

export const triggerMarcSync = async () =>
  await apiRequest<{ syncedCount: number; message: string }>('/admin/inventory/marc-sync', {
    method: 'POST',
  });
