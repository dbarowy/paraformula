import { Primitives as P, CharUtil as CU } from "parsecco";

export module Util {
  /**
   * Convert an Excel A1 column string into a number.
   * @param col A1 column string.
   * @returns Number.
   */
  export function columnToInt(col: string): number {
    function cti(idx: number): number {
      // get ASCII code and then subtract 64 to get Excel column #
      const code = col.charCodeAt(idx) - 64;
      // the value depends on the position; a column is a base-26 number
      const num = Math.pow(26, col.length - idx - 1) * code;
      if (idx === 0) {
        // base case
        return num;
      } else {
        // add this letter to number and recurse
        return num + cti(idx - 1);
      }
    }
    return cti(col.length - 1);
  }

  /**
   * This helper function sorts strings from
   * longest length to shortest length; length
   * ties are sorted lexicographically; ensures
   * that a substring is never matched, consumed,
   * and then returned to the calling parser which
   * then fails.
   * @param sa An array of strings.
   * @returns A sorted array of strings.
   */
  function longestMatchFirst(sa: string[]): string[] {
    const arr = sa.slice(); // make a copy
    arr.sort((s1, s2) => {
      if (s1.length < s2.length) {
        return 1;
      } else if (s1.length === s2.length) {
        return s1.localeCompare(s2);
      } else {
        return -1;
      }
    });
    process.stdout.write(JSON.stringify(arr) + "\n");
    return arr;
  }

  /**
   * Parses a large set of string alternatives.
   * @param ss An array of strings
   */
  export function strAlternatives(ss: string[]): P.IParser<CU.CharStream> {
    const parsers = ss.map((s) => P.str(s));
    const p = P.choices<CU.CharStream>(...parsers);
    return p;
  }
}
