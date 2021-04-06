import { AST } from "./ast";
import { Primitives as P, CharUtil as CU } from "parsecco";

export module Excello {
  /**
   * Parses the `R` part of an R1C1 address.
   * @param istream input CharStream.
   */
  export const addrR = P.right<CU.CharStream, number>(P.str("R"))(P.integer);

  /**
   * Parses the `C` part of an R1C1 address.
   * @param istream input CharStream.
   */
  export const addrC = P.right<CU.CharStream, number>(P.str("C"))(P.integer);

  /**
   * Parses an R1C1 address.
   * TODO: Fix env.
   */
  export const addrR1C1 = P.pipe2<number, number, AST.Address>(addrR)(addrC)(
    (r: number, c: number) =>
      new AST.Address(
        r,
        c,
        AST.RelativeAddress,
        AST.RelativeAddress,
        new AST.Env("", "", "")
      )
  );

  /**
   * Top-level grammar definition.
   */
  export const grammar = P.right<CU.CharStream, AST.Address>(
    P.left<CU.CharStream, CU.CharStream>(P.str("="))(P.ws)
  )(addrR1C1);

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
