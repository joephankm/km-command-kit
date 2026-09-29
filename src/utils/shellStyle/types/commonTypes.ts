/**
 * Accepts either the value for one commonly used parameter or the complete parameter object.
 */
export type ValueOrParams<Params, Key extends keyof Params> = Params[Key] | Params;

/**
 * An indexed collection supplied as an array or as a numeric-keyed object. Both forms can be read
 * by position without conversion.
 */
export type ArrayOrIndexed<T> = (T | undefined)[] | Record<number, T>;
