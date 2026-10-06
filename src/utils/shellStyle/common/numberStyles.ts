/**
 * Converts a number to a formatted label.
 */
export type NumberStyleFunc = (number: number) => string;

/**
 * Roman numeral values used by the number formatter.
 */
const ROMAN_NUMERALS: [value: number, numeral: string][] = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

/**
 * Converts a number to a Roman numeral label.
 *
 * @example `14` => `XIV`
 */
export const romanNumber: NumberStyleFunc = number => {
  if (number < 1) return String(number);

  let rest = number;
  let result = '';

  for (const [value, numeral] of ROMAN_NUMERALS) {
    while (rest >= value) {
      result += numeral;
      rest -= value;
    }
  }

  return result;
};

/**
 * Converts a number to an alphabetic label.
 *
 * @example `3` => `C`, `28` => `AB`
 */
export const alphaNumber: NumberStyleFunc = number => {
  if (number < 1) return String(number);

  let rest = number;
  let result = '';

  while (rest > 0) {
    rest -= 1;
    result = String.fromCharCode(65 + (rest % 26)) + result;
    rest = Math.floor(rest / 26);
  }

  return result;
};

/**
 * Converts a number to a circled-number label.
 *
 * @example `3` => `③`, `21` => `㉑`
 */
export const circledNumber: NumberStyleFunc = number => {
  if (number === 0) return '⓪';
  if (number >= 1 && number <= 20) return String.fromCodePoint(0x2460 + number - 1);
  if (number >= 21 && number <= 35) return String.fromCodePoint(0x3251 + number - 21);
  if (number >= 36 && number <= 50) return String.fromCodePoint(0x32b1 + number - 36);

  return String(number);
};

export const NUMBER_STYLES = {
  decimal: number => String(number),
  upperRoman: romanNumber,
  lowerRoman: number => romanNumber(number).toLowerCase(),
  upperAlpha: alphaNumber,
  lowerAlpha: number => alphaNumber(number).toLowerCase(),
  circled: circledNumber,
} satisfies Record<string, NumberStyleFunc>;

/**
 * Names of the available number formats.
 */
export type NumberStyleName = keyof typeof NUMBER_STYLES;
