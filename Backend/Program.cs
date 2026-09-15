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
    ?? "Server=localhost;Database=KatipunerosLibraryDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true;";

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
        policy.WithOrigins("http://localhost:5173")
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
