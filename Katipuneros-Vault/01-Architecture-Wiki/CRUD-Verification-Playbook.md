---
title: CRUD Verification & Edit-Lock-Save Protocol
tags: [crud, verification, security, architecture]
---

# 🛡️ Full-Stack CRUD Verification & Edit-Lock-Save Protocol

## 1. Universal Profile Edit-Lock-Save Rule
Across **all user portals** (`Customer`, `Cashier`, `Admin`):
1. **Locked by Default (`isEditing === false`)**:
   - All profile credential inputs (`firstName`, `middleName`, `lastName`, `username`, `email`, `phoneNumber`, `currentAddress`, `permanentAddress`, `department`, `employmentStatus`, `age`) MUST be disabled/readOnly.
   - Clear visual lock indicator and non-editable background styling.
2. **Unlock Transition**:
   - User clicks **"Edit Profile"** button.
   - `isEditing` transitions to `true`.
   - All input controls unlock.
   - The button transforms into **"Save Changes"** alongside a **"Cancel"** button.
3. **Save & Persist Transition**:
   - User clicks **"Save Changes"**.
   - Frontend validates input fields.
   - Calls `PUT /api/auth/profile` (or `PUT /api/users/profile`).
   - Persists to SQL Server `[Users]` table.
   - Updates `localStorage.setItem('katipuneros_user', ...)`.
   - Updates React UI context/state across header and sidebar.
   - `isEditing` returns to `false` (re-locking inputs).
4. **Cancel Transition**:
   - Resets state back to last persisted user values and sets `isEditing = false`.

## 2. Image & Avatar Upload Rule
- Profile pictures: `POST /api/auth/profile-picture` or `PUT /api/users/{id}` persists base64/URL to `[Users].[ProfilePictureUrl]` (`NVARCHAR(MAX)`).
- Book cover images: `POST /api/books` or `PUT /api/books/{id}` persists base64/URL to `[Books].[CoverImage]` (`NVARCHAR(MAX)`).
