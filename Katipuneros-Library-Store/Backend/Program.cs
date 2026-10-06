// [Layer: Backend/]
// Program.cs -- Master application entry point, DI registrations, middleware pipeline, and OpenAPI setup.
// Coordinates service registration, authentication, CORS, rate limiting, and Scalar V1 documentation.
// DO NOT put domain business logic or direct database queries here.

using System.Text;
using Backend.Features.Api.Middleware;
using Backend.Features.Data;
using Backend.Features.DBInfrastructure.Cache;
using Backend.Features.DBInfrastructure.Database;
using Backend.Features.Repositories.Implementations;
using Backend.Features.Repositories.Interfaces;
using Backend.Features.Services.Implementations;
using Backend.Features.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. Database & Cache Infrastructure
// ==========================================
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=localhost;Database=KatipunerosLibraryDb;User Id=InventoryLibrary;Password=InventoryLibrary;TrustServerCertificate=True;MultipleActiveResultSets=true;";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddMemoryCache();
builder.Services.AddScoped<ICacheService, CacheService>();
builder.Services.AddScoped<CacheInvalidation>();

// ==========================================
// 2. Repositories (Data Access Layer)
// ==========================================
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IBookRepository, BookRepository>();
builder.Services.AddScoped<IBorrowRepository, BorrowRepository>();
builder.Services.AddScoped<IReservationRepository, ReservationRepository>();
builder.Services.AddScoped<IFineRepository, FineRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IAuditRepository, AuditRepository>();
builder.Services.AddScoped<IContactRepository, ContactRepository>();
builder.Services.AddScoped<IPersonnelRepository, PersonnelRepository>();
builder.Services.AddScoped<ISettingsRepository, SettingsRepository>();
builder.Services.AddScoped<ICashierRepository, CashierRepository>();

// ==========================================
// 3. Services (Business Rules Layer)
// ==========================================
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IBookService, BookService>();
builder.Services.AddScoped<IBorrowService, BorrowService>();
builder.Services.AddScoped<IReservationService, ReservationService>();
builder.Services.AddScoped<IFineService, FineService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddScoped<IContactService, ContactService>();
builder.Services.AddScoped<ISystemHealthService, SystemHealthService>();
builder.Services.AddScoped<IPersonnelService, PersonnelService>();
builder.Services.AddScoped<IInventoryService, InventoryService>();
builder.Services.AddScoped<IReturnService, ReturnService>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<ISettingsService, SettingsService>();
builder.Services.AddScoped<ICashierService, CashierService>();

// ==========================================
// 4. JWT Authentication & Authorization
// ==========================================
var jwtSecretKey = builder.Configuration["Jwt:SecretKey"] ?? "KatipunerosLibraryStoreJwtSecretKey_2026_SecureKey_MustBeLongEnough!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "KatipunerosLibraryApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "KatipunerosLibraryClient";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("StaffOnly", policy => policy.RequireRole("Admin", "Cashier"));
    options.AddPolicy("PatronOnly", policy => policy.RequireRole("Customer"));
});

// ==========================================
// 5. CORS Policy
// ==========================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5174"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

// ==========================================
// 6. Controllers & JSON Options
// ==========================================
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// ==========================================
// 7. OpenAPI & Scalar V1 Documentation
// ==========================================
builder.Services.AddOpenApi();

var app = builder.Build();

// ==========================================
// 8. Middleware Pipeline (Strict AGENTS.md Order)
// ==========================================
app.UseMiddleware<GlobalExceptionMiddleware>();  // 1. Catch unhandled exceptions
app.UseMiddleware<RateLimitMiddleware>();        // 2. Rate limiting per IP
app.UseMiddleware<IdempotencyMiddleware>();      // 3. Duplicate POST protection
app.UseCors("AllowFrontend");                    // 4. CORS headers
app.UseAuthentication();                         // 5. JWT token validation
app.UseAuthorization();                          // 6. Role / policy checks
app.UseMiddleware<JwtMiddleware>();              // 7. Identity context hydration
app.MapControllers();                            // 8. Route to controllers

// Scalar V1 Interactive API Documentation & OpenAPI schema
app.MapOpenApi();                                // /openapi/v1.json
app.MapScalarApiReference();                     // /scalar/v1

// ==========================================
// 8.5 Admin & User CLI Creation / Management
// ==========================================
if (args.Length >= 1 && args[0].Equals("listcliusers", StringComparison.OrdinalIgnoreCase))
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var users = await dbContext.Users.Where(u => u.IsProtected).OrderBy(u => u.FullName).ToListAsync();
    Console.WriteLine("[CLI_USERS_JSON_BEGIN]");
    var json = System.Text.Json.JsonSerializer.Serialize(users.ConvertAll(u => new
    {
        u.Id,
        u.FullName,
        u.FirstName,
        u.LastName,
        u.Username,
        u.Email,
        Role = u.Role.ToString(),
        u.LibraryCardNumber,
        u.Department,
        u.IsActive,
        u.IsProtected,
        CreatedAt = u.CreatedAt.ToString("yyyy-MM-dd")
    }));
    Console.WriteLine(json);
    Console.WriteLine("[CLI_USERS_JSON_END]");
    return;
}

if (args.Length >= 3 && args[0].Equals("resetpassword", StringComparison.OrdinalIgnoreCase))
{
    var identifier = args[1];
    var newPassword = args[2];
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Username == identifier || u.Email == identifier || u.LibraryCardNumber == identifier);
    if (user == null)
    {
        Console.WriteLine($"[!] User '{identifier}' not found.");
        return;
    }
    user.PasswordHash = Backend.Features.Helpers.Infrastructure.PasswordHelper.HashPassword(newPassword);
    await dbContext.SaveChangesAsync();
    Console.WriteLine($"[OK] Password for '{identifier}' successfully reset.");
    return;
}

if (args.Length >= 4 && args[0].Equals("editcliuser", StringComparison.OrdinalIgnoreCase))
{
    var identifier = args[1];
    var field = args[2].ToLowerInvariant();
    var value = args[3];

    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Username == identifier || u.Email == identifier || u.LibraryCardNumber == identifier);
    if (user == null)
    {
        Console.WriteLine($"[!] User '{identifier}' not found.");
        return;
    }
    if (!user.IsProtected)
    {
        Console.WriteLine($"[!] User '{identifier}' is not a CLI-created protected user. Only CLI-created users can be edited via editcliuser.");
        return;
    }

    switch (field)
    {
        case "name":
        case "fullname":
            user.FullName = value.Trim();
            var parts = value.Trim().Split(' ', 2);
            user.FirstName = parts[0];
            if (parts.Length > 1) user.LastName = parts[1];
            break;
        case "firstname":
            user.FirstName = value.Trim();
            user.FullName = $"{user.FirstName} {user.LastName}".Trim();
            break;
        case "lastname":
            user.LastName = value.Trim();
            user.FullName = $"{user.FirstName} {user.LastName}".Trim();
            break;
        case "email":
            user.Email = value.Trim();
            break;
        case "department":
            user.Department = value.Trim();
            break;
        case "role":
            if (Enum.TryParse<Backend.Features.Data.Enums.UserRole>(value, true, out var newRole))
                user.Role = newRole;
            else
            {
                Console.WriteLine($"[!] Invalid role '{value}'. Must be Customer, Cashier, or Admin.");
                return;
            }
            break;
        case "password":
            user.PasswordHash = Backend.Features.Helpers.Infrastructure.PasswordHelper.HashPassword(value);
            break;
        default:
            Console.WriteLine($"[!] Unknown field '{field}'. Allowed: name, firstname, lastname, email, department, role, password.");
            return;
    }

    await dbContext.SaveChangesAsync();
    Console.WriteLine($"[OK] CLI Protected User '{user.Username}' ({user.LibraryCardNumber}) field '{field}' updated successfully.");
    return;
}

if (args.Length >= 2 && args[0].Equals("deletecliuser", StringComparison.OrdinalIgnoreCase))
{
    var identifier = args[1];
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var user = await dbContext.Users
        .Include(u => u.BorrowTransactions)
        .Include(u => u.Reservations)
        .Include(u => u.FineTransactions)
        .FirstOrDefaultAsync(u => u.Username == identifier || u.Email == identifier || u.LibraryCardNumber == identifier);

    if (user == null)
    {
        Console.WriteLine($"[!] User '{identifier}' not found.");
        return;
    }
    if (!user.IsProtected)
    {
        Console.WriteLine($"[!] User '{identifier}' is not a CLI-created protected user. Only CLI-created users can be deleted via deletecliuser.");
        return;
    }

    // Cascade / Disassociate foreign keys
    var auditLogs = await dbContext.AuditLogs.Where(a => a.UserId == user.Id).ToListAsync();
    foreach (var a in auditLogs) a.UserId = null;

    var cashierLoans = await dbContext.BorrowTransactions.Where(b => b.CashierId == user.Id).ToListAsync();
    foreach (var b in cashierLoans) b.CashierId = null;

    var waivedFines = await dbContext.FineTransactions.Where(f => f.WaivedByUserId == user.Id).ToListAsync();
    foreach (var f in waivedFines) f.WaivedByUserId = null;

    var feedbacks = await dbContext.Feedbacks.Where(f => f.PatronId == user.Id).ToListAsync();
    if (feedbacks.Any()) dbContext.Feedbacks.RemoveRange(feedbacks);

    if (user.FineTransactions.Any()) dbContext.FineTransactions.RemoveRange(user.FineTransactions);
    if (user.Reservations.Any()) dbContext.Reservations.RemoveRange(user.Reservations);
    if (user.BorrowTransactions.Any())
    {
        var loanIds = user.BorrowTransactions.Select(l => l.Id).ToList();
        var childFines = await dbContext.FineTransactions.Where(f => loanIds.Contains(f.BorrowTransactionId)).ToListAsync();
        if (childFines.Any()) dbContext.FineTransactions.RemoveRange(childFines);
        dbContext.BorrowTransactions.RemoveRange(user.BorrowTransactions);
    }

    dbContext.Users.Remove(user);
    await dbContext.SaveChangesAsync();
    Console.WriteLine($"[OK] CLI Protected User '{user.Username}' ({user.LibraryCardNumber}) permanently deleted.");
    return;
}

if (args.Length >= 1 && args[0].Equals("deleteallcliusers", StringComparison.OrdinalIgnoreCase))
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var protectedUsers = await dbContext.Users
        .Include(u => u.BorrowTransactions)
        .Include(u => u.Reservations)
        .Include(u => u.FineTransactions)
        .Where(u => u.IsProtected)
        .ToListAsync();

    if (!protectedUsers.Any())
    {
        Console.WriteLine("[!] No CLI-created protected users found to delete.");
        return;
    }

    var ids = protectedUsers.Select(u => u.Id).ToList();
    var auditLogs = await dbContext.AuditLogs.Where(a => a.UserId.HasValue && ids.Contains(a.UserId.Value)).ToListAsync();
    foreach (var a in auditLogs) a.UserId = null;

    var cashierLoans = await dbContext.BorrowTransactions.Where(b => b.CashierId.HasValue && ids.Contains(b.CashierId.Value)).ToListAsync();
    foreach (var b in cashierLoans) b.CashierId = null;

    var waivedFines = await dbContext.FineTransactions.Where(f => f.WaivedByUserId.HasValue && ids.Contains(f.WaivedByUserId.Value)).ToListAsync();
    foreach (var f in waivedFines) f.WaivedByUserId = null;

    var feedbacks = await dbContext.Feedbacks.Where(f => f.PatronId.HasValue && ids.Contains(f.PatronId.Value)).ToListAsync();
    if (feedbacks.Any()) dbContext.Feedbacks.RemoveRange(feedbacks);

    foreach (var u in protectedUsers)
    {
        if (u.FineTransactions.Any()) dbContext.FineTransactions.RemoveRange(u.FineTransactions);
        if (u.Reservations.Any()) dbContext.Reservations.RemoveRange(u.Reservations);
        if (u.BorrowTransactions.Any())
        {
            var loanIds = u.BorrowTransactions.Select(l => l.Id).ToList();
            var childFines = await dbContext.FineTransactions.Where(f => loanIds.Contains(f.BorrowTransactionId)).ToListAsync();
            if (childFines.Any()) dbContext.FineTransactions.RemoveRange(childFines);
            dbContext.BorrowTransactions.RemoveRange(u.BorrowTransactions);
        }
        dbContext.Users.Remove(u);
    }

    await dbContext.SaveChangesAsync();
    Console.WriteLine($"[OK] Successfully deleted all {protectedUsers.Count} CLI-created protected users.");
    return;
}

if (args.Length >= 4 && (args[0].Equals("createsuperadmin", StringComparison.OrdinalIgnoreCase) || 
                         args[0].Equals("createsuperuseradmin", StringComparison.OrdinalIgnoreCase) ||
                         args[0].Equals("createcustomsuperadmin", StringComparison.OrdinalIgnoreCase) ||
                         args[0].Equals("createcustomersuperuseradmin", StringComparison.OrdinalIgnoreCase) ||
                         args[0].Equals("adduser", StringComparison.OrdinalIgnoreCase)))
{
    var cmd = args[0].ToLowerInvariant();
    var username = args[1];
    var password = args[2];
    var email = args[3];

    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    
    var existingUser = await dbContext.Users.FirstOrDefaultAsync(u => u.Username == username || u.Email == email);
    if (existingUser != null)
    {
        Console.WriteLine($"[!] User with username '{username}' or email '{email}' already exists.");
        return;
    }

    var role = Backend.Features.Data.Enums.UserRole.Admin;
    string firstName = "Super";
    string lastName = "Admin";
    string department = "System Administration";

    if (cmd == "createcustomsuperadmin" || cmd == "createsuperuseradmin" || cmd == "createsuperadmin")
    {
        firstName = args.Length >= 5 ? args[4] : "Super";
        lastName = args.Length >= 6 ? args[5] : "Admin";
        department = args.Length >= 7 ? args[6] : "System Administration";
        role = Backend.Features.Data.Enums.UserRole.Admin;
    }
    else if (cmd == "createcustomersuperuseradmin")
    {
        firstName = args.Length >= 5 ? args[4] : "Customer";
        lastName = args.Length >= 6 ? args[5] : "Superuser";
        department = args.Length >= 7 ? args[6] : "Academic Research & Governance";
        role = Backend.Features.Data.Enums.UserRole.Customer;
    }
    else if (cmd == "adduser")
    {
        var roleStr = args.Length >= 5 ? args[4] : "Customer";
        if (Enum.TryParse<Backend.Features.Data.Enums.UserRole>(roleStr, true, out var parsedRole))
        {
            role = parsedRole;
        }
        else
        {
            role = Backend.Features.Data.Enums.UserRole.Customer;
        }
        firstName = args.Length >= 6 ? args[5] : "New";
        lastName = args.Length >= 7 ? args[6] : "User";
        department = args.Length >= 8 ? args[7] : (role == Backend.Features.Data.Enums.UserRole.Admin ? "System Administration" : "General Department");
    }

    var prefix = role switch
    {
        Backend.Features.Data.Enums.UserRole.Admin => "KP-ADM",
        Backend.Features.Data.Enums.UserRole.Cashier => "KP-CSH",
        _ => "KP-LIB"
    };

    var newUser = new Backend.Features.Data.Models.User
    {
        FirstName = firstName,
        LastName = lastName,
        FullName = $"{firstName} {lastName}".Trim(),
        Username = username,
        Email = email,
        PasswordHash = Backend.Features.Helpers.Infrastructure.PasswordHelper.HashPassword(password),
        Role = role,
        LibraryCardNumber = $"{prefix}-2026-{Guid.NewGuid().ToString().Substring(0, 5).ToUpper()}",
        Department = department,
        EmploymentStatus = role == Backend.Features.Data.Enums.UserRole.Customer ? "Student" : "Employee",
        IsActive = true,
        IsProtected = true // All users created via CLI are immune from Web UI deletion and suspension
    };

    dbContext.Users.Add(newUser);
    await dbContext.SaveChangesAsync();
    Console.WriteLine($"[OK] {role} '{username}' ({email}) successfully created with ID {newUser.LibraryCardNumber} [PROTECTED CLI ROOT].");
    return;
}

// ==========================================
// 9. Database Auto-Seeder on Startup
// ==========================================
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        await DatabaseSeeder.SeedAsync(dbContext);
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning(ex, "Initial database seeding deferred until migrations are applied.");
    }
}

app.Run();
