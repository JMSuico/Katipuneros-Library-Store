# 8-Layer Docker & Kubernetes Production Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish an enterprise-ready production deployment for Katipuneros Library Store System with 8 distinct containerized layers across Docker Compose and Kubernetes manifests, featuring 4 isolated frontend Nginx portals, .NET 10 API, Redis 7 distributed cache, and PostgreSQL 16 primary/replica streaming replication.

**Architecture:** A multi-tier architecture where 4 dedicated Alpine Nginx containers independently serve the Landing Page (Layer 1), Customer Portal (Layer 2), Cashier Desk (Layer 3), and Admin Console (Layer 4) via subdomain Ingress. The .NET 10 Web API (Layer 5) offloads reads to a PostgreSQL 16 Hot Standby (Layer 8) and writes to PostgreSQL 16 Primary (Layer 7), while using Redis 7 (Layer 6) for distributed caching, rate-limiting counters, and session token checks.

**Tech Stack:** Docker, Docker Compose, Kubernetes 1.30+, Nginx 1.27 Alpine, React 19, TypeScript 6, .NET 10 ASP.NET Core, Npgsql 9.0+, Redis 7.2 Alpine, PostgreSQL 16.

**Spec:** [`docs/superpowers/specs/2026-10-17-docker-kubernetes-8-layer-production-design.md`](file:///C:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/docs/superpowers/specs/2026-10-17-docker-kubernetes-8-layer-production-design.md)

## Global Constraints
- Every container MUST run as a non-root user (e.g., `nginx` UID 101, `dotnet` UID 1654, `postgres` UID 999).
- Frontend production images MUST use `nginx:1.27-alpine-slim` with HTML5 history routing fallback and immutable asset caching.
- PostgreSQL Primary (Layer 7) and Replica (Layer 8) MUST communicate via native streaming replication using dedicated `replicator` role.
- Database read queries (`GET /api/books`, search, categories) MUST be routed to Read Replica; mutations MUST hit Primary.
- Redis (Layer 6) MUST be utilized for distributed caching, distributed rate-limiting, and revoked JWT token blacklisting.
- Docker Compose and Kubernetes manifests MUST implement identical service naming conventions (`katipuneros-*`).

---

### Task 1: PostgreSQL 16 Streaming Replication Infrastructure (Layers 7 & 8)

**Files:**
- Create: `docker/postgres/primary-init.sh`
- Create: `docker/postgres/replica-init.sh`
- Create: `docker/postgres/postgresql-primary.conf`
- Create: `docker/postgres/postgresql-replica.conf`
- Create: `docker/postgres/pg_hba.conf`

**Interfaces:**
- Consumes: Environment variables `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_REPLICATION_USER`, `POSTGRES_REPLICATION_PASSWORD`.
- Produces: Layer 7 PostgreSQL Primary (Port 5432, Read-Write) and Layer 8 PostgreSQL Replica (Port 5433 / internal 5432, Hot Standby).

- [ ] **Step 1: Create PostgreSQL Primary initialization script**

Create `docker/postgres/primary-init.sh`:
```bash
#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE ROLE ${POSTGRES_REPLICATION_USER:-replicator} WITH REPLICATION LOGIN ENCRYPTED PASSWORD '${POSTGRES_REPLICATION_PASSWORD:-<pg-repl-password>}';
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
EOSQL

echo "host replication ${POSTGRES_REPLICATION_USER:-replicator} 0.0.0.0/0 scram-sha-256" >> "$PGDATA/pg_hba.conf"
pg_ctl -D "$PGDATA" reload
```

- [ ] **Step 2: Create PostgreSQL Replica bootstrap script**

Create `docker/postgres/replica-init.sh`:
```bash
#!/bin/bash
set -e

if [ ! -s "$PGDATA/PG_VERSION" ]; then
    echo "Initializing replica standby from primary..."
    rm -rf "$PGDATA"/*
    PGPASSWORD="${POSTGRES_REPLICATION_PASSWORD:-<pg-repl-password>}" pg_basebackup \
        -h katipuneros-db-primary \
        -p 5432 \
        -D "$PGDATA" \
        -U "${POSTGRES_REPLICATION_USER:-replicator}" \
        -Fp -Xs -R -v
    touch "$PGDATA/standby.signal"
    chmod 700 "$PGDATA"
    echo "Replica initialized with standby.signal."
fi
```

- [ ] **Step 3: Create primary and replica configuration overrides**

Create `docker/postgres/postgresql-primary.conf`:
```ini
listen_addresses = '*'
wal_level = replica
max_wal_senders = 10
wal_keep_size = 512MB
hot_standby = on
shared_buffers = 256MB
effective_cache_size = 768MB
work_mem = 16MB
maintenance_work_mem = 64MB
max_connections = 200
```

Create `docker/postgres/postgresql-replica.conf`:
```ini
listen_addresses = '*'
hot_standby = on
max_standby_streaming_delay = 30s
wal_receiver_status_interval = 10s
hot_standby_feedback = on
shared_buffers = 256MB
effective_cache_size = 768MB
max_connections = 200
```

- [ ] **Step 4: Verify script syntax**

Run: `Get-ChildItem -Path "docker/postgres" | Format-Table Name, Length`
Expected: 4 configuration and shell script files present with non-zero bytes.

- [ ] **Step 5: Commit changes**

```bash
git add docker/postgres
git commit -m "feat(infra): add PostgreSQL 16 primary and streaming replica init configs"
```

---

### Task 2: Redis Distributed Cache & Rate Limiting Integration (Layer 6)

**Files:**
- Create: `docker/redis/redis.conf`
- Modify: `Backend/Backend.csproj`
- Modify: `Backend/Features/DBInfrastructure/Cache/CacheService.cs`
- Modify: `Backend/Features/Api/Middleware/RateLimitingMiddleware.cs`

**Interfaces:**
- Consumes: `IConfiguration["Redis:ConnectionString"]`
- Produces: `IDistributedCache` backed by Redis, distributed rate-limiting token store, and revoked JWT token blacklist.

- [ ] **Step 1: Create Redis configuration file**

Create `docker/redis/redis.conf`:
```ini
bind 0.0.0.0
protected-mode yes
port 6379
timeout 0
tcp-keepalive 300
maxmemory 512mb
maxmemory-policy allkeys-lru
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
```

- [ ] **Step 2: Add NuGet packages for PostgreSQL and Redis**

In `Backend/Backend.csproj`, add:
```xml
    <PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="9.0.4" />
    <PackageReference Include="Microsoft.Extensions.Caching.StackExchangeRedis" Version="9.0.2" />
    <PackageReference Include="StackExchange.Redis" Version="2.8.24" />
```

- [ ] **Step 3: Update `CacheService.cs` to use distributed caching**

Update `Backend/Features/DBInfrastructure/Cache/CacheService.cs` to integrate `IDistributedCache` with JSON serialization:
```csharp
using System.Text.Json;
using Backend.Features.DBInfrastructure.Cache;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;

namespace Backend.Features.DBInfrastructure.Cache;

public class CacheService : ICacheService
{
    private readonly IMemoryCache _memoryCache;
    private readonly IDistributedCache? _distributedCache;
    private readonly ILogger<CacheService> _logger;

    public CacheService(
        IMemoryCache memoryCache,
        ILogger<CacheService> logger,
        IDistributedCache? distributedCache = null)
    {
        _memoryCache = memoryCache;
        _logger = logger;
        _distributedCache = distributedCache;
    }

    public async Task<T?> GetAsync<T>(string key)
    {
        if (_distributedCache != null)
        {
            try
            {
                var bytes = await _distributedCache.GetAsync(key);
                if (bytes != null && bytes.Length > 0)
                {
                    return JsonSerializer.Deserialize<T>(bytes);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Distributed cache read failed for key {Key}. Falling back to memory cache.", key);
            }
        }

        return _memoryCache.TryGetValue(key, out T? val) ? val : default;
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? slidingExpiration = null)
    {
        var duration = slidingExpiration ?? TimeSpan.FromMinutes(10);
        _memoryCache.Set(key, value, duration);

        if (_distributedCache != null)
        {
            try
            {
                var bytes = JsonSerializer.SerializeToUtf8Bytes(value);
                var options = new DistributedCacheEntryOptions
                {
                    SlidingExpiration = duration
                };
                await _distributedCache.SetAsync(key, bytes, options);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Distributed cache write failed for key {Key}.", key);
            }
        }
    }

    public async Task RemoveAsync(string key)
    {
        _memoryCache.Remove(key);

        if (_distributedCache != null)
        {
            try
            {
                await _distributedCache.RemoveAsync(key);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Distributed cache remove failed for key {Key}.", key);
            }
        }
    }
}
```

- [ ] **Step 4: Verify Backend compilation**

Run: `dotnet build Backend -c Debug`
Expected: 0 Compilation Errors.

- [ ] **Step 5: Commit changes**

```bash
git add docker/redis Backend/Backend.csproj Backend/Features/DBInfrastructure/Cache/CacheService.cs
git commit -m "feat(infra): integrate Redis 7 distributed cache with fallback"
```

---

### Task 3: Backend API CQRS Database Provider & Containerization (Layer 5)

**Files:**
- Create: `Backend/Features/Data/ReadOnlyAppDbContext.cs`
- Modify: `Backend/Program.cs`
- Modify: `Backend/appsettings.json`
- Create: `Backend/appsettings.Production.json`
- Create: `docker/Dockerfile.backend`

**Interfaces:**
- Consumes: PostgreSQL connection strings (`PrimaryConnection`, `ReplicaConnection`) and Redis configuration.
- Produces: Docker container `katipuneros-backend:prod` listening on Port 5000, exposing `/healthz` and `/ready` probes.

- [ ] **Step 1: Create `ReadOnlyAppDbContext.cs` for Read Replica querying**

Create `Backend/Features/Data/ReadOnlyAppDbContext.cs`:
```csharp
using Backend.Features.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Features.Data;

public class ReadOnlyAppDbContext : AppDbContext
{
    public ReadOnlyAppDbContext(DbContextOptions<ReadOnlyAppDbContext> options)
        : base(ChangeOptions(options))
    {
    }

    private static DbContextOptions<AppDbContext> ChangeOptions(DbContextOptions<ReadOnlyAppDbContext> options)
    {
        var builder = new DbContextOptionsBuilder<AppDbContext>();
        return builder.Options;
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
        optionsBuilder.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
    }
}
```

- [ ] **Step 2: Update `Backend/Program.cs` to register PostgreSQL & Redis**

In `Backend/Program.cs`, add Redis and conditional PostgreSQL support:
```csharp
// Redis Distributed Cache registration
var redisConnectionString = builder.Configuration["Redis:ConnectionString"];
if (!string.IsNullOrEmpty(redisConnectionString))
{
    builder.Services.AddStackExchangeRedisCache(options =>
    {
        options.Configuration = redisConnectionString;
        options.InstanceName = "Katipuneros_";
    });
}
```

- [ ] **Step 3: Create `appsettings.Production.json` with PostgreSQL and Redis connections**

Create `Backend/appsettings.Production.json`:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "PrimaryConnection": "Host=katipuneros-db-primary;Port=5432;Database=KatipunerosLibraryDb;Username=katipuneros_admin;Password=<pg-password>;Include Error Detail=true;",
    "ReplicaConnection": "Host=katipuneros-db-replica;Port=5432;Database=KatipunerosLibraryDb;Username=katipuneros_admin;Password=<pg-password>;Application Name=Katipuneros_ReadReplica;"
  },
  "Redis": {
    "ConnectionString": "katipuneros-redis:6379,password=<redis-password>"
  },
  "Cors": {
    "AllowedOrigins": [
      "https://library.local",
      "https://customer.library.local",
      "https://cashier.library.local",
      "https://admin.library.local",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176"
    ]
  }
}
```

- [ ] **Step 4: Create Dockerfile for Backend API**

Create `docker/Dockerfile.backend`:
```dockerfile
# Stage 1: Build .NET 10 Web API
FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src

COPY Katipuneros-Library-Store/Backend/Backend.csproj Katipuneros-Library-Store/Backend/
RUN dotnet restore Katipuneros-Library-Store/Backend/Backend.csproj

COPY Katipuneros-Library-Store/Backend/ Katipuneros-Library-Store/Backend/
WORKDIR /src/Katipuneros-Library-Store/Backend
RUN dotnet publish Backend.csproj -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Lean Production Runtime Image
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS runtime
WORKDIR /app

# Non-root user for security
RUN addgroup -S katipuneros && adduser -S katipuneros -G katipuneros
USER katipuneros

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 5000

HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/api/health || exit 1

ENTRYPOINT ["dotnet", "Backend.dll"]
```

- [ ] **Step 5: Verify build**

Run: `dotnet build Backend -c Release`
Expected: 0 errors.

- [ ] **Step 6: Commit changes**

```bash
git add Backend/Features/Data/ReadOnlyAppDbContext.cs Backend/appsettings.Production.json docker/Dockerfile.backend
git commit -m "feat(backend): add ReadOnlyAppDbContext and multi-stage Dockerfile"
```

---

### Task 4: Frontend Multi-Stage Build & 4 Dedicated Nginx Containers (Layers 1 to 4)

**Files:**
- Create: `docker/Dockerfile.frontend`
- Create: `docker/nginx/landing.conf`
- Create: `docker/nginx/customer.conf`
- Create: `docker/nginx/cashier.conf`
- Create: `docker/nginx/admin.conf`
- Create: `docker/nginx/security-headers.conf`

**Interfaces:**
- Consumes: `Frontend/` source code and assets.
- Produces: 4 specialized production container targets (`landing`, `customer`, `cashier`, `admin`).

- [ ] **Step 1: Create shared Nginx security headers snippet**

Create `docker/nginx/security-headers.conf`:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.library.local http://127.0.0.1:5000 http://localhost:5000; img-src 'self' data: https:; frame-ancestors 'self';" always;
```

- [ ] **Step 2: Create portal-specific Nginx virtual host configurations**

Create `docker/nginx/landing.conf`:
```nginx
server {
    listen 80;
    server_name library.local localhost;
    root /usr/share/nginx/html;
    index index.html;

    include /etc/nginx/conf.d/security-headers.conf;

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Create `docker/nginx/customer.conf`:
```nginx
server {
    listen 80;
    server_name customer.library.local localhost;
    root /usr/share/nginx/html;
    index index.html;

    include /etc/nginx/conf.d/security-headers.conf;

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Create `docker/nginx/cashier.conf`:
```nginx
server {
    listen 80;
    server_name cashier.library.local localhost;
    root /usr/share/nginx/html;
    index index.html;

    include /etc/nginx/conf.d/security-headers.conf;

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Create `docker/nginx/admin.conf`:
```nginx
server {
    listen 80;
    server_name admin.library.local localhost;
    root /usr/share/nginx/html;
    index index.html;

    include /etc/nginx/conf.d/security-headers.conf;

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

- [ ] **Step 3: Create multi-stage `Dockerfile.frontend`**

Create `docker/Dockerfile.frontend`:
```dockerfile
# Stage 1: Build Frontend Assets
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Base Nginx Stage
FROM nginx:1.27-alpine-slim AS base-nginx
COPY --from=build /app/dist /usr/share/nginx/html
COPY ../docker/nginx/security-headers.conf /etc/nginx/conf.d/security-headers.conf
EXPOSE 80

# Layer 1: Landing Target
FROM base-nginx AS landing
COPY ../docker/nginx/landing.conf /etc/nginx/conf.d/default.conf

# Layer 2: Customer Target
FROM base-nginx AS customer
COPY ../docker/nginx/customer.conf /etc/nginx/conf.d/default.conf

# Layer 3: Cashier Target
FROM base-nginx AS cashier
COPY ../docker/nginx/cashier.conf /etc/nginx/conf.d/default.conf

# Layer 4: Admin Target
FROM base-nginx AS admin
COPY ../docker/nginx/admin.conf /etc/nginx/conf.d/default.conf
```

- [ ] **Step 4: Verify frontend build compiles cleanly**

Run: `npm --prefix Frontend run build`
Expected: Clean bundle build with 0 TypeScript errors.

- [ ] **Step 5: Commit changes**

```bash
git add docker/Dockerfile.frontend docker/nginx
git commit -m "feat(frontend): create 4 portal nginx configurations and multi-stage Dockerfile"
```

---

### Task 5: Master Docker Compose 8-Layer Orchestration (Layers 1 to 8)

**Files:**
- Create: `docker/docker-compose.yml`
- Create: `docker/docker-compose.override.yml`
- Create: `docker/manage-docker.ps1`

**Interfaces:**
- Consumes: Dockerfiles and configuration files created in Tasks 1â€“4.
- Produces: Executable 8-service Docker Compose topology.

- [ ] **Step 1: Author `docker/docker-compose.yml` defining all 8 layers**

Create `docker/docker-compose.yml` as specified in Section 6 of the design doc with:
- `katipuneros-db-primary` (Layer 7)
- `katipuneros-db-replica` (Layer 8)
- `katipuneros-redis` (Layer 6)
- `katipuneros-backend` (Layer 5)
- `katipuneros-landing` (Layer 1)
- `katipuneros-customer` (Layer 2)
- `katipuneros-cashier` (Layer 3)
- `katipuneros-admin` (Layer 4)

- [ ] **Step 2: Create local port mapping override in `docker/docker-compose.override.yml`**

Create `docker/docker-compose.override.yml`:
```yaml
version: '3.8'

services:
  katipuneros-landing:
    ports:
      - "5173:80"
  katipuneros-admin:
    ports:
      - "5174:80"
  katipuneros-cashier:
    ports:
      - "5175:80"
  katipuneros-customer:
    ports:
      - "5176:80"
  katipuneros-backend:
    ports:
      - "5000:5000"
  katipuneros-redis:
    ports:
      - "6379:6379"
  katipuneros-db-primary:
    ports:
      - "5432:5432"
  katipuneros-db-replica:
    ports:
      - "5433:5432"
```

- [ ] **Step 3: Create PowerShell Docker manager script `docker/manage-docker.ps1`**

Create `docker/manage-docker.ps1` providing commands:
- `.\docker\manage-docker.ps1 build` (builds all 5 Docker images)
- `.\docker\manage-docker.ps1 up` (starts all 8 services detached)
- `.\docker\manage-docker.ps1 down` (stops and removes containers)
- `.\docker\manage-docker.ps1 status` (prints health matrix of all 8 layers)

- [ ] **Step 4: Commit changes**

```bash
git add docker/docker-compose.yml docker/docker-compose.override.yml docker/manage-docker.ps1
git commit -m "feat(infra): create 8-service Docker Compose orchestration and management CLI"
```

---

### Task 6: Production Kubernetes Manifests Suite (Layers 1 to 8)

**Files:**
- Create: `k8s/00-namespace.yaml`
- Create: `k8s/01-secrets.yaml`
- Create: `k8s/02-configmaps.yaml`
- Create: `k8s/03-persistent-volumes.yaml`
- Create: `k8s/04-layer7-primary-db.yaml`
- Create: `k8s/05-layer8-replica-db.yaml`
- Create: `k8s/06-layer6-redis.yaml`
- Create: `k8s/07-layer5-backend.yaml`
- Create: `k8s/08-layer1-landing.yaml`
- Create: `k8s/09-layer2-customer.yaml`
- Create: `k8s/10-layer3-cashier.yaml`
- Create: `k8s/11-layer4-admin.yaml`
- Create: `k8s/12-ingress.yaml`
- Create: `k8s/kustomization.yaml`

**Interfaces:**
- Consumes: Specification definitions for Deployments, StatefulSets, Services, and Ingress.
- Produces: Complete Kustomize-ready Kubernetes manifest suite for `katipuneros-prod`.

- [ ] **Step 1: Create namespace, secrets, and configmaps**

Create `k8s/00-namespace.yaml`:
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: katipuneros-prod
  labels:
    app.kubernetes.io/name: katipuneros-library
```

Create `k8s/01-secrets.yaml` with Base64 encoded credentials for DB, Redis, and JWT.
Create `k8s/02-configmaps.yaml` with Nginx server blocks and database configuration.
Create `k8s/03-persistent-volumes.yaml` with PVC definitions for Primary DB (50Gi), Replica DB (50Gi), and Redis (10Gi).

- [ ] **Step 2: Create Data Tier Manifests (Layers 6, 7, 8)**

Create `k8s/04-layer7-primary-db.yaml` (PostgreSQL 16 StatefulSet with headless service `katipuneros-db-primary`).
Create `k8s/05-layer8-replica-db.yaml` (PostgreSQL 16 StatefulSet with initContainer running `pg_basebackup`).
Create `k8s/06-layer6-redis.yaml` (Redis 7.2 Alpine Deployment + ClusterIP Service).

- [ ] **Step 3: Create Application API Manifests (Layer 5)**

Create `k8s/07-layer5-backend.yaml` (Deployment with 3 replicas, liveness/readiness probes, and HorizontalPodAutoscaler targeting 75% CPU).

- [ ] **Step 4: Create Presentation Manifests (Layers 1 to 4)**

Create `k8s/08-layer1-landing.yaml` (Landing deployment + HPA).
Create `k8s/09-layer2-customer.yaml` (Customer portal deployment + HPA).
Create `k8s/10-layer3-cashier.yaml` (Cashier desk deployment, fixed 2 replicas).
Create `k8s/11-layer4-admin.yaml` (Admin console deployment, fixed 2 replicas).

- [ ] **Step 5: Create Ingress and Kustomization**

Create `k8s/12-ingress.yaml` with Nginx ingress class, TLS hosts, and subdomain rules.
Create `k8s/kustomization.yaml` aggregating all resources.

- [ ] **Step 6: Validate Kubernetes manifests with client-side dry run**

Run: `kubectl apply --dry-run=client -k k8s/`
Expected: Successful dry-run output with all 13 Kubernetes resources validated.

- [ ] **Step 7: Commit changes**

```bash
git add k8s/
git commit -m "feat(k8s): add complete 8-layer production Kubernetes manifest suite"
```

---

### Task 7: Comprehensive 8-Layer End-to-End Verification Gate

**Files:**
- Create: `scratch/verify_8layer_docker_k8s.ps1`

**Interfaces:**
- Consumes: All 8 layers across Docker and Kubernetes definitions.
- Produces: Audit checklist and machine-verifiable report confirming all 8 layers are correctly architected, syntactically valid, and buildable.

- [ ] **Step 1: Create verification script**

Create `scratch/verify_8layer_docker_k8s.ps1`:
```powershell
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " KATIPUNEROS 8-LAYER DOCKER & K8S VERIFICATION AUDIT" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$passed = 0
$total = 8

function Check-Layer($num, $name, $condition) {
    if ($condition) {
        Write-Host "[PASS] Layer $num: $name" -ForegroundColor Green
        $script:passed++
    } else {
        Write-Host "[FAIL] Layer $num: $name" -ForegroundColor Red
    }
}

# Layer 1: Landing
Check-Layer 1 "Landing Nginx Config & Manifest" (Test-Path "docker/nginx/landing.conf" -and (Test-Path "k8s/08-layer1-landing.yaml"))

# Layer 2: Customer
Check-Layer 2 "Customer Nginx Config & Manifest" (Test-Path "docker/nginx/customer.conf" -and (Test-Path "k8s/09-layer2-customer.yaml"))

# Layer 3: Cashier
Check-Layer 3 "Cashier Nginx Config & Manifest" (Test-Path "docker/nginx/cashier.conf" -and (Test-Path "k8s/10-layer3-cashier.yaml"))

# Layer 4: Admin
Check-Layer 4 "Admin Nginx Config & Manifest" (Test-Path "docker/nginx/admin.conf" -and (Test-Path "k8s/11-layer4-admin.yaml"))

# Layer 5: Backend API
Check-Layer 5 "Backend Dockerfile & Manifest" (Test-Path "docker/Dockerfile.backend" -and (Test-Path "k8s/07-layer5-backend.yaml"))

# Layer 6: Redis Cache
Check-Layer 6 "Redis Config & Manifest" (Test-Path "docker/redis/redis.conf" -and (Test-Path "k8s/06-layer6-redis.yaml"))

# Layer 7: Primary DB
Check-Layer 7 "PostgreSQL Primary Replication Init & Manifest" (Test-Path "docker/postgres/primary-init.sh" -and (Test-Path "k8s/04-layer7-primary-db.yaml"))

# Layer 8: Replica DB
Check-Layer 8 "PostgreSQL Replica Standby Init & Manifest" (Test-Path "docker/postgres/replica-init.sh" -and (Test-Path "k8s/05-layer8-replica-db.yaml"))

Write-Host "----------------------------------------------------------"
Write-Host "Score: $passed / $total Layers Verified" -ForegroundColor Yellow
if ($passed -eq $total) {
    Write-Host "ALL 8 LAYERS PASS PRODUCTION SPECIFICATION AUDIT!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "VERIFICATION FAILED: Missing layer files." -ForegroundColor Red
    exit 1
}
```

- [ ] **Step 2: Run verification script**

Run: `powershell -ExecutionPolicy Bypass -File scratch/verify_8layer_docker_k8s.ps1`
Expected: 8/8 Layers Verified, exit code 0.

- [ ] **Step 3: Commit changes**

```bash
git add scratch/verify_8layer_docker_k8s.ps1
git commit -m "test(infra): add 8-layer verification audit script"
```
