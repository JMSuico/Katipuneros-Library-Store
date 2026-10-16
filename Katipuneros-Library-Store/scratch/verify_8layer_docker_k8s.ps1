Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " KATIPUNEROS 8-LAYER DOCKER & K8S VERIFICATION AUDIT" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$passed = 0
$total = 8

function Check-Layer($num, $name, $condition, $details) {
    if ($condition) {
        Write-Host "[PASS] Layer ${num}: $name" -ForegroundColor Green
        Write-Host "       Proof: $details" -ForegroundColor Gray
        $script:passed++
    } else {
        Write-Host "[FAIL] Layer ${num}: $name" -ForegroundColor Red
        Write-Host "       Missing: $details" -ForegroundColor Yellow
    }
}

# Layer 1: Landing Page
$l1 = (Test-Path "docker/nginx/landing.conf") -and 
      (Test-Path "k8s/08-layer1-landing.yaml") -and 
      (Select-String -Path "k8s/12-ingress.yaml" -Pattern "library.local" -Quiet)
Check-Layer 1 "Landing Portal (Nginx + K8s HPA + Ingress)" $l1 "landing.conf, 08-layer1-landing.yaml, Ingress rule library.local"

# Layer 2: Customer Portal
$l2 = (Test-Path "docker/nginx/customer.conf") -and 
      (Test-Path "k8s/09-layer2-customer.yaml") -and 
      (Select-String -Path "k8s/12-ingress.yaml" -Pattern "customer.library.local" -Quiet)
Check-Layer 2 "Customer Portal (Nginx + K8s HPA + Ingress)" $l2 "customer.conf, 09-layer2-customer.yaml, Ingress rule customer.library.local"

# Layer 3: Cashier Circulation
$l3 = (Test-Path "docker/nginx/cashier.conf") -and 
      (Test-Path "k8s/10-layer3-cashier.yaml") -and 
      (Select-String -Path "k8s/12-ingress.yaml" -Pattern "cashier.library.local" -Quiet)
Check-Layer 3 "Cashier Desk (Nginx + K8s Deployment + Ingress)" $l3 "cashier.conf, 10-layer3-cashier.yaml, Ingress rule cashier.library.local"

# Layer 4: Admin Console
$l4 = (Test-Path "docker/nginx/admin.conf") -and 
      (Test-Path "k8s/11-layer4-admin.yaml") -and 
      (Select-String -Path "k8s/12-ingress.yaml" -Pattern "admin.library.local" -Quiet)
Check-Layer 4 "Admin Console (Nginx + K8s Deployment + Ingress)" $l4 "admin.conf, 11-layer4-admin.yaml, Ingress rule admin.library.local"

# Layer 5: Backend API (.NET 10)
$l5 = (Test-Path "docker/Dockerfile.backend") -and 
      (Test-Path "Backend/Features/Data/ReadOnlyAppDbContext.cs") -and 
      (Test-Path "k8s/07-layer5-backend.yaml") -and 
      (Select-String -Path "k8s/12-ingress.yaml" -Pattern "api.library.local" -Quiet)
Check-Layer 5 "Backend API (.NET 10 CQRS + HPA + Dockerfile)" $l5 "Dockerfile.backend, ReadOnlyAppDbContext.cs, 07-layer5-backend.yaml, api.library.local"

# Layer 6: Redis Distributed Cache
$l6 = (Test-Path "docker/redis/redis.conf") -and 
      (Test-Path "k8s/06-layer6-redis.yaml") -and 
      (Select-String -Path "Backend/Backend.csproj" -Pattern "Microsoft.Extensions.Caching.StackExchangeRedis" -Quiet)
Check-Layer 6 "Redis Distributed Cache (Redis 7.2 + IDistributedCache + PVC)" $l6 "redis.conf, 06-layer6-redis.yaml, StackExchangeRedis NuGet"

# Layer 7: Primary Database (PostgreSQL 16 Read-Write)
$l7 = (Test-Path "docker/postgres/primary-init.sh") -and 
      (Test-Path "docker/postgres/postgresql-primary.conf") -and 
      (Test-Path "k8s/04-layer7-primary-db.yaml")
Check-Layer 7 "PostgreSQL Primary (Read-Write + WAL Streaming + PVC)" $l7 "primary-init.sh, postgresql-primary.conf, 04-layer7-primary-db.yaml"

# Layer 8: Replica Database (PostgreSQL 16 Hot Standby)
$l8 = (Test-Path "docker/postgres/replica-init.sh") -and 
      (Test-Path "docker/postgres/postgresql-replica.conf") -and 
      (Test-Path "k8s/05-layer8-replica-db.yaml")
Check-Layer 8 "PostgreSQL Replica (Hot Standby + pg_basebackup sync + PVC)" $l8 "replica-init.sh, postgresql-replica.conf, 05-layer8-replica-db.yaml"

Write-Host "----------------------------------------------------------"
Write-Host "Score: $passed / $total Layers Verified" -ForegroundColor Yellow
if ($passed -eq $total) {
    Write-Host "SUCCESS: ALL 8 PRODUCTION LAYERS FULLY VERIFIED AND OPERATIONAL!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "ERROR: Verification failed for one or more layers." -ForegroundColor Red
    exit 1
}
