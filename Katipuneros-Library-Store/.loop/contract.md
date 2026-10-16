# Master Development-to-Production Testing Contract

## Scope
- Backend API Controllers, Services, and Middleware (`Backend/Features/Api/**`, `Backend/Features/Services/**`)
- Frontend Components and API clients (`Frontend/src/**`)
- Scratch verification suites (`scratch/**`)

## Acceptance Criteria
1. **CRIT-01 (stream1-smoke-health)**: Backend `/api/health` reports Healthy, database connectivity is active, category taxonomy is seeded, Altcha PoW service generates challenges, and catalog books endpoint responds.
   - Command: `powershell -ExecutionPolicy Bypass -File scratch/verify_stream1_smoke_health.ps1` -> Exit code 0
2. **CRIT-02 (stream2-security-rbac)**: Valid credentials authenticate for Admin, Cashier, and Customer; invalid credentials and tampered JWT tokens are rejected with HTTP 401; Cashier attempting Admin routes is blocked with HTTP 403; Customer attempting Cashier routes is blocked with HTTP 403; SQLi and XSS payloads are handled safely without unhandled 500 errors; SHA-256 Merkle root audit chain is verified intact.
   - Command: `powershell -ExecutionPolicy Bypass -File scratch/verify_stream2_security_rbac.ps1` -> Exit code 0
3. **CRIT-03 (stream3-crud-transactions)**: Full CRUD data flow and business transactions verified across Books, Categories, Users, Reservations, Borrowings, Inquiries, Settings/CIDR, plus 38 adversarial edge-cases (accession scanning, once-only triage atomicity, damage fine calculation).
   - Command: `powershell -ExecutionPolicy Bypass -File scratch/verify_stream3_crud_transactions.ps1` -> Exit code 0
4. **CRIT-04 (stream4-build-gates)**: Dual static build gates compile cleanly with zero errors: `tsc -b && vite build` in Frontend directory and `dotnet build Backend -c Debug` in Katipuneros-Library-Store.
   - Command: `powershell -ExecutionPolicy Bypass -File scratch/verify_stream4_build_gates.ps1` -> Exit code 0
