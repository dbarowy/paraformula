import { AST } from "./ast";
import { Primitives as P, CharUtil as CU } from "parsecco";
import { Expression as PE } from "./expression";
import { Range as PR } from "./range";

export module Paraformula {
  /**
   * Top-level grammar definition.
   */
  export const grammar: P.IParser<AST.Expression> = P.right<
    CU.CharStream,
    AST.Expression
  >(P.char("="))(PE.expr(PR.rangeAny));

  /**
   * Parses an Excel formula and returns an AST.  Throws an
   * exception if the input is invalid.
   * @param input A formula string
   */
  export function parse(input: string): AST.Expression {
    const cs = new CU.CharStream(input);
    const output = grammar(cs);
    switch (output.tag) {
      case "success":
        return output.result;
      case "failure":
        throw new Error("Unable to parse input: " + output.error_msg);
    }
  }
}
