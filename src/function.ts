import { Primitives as P, CharUtil as CU } from "parsecco";
import { AST } from "./ast";
import { Primitives as PP } from "./primitives";
import { Reference as PR } from "./reference";
import { ReservedWords as PRW } from "./reserved_words";
import { Expression as PE } from "./expression";
import { pseudoRandomBytes } from "node:crypto";

export module Function {
  /**
   * Creates an array from 0 to n-1.
   * @param n A number.
   * @returns An array.
   */
  function fillTo(n: number) {
    return Array(n)
      .fill(0)
      .map((_, i) => i);
  }

  /**
   * Generate an n-choice combinator from an array of parsers.
   * @param ps An array of parsers.
   */
  function choicesFrom<T>(ps: P.IParser<T>[]): P.IParser<T> {
    function nest(i: number): P.IParser<T> {
      if (i < ps.length - 1) {
        return P.choice(ps[i])(nest(i + 1));
      } else {
        return ps[i];
      }
    }
    return nest(0);
  }

  /**
   * Like a functional list cons, except probably a lot
   * less efficient.  Makes a shallow copy of the list tail.
   * @param elem The element to prepend.
   * @param arr The list.
   */
  function cons<T>(elem: T, arr: T[]): T[] {
    const arr2 = arr.slice();
    arr2.push(elem);
    return arr2;
  }

  /**
   * Repeatedly calls parser `p` `n` times in sequence, returning
   * an array of results.
   * @param p A parser.
   * @param n Number of times to repeat.
   */
  function seqN<T>(n: number, p: P.IParser<T>): P.IParser<T[]> {
    if (n === 0) {
      return P.pipe<T, T[]>(p)((t) => [t]);
    } else {
      return P.pipe2<T, T[], T[]>(p)(seqN(n - 1, p))((t, ts) => cons(t, ts));
    }
  }

  /**
   * Parses a single function argument expression.
   */
  export const argument = P.left(PE.expr)(PP.Comma);

  /**
   * Parses a list of `n` argument expressions.
   * @param n Number of arguments to parse.
   */
  export function argumentsN(n: number): P.IParser<AST.Expression[]> {
    return P.pipe2<AST.Expression[], AST.Expression, AST.Expression[]>(
      seqN(n - 1, argument)
    )(PE.expr)((as, a) => cons(a, as));
  }

  /**
   * Parses a function application of arity n.
   * @param n Arity.
   */
  export function arityNFunction(n: number): P.IParser<AST.ReferenceFunction> {
    if (n === 0) {
      return P.pipe<CU.CharStream, AST.ReferenceFunction>(
        P.left(PRW.arityNName(0))(P.str("()"))
      )(
        (name) =>
          new AST.ReferenceFunction(
            PP.EnvStub,
            name.toString(),
            [],
            new AST.FixedArity(0)
          )
      );
    } else {
      return P.pipe2<CU.CharStream, AST.Expression[], AST.ReferenceFunction>(
        // parse the function name
        P.left<CU.CharStream, CU.CharStream>(PRW.arityNName(n))(P.char("("))
      )(
        // parse the arguments
        P.left<AST.Expression[], CU.CharStream>(argumentsN(n))(P.char(")"))
      )(
        (name, es) =>
          new AST.ReferenceFunction(
            PP.EnvStub,
            name.toString(),
            es,
            new AST.FixedArity(n)
          )
      );
    }
  }

  /**
   * Parses a function of arbitrary arity.
   */
  export const func: P.IParser<AST.ReferenceFunction> = choicesFrom(
    fillTo(PRW.arityNNameArray.length).map((e, i) => arityNFunction(i))
  );
}
