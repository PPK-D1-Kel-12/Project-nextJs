import { describe, it, expect } from 'vitest';

describe('Client-Side Pagination Logic (SRS-08)', () => {
  const pageSize = 10;

  function calculatePagination(totalItems: number, currentPage: number) {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    return { totalPages, startIndex, endIndex };
  }

  it('menghitung totalPages minimal 1 ketika daftar transaksi kosong', () => {
    const { totalPages, startIndex, endIndex } = calculatePagination(0, 1);
    expect(totalPages).toBe(1);
    expect(startIndex).toBe(0);
    expect(endIndex).toBe(0);
  });

  it('menghitung paginasi halaman 1 untuk 25 transaksi', () => {
    const { totalPages, startIndex, endIndex } = calculatePagination(25, 1);
    expect(totalPages).toBe(3);
    expect(startIndex).toBe(0);
    expect(endIndex).toBe(10);
  });

  it('menghitung paginasi halaman 2 untuk 25 transaksi', () => {
    const { totalPages, startIndex, endIndex } = calculatePagination(25, 2);
    expect(totalPages).toBe(3);
    expect(startIndex).toBe(10);
    expect(endIndex).toBe(20);
  });

  it('menghitung paginasi halaman terakhir (halaman 3) untuk 25 transaksi', () => {
    const { totalPages, startIndex, endIndex } = calculatePagination(25, 3);
    expect(totalPages).toBe(3);
    expect(startIndex).toBe(20);
    expect(endIndex).toBe(25);
  });

  it('memotong (slice) data transaksi secara tepat per halaman', () => {
    const mockTransactions = Array.from({ length: 25 }, (_, i) => ({
      id: `tx-${i + 1}`,
      amount: (i + 1) * 10000,
    }));

    // Halaman 1
    const page1 = mockTransactions.slice(0, 10);
    expect(page1.length).toBe(10);
    expect(page1[0].id).toBe('tx-1');
    expect(page1[9].id).toBe('tx-10');

    // Halaman 2
    const page2 = mockTransactions.slice(10, 20);
    expect(page2.length).toBe(10);
    expect(page2[0].id).toBe('tx-11');
    expect(page2[9].id).toBe('tx-20');

    // Halaman 3
    const page3 = mockTransactions.slice(20, 25);
    expect(page3.length).toBe(5);
    expect(page3[0].id).toBe('tx-21');
    expect(page3[4].id).toBe('tx-25');
  });
});
