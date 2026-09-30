import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(), from: vi.fn(), revalidate: vi.fn(),
}));
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ auth: { getUser: mocks.getUser }, from: mocks.from }) }));
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidate }));

import { getBudgetData, saveBudget } from '@/actions/budgets';
import { summarizeBudget, validAmount, validMonth } from '@/lib/budgets';

function form(values: Record<string, string>) {
  const result = new FormData();
  for (const [key, value] of Object.entries(values)) result.set(key, value);
  return result;
}
const previous = { success: false, message: '' };
const allocation = { operation: 'allocation', account_id: 'account-a', category_id: 'food', month: '2026-09', amount: '500000' };

function query(result = { data: [{ id: 'allocation-a' }], error: null } as { data: unknown[]; error: null | { code: string } }) {
  const chain = { insert: vi.fn(), update: vi.fn(), delete: vi.fn(), eq: vi.fn(), select: vi.fn(), order: vi.fn(), then: vi.fn() };
  for (const key of ['insert', 'update', 'delete', 'eq', 'select', 'order'] as const) chain[key].mockReturnValue(chain);
  chain.then.mockImplementation((resolve: (value: typeof result) => void) => Promise.resolve(result).then(resolve));
  mocks.from.mockReturnValue(chain);
  return chain;
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'public-test-key');
  mocks.getUser.mockResolvedValue({ data: { user: { id: 'owner-a' } }, error: null });
});

describe('Multi-budget validation and totals', () => {
  it('validates month and whole positive rupiah', () => {
    expect(validMonth('2026-09')).toBe(true);
    for (const month of ['2026-13', '1999-01', '2026-9', '2026-01-01']) expect(validMonth(month)).toBe(false);
    for (const amount of [0, -1, 0.5, NaN, Infinity, 1_000_000_000_001]) expect(validAmount(amount)).toBe(false);
  });
  it('sums one category funded by multiple accounts without double counting', () => {
    const data = { accounts: [{ id: 'bank', name: 'Bank' }, { id: 'cash', name: 'Tunai' }], categories: [{ id: 'food', name: 'Makanan' }, { id: 'travel', name: 'Transportasi' }], allocations: [
      { id: '1', account_id: 'bank', category_id: 'food', month: '2026-09-01', amount: 500000 },
      { id: '2', account_id: 'cash', category_id: 'food', month: '2026-09-01', amount: 200000 },
      { id: '3', account_id: 'bank', category_id: 'travel', month: '2026-09-01', amount: 100000 },
    ] };
    const summary = summarizeBudget(data);
    expect(summary.total).toBe(800000);
    expect(summary.categories[0].total).toBe(700000);
    expect(summary.accounts[0].total).toBe(600000);
  });
});

describe('Budget actions', () => {
  it('rejects unauthenticated writes without querying tables', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    expect((await saveBudget(previous, form(allocation))).success).toBe(false);
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it('uses verified identity instead of a supplied user ID', async () => {
    const chain = query();
    expect((await saveBudget(previous, form({ ...allocation, user_id: 'other-owner' }))).success).toBe(true);
    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'owner-a', month: '2026-09-01', amount: 500000 }));
    expect(mocks.revalidate).toHaveBeenCalledWith('/budgets');
  });
  it('rejects invalid amounts before inserting', async () => {
    for (const amount of ['NaN', 'Infinity', '-2', '0', '12.5']) expect((await saveBudget(previous, form({ ...allocation, amount }))).success).toBe(false);
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it('scopes edits and deletions to the owner and rejects missing rows', async () => {
    const chain = query({ data: [], error: null });
    expect((await saveBudget(previous, form({ ...allocation, id: 'foreign-id' }))).success).toBe(false);
    expect(chain.eq).toHaveBeenCalledWith('user_id', 'owner-a');
    expect((await saveBudget(previous, form({ operation: 'delete-allocation', id: 'foreign-id' }))).success).toBe(false);
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });
  it('surfaces duplicate allocations and reference constraints instead of pretending to save', async () => {
    query({ data: [], error: { code: '23505' } });
    expect((await saveBudget(previous, form(allocation))).message).toContain('Data sudah ada');
    query({ data: [], error: { code: '23503' } });
    expect((await saveBudget(previous, form(allocation))).success).toBe(false);
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });
  it('loads only the selected month and owner', async () => {
    const chain = query({ data: [], error: null });
    expect(await getBudgetData('2026-10')).toEqual({ accounts: [], categories: [], allocations: [] });
    expect(chain.eq).toHaveBeenCalledWith('month', '2026-10-01');
    expect(chain.eq).toHaveBeenCalledWith('user_id', 'owner-a');
  });
});
