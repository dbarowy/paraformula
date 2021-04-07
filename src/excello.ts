import { AST } from "./ast";
import { Util } from "./util";
import { Primitives as P, CharUtil as CU } from "parsecco";

export module Excello {
  const EnvStub = new AST.Env("", "", "");

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
      new AST.Address(r, c, AST.RelativeAddress, AST.RelativeAddress, EnvStub)
  );

  /**
   * Parses an address mode token.
   */
  export const addrMode = P.choice<AST.AddressMode>(
    P.pipe<CU.CharStream, AST.AddressMode>(P.str("$"))(
      (cs) => AST.AbsoluteAddress
    )
  )(
    P.pipe<undefined, AST.AddressMode>(P.ok(undefined))(
      (cs) => AST.RelativeAddress
    )
  );

  /**
   * Parses the column component of an A1 address.
   */
  export const addrA = P.pipe<CU.CharStream[], CU.CharStream>(
    P.many1(P.upper)
  )((css) => CU.CharStream.concat(css));

  /**
   * Parses the column component of an A1 address, including address mode.
   */
  export const addrAMode = P.pipe2<
    AST.AddressMode,
    CU.CharStream,
    [AST.AddressMode, CU.CharStream]
  >(addrMode)(addrA)((mode, col) => [mode, col]);

  /**
   * Parses the row component of an A1 address.
   */
  export const addr1 = P.integer;

  /**
   * Parses the row component of an A1 address, including address mode.
   */
  export const addr1Mode = P.pipe2<
    AST.AddressMode,
    number,
    [AST.AddressMode, number]
  >(addrMode)(addr1)((mode, col) => [mode, col]);

  /**
   * Parses an A1 address, with address modes.
   */
  export const addrA1 = P.pipe2<
    [AST.AddressMode, CU.CharStream],
    [AST.AddressMode, number],
    AST.Address
  >(addrAMode)(addr1Mode)(
    ([colMode, col], [rowMode, row]) =>
      new AST.Address(
        row,
        Util.columnToInt(col.toString()),
        rowMode,
        colMode,
        EnvStub
      )
  );

  /**
   * Top-level grammar definition.
   */
  export const grammar = P.right<CU.CharStream, AST.Address>(
    P.left<CU.CharStream, CU.CharStream>(P.str("="))(P.str(""))
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
