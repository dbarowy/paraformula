import { Primitives as P, CharUtil as CU } from "parsecco";
import { AST } from "./ast";
import { Reference as PR } from "./reference";
import { Function as PF } from "./function";

export module Expression {
  export let [expr, exprImpl] = P.recParser<AST.Expression>();

  /**
   * Parses a parenthesized expression.
   * @param R A range parser.
   * @returns
   */
  export const parensExpr = P.between<
    CU.CharStream,
    CU.CharStream,
    AST.ParensExpr
  >(P.char("("))(P.char(")"))(
    P.pipe<AST.Expression, AST.ParensExpr>(expr)((e) => new AST.ParensExpr(e))
  );

  /**
   * Parses either functions or data.
   */
  export const exprAtom = P.choice<AST.ReferenceExpr>(PF.func)(PR.data);

  /**
   * Parses a simple expression.
   * @param R A range parser.
   */
  export const exprSimple = parensExpr;

  /**
   * Parses an arbitrarily complex expression.
   * @param R A range parser.
   */
  exprImpl.contents = exprSimple;
}
