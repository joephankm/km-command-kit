/**
 * Make a getter of a single value, created only when it is first needed.
 */
export const lazeCreate = <Value>(creator: () => Value): (() => Value) => {
  let isCreated = false;
  let value: Value;

  return () => {
    // The first call runs the creator, and every later call returns what it created.
    if (!isCreated) {
      value = creator();
      isCreated = true;
    }

    return value;
  };
};
