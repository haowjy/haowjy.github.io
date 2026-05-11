import { describe, expect, it } from 'vitest'
import { pageOfItem, paginate, paginateRanges } from './usePagination'

/**
 * Tests target the pure pagination math exported alongside the hook. The
 * hook itself is verified in the browser; the math is what's load-bearing
 * and easily testable in isolation.
 */

describe('paginate', () => {
  it('returns empty for zero items', () => {
    expect(paginate(0, 4)).toEqual([])
  })

  it('returns one full page when items === capacity', () => {
    expect(paginate(4, 4)).toEqual([4])
  })

  it('returns one short page when items < capacity', () => {
    expect(paginate(2, 4)).toEqual([2])
  })

  it('packs evenly when divisible', () => {
    expect(paginate(8, 4)).toEqual([4, 4])
  })

  it('places remainder on the last page when remainder > 1', () => {
    expect(paginate(7, 4)).toEqual([4, 3])
  })

  it('widow-balances 5 with capacity 4 → [3, 2]', () => {
    // Spec: "5 items with capacity 4 → pages of 3 + 2, not 4 + 1"
    expect(paginate(5, 4)).toEqual([3, 2])
  })

  it('widow-balances 9 with capacity 4 → [4, 3, 2]', () => {
    expect(paginate(9, 4)).toEqual([4, 3, 2])
  })

  it('does not widow-balance when there is no prior page to borrow from', () => {
    // 1 item, capacity 4 → single page of 1. No prior page exists.
    expect(paginate(1, 4)).toEqual([1])
  })

  it('widow-balances when many full pages precede the orphan', () => {
    // 13 with capacity 4 → [4, 4, 4, 1] → rebalance last two → [4, 4, 3, 2]
    expect(paginate(13, 4)).toEqual([4, 4, 3, 2])
  })

  it('handles capacity 1 (every item gets its own page, no rebalance possible)', () => {
    expect(paginate(3, 1)).toEqual([1, 1, 1])
  })

  it('treats non-positive capacity as 1 defensively', () => {
    expect(paginate(3, 0)).toEqual([1, 1, 1])
    expect(paginate(3, -2)).toEqual([1, 1, 1])
  })

  it('floors fractional capacity', () => {
    expect(paginate(7, 3.9)).toEqual([3, 2, 2])
  })
})

describe('paginateRanges', () => {
  it('returns disjoint [start, end) ranges that cover all items', () => {
    expect(paginateRanges([3, 2])).toEqual([
      { start: 0, end: 3 },
      { start: 3, end: 5 },
    ])
  })

  it('returns empty for empty input', () => {
    expect(paginateRanges([])).toEqual([])
  })
})

describe('pageOfItem', () => {
  it('locates items inside their page', () => {
    const pages = [4, 4, 3, 2] // 13 items across 4 pages
    expect(pageOfItem(pages, 0)).toBe(0)
    expect(pageOfItem(pages, 3)).toBe(0)
    expect(pageOfItem(pages, 4)).toBe(1)
    expect(pageOfItem(pages, 7)).toBe(1)
    expect(pageOfItem(pages, 8)).toBe(2)
    expect(pageOfItem(pages, 10)).toBe(2)
    expect(pageOfItem(pages, 11)).toBe(3)
    expect(pageOfItem(pages, 12)).toBe(3)
  })

  it('returns -1 for out-of-bounds indices', () => {
    expect(pageOfItem([3, 2], -1)).toBe(-1)
    expect(pageOfItem([3, 2], 5)).toBe(-1)
    expect(pageOfItem([], 0)).toBe(-1)
  })
})
