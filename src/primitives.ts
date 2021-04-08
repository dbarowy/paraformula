import { AST } from "./ast";
import { Primitives as P, CharUtil as CU } from "parsecco";

export module Primitives {
  /**
   * TODO remove: this is a stub until parsecco supports parsing with user state.
   */
  export const EnvStub = new AST.Env("", "", "");

  /**
   * Parse an Excel integer.
   */
  export const Z = P.choices(
    // leading + sign
    P.seq<CU.CharStream, number, number>(P.str("+"))(P.integer)(
      ([, num]) => num
    ),
    // leading - sign
    P.seq<CU.CharStream, number, number>(P.str("-"))(P.integer)(
      ([, num]) => -num
    ),
    // no leading sign
    P.integer
  );

  /**
   * Parses a comma surrounded by optional whitespace.
   */
  export const Comma = P.between<CU.CharStream, CU.CharStream, CU.CharStream>(
    P.ws
  )(P.ws)(P.str(","));
}
