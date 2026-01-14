export function areArraysEquals<T extends string>(
  left: readonly T[] | undefined | null,
  right: readonly T[] | undefined | null,
  order: 'any' | 'strict' = 'any',
): boolean {
  if (left === right) {
    return true;
  }

  if (left == null || right == null) {
    return false;
  }

  if (left.length !== right.length) {
    return false;
  }

  const leftArray = order === 'any' ? [...left].sort() : left;
  const rightArray = order === 'any' ? [...right].sort() : right;

  for (let i = 0; i < leftArray.length; i += 1) {
    if (leftArray[i] !== rightArray[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Returns a fixed-size, bounded window around `center`.
 *
 * The result always contains exactly `sidesCount + 1` numbers in total:
 * `left.length + 1 (mid) + right.length`.
 *
 * If the ideal symmetric window would go below `min` or above `max`,
 * the function shifts (“compensates”) the other side to keep the total
 * count constant, clamping within the bounds.
 *
 * @param center - The central number.
 * @param sidesCount - Total amount of numbers on both sides combined (excluding `center`).
 * @param min - Lower bound (inclusive).
 * @param max - Upper bound (inclusive).
 *
 * @example
 * // constantRangeAround(5,15,0,20) // { left: [0,1,2,3,4], mid: 5, right: [6,7,8,9,10,11,12,13,14] }
 */

export function fixedCountRangeAround(
  center: number,
  totalCount: number,
  min: number = Number.MIN_SAFE_INTEGER,
  max: number = Number.MAX_SAFE_INTEGER,
): { left: number[]; mid: number; right: number[] } {
  const count = Math.max(1, Math.floor(totalCount));
  const sideTotal = count - 1;

  const leftIdeal = Math.floor(sideTotal / 2);
  const rightIdeal = sideTotal - leftIdeal;

  const maxLeft = Math.max(0, center - min);
  const maxRight = Math.max(0, max - center);

  let leftCount = Math.min(leftIdeal, maxLeft);
  let rightCount = Math.min(rightIdeal, maxRight);

  let remaining = sideTotal - (leftCount + rightCount);

  if (remaining > 0) {
    const addRight = Math.min(remaining, maxRight - rightCount);
    rightCount += addRight;
    remaining -= addRight;

    const addLeft = Math.min(remaining, maxLeft - leftCount);
    leftCount += addLeft;
    remaining -= addLeft;
  }

  const left = Array.from({ length: leftCount }, (_, i) => center - leftCount + i).filter(n => n >= min);
  const right = Array.from({ length: rightCount }, (_, i) => center + 1 + i).filter(n => n <= max);

  return { left, mid: center, right };
}
