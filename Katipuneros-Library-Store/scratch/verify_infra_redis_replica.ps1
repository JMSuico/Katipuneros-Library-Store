# ==============================================================================
# Katipuneros Library Store - Infrastructure Verification Script
# Specialist: Subagent 4 - Infrastructure Verification & Replication/Cache Specialist
# Verifies:
#   1. Redis Distributed Cache Integration (CacheService.cs)
#   2. PostgreSQL 16 Streaming Replication Config (primary.conf, replica.conf, init scripts)
#   3. ReadOnlyAppDbContext & Read Offloading in Repositories
#   4. Docker Compose Multi-Node Topology (:6379, :5432, :5433)
#   5. Kubernetes Manifests (Layer 6 Redis, Layer 7 Primary DB, Layer 8 Replica DB)
#   6. Live C# Runtime Behavior & Mutation Guard Verification
# ==============================================================================

$ErrorActionPreference = "Continue"

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host " KATIPUNEROS INFRASTRUCTURE AUDIT: REDIS CACHE & POSTGRESQL REPLICATION" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan

$passed = 0
$failed = 0
$auditResults = @()

function Audit-Check {
    param(
        [string]$Category,
        [string]$TestName,
        [bool]$Condition,
        [string]$Proof
    )
    if ($Condition) {
        Write-Host "  [PASS] $TestName" -ForegroundColor Green
        Write-Host "         Proof: $Proof" -ForegroundColor DarkGray
        $script:passed++
        $script:auditResults += [PSCustomObject]@{
            Category = $Category
            Test     = $TestName
            Status   = "PASS"
            Details  = $Proof
        }
    } else {
        Write-Host "  [FAIL] $TestName" -ForegroundColor Red
        Write-Host "         Missing: $Proof" -ForegroundColor Yellow
        $script:failed++
        $script:auditResults += [PSCustomObject]@{
            Category = $Category
            Test     = $TestName
            Status   = "FAIL"
            Details  = $Proof
        }
    }
}

# ------------------------------------------------------------------------------
# SECTION 1: REDIS DISTRIBUTED CACHE INTEGRATION (CacheService.cs)
# ------------------------------------------------------------------------------
Write-Host "`n--- [SECTION 1] Redis Distributed Cache Integration (CacheService.cs) ---" -ForegroundColor Yellow

$cacheServicePath = "Backend/Features/DBInfrastructure/Cache/CacheService.cs"
$iCacheServicePath = "Backend/Features/DBInfrastructure/Cache/ICacheService.cs"

Audit-Check "CacheService" "Cache files exist" `
    ((Test-Path $cacheServicePath) -and (Test-Path $iCacheServicePath)) `
    "Found $cacheServicePath and $iCacheServicePath"

if (Test-Path $cacheServicePath) {
    $csContent = Get-Content $cacheServicePath -Raw

    # Hybrid in-memory + IDistributedCache
    $hasHybrid = ($csContent -match "private readonly IMemoryCache _memoryCache;") -and
                 ($csContent -match "private readonly IDistributedCache\? _distributedCache;") -and
                 ($csContent -match "public CacheService\s*\(\s*IMemoryCache\s+memoryCache,\s*IDistributedCache\?\s+distributedCache")
    Audit-Check "CacheService" "Hybrid Architecture (IMemoryCache + IDistributedCache)" `
        $hasHybrid "Constructors inject both IMemoryCache and optional IDistributedCache"

    # UTF-8 Serialization
    $hasSerialization = ($csContent -match "JsonSerializer\.SerializeToUtf8Bytes\(value\)") -and
                        ($csContent -match "JsonSerializer\.Deserialize<T>\(bytes\)")
    Audit-Check "CacheService" "Binary UTF-8 JSON Serialization" `
        $hasSerialization "Uses JsonSerializer.SerializeToUtf8Bytes and Deserialize<T>"

    # Error Fallback & Resilience
    $hasGetFallback = $csContent -match 'catch\s*\(\s*Exception\s+ex\s*\)\s*\{\s*_logger\?\.LogWarning\(ex,\s*"Distributed cache read failed.*Falling back to memory cache'
    Audit-Check "CacheService" "GetAsync Error Fallback to MemoryCache" `
        $hasGetFallback "Catches distributed read errors and transparently serves from memory cache"

    $hasSetFallback = $csContent -match 'catch\s*\(\s*Exception\s+ex\s*\)\s*\{\s*_logger\?\.LogWarning\(ex,\s*"Distributed cache write failed'
    Audit-Check "CacheService" "SetAsync Error Fallback Resilience" `
        $hasSetFallback "Catches distributed write errors and logs warning without throwing"

    $hasRemoveFallback = $csContent -match 'catch\s*\(\s*Exception\s+ex\s*\)\s*\{\s*_logger\?\.LogWarning\(ex,\s*"Distributed cache remove failed'
    Audit-Check "CacheService" "RemoveAsync Error Fallback Resilience" `
        $hasRemoveFallback "Catches distributed remove errors and logs warning without throwing"

    # Prefix invalidation tracking
    $hasPrefix = ($csContent -match "ConcurrentDictionary<string,\s*bool>\s*_activeKeys") -and
                 ($csContent -match "public async Task RemoveByPrefixAsync\(string prefix\)")
    Audit-Check "CacheService" "Active Keys Prefix Invalidation" `
        $hasPrefix "Maintains ConcurrentDictionary _activeKeys for RemoveByPrefixAsync"
}

# ------------------------------------------------------------------------------
# SECTION 2: POSTGRESQL STREAMING REPLICATION CONFIGURATION
# ------------------------------------------------------------------------------
Write-Host "`n--- [SECTION 2] PostgreSQL Streaming Replication Configuration ---" -ForegroundColor Yellow

$primaryConfPath = "docker/postgres/postgresql-primary.conf"
$replicaConfPath = "docker/postgres/postgresql-replica.conf"
$primaryInitPath = "docker/postgres/primary-init.sh"
$replicaInitPath = "docker/postgres/replica-init.sh"

# Primary postgresql-primary.conf
Audit-Check "PostgresConfig" "Primary config file exists" (Test-Path $primaryConfPath) "Found $primaryConfPath"
if (Test-Path $primaryConfPath) {
    $pConf = Get-Content $primaryConfPath -Raw
    $hasWalLevel = $pConf -match "wal_level\s*=\s*replica"
    Audit-Check "PostgresConfig" "Primary wal_level = replica" $hasWalLevel "wal_level = replica configured"

    $hasMaxSenders = $pConf -match "max_wal_senders\s*=\s*10"
    Audit-Check "PostgresConfig" "Primary max_wal_senders = 10" $hasMaxSenders "max_wal_senders = 10 configured"

    $hasPrimaryHotStandby = $pConf -match "hot_standby\s*=\s*on"
    Audit-Check "PostgresConfig" "Primary hot_standby = on" $hasPrimaryHotStandby "hot_standby = on configured"

    $hasWalKeepSize = $pConf -match "wal_keep_size\s*=\s*512MB"
    Audit-Check "PostgresConfig" "Primary wal_keep_size = 512MB" $hasWalKeepSize "wal_keep_size = 512MB retention safety configured"
}

# Replica postgresql-replica.conf
Audit-Check "PostgresConfig" "Replica config file exists" (Test-Path $replicaConfPath) "Found $replicaConfPath"
if (Test-Path $replicaConfPath) {
    $rConf = Get-Content $replicaConfPath -Raw
    $hasReplicaHotStandby = $rConf -match "hot_standby\s*=\s*on"
    Audit-Check "PostgresConfig" "Replica hot_standby = on" $hasReplicaHotStandby "hot_standby = on enabled for read queries"

    $hasFeedback = $rConf -match "hot_standby_feedback\s*=\s*on"
    Audit-Check "PostgresConfig" "Replica hot_standby_feedback = on" $hasFeedback "hot_standby_feedback prevents replication query conflicts"
}

# Primary init script
Audit-Check "PostgresInit" "Primary init script exists" (Test-Path $primaryInitPath) "Found $primaryInitPath"
if (Test-Path $primaryInitPath) {
    $pInit = Get-Content $primaryInitPath -Raw
    $hasReplRole = $pInit -match 'CREATE\s+ROLE\s+\$\{POSTGRES_REPLICATION_USER:-replicator\}\s+WITH\s+REPLICATION\s+LOGIN'
    Audit-Check "PostgresInit" "Primary creates replicator role" $hasReplRole "Creates role with REPLICATION LOGIN"

    $hasPgHba = ($pInit -match 'host\s+replication\s+\$\{POSTGRES_REPLICATION_USER:-replicator\}\s+0\.0\.0\.0/0\s+scram-sha-256') -and
                ($pInit -match 'pg_ctl\s+-D\s+"\$PGDATA"\s+reload')
    Audit-Check "PostgresInit" "Primary configures and reloads pg_hba" $hasPgHba "Appends replication rule to pg_hba.conf and executes pg_ctl reload"
}

# Replica init script
Audit-Check "PostgresInit" "Replica init script exists" (Test-Path $replicaInitPath) "Found $replicaInitPath"
if (Test-Path $replicaInitPath) {
    $rInit = Get-Content $replicaInitPath -Raw
    $hasPgBasebackup = ($rInit -match "pg_basebackup") -and ($rInit -match "\s+-R(\s+|$)")
    Audit-Check "PostgresInit" "Replica pg_basebackup with -R" $hasPgBasebackup "Runs pg_basebackup with -R (write connection config)"

    $hasStandbyCheck = ($rInit -match 'if\s*\[\s*!\s*-f\s*"\$PGDATA/standby\.signal"\s*\];\s*then') -or
                       ($rInit -match '-f\s+.*standby\.signal')
    Audit-Check "PostgresInit" "Replica standby.signal check with -f" $hasStandbyCheck "Checks for standby.signal existence with -f before clone"

    $hasStandbyTouch = $rInit -match 'touch\s+"\$PGDATA/standby\.signal"'
    Audit-Check "PostgresInit" "Replica creates standby.signal" $hasStandbyTouch "Explicitly verifies/creates standby.signal marker"
}

# ------------------------------------------------------------------------------
# SECTION 3: READONLY APPDBCONTEXT & REPOSITORY READ OFFLOADING
# ------------------------------------------------------------------------------
Write-Host "`n--- [SECTION 3] ReadOnlyAppDbContext & Read Offloading ---" -ForegroundColor Yellow

$readOnlyDbPath = "Backend/Features/Data/ReadOnlyAppDbContext.cs"
$bookRepoPath = "Backend/Features/Repositories/Implementations/BookRepository.cs"
$catRepoPath = "Backend/Features/Repositories/Implementations/CategoryRepository.cs"
$programCsPath = "Backend/Program.cs"

Audit-Check "ReadOnlyContext" "ReadOnlyAppDbContext file exists" (Test-Path $readOnlyDbPath) "Found $readOnlyDbPath"
if (Test-Path $readOnlyDbPath) {
    $roContent = Get-Content $readOnlyDbPath -Raw

    $inheritsAppDb = $roContent -match "public\s+class\s+ReadOnlyAppDbContext\s*:\s*AppDbContext"
    Audit-Check "ReadOnlyContext" "Inherits AppDbContext" $inheritsAppDb "ReadOnlyAppDbContext inherits from AppDbContext"

    $hasNoTracking = $roContent -match "optionsBuilder\.UseQueryTrackingBehavior\(QueryTrackingBehavior\.NoTracking\);"
    Audit-Check "ReadOnlyContext" "QueryTrackingBehavior.NoTracking" $hasNoTracking "OnConfiguring sets QueryTrackingBehavior.NoTracking"

    $guardsSaveChanges = ($roContent -match "public\s+override\s+int\s+SaveChanges\(\)\s*\{\s*throw\s+new\s+InvalidOperationException") -and
                         ($roContent -match "public\s+override\s+int\s+SaveChanges\(bool\s+acceptAllChangesOnSuccess\)\s*\{\s*throw\s+new\s+InvalidOperationException")
    Audit-Check "ReadOnlyContext" "SaveChanges Mutation Guards" $guardsSaveChanges "Throws InvalidOperationException on SaveChanges()"

    $guardsSaveChangesAsync = ($roContent -match "public\s+override\s+Task<int>\s+SaveChangesAsync\(CancellationToken") -and
                             ($roContent -match "public\s+override\s+Task<int>\s+SaveChangesAsync\(bool\s+acceptAllChangesOnSuccess,\s*CancellationToken")
    Audit-Check "ReadOnlyContext" "SaveChangesAsync Mutation Guards" $guardsSaveChangesAsync "Throws InvalidOperationException on SaveChangesAsync()"
}

# Program.cs DI Registration
if (Test-Path $programCsPath) {
    $progContent = Get-Content $programCsPath -Raw
    $hasDiReadOnly = ($progContent -match "builder\.Services\.AddDbContext<ReadOnlyAppDbContext>") -and
                     ($progContent -match "replicaConn") -and
                     ($progContent -match "options\.UseQueryTrackingBehavior\(QueryTrackingBehavior\.NoTracking\)")
    Audit-Check "ReadOnlyContext" "DI Registration in Program.cs" $hasDiReadOnly "Configures ReadOnlyAppDbContext with replica connection and NoTracking"
}

# BookRepository read offloading
Audit-Check "Repositories" "BookRepository exists" (Test-Path $bookRepoPath) "Found $bookRepoPath"
if (Test-Path $bookRepoPath) {
    $bContent = Get-Content $bookRepoPath -Raw
    $hasBookInjection = ($bContent -match "public\s+BookRepository\s*\(\s*AppDbContext\s+context,\s*ReadOnlyAppDbContext\?\s+readOnlyContext\s*=\s*null\)") -and
                        ($bContent -match "_readOnlyContext\s*=\s*\(AppDbContext\?\)readOnlyContext\s*\?\?\s*context;")
    Audit-Check "Repositories" "BookRepository injects ReadOnlyAppDbContext" $hasBookInjection "Constructor injects ReadOnlyAppDbContext for queries"

    $hasBookReadOffloading = ($bContent -match "(?s)GetByIdAsync.*?_readOnlyContext\.Books") -and
                             ($bContent -match "(?s)GetAllAsync.*?_readOnlyContext\.Books") -and
                             ($bContent -match "(?s)AddAsync.*?_context\.Books")
    Audit-Check "Repositories" "BookRepository read queries offloaded to replica" $hasBookReadOffloading "Queries target _readOnlyContext; writes target _context"
}

# CategoryRepository read offloading
Audit-Check "Repositories" "CategoryRepository exists" (Test-Path $catRepoPath) "Found $catRepoPath"
if (Test-Path $catRepoPath) {
    $cContent = Get-Content $catRepoPath -Raw
    $hasCatInjection = ($cContent -match "public\s+CategoryRepository\s*\(\s*AppDbContext\s+context,\s*ReadOnlyAppDbContext\?\s+readOnlyContext\s*=\s*null\)") -and
                       ($cContent -match "_readOnlyContext\s*=\s*\(AppDbContext\?\)readOnlyContext\s*\?\?\s*context;")
    Audit-Check "Repositories" "CategoryRepository injects ReadOnlyAppDbContext" $hasCatInjection "Constructor injects ReadOnlyAppDbContext for queries"

    $hasCatReadOffloading = ($cContent -match "(?s)GetByIdAsync.*?_readOnlyContext\.Categories") -and
                            ($cContent -match "(?s)GetAllAsync.*?_readOnlyContext\.Categories") -and
                            ($cContent -match "(?s)AddAsync.*?_context\.Categories")
    Audit-Check "Repositories" "CategoryRepository read queries offloaded to replica" $hasCatReadOffloading "Queries target _readOnlyContext; writes target _context"
}

# ------------------------------------------------------------------------------
# SECTION 4: DOCKER COMPOSE TOPOLOGY
# ------------------------------------------------------------------------------
Write-Host "`n--- [SECTION 4] Docker Compose Topology (:6379, :5432, :5433) ---" -ForegroundColor Yellow

$composePath = "docker/docker-compose.yml"
$overridePath = "docker/docker-compose.override.yml"

Audit-Check "DockerCompose" "Docker Compose files exist" `
    ((Test-Path $composePath) -and (Test-Path $overridePath)) `
    "Found $composePath and $overridePath"

if ((Test-Path $composePath) -and (Test-Path $overridePath)) {
    $dcContent = Get-Content $composePath -Raw
    $ovContent = Get-Content $overridePath -Raw

    # Redis service (:6379)
    $hasRedisService = ($dcContent -match "katipuneros-redis:") -and ($dcContent -match "redis:7\.2-alpine")
    $hasRedisPort = $ovContent -match 'katipuneros-redis:\s*[\r\n]+\s*ports:\s*[\r\n]+\s*-\s*"6379:6379"'
    Audit-Check "DockerCompose" "Redis Service (:6379)" `
        ($hasRedisService -and $hasRedisPort) "katipuneros-redis configured with port 6379:6379"

    # Primary DB service (:5432)
    $hasPrimaryService = ($dcContent -match "katipuneros-db-primary:") -and
                         ($dcContent -match "primary-init\.sh") -and
                         ($dcContent -match "postgresql-primary\.conf")
    $hasPrimaryPort = $ovContent -match 'katipuneros-db-primary:\s*[\r\n]+\s*ports:\s*[\r\n]+\s*-\s*"5432:5432"'
    Audit-Check "DockerCompose" "PostgreSQL Primary DB (:5432)" `
        ($hasPrimaryService -and $hasPrimaryPort) "katipuneros-db-primary configured with port 5432:5432 and config mounts"

    # Replica DB service (:5433)
    $hasReplicaService = ($dcContent -match "katipuneros-db-replica:") -and
                         ($dcContent -match "replica-init\.sh") -and
                         ($dcContent -match "postgresql-replica\.conf") -and
                         ($dcContent -match "standby\.signal")
    $hasReplicaPort = $ovContent -match 'katipuneros-db-replica:\s*[\r\n]+\s*ports:\s*[\r\n]+\s*-\s*"5433:5432"'
    Audit-Check "DockerCompose" "PostgreSQL Replica DB (:5433)" `
        ($hasReplicaService -and $hasReplicaPort) "katipuneros-db-replica configured with external port 5433 (:5432 internal)"

    # Backend Connection Routing
    $hasBackendConnections = ($dcContent -match "ConnectionStrings__PrimaryConnection=.*Host=katipuneros-db-primary;Port=5432") -and
                             ($dcContent -match "ConnectionStrings__ReplicaConnection=.*Host=katipuneros-db-replica;Port=5432") -and
                             ($dcContent -match "Redis__ConnectionString=katipuneros-redis:6379")
    Audit-Check "DockerCompose" "Backend Connection Routing" `
        $hasBackendConnections "Backend env routes writes to primary:5432, reads to replica:5432, and cache to redis:6379"
}

# ------------------------------------------------------------------------------
# SECTION 5: KUBERNETES MANIFESTS
# ------------------------------------------------------------------------------
Write-Host "`n--- [SECTION 5] Kubernetes Manifests (Layers 6, 7, 8) ---" -ForegroundColor Yellow

$k8sPrimaryPath = "k8s/04-layer7-primary-db.yaml"
$k8sReplicaPath = "k8s/05-layer8-replica-db.yaml"
$k8sRedisPath = "k8s/06-layer6-redis.yaml"

# 04-layer7-primary-db.yaml
Audit-Check "K8sManifests" "04-layer7-primary-db.yaml exists" (Test-Path $k8sPrimaryPath) "Found $k8sPrimaryPath"
if (Test-Path $k8sPrimaryPath) {
    $kPrimary = Get-Content $k8sPrimaryPath -Raw
    $hasPrimaryMounts = ($kPrimary -match "name:\s*pg-init\s*[\r\n]+\s*mountPath:\s*/docker-entrypoint-initdb\.d/01-init\.sh") -and
                        ($kPrimary -match "name:\s*pg-config\s*[\r\n]+\s*mountPath:\s*/etc/postgresql/postgresql\.conf") -and
                        ($kPrimary -match "configMap:\s*[\r\n]+\s*name:\s*katipuneros-pg-primary-config")
    Audit-Check "K8sManifests" "Layer 7 Primary DB ConfigMap Mounts" `
        $hasPrimaryMounts "Mounts 01-init.sh and postgresql.conf from katipuneros-pg-primary-config"
}

# 05-layer8-replica-db.yaml
Audit-Check "K8sManifests" "05-layer8-replica-db.yaml exists" (Test-Path $k8sReplicaPath) "Found $k8sReplicaPath"
if (Test-Path $k8sReplicaPath) {
    $kReplica = Get-Content $k8sReplicaPath -Raw
    $hasCloneContainer = ($kReplica -match "initContainers:\s*[\r\n]+\s*-\s*name:\s*clone-primary") -and
                         ($kReplica -match "name:\s*PGPASSWORD\s*[\r\n]+\s*valueFrom:\s*[\r\n]+\s*secretKeyRef:\s*[\r\n]+\s*name:\s*katipuneros-secrets\s*[\r\n]+\s*key:\s*POSTGRES_REPLICATION_PASSWORD") -and
                         ($kReplica -match "pg_basebackup.*-R")
    Audit-Check "K8sManifests" "Layer 8 Replica DB initContainer with PGPASSWORD secretKeyRef" `
        $hasCloneContainer "clone-primary initContainer securely injects PGPASSWORD from katipuneros-secrets and clones with -R"
}

# 06-layer6-redis.yaml
Audit-Check "K8sManifests" "06-layer6-redis.yaml exists" (Test-Path $k8sRedisPath) "Found $k8sRedisPath"
if (Test-Path $k8sRedisPath) {
    $kRedis = Get-Content $k8sRedisPath -Raw
    $hasRedisMount = ($kRedis -match "name:\s*redis-config\s*[\r\n]+\s*mountPath:\s*/usr/local/etc/redis/redis\.conf") -and
                     ($kRedis -match "configMap:\s*[\r\n]+\s*name:\s*katipuneros-pg-primary-config") -and
                     ($kRedis -match "subPath:\s*redis\.conf")
    Audit-Check "K8sManifests" "Layer 6 Redis ConfigMap Mount" `
        $hasRedisMount "Mounts redis.conf from katipuneros-pg-primary-config into /usr/local/etc/redis/redis.conf"
}

# ------------------------------------------------------------------------------
# SECTION 6: LIVE C# RUNTIME & MUTATION GUARDS EXECUTION
# ------------------------------------------------------------------------------
Write-Host "`n--- [SECTION 6] Live C# Runtime & Mutation Guards Execution ---" -ForegroundColor Yellow

$runnerPath = "scratch/InfraTestRunner/InfraTestRunner.csproj"
if (Test-Path $runnerPath) {
    Write-Host "Executing compiled C# runtime verification harness..." -ForegroundColor DarkGray
    $proc = Start-Process -FilePath "dotnet" `
        -ArgumentList "run --project $runnerPath -c Release --no-build" `
        -NoNewWindow -PassThru -Wait -RedirectStandardOutput "scratch/InfraTestRunner/output.txt" -RedirectStandardError "scratch/InfraTestRunner/error.txt"

    $runnerExitCode = $proc.ExitCode
    $runnerOut = ""
    if (Test-Path "scratch/InfraTestRunner/output.txt") {
        $runnerOut = Get-Content "scratch/InfraTestRunner/output.txt" -Raw
    }

    if ($runnerExitCode -ne 0) {
        # Retry with build if binaries were not ready
        $proc = Start-Process -FilePath "dotnet" `
            -ArgumentList "run --project $runnerPath -c Release" `
            -NoNewWindow -PassThru -Wait -RedirectStandardOutput "scratch/InfraTestRunner/output.txt" -RedirectStandardError "scratch/InfraTestRunner/error.txt"
        $runnerExitCode = $proc.ExitCode
        if (Test-Path "scratch/InfraTestRunner/output.txt") {
            $runnerOut = Get-Content "scratch/InfraTestRunner/output.txt" -Raw
        }
    }

    # Print runtime test output
    $runnerOut -split "`r?`n" | ForEach-Object {
        if ($_ -match "\[C# RUNTIME PASS\]") {
            Write-Host "  $_" -ForegroundColor Green
            $script:passed++
        } elseif ($_ -match "\[C# RUNTIME FAIL\]") {
            Write-Host "  $_" -ForegroundColor Red
            $script:failed++
        }
    }

    Audit-Check "RuntimeHarness" "C# Behavioral Test Suite Exit Code" `
        ($runnerExitCode -eq 0) "Runtime harness executed with exit code 0"
} else {
    Audit-Check "RuntimeHarness" "InfraTestRunner project exists" $false "Runner project missing"
}

# ------------------------------------------------------------------------------
# AUDIT SUMMARY & SCORECARD
# ------------------------------------------------------------------------------
Write-Host "`n==============================================================================" -ForegroundColor Cyan
Write-Host " INFRASTRUCTURE VERIFICATION SCORECARD" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan

$totalTests = $passed + $failed
Write-Host "Total Verification Checks: $totalTests"
Write-Host "Passed Checks            : $passed" -ForegroundColor Green
$failColor = if ($failed -gt 0) { "Red" } else { "Green" }
Write-Host "Failed Checks            : $failed" -ForegroundColor $failColor

if ($failed -eq 0) {
    Write-Host "`n==============================================================================" -ForegroundColor Green
    Write-Host " SUCCESS: ALL REDIS CACHE & POSTGRESQL REPLICATION CHECKS PASSED (100%)" -ForegroundColor Green
    Write-Host "==============================================================================" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n==============================================================================" -ForegroundColor Red
    Write-Host " AUDIT FAILURE: $failed checks failed out of $totalTests." -ForegroundColor Red
    Write-Host "==============================================================================" -ForegroundColor Red
    exit 1
}
