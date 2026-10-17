# Katipuneros Library Store - Production Environment Variables

Use this document to copy and paste your configuration into **Render**, **Vercel**, and **Supabase**.

---

## 🔑 Default Initial Administrator Account (Active in Database)

The database schema and first superuser admin account have been bootstrapped directly into Supabase:

| Field | Value |
| :--- | :--- |
| **Username** | `admin1` |
| **Email** | `admin1@gmail.com` |
| **Password** | `admin123` |
| **Role** | `Admin` |
| **Library Card #** | `KP-ADM-0001` |
| **Status** | Active & Protected |

---

## 1. Render Web Service: `katipuneros-backend`

### Key 1
- **Key**:
```text
ASPNETCORE_ENVIRONMENT
```
- **Value**:
```text
Production
```

### Key 2
- **Key**:
```text
ASPNETCORE_URLS
```
- **Value**:
```text
http://+:5000
```

### Key 3
- **Key**:
```text
PORT
```
- **Value**:
```text
5000
```

### Key 4
- **Key**:
```text
ConnectionStrings__PrimaryConnection
```
- **Value**:
```text
Host=aws-0-ap-northeast-2.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.bjytjzlnajanwewdvqtj;Password=katipuneros-library-production9999;SslMode=Require;TrustServerCertificate=true;
```

### Key 5
- **Key**:
```text
ConnectionStrings__ReplicaConnection
```
- **Value**:
```text
Host=aws-0-ap-northeast-2.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.bjytjzlnajanwewdvqtj;Password=katipuneros-library-production9999;SslMode=Require;TrustServerCertificate=true;
```

### Key 6 (CORS: Production Customer Portal)
- **Key**:
```text
Cors__AllowedOrigins__0
```
- **Value**:
```text
https://katipuneros-customer.vercel.app
```

### Key 7 (CORS: Preview Customer Portal)
- **Key**:
```text
Cors__AllowedOrigins__1
```
- **Value**:
```text
https://katipuneros-customer-acgers2xy-suicojm99-gmailcoms-projects.vercel.app
```

### Key 8 (CORS: Cashier Terminal)
- **Key**:
```text
Cors__AllowedOrigins__2
```
- **Value**:
```text
https://katipuneros-cashier.vercel.app
```

### Key 9 (CORS: Chief Admin Console)
- **Key**:
```text
Cors__AllowedOrigins__3
```
- **Value**:
```text
https://katipuneros-admin.onrender.com
```

### Key 10 (CORS: Wildcard Fallback)
- **Key**:
```text
Cors__AllowedOrigins__4
```
- **Value**:
```text
*
```

### Key 11 (REQUIRED: JWT HS256 Secret Key)
- **Key**:
```text
Jwt__SecretKey
```
- **Value**:
```text
KatipunerosLibraryStoreJwtSecretKey_2026_SecureKey_MustBeLongEnough!
```

### Key 12 (OPTIONAL: ALTCHA HMAC Secret - Captcha removed from UI)
- **Key**:
```text
Altcha__HmacSecret
```
- **Value**:
```text
KatipunerosAltchaHmacSecret_2026_SecureKey_MustBeLongEnough!
```

---

## 2. Render Static Site: `katipuneros-admin`

### Key 1
- **Key**:
```text
VITE_PORTAL
```
- **Value**:
```text
admin
```

### Key 2
- **Key**:
```text
VITE_API_URL
```
- **Value**:
```text
https://katipuneros-backend.onrender.com/api
```

---

## 3. Vercel Project: `katipuneros-cashier`

### Key 1
- **Key**:
```text
VITE_PORTAL
```
- **Value**:
```text
cashier
```

### Key 2
- **Key**:
```text
VITE_API_URL
```
- **Value**:
```text
https://katipuneros-backend.onrender.com/api
```

---

## 4. Vercel Project: `katipuneros-customer` (Already Live)

### Key 1
- **Key**:
```text
VITE_PORTAL
```
- **Value**:
```text
customer
```

### Key 2
- **Key**:
```text
VITE_API_URL
```
- **Value**:
```text
https://katipuneros-backend.onrender.com/api
```

---

## 5. Supabase Project Information

| Property | Value |
| :--- | :--- |
| **Project Reference** | `bjytjzlnajanwewdvqtj` |
| **Project Region** | `ap-northeast-2` (Seoul) |
| **Project URL** | `https://bjytjzlnajanwewdvqtj.supabase.co` |
| **Publishable / Anon Key** | `sb_publishable_mh8gYpgNGvFPFy5q14E8Qg_rYglYQCQ` |
| **Session Pooler Host** | `aws-0-ap-northeast-2.pooler.supabase.com:5432` |
| **Transaction Pooler Host** | `aws-0-ap-northeast-2.pooler.supabase.com:6543` |
| **Direct URI** | `postgresql://postgres:katipuneros-library-production9999@db.bjytjzlnajanwewdvqtj.supabase.co:5432/postgres` |
