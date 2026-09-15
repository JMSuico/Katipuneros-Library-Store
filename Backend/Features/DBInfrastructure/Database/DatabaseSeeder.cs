// [Layer: Features/DBInfrastructure/Database]
// DatabaseSeeder.cs -- Initial database seed orchestrator.
// Populates core Dewey Decimal categories, default personnel, and catalog titles.
// DO NOT put HTTP concerns or controller logic here.

using Microsoft.EntityFrameworkCore;
using Backend.Features.Data;
using Backend.Features.Data.Enums;
using Backend.Features.Data.Models;
using Backend.Features.Helpers.Infrastructure;

namespace Backend.Features.DBInfrastructure.Database;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // 1. Seed Categories
        if (!await context.Categories.AnyAsync())
        {
            var categories = new List<Category>
            {
                new() { DeweyRange = "000 - 099", Name = "Computer Science & Information", ShelfBayLocation = "Bay A-01 to A-08", Description = "Algorithms, software engineering, systems, and data structures." },
                new() { DeweyRange = "100 - 199", Name = "Philosophy & Psychology", ShelfBayLocation = "Bay B-01 to B-06", Description = "Ethics, logic, classical philosophy, and cognitive science." },
                new() { DeweyRange = "300 - 399", Name = "Social Sciences & Law", ShelfBayLocation = "Bay C-01 to C-10", Description = "Economics, education, sociology, and jurisprudence." },
                new() { DeweyRange = "500 - 599", Name = "Pure Science & Mathematics", ShelfBayLocation = "Bay D-01 to D-12", Description = "Physics, chemistry, calculus, and astrophysics." },
                new() { DeweyRange = "600 - 699", Name = "Technology & Applied Sciences", ShelfBayLocation = "Bay E-01 to E-14", Description = "Mechanical, electrical, chemical engineering, and robotics." },
                new() { DeweyRange = "800 - 899", Name = "Literature & Rhetoric", ShelfBayLocation = "Bay F-01 to F-10", Description = "Poetry, world classics, drama, and scholastic rhetoric." },
                new() { DeweyRange = "900 - 999", Name = "History & Filipiniana", ShelfBayLocation = "Bay G-01 to G-08", Description = "Philippine revolution, Katipunan archives, and global history." }
            };

            await context.Categories.AddRangeAsync(categories);
            await context.SaveChangesAsync();
        }

        // 2. Seed Users
        if (!await context.Users.AnyAsync())
        {
            var users = new List<User>
            {
                new()
                {
                    FullName = "Chief Administrator",
                    Email = "admin@katipuneros.edu.ph",
                    PasswordHash = PasswordHelper.HashPassword("Admin@2026!"),
                    Role = UserRole.Admin,
                    LibraryCardNumber = "KP-ADM-2026-00001",
                    Department = "University Library Administration",
                    PhoneNumber = "+63 917 100 0001",
                    IsActive = true
                },
                new()
                {
                    FullName = "Senior Circulation Cashier",
                    Email = "cashier@katipuneros.edu.ph",
                    PasswordHash = PasswordHelper.HashPassword("Cashier@2026!"),
                    Role = UserRole.Cashier,
                    LibraryCardNumber = "KP-CSH-2026-00002",
                    Department = "Circulation & Stacks Terminal",
                    PhoneNumber = "+63 917 100 0002",
                    IsActive = true
                },
                new()
                {
                    FullName = "Juan Dela Cruz",
                    Email = "patron@katipuneros.edu.ph",
                    PasswordHash = PasswordHelper.HashPassword("Patron@2026!"),
                    Role = UserRole.Customer,
                    LibraryCardNumber = "KP-LIB-2024-08912-JD",
                    Department = "College of Computer Studies",
                    PhoneNumber = "+63 917 100 0003",
                    IsActive = true
                }
            };

            await context.Users.AddRangeAsync(users);
            await context.SaveChangesAsync();
        }

        // 3. Seed Books
        if (!await context.Books.AnyAsync())
        {
            var csCat = await context.Categories.FirstAsync(c => c.DeweyRange.StartsWith("000"));
            var philCat = await context.Categories.FirstAsync(c => c.DeweyRange.StartsWith("100"));
            var sciCat = await context.Categories.FirstAsync(c => c.DeweyRange.StartsWith("500"));
            var histCat = await context.Categories.FirstAsync(c => c.DeweyRange.StartsWith("900"));

            var books = new List<Book>
            {
                new()
                {
                    Title = "Clean Architecture: A Craftsman's Guide to Software Structure",
                    Author = "Robert C. Martin",
                    Isbn = "978-0134494166",
                    DeweyCode = "005.1 MAR",
                    CategoryId = csCat.Id,
                    PublishedYear = 2017,
                    TotalCopies = 5,
                    AvailableCopies = 4,
                    BayLocation = "Bay A-04",
                    IsbnBarcode = "9780134494166",
                    RfidTag = "RFID-0051-MAR-01",
                    IsSpotlight = true,
                    Description = "A universal framework for software structure, modularity, and dependency inversion in modern applications."
                },
                new()
                {
                    Title = "Structure and Interpretation of Computer Programs (SICP)",
                    Author = "Harold Abelson, Gerald Jay Sussman",
                    Isbn = "978-0262510875",
                    DeweyCode = "005.13 ABE",
                    CategoryId = csCat.Id,
                    PublishedYear = 1996,
                    TotalCopies = 4,
                    AvailableCopies = 4,
                    BayLocation = "Bay A-03",
                    IsbnBarcode = "9780262510875",
                    RfidTag = "RFID-0051-ABE-01",
                    Description = "Foundational principles of abstraction, functional modeling, and interpreter construction."
                },
                new()
                {
                    Title = "Introduction to Algorithms (CLRS 4th Edition)",
                    Author = "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
                    Isbn = "978-0262046305",
                    DeweyCode = "005.1 COR",
                    CategoryId = csCat.Id,
                    PublishedYear = 2022,
                    TotalCopies = 8,
                    AvailableCopies = 6,
                    BayLocation = "Bay A-06",
                    IsbnBarcode = "9780262046305",
                    RfidTag = "RFID-0051-COR-01",
                    Description = "Comprehensive algorithms, asymptotic notation, dynamic programming, and graph theory."
                },
                new()
                {
                    Title = "Meditations",
                    Author = "Marcus Aurelius",
                    Isbn = "978-0140449334",
                    DeweyCode = "188 AUR",
                    CategoryId = philCat.Id,
                    PublishedYear = 2006,
                    TotalCopies = 6,
                    AvailableCopies = 5,
                    BayLocation = "Bay B-02",
                    IsbnBarcode = "9780140449334",
                    RfidTag = "RFID-0188-AUR-01",
                    Description = "Private reflections on Stoic philosophy, ethical conduct, and psychological resilience."
                },
                new()
                {
                    Title = "A Brief History of Time",
                    Author = "Stephen Hawking",
                    Isbn = "978-0553380163",
                    DeweyCode = "523.1 HAW",
                    CategoryId = sciCat.Id,
                    PublishedYear = 1998,
                    TotalCopies = 5,
                    AvailableCopies = 4,
                    BayLocation = "Bay D-03",
                    IsbnBarcode = "9780553380163",
                    RfidTag = "RFID-0523-HAW-01",
                    Description = "Landmark treatise on cosmology, black holes, time curvature, and the origin of the universe."
                },
                new()
                {
                    Title = "The Katipunan and the Revolution: Memoirs of a General",
                    Author = "Santiago V. Alvarez",
                    Isbn = "978-9715500814",
                    DeweyCode = "959.9 ALV",
                    CategoryId = histCat.Id,
                    PublishedYear = 1992,
                    TotalCopies = 3,
                    AvailableCopies = 3,
                    BayLocation = "Bay G-02",
                    IsbnBarcode = "9789715500814",
                    RfidTag = "RFID-0959-ALV-01",
                    Description = "First-hand historical accounts and memoirs of the Philippine Revolution of 1896."
                }
            };

            await context.Books.AddRangeAsync(books);
            await context.SaveChangesAsync();
        }
    }
}
