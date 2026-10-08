/**
 * Accepts either the value for one commonly used parameter or the complete parameter object.
 */
export type ValueOrParams<Params, Key extends keyof Params> = Params[Key] | Params;

/**
 * Creates a normalizer that accepts either a complete parameter object or a value for the chosen
 * key, and returns the corresponding parameter object.
 */
export const makeToParams =
  <Params extends object, Key extends keyof Params>(key: Key) =>
  (value: ValueOrParams<Params, Key>): Params =>
    typeof value === 'object' ? (value as Params) : ({ [key]: value } as Params);
