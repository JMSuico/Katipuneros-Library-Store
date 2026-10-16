# Verification Contract: Full-Stack CRUD End-to-End System

## Scope
- Full-Stack CRUD Data Flow: UI Client / Endpoint -> ASP.NET Core Controllers & Services -> EF Core SQL Server Database Mutation -> API Response Envelope -> Client Data Verification.
- Modules:
  1. Books & Inventory (`/api/books`, `[Books]`)
  2. Categories & Taxonomy (`/api/categories`, `[Categories]`)
  3. User & Patron Identity (`/api/users`, `/api/auth`, `[Users]`)
  4. Circulation Holds & Triage (`/api/reservations`, `[Reservations]`)
  5. Circulation Checkout & Returns (`/api/borrow`, `[BorrowTransactions]`, `[Books]`)
  6. Contact Desk Inquiries (`/api/contact`, `[ContactInquiries]`)

## Acceptance Criteria
1. **CRIT-01 (crud-books)**: Create book persists in `[Books]` table; Read returns entity; Update modifies title/bay/copies in DB; Delete removes record and confirms absence.
2. **CRIT-02 (crud-categories)**: Create category persists in `[Categories]`; Read lists record; Update modifies name/description; Delete removes record from SQL Server.
3. **CRIT-03 (crud-users)**: Create patron persists in `[Users]` with password hash; Read returns user profile; Update modifies user details; Status toggle deactivates account and blocks subsequent login.
4. **CRIT-04 (crud-reservations)**: Create hold records in `[Reservations]`; Read returns pending hold; Update via triage transitions status to `StagedInLocker`; Delete/Cancel updates status to `Cancelled` and restores copy.
5. **CRIT-05 (crud-borrowings)**: Checkout creates active record in `[BorrowTransactions]` and decrements `[Books].AvailableCopies`; Return updates status to `Returned` and increments available copies back.
6. **CRIT-06 (crud-inquiries)**: Submit contact inquiry inserts sanitized message in database; Admin read query lists inquiry.
