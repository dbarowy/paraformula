import { AST } from "./ast";
import { Util } from "./util";
import { Primitives as P, CharUtil as CU } from "parsecco";

export module Excello {
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
   * Parses the `R` part of an absolute R1C1 address.
   * @param istream input CharStream.
   */
  export const addrR = P.right<CU.CharStream, number>(P.str("R"))(P.integer);

  /**
   * Parses the `R` part of a relative R1C1 address.
   */
  export const addrRRel = P.between<CU.CharStream, CU.CharStream, number>(
    P.str("R[")
  )(P.str("]"))(Z);

  /**
   * Parses the `C` part of an absolute R1C1 address.
   * @param istream input CharStream.
   */
  export const addrC = P.right<CU.CharStream, number>(P.str("C"))(P.integer);

  /**
   * Parses the `C` part of a relative R1C1 address.
   * @param istream input CharStream.
   */
  export const addrCRel = P.between<CU.CharStream, CU.CharStream, number>(
    P.str("C[")
  )(P.str("]"))(Z);

  /**
   * Parses the `R` part of an R1C1 address.
   */
  export const addrRMode = P.choice(
    P.pipe<number, [number, AST.AddressMode]>(addrRRel)((r) => [
      r,
      AST.RelativeAddress,
    ])
  )(
    P.pipe<number, [number, AST.AddressMode]>(addrR)((r) => [
      r,
      AST.AbsoluteAddress,
    ])
  );

  /**
   * Parses the `C` part of an R1C1 address.
   */
  export const addrCMode = P.choice(
    P.pipe<number, [number, AST.AddressMode]>(addrCRel)((c) => [
      c,
      AST.RelativeAddress,
    ])
  )(
    P.pipe<number, [number, AST.AddressMode]>(addrC)((c) => [
      c,
      AST.AbsoluteAddress,
    ])
  );

  /**
   * Parses an R1C1 address.
   */
  export const addrR1C1 = P.pipe2<
    [number, AST.AddressMode],
    [number, AST.AddressMode],
    AST.Address
  >(addrRMode)(addrCMode)(([row, rowMode], [col, colMode]) => {
    return new AST.Address(row, col, rowMode, colMode, EnvStub);
  });

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
   * Parses either an A1 or R1C1 address.
   */
  export const anyAddr = P.choice(addrR1C1)(addrA1);

  /**
   * Parses an A1 range suffix.
   */
  export const rangeA1Suffix = P.right<CU.CharStream, AST.Address>(P.str(":"))(
    addrA1
  );

  /**
   * Parses an R1C1 range suffix.
   */
  export const rangeR1C1Suffix = P.right<CU.CharStream, AST.Address>(
    P.str(":")
  )(addrR1C1);

  /**
   * Parses an A1-style contiguous range.
   */
  export const rangeA1Contig = P.pipe2<AST.Address, AST.Address, AST.Range>(
    addrA1
  )(rangeA1Suffix)((a1, a2) => new AST.Range([[a1, a2]]));

  /**
   * Parses an R1C1-style contiguous range.
   */
  export const rangeR1C1Contig = P.pipe2<AST.Address, AST.Address, AST.Range>(
    addrR1C1
  )(rangeR1C1Suffix)((a1, a2) => new AST.Range([[a1, a2]]));

  /**
   * Parses a comma surrounded by optional whitespace.
   */
  export const Comma = P.between<CU.CharStream, CU.CharStream, CU.CharStream>(
    P.ws
  )(P.ws)(P.str(","));

  /**
   * Parses a discontiguous A1-style range list.
   */
  export const rangeA1Discontig = P.seq<AST.Range[], AST.Range, AST.Range>(
    // recursive case
    P.many1(P.left<AST.Range, CU.CharStream>(rangeA1Contig)(Comma))
  )(
    // base case
    rangeA1Contig
  )(
    // reducer
    ([rs, r]) => rs.reduce((acc, r) => acc.merge(r)).merge(r)
  );

  /**
   * Parses a discontiguous R1C1-style range list.
   */
  export const rangeR1C1Discontig = P.seq<AST.Range[], AST.Range, AST.Range>(
    // recursive case
    P.many1(P.left<AST.Range, CU.CharStream>(rangeR1C1Contig)(Comma))
  )(
    // base case
    rangeR1C1Contig
  )(
    // reducer
    ([rs, r]) => rs.reduce((acc, r) => acc.merge(r)).merge(r)
  );

  /**
   * Parses any range, A1-style or R1C1-style, contiguous or discontiguous.
   */
  export const rangeAny = P.choice(
    P.choice(rangeR1C1Discontig)(rangeR1C1Contig)
  )(P.choice(rangeA1Discontig)(rangeA1Contig));

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
