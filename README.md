# 📚 Katipuneros Library Store

A full-stack library management system with a public landing page and three role-based portals
(Customer, Cashier, Admin). Built with **React + TypeScript + Vite** on the frontend and
**.NET 10 / ASP.NET Core Web API + EF Core** on the backend.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Seeded Accounts](#seeded-accounts)
- [API Documentation (Scalar V1)](#api-documentation-scaler-v1)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Feature Status](#feature-status)
- [Configuration](#configuration)
- [Security Notes](#security-notes)
- [Known Issues](#known-issues)
- [Contributing / Agent Rules](#contributing--agent-rules)

---

## Overview

Katipuneros Library Store is a circulation and catalog management system. It supports:

- **Public landing page** — home, services, catalog showcase, and contact form.
- **Customer portal** — browse the catalog, place reservations, track borrowings, manage favorites.
- **Cashier portal (circulation desk)** — checkout/return books, process fines, look up patrons,
  manage schedules and transactions.
- **Admin portal (executive console)** — user management, book/category CRUD, reservations,
  reports, analytics, RBAC roles, audit logs, and system settings.

Authentication is handled via **JWT Bearer tokens** with **ASP.NET Identity-style** role claims,
enforced **backend-only** — frontend visibility is never a security boundary.

---

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | TypeScript, React 19, Vite 7, React Router v7 |
| Styling    | Plain CSS with global design tokens (`LayoutStyles/`) |
| 3D Assets  | Three.js (`src/Assets/threejs/`) |
| Backend    | .NET 10, ASP.NET Core Web API, C# 14 |
| ORM        | Entity Framework Core 10 (Code-First + Migrations) |
| Database   | SQL Server (primary) — PostgreSQL / MySQL supported by config |
| Auth       | JWT Bearer Tokens + BCrypt password hashing |
| API Docs   | Scalar V1 (`/scalar/v1`) + OpenAPI (`/openapi/v1.json`) |
| Cache      | Redis (`ICacheService` abstraction) |
| Email      | SMTP via `IEmailSender` |
| Spam guard | ALTCHA proof-of-work on public forms |

---

## Project Structure

```
Katipuneros-Library-Store/
├── Frontend/
│   ├── App.tsx                    # Router: React.lazy + Suspense + redirect guards
│   ├── main.tsx                   # ReactDOM entry
│   └── src/
│       ├── Assets/                # Images, videos, icons, threejs/ scenes
│       ├── LANDING_PAGE/          # Public slice (Home, Services, Products, ContactMe)
│       ├── UserRoles/             # Portal slices (Customers/Cashiers/Admins Panel)
│       ├── LayoutBars/            # LandingLayout, CustomerLayout, CashierLayout, AdminLayout
│       ├── Shared/                # Global presentational primitives
│       ├── LayoutStyles/          # Design tokens, MainLayout.css, FontSyle/
│       ├── Hooks/                 # useFluidResposiveness, useResponsive, useToasts, ...
│       ├── Libs/Assets/           # Static constants & link catalogs
│       └── Endpoints/             # Typed API stubs (apiClient + role-scoped feature APIs)
│
└── Backend/
    ├── Program.cs                 # DI + middleware pipeline
    ├── appsettings.json           # Connection strings, JWT, SMTP, Redis
    └── Features/
        ├── Data/                  # AppDbContext, Models/, Enums/, Migrations/
        ├── Repositories/          # Interfaces/ + Implementations/ (EF Core only)
        ├── Services/              # Interfaces/ + Implementations/ (business rules)
        ├── Helpers/Infrastructure # InputSanitizer, JwtHelper, PasswordHelper, AuditHelper
        ├── DBInfrastructure/      # Database/, Cache/, ApiTools/, EmailClient/
        ├── Api/                   # Controllers/, DTOs/, Middleware/
        └── (Management/)          # Migration/seed CLI commands
```

> **Layer rule:** Controllers never touch `_context`. Services never touch `HttpContext`.
> Only `Repositories/Implementations/` may query `AppDbContext`.

---

## Getting Started

### Prerequisites

- .NET 10 SDK
- Node.js 20+ and npm
- SQL Server (SSMS) / PostgreSQL / MySQL
- (Optional) Redis for caching

### 1. Backend

```bash
cd Backend

# Apply EF Core migrations
dotnet ef database update

# Run the API (Kestrel)
dotnet run
```

- API base URL: `http://localhost:5000`
- Scalar docs: `http://localhost:5000/scalar/v1`
- OpenAPI JSON: `http://localhost:5000/openapi/v1.json`

### 2. Frontend

```bash
cd Frontend

npm install
npm run dev
```

- Vite dev server: `http://localhost:5173`

### 3. Database

On first run, `DatabaseSeeder` provisions roles, categories, books, and demo accounts
(see [Seeded Accounts](#seeded-accounts)).

---

## Seeded Accounts

| Role     | Email                     | Password    |
|----------|---------------------------|-------------|
| Admin    | `admin@katipuneros.ph`    | `Admin@123` |
| Cashier  | `cashier@katipuneros.ph`  | `Cashier@123` |
| Customer | `customer@katipuneros.ph` | `Customer@123` |

> ⚠️ These are **development credentials**. Change or remove them before any deployment —
> see [Security Notes](#security-notes).

---

## API Documentation (Scalar V1)

Once the backend is running, open:

```
http://localhost:5000/scalar/v1
```

Scalar V1 replaces Swagger UI as the interactive API explorer. Every controller action declares
`[ProducesResponseType]` so request/response shapes are discoverable.

---

## Backend Architecture

### Request flow

```
HTTP Request
  → Middleware (GlobalException → RateLimit → Idempotency → CORS → JWT auth → Authorization)
  → Controller (parse DTO, validate, call IService)
  → Service (business rules, sanitization, orchestration)
  → Repository (EF Core queries via AppDbContext)
  → Database
```

### Layers

| Layer | Responsibility | Forbidden |
|-------|----------------|-----------|
| `Data/Models` | Entity shape + FK navigation | Business logic |
| `Data/Enums` | Enum values | Methods |
| `Repositories` | EF Core queries, CRUD, filtering | Business rules, service calls |
| `Services` | Validation, workflows, rules | `_context`, `HttpContext`, raw SQL |
| `Helpers/Infrastructure` | JWT, BCrypt, sanitizer, RBAC, audit | Workflows, direct DB calls |
| `Api/Controllers` | Parse request → `IService` → response | Logic, EF Core, `_context` |
| `Api/DTOs` | Data shaping + DataAnnotations | Validation logic |
| `Api/Middleware` | Rate limit, auth, idempotency, exceptions | Logic, DB queries |

### Controllers

`UsersController`, `BooksController`, `BorrowController`, `ReservationsController`,
`FinesController`, `CategoriesController`, `PersonnelController`, `AuditController`,
`ContactController`, `FeedbackController`, `AuthController`, `HealthController`,
`AltchaController`, `NotificationsController`.

### Middleware pipeline (`Program.cs`)

```csharp
app.UseMiddleware<GlobalExceptionMiddleware>();  // 1. catch unhandled exceptions
app.UseMiddleware<RateLimitMiddleware>();        // 2. per-IP rate limiting
app.UseMiddleware<IdempotencyMiddleware>();      // 3. duplicate POST protection
app.UseCors();                                   // 4. CORS headers
app.UseAuthentication();                         // 5. JWT validation
app.UseAuthorization();                          // 6. role / policy checks
app.MapControllers();                            // 7. route
```

---

## Frontend Architecture

### Flow chain

```
Pages        → route-level composition ONLY (no logic)
Features     → feature-specific UI, hooks, workflows
Hooks/State/Endpoints → reusable logic, shared state, API stubs
Shared       → presentational primitives
Libs         → formatters, validators, constants
Assets       → raw static files
```

### Routing

`App.tsx` registers ~40 routes using `React.lazy()` + `<Suspense>`, wrapped in role-specific
layouts:

- `/` `/home` `/services` `/products` `/contact-me` → `LandingLayout`
- `/customer/*` → `CustomerLayout`
- `/cashier/*` → `CashierLayout`
- `/admin/*` → `AdminLayout`

### API layer

All HTTP calls live in `src/Endpoints/` — never in page components.

- `apiClient.ts` — typed client, Bearer token injection, `ApiResponse<T>` unwrapping
- `contactApi.ts`, `feedbackApi.ts`, `booksApi.ts` — public
- `Customer/` — `borrowApi.ts`, `reservationApi.ts`
- `Cashier/` — `transactionApi.ts`, `fineApi.ts`
- `Admin/` — `cmsApi.ts`, `userApi.ts`, `reportApi.ts`, `notificationApi.ts`

### Responsive system

Use `Hooks/useFluidResposiveness.ts` for all breakpoints and fluid sizing — it exposes
`isMobileSmall`, `isTablet`, `isLaptop`, `isUltraWide`, `getFluidClamp()`, `getFluidPx()`,
and touch detection. Never write inline `window.addEventListener('resize')`.

---

## Feature Status

> ⚠️ This project is a **partially wired prototype**. The backend is substantially complete;
> the frontend is largely a static, HTML-converted UI awaiting integration.

### ✅ Working / Implemented

- Full backend layering with clean repository/service/controller separation.
- JWT auth, BCrypt hashing, input sanitization, rate limiting, idempotency.
- EF Core migrations + database seeder.
- ~40 REST endpoints across 14 controllers.
- Scalar V1 API documentation.
- Public contact form wired end-to-end (`ContactForm` → `contactApi` → `ContactController`).
- 32 portal pages rendered with full layout and responsive design.

### 🚧 Partially Wired

- Book catalog (`booksApi` exists, some pages consume it).
- Reservations & borrowings (API stubs + backend endpoints exist; UI flows incomplete).
- Notifications (stub + endpoint present).

### 📋 Not Yet Wired

- Admin Books/Categories management (no `BooksApi`/`CategoryApi` stub yet).
- Cashier Returns (no `ReturnsApi` stub).
- RBAC screen (`RolesPermissions.tsx` — frontend-only, no backend role-management endpoints).
- ~77 `onClick` handlers currently call optional no-op globals (`(window as any).someFn?.()`).
- Hooks in `src/Hooks/` (`useToasts`, `useAutoRefresh`, `useNotifications`, `useDraggable`,
  `useScrollbar`) exist but have no consumers yet.
- 3D hero scene (`BookHero3D`) placeholder — not yet mounted.

See `implementation_plan.md` for the full wiring blueprint and `CRUD_BACKEND_MAPPING.md`
for the endpoint-by-endpoint spec.

---

## Configuration

All configuration lives in `appsettings.json` / `.env` — **never hardcode secrets in source**.

```jsonc
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;Database=...;Trusted_Connection=True;"
  },
  "Jwt": {
    "Secret": "<set via environment variable in production>",
    "Issuer": "KatipunerosLibraryStore",
    "ExpiryMinutes": 60
  },
  "Redis": { "Connection": "localhost:6379" },
  "Smtp": { "Host": "...", "Port": 587, "Username": "...", "Password": "..." }
}
```

Environment overrides: `appsettings.Development.json`, `appsettings.Production.json`, `.env`.

---

## Security Notes

Built-in protections:

- ✅ Passwords hashed with **BCrypt** (`PasswordHelper`) — never MD5/SHA1.
- ✅ Public form inputs pass through **`InputSanitizer`** (HTML-tag stripping + encoding).
- ✅ **JWT Bearer** auth with backend-enforced role checks (`[Authorize(Roles = "Admin")]`).
- ✅ **Rate limiting** per IP on public endpoints.
- ✅ **Idempotency middleware** guards duplicate POSTs.
- ✅ **ALTCHA** proof-of-work challenge on public form submissions.
- ✅ **Audit log hash chaining** (SHA-256) via `AuditHelper`.
- ✅ CORS restricted to the configured frontend origin.
- ✅ No secrets stored in the frontend bundle.

### Before deploying to production

- [ ] Move the JWT secret out of `appsettings.json` into an environment variable / Key Vault.
- [ ] Replace or remove all seeded demo accounts.
- [ ] Disable Scalar V1 (`/scalar/v1`) in production.
- [ ] Set `AllowedOrigins` to your real frontend origin (no `AllowAll`).
- [ ] Confirm rate limits and token expiry match your threat model.
- [ ] Verify `GlobalExceptionMiddleware` does not leak exception details in production responses.

---

## Known Issues

Tracked technical debt as of the current `main` branch — see the full analysis for detail:

1. **`ReturnBookAsync` uses `request.PatronId` instead of `loan.UserId`** — a cashier can return
   another patron's loan. (`BorrowService.cs`)
2. **`CheckoutAsync` has no DB transaction** — partial failures can corrupt loan state.
3. **`SettleFineAsync` discards `request.paymentMethod`.**
4. **`FeedbackController` has no `[Authorize]`** on either endpoint.
5. **`AltchaController` contains crypto logic and a hardcoded HMAC secret** — belongs in a service.
6. **JWT secret is hardcoded in 4 places.**
7. **Controllers return raw EF entities** — `PasswordHash` is not `[JsonIgnore]`'d; response
   DTOs (`UserResponse`, `BookResponse`) are documented but not implemented.
8. **`GET /api/Categories`** is anonymous and serializes `.Include(c => c.Books)`.
9. **Dead infrastructure**: the Redis cache layer, `IAuditService.LogEventAsync`,
   `NotificationHelper`, and `PermissionsHelper` are registered but never invoked.
10. **Docs drift**: `AGENTS.md` / `SKILL.md` reference files that don't exist
    (`Management/`, `DBInfrastructure/ApiTools/`, `Backend.sln`, `.env`,
    `appsettings.Production.json`).
11. **`bin/` and `obj/` build artifacts are committed to git** — should be gitignored.

---

## Contributing / Agent Rules

This repository is governed by **`AGENTS.md`** — the binding behavior contract for every AI
agent and contributor. Read it before touching any code. Key hard stops:

- ❌ No business logic in controllers.
- ❌ No `_context` queries outside repositories.
- ❌ No `any` in TypeScript.
- ❌ No API calls in React page components.
- ❌ No hardcoded colors/fonts — use `LayoutStyles/` tokens.
- ❌ Never mix Landing Page code with UserRoles panel code.
- ✅ Prefer expression-bodied (`=>`) members across all C# layers.
- ✅ Register every new service/repository in `Program.cs` via DI.
- ✅ Add a header comment to every new file.

Also read **`SKILL.md`** for the full architecture reference, plus:

- `implementation_plan.md` — frontend→backend wiring blueprint
- `CRUD_BACKEND_MAPPING.md` — endpoint-by-endpoint spec vs. implementation

---

*Built for the Katipuneros Library Store.*
