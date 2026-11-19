/**
 * MoneyMate utility functions
 * Currency: INR (₹)
 * Timezone: Asia/Kolkata
 */

export const OWNER_EMAIL = 'Sumity9432@gmail.com';

/**
 * Format numbers according to Indian Currency System (Lakhs and Crores)
 * e.g., 200000 -> ₹2,00,000
 */
export function formatINR(amount: number, showDecimals = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  });

  return formatter.format(amount);
}

/**
 * Format date in standard Indian format: 19 Nov 2026 or DD/MM/YYYY
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(date);
}

/**
 * Format Month & Year e.g. "November 2026"
 */
export function formatMonthYear(monthYearStr: string): string {
  if (!monthYearStr) return '';
  const [year, month] = monthYearStr.split('-').map(Number);
  const date = new Date(year, (month || 1) - 1, 1);
  return new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(date);
}

/**
 * Get current Month-Year string in YYYY-MM
 */
export function getCurrentMonthYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Calculate Monthly EMI using reducing balance method
 * P: Principal, r: Annual Interest Rate (%), n: Tenor in months
 */
export function calculateMonthlyEmi(principal: number, annualRate: number, tenureMonths: number): number {
  if (tenureMonths <= 0 || principal <= 0) return 0;
  if (annualRate <= 0) return Math.round(principal / tenureMonths);

  const monthlyRate = annualRate / (12 * 100);
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * factor) / (factor - 1);
  return Math.round(emi);
}

/**
 * Calculate interest and principal split for an EMI installment based on current outstanding
 */
export function calculateEmiSplit(outstanding: number, annualRate: number, emiAmount: number) {
  const monthlyRate = annualRate / (12 * 100);
  const interestComponent = Math.round(outstanding * monthlyRate);
  const principalComponent = Math.max(0, emiAmount - interestComponent);
  return {
    interestComponent,
    principalComponent,
  };
}

/**
 * Days difference between today and a target date in Asia/Kolkata
 */
export function getDaysRemaining(targetDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Export array of data to CSV file download
 */
export function exportToCSV<T extends object>(filename: string, rows: T[]): void {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]) as (keyof T)[];
  const csvContent =
    keys.map(String).join(separator) +
    '\n' +
    rows
      .map((row) => {
        return keys
          .map((k) => {
            const rawVal = (row as Record<string, unknown>)[k as string];
            let cell = rawVal === null || rawVal === undefined ? '' : rawVal;
            if (typeof cell === 'string') {
              cell = `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
