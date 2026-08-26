/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 📐 Style Rules (ANSI Escape Sequences)
 * ------------------------------------------------------------------------------------------------
 * ANSI escape sequences control terminal text styling, such as text styles (decoration, text
 * (foreground) colors, and background colors.
 *
 * Escape Sequences Example:
 *   \033[1;31m
 *   └─┬─┘└─┬┘
 *     │    └── SGR parameters
 *     └─────── ESC
 *
 *   `\033` : Escape character (`ESC`, ANSI value 27)
 *              - Octal:       `\033`
 *              - Hexadecimal: `\x1b`
 *              - Unicode:     `\u001b`
 *   `[`    : Control Sequence Introducer (`SCI`)
 *   `1;31` : Text Style, Text Color and Background Color, separate by `;`,
 *            Can have many Text Styles, 1 Text Color and 1 Background Color
 *   `m`    : Terminates an SGR (Select Graphic Rendition) sequence
 *
 * ANSI Style Codes:
 *  ╔════════════════╤══════════╤════════════╗
 *  ║ Text Style     │ Set Code │ Reset Code ║
 *  ╠════════════════╪══════════╪════════════╣
 *  ║ bold           │        1 │         22 ║
 *  ║ dim            │        2 │         22 ║
 *  ║ italic         │        3 │         23 ║
 *  ║ underline      │        4 │         24 ║
 *  ║ blinking       │        5 │         25 ║
 *  ║ inverse        │        7 │         27 ║
 *  ║ hidden         │        8 │         28 ║
 *  ║ strikethrough  │        9 │         29 ║
 *  ╠════════════════╪══════════╪════════════╣
 *  ║ Color          │ Text     │ Background ║
 *  ╠════════════════╪══════════╪════════════╣
 *  ║ black          │       30 │         40 ║
 *  ║ red            │       31 │         41 ║
 *  ║ green          │       32 │         42 ║
 *  ║ yellow         │       33 │         43 ║
 *  ║ blue           │       34 │         44 ║
 *  ║ magenta        │       35 │         45 ║
 *  ║ cyan           │       36 │         46 ║
 *  ║ white          │       37 │         47 ║
 *  ║ gray           │       90 │        100 ║
 *  ║ bright red     │       91 │        101 ║
 *  ║ bright green   │       92 │        102 ║
 *  ║ bright yellow  │       93 │        103 ║
 *  ║ bright blue    │       94 │        104 ║
 *  ║ bright magenta │       95 │        105 ║
 *  ║ bright cyan    │       96 │        106 ║
 *  ║ bright white   │       97 │        107 ║
 *  ║ RESET COLOR    │       39 │         49 ║
 *  ╠════════════════╧══════════╪════════════╣
 *  ║ RESET ALL                 │          0 ║
 *  ╚═══════════════════════════╧════════════╝
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * @see {@link https://gist.github.com/JBlond/2fea43a3049b38287e5e9cefc87b2124 Table of ANSI color codes}
 * @see {@link https://en.wikipedia.org/wiki/ANSI_escape_code ANSI escape code Wiki}
 */
export type ShellStyleCode = number | string;

/**
 * ANSI foreground color SGR codes.
 */
export enum ShellColor {
  Black = 30,
  Red = 31,
  Green = 32,
  Yellow = 33,
  Blue = 34,
  Magenta = 35,
  Cyan = 36,
  White = 37,
  Gray = 90,
  BrightRed = 91,
  BrightGreen = 92,
  BrightYellow = 93,
  BrightBlue = 94,
  BrightMagenta = 95,
  BrightCyan = 96,
  BrightWhite = 97,
}

/**
 * ANSI background color SGR codes.
 */
export enum ShellBackground {
  Black = 40,
  Red = 41,
  Green = 42,
  Yellow = 43,
  Blue = 44,
  Magenta = 45,
  Cyan = 46,
  White = 47,
  Gray = 100,
  BrightRed = 101,
  BrightGreen = 102,
  BrightYellow = 103,
  BrightBlue = 104,
  BrightMagenta = 105,
  BrightCyan = 106,
  BrightWhite = 107,
}

/**
 * ANSI text style SGR codes.
 */
export enum ShellDecoration {
  Bold = 1,
  Dim = 2,
  Italic = 3,
  Underline = 4,
  Blink = 5,
  Inverse = 7,
  Hidden = 8,
  Strikethrough = 9,
}

/**
 * ANSI SGR codes that turn off one specific color or text style, instead of a full reset.
 */
export enum ShellReset {
  All = 0,
  Color = 39,
  Background = 49,
  BoldOrDim = 22,
  Italic = 23,
  Underline = 24,
  Blink = 25,
  Inverse = 27,
  Hidden = 28,
  Strikethrough = 29,
}
