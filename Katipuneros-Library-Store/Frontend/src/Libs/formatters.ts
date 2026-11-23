// [Layer: Libs]
// formatters.ts -- Reusable formatting utilities for dates, currency, numbers, and error strings.
// Uses universal arrow lambda syntax (=>).
// DO NOT put UI components, React hooks, or business rules here.

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);

export const formatDate = (date: string | Date): string =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(typeof date === 'string' ? new Date(date) : date);

export const formatDateTime = (date: string | Date): string =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(typeof date === 'string' ? new Date(date) : date);

export const getErrorMessage = (err: unknown, fallback = 'An unexpected error occurred.'): string =>
  err instanceof Error && err.message ? err.message : fallback;
