import { AST } from "./ast";
import { Primitives as P, CharUtil as CU } from "parsecco";
import { ParaformulaAddress as PA } from "./address";

export module Paraformula {
  /**
   * Top-level grammar definition.
   */
  export const grammar = P.right<CU.CharStream, AST.Address>(
    P.left<CU.CharStream, CU.CharStream>(P.str("="))(P.str(""))
  )(PA.addrR1C1);

  function parse(input: string): AST.Expr {
    const cs = new CU.CharStream(input);
    // const p = P.right(P.left(P.str("="))(P.ws()))();
    const output = grammar(cs);
    switch (output.tag) {
      case "success":
        return output.result;
      case "failure":
        throw new Error("Unable to parse input: " + output.error_msg);
    }
  }
}
