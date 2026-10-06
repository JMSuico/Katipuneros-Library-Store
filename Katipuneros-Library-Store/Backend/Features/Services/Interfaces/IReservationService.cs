// [Layer: Features/Services/Interfaces]
// IReservationService.cs -- Contract for book holds, smart locker staging, and pickup fulfillment.
// Defines business rules for queue rank, reservation expiration, and pickup validation.
// DO NOT put data access, raw SQL, or HTTP concerns here.

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Features.Api.DTOs.Requests;
using Backend.Features.Api.DTOs.Responses;
using Backend.Features.Data.Models;

namespace Backend.Features.Services.Interfaces;

public interface IReservationService
{
    Task<(bool Success, Reservation? Reservation, string? Error)> CreateReservationAsync(Guid patronId, Guid bookId, string? pickupBranch);
    Task<(bool Success, string? Error)> CancelReservationAsync(Guid reservationId, Guid patronId);
    Task<(bool Success, string? Error)> AssignLockerAsync(Guid reservationId, string lockerBay, string pin);
    Task<(bool Success, string? Error)> FulfillReservationAsync(Guid reservationId);
    Task<List<Reservation>> GetPatronReservationsAsync(Guid patronId);
    Task<List<Reservation>> GetPendingReservationsAsync();
    Task<ReservationMetricsResponse> GetMetricsAsync();
    Task<List<ReservationDetailResponse>> GetAllAdminReservationsAsync(string? status = null, string? query = null);
    Task<(bool Success, string? Error)> TriageReservationAsync(Guid reservationId, bool approved, string? reason, bool priority);
    Task<(bool Success, string? Error)> UpdateStatusAsync(Guid reservationId, string newStatus, string? notes);
    Task<(bool Success, int AffectedCount, string? Error)> BatchClearanceAsync(List<Guid> holdIds, string action, string? lockerBay);
    Task<(bool Success, string? Message, string? Error)> NotifyPatronAsync(Guid reservationId, string channel, string? customMessage);
    Task<LockerDiagnosticsResponse> GetLockerDiagnosticsAsync();
    Task<byte[]> ExportReservationsAsync(ExportReservationsQuery query);
}

