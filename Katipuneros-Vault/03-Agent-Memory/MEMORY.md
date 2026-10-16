---
title: Agent Memory Core
updated: 2026-10-16
tags: [memory, discipline, rules]
---

# Agent Memory Core

## System Invariants
1. **Never mock data when an API exists**: Every UI action must communicate with .NET 10 Backend API on Port 5000 and persist in SQL Server `KatipunerosLibraryDb`.
2. **Normalize API paths**: `apiClient.ts` must strip redundant `/api/` prefixes.
3. **Lock Credentials by Default**: All user profile forms must enforce the Edit-Lock-Save pattern.
4. **Base64 & URL Support for Media**: `[Users].[ProfilePictureUrl]` and `[Books].[CoverImage]` must be `NVARCHAR(MAX)`.
5. **Always Verify Live**: Run machine verification (`dotnet build`, `npx tsc --noEmit`, E2E test script) before completing any task.
6. **Once-Only Triage Lifecycle**: Triage decisions (`StagedInLocker` / `Cancelled`) are immutable. Backend blocks re-triage with HTTP 400; Cashier UI shows locked `APPROVED (ONCE)` and `DECLINED (ONCE)` badges.
7. **Complete Patron Hold History**: `GetActiveByPatronIdAsync` returns all holds (including `Cancelled` and `Fulfilled`) so patrons can track declined or completed reservations.
8. **Visible Universal Scrollbars**: Accessible themed scrollbars (`scrollbar-width: thin; scrollbar-color: rgba(...)`) are enforced across all customer, cashier, and admin modules.
