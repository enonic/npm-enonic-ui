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
