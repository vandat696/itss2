export type SearchParams = Record<string, string | string[] | undefined>;

export function singleValues<T extends string>(query: SearchParams, keys: readonly T[]): Partial<Record<T, string>> {
  const result: Partial<Record<T, string>> = {};
  for (const key of keys) {
    const value = query[key];
    if (typeof value === "string") result[key] = value;
  }
  return result;
}
