/**
 * Helper untuk format mata uang Rupiah dan tanggal
 */

export function formatRupiah(
  amount: number,
  options?: {
    showSign?: boolean;
    type?: 'INCOME' | 'EXPENSE';
  }
): string {
  const absAmount = Math.abs(amount);
  const formattedNumber = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(absAmount);

  if (options?.type === 'INCOME') {
    return `+Rp ${formattedNumber}`;
  }
  if (options?.type === 'EXPENSE') {
    return `-Rp ${formattedNumber}`;
  }
  if (options?.showSign) {
    if (amount > 0) return `+Rp ${formattedNumber}`;
    if (amount < 0) return `-Rp ${formattedNumber}`;
  }

  return `Rp ${formattedNumber}`;
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}
