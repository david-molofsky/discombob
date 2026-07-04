export function arrayMove<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
  const copy = arr.slice();
  const [moved] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, moved);
  return copy;
}
