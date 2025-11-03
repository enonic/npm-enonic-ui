export function arraysEquals<T>(left: readonly T[], right: readonly T[], order: 'any' | 'strict' = 'any'): boolean {
  const leftArray = order === 'any' ? [...left].sort() : left;
  const rightArray = order === 'any' ? [...right].sort() : right;

  if (leftArray.length !== rightArray.length) {
    return false;
  }

  for (let i = 0; i < leftArray.length; i += 1) {
    if (leftArray[i] !== rightArray[i]) {
      return false;
    }
  }

  return true;
}
