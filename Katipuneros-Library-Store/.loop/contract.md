# Verification Contract: Full Circulation, Auth & Wishlist Loop

## Scope
- Backend API endpoints: `/api/auth/*`, `/api/books/*`, `/api/reservations/*`, `/api/borrowings/*`, `/api/returns/*`
- Frontend Endpoints & Storage: `apiClient.ts`, `authApi.ts`, `favoriteApi.ts`, `reservationApi.ts`
- Verification Automation: `scratch/verify_*.ps1`

## Acceptance Criteria
1. **CRIT-01 (customer-auth)**: User can register a customer account and immediately sign in using Username, Institutional Email, and Library Card Number returning HTTP 200 with JWT.
2. **CRIT-02 (admin-add-book)**: Adding a new book via Admin API persists in database and is returned in the public catalog with correct metadata and copy count.
3. **CRIT-03 (customer-reserve)**: Customer can place a reservation on an available book; reservation record is created with status `Pending` and is listed in the customer's active reservations.
4. **CRIT-04 (admin-triage)**: Admin can approve a pending reservation (transitions to `StagedInLocker` with locker pin and counter bay) AND decline a pending reservation (transitions to `Cancelled`/`Rejected` and restores copy availability).
5. **CRIT-05 (book-return)**: Borrowed book can be returned via circulation desk; return transaction status transitions to `Returned` and available book copies count increments back in catalog.
6. **CRIT-06 (patron-wishlist)**: Patron can add a book to their wishlist / favorites collection, query their saved list, and remove a book from favorites with full state synchronization.
