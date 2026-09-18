/** Sorted unique indices for set comparison (order of user selection ignored). */
export function normalizeIndices(indices: readonly number[]): readonly number[] {
  const unique = [...new Set(indices)];
  unique.sort((a, b) => a - b);
  return unique;
}

export function isValidSelection(
  selectedIndices: readonly number[],
  optionCount: number,
): boolean {
  if (selectedIndices.length === 0) {
    return false;
  }
  const seen = new Set<number>();
  for (const index of selectedIndices) {
    if (!Number.isInteger(index) || index < 0 || index >= optionCount) {
      return false;
    }
    if (seen.has(index)) {
      return false;
    }
    seen.add(index);
  }
  return true;
}

export function quizAnswersMatch(
  selectedIndices: readonly number[],
  correctIndices: readonly number[],
): boolean {
  const selected = normalizeIndices(selectedIndices);
  const correct = normalizeIndices(correctIndices);
  if (selected.length !== correct.length) {
    return false;
  }
  return selected.every((value, i) => value === correct[i]);
}
