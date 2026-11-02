/**
 * The metas worked out so far, each set on its function's first call.
 */
const cache: Record<string, unknown> = {};

/**
 * Get a meta, kept in the cache by its name.
 */
export const getMeta = <Value>(name: string, getValue: () => Value): Value => {
  if (!(name in cache)) cache[name] = getValue();

  return cache[name] as Value;
};

/**
 * Make a getter of a meta, which gets it as `getMeta` does on each call.
 */
export const metaFunc =
  <Value>(name: string, getValue: () => Value) =>
  (): Value =>
    getMeta(name, getValue);
