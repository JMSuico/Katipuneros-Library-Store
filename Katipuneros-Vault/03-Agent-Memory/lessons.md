---
title: Lessons Learned
updated: 2026-10-16
tags: [lessons, bugs, fixes]
---

# Lessons Learned & Antipatterns

1. **Path Prefix Duplication**: Frontend endpoints written as `/api/returns/...` became `/api/api/returns/...` through `apiClient.ts`. Fixed by stripping duplicate `/api/` in `apiClient.ts` and keeping endpoint paths clean.
2. **Barcode Ingestion FK Constraint**: Ingesting barcodes without setting `CategoryId` resulted in foreign key failures. Fixed by defaulting to default CategoryId.
3. **Borrow PatronId Fallback**: Self-checkout must extract patronId from JWT `NameIdentifier` if not explicitly supplied in request body.
4. **CoverImage Column Length**: Default `[MaxLength(500)]` truncates base64 data URLs. Upgraded to `NVARCHAR(MAX)`.
5. **Declined Holds Vanishing from Customer Ledger**: `GetActiveByPatronIdAsync` previously filtered on `Status == Pending || Status == StagedInLocker`. When cashier rejected a hold (`Status = Cancelled`), it vanished from `GET /api/reservations/my-holds`. Fixed by returning all patron holds ordered by `ReservationDate DESC`.
6. **Cashier Triage Mutability & Missing Badges**: Cashier table previously hardcoded `getAdminReservations('Pending')` removing triaged items on refresh, and rendered action buttons without once-only locks. Fixed by fetching all queue records, rendering status badges, and locking action columns with `APPROVED (ONCE)` and `DECLINED (ONCE)`.
