import isISO31661Alpha2 from 'validator/lib/isISO31661Alpha2.js';

/**
 * I'm patching the type definitions for isISO31661Alpha2 because
 * it is returning some encapsulated object.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _isISO31661Alpha2 = (isISO31661Alpha2 as any)
  .default as typeof isISO31661Alpha2;

/**
 * Predicate function that verifies if a given array contains only valid ISO 3166-1 Alpha 2 countries.
 * @param arr Array of ISO 3166-1 Alpha 2 countries as string.
 * @returns Boolean if elements of the given array are valid.
 * @group Helpers
 */
const isArrISO31661Alpha2 = (arr: Array<string>): boolean =>
  arr
    .map(el => _isISO31661Alpha2(el))
    .reduce((acc, curr) => {
      if (curr) {
        acc = true;
      }
      return acc;
    }, false);

export { isArrISO31661Alpha2 };
