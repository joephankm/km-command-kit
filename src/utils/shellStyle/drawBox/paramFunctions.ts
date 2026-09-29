import type { ValueOrParams } from '../types/commonTypes';

/**
 * Creates a normalizer that accepts either a complete parameter object or a value for the chosen
 * key, and returns the corresponding parameter object.
 */
export const makeToParams =
  <Params extends object, Key extends keyof Params>(key: Key) =>
  (value: ValueOrParams<Params, Key>): Params =>
    typeof value === 'object' ? (value as Params) : ({ [key]: value } as Params);
