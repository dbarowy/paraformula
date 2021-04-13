import { Primitives as P, CharUtil as CU } from "parsecco";
import { AST } from "./ast";
import { Primitives as PP } from "./primitives";
import { Range as PR } from "./range";
import { Reference as PRF } from "./reference";
import { ReservedWords as PRW } from "./reserved_words";

export module Expression {
  /**
   * expr is the top-level parser in the grammar.
   */
  export let [expr, exprImpl] = P.rec1ArgParser<
    P.IParser<AST.Range>,
    AST.Expression
  >();

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
   * less efficient.  Makes a shallow copy of the array tail.
   * @param elem The element to prepend.
   * @param arr The array.
   */
  function cons<T>(elem: T, arr: T[]): T[] {
    const arr2 = arr.slice();
    arr2.unshift(elem);
    return arr2;
  }

  /**
   * Like a functional list append, except probably a lot
   * less efficient.  Makes a shallow copy of the array tail.
   * @param elem The element to append.
   * @param arr The array.
   */
  function append<T>(elem: T, arr: T[]): T[] {
    const arr2 = arr.slice();
    arr2.push(elem);
    return arr2;
  }

  /**
   * Returns a shallow copy of the given array, reversed.
   * @param arr The array.
   */
  function rev<T>(arr: T[]): T[] {
    const arr2 = arr.slice();
    arr2.reverse();
    return arr2;
  }

  /**
   * Repeatedly calls parser `p` `n` times in sequence, returning
   * an array of results.
   * @param p A parser.
   * @param n Number of times to repeat.
   */
  function repN<T>(n: number, p: P.IParser<T>): P.IParser<T[]> {
    if (n <= 0) {
      return P.result([]);
    } else if (n == 1) {
      return P.pipe<T, T[]>(p)((t) => [t]);
    } else {
      return P.pipe2<T, T[], T[]>(p)(repN(n - 1, p))((t, ts) => append(t, ts));
    }
  }

  /**
   * Parses a single function argument expression.
   * @param R A range parser.
   */
  export function argument(R: P.IParser<AST.Range>) {
    return P.left<AST.Expression, CU.CharStream>(expr(R))(PP.Comma);
  }

  /**
   * Parses a list of `n` argument expressions.
   * @param R A range parser.
   * @param n Number of arguments to parse.
   */
  export function argumentsN(R: P.IParser<AST.Range>) {
    return (n: number) => {
      return P.pipe2<AST.Expression[], AST.Expression, AST.Expression[]>(
        repN(n - 1, argument(R))
      )(expr(R))((as, a) => rev(cons(a, as)));
    };
  }

  /**
   * Parses at least one `p`, followed by repeated sequences of `sep` and `p`.
   * In BNF: `p (sep p)*`.
   * @param p A parser
   * @param sep A separator
   */
  function sepBy1<T, U>(p: P.IParser<T>) {
    return (sep: P.IParser<U>) => {
      return P.pipe2<T, T[], T[]>(
        // parse the one
        P.right<CU.CharStream, T>(PP.Comma)(p)
      )(
        // then the many
        P.many(P.right<U, T>(sep)(p))
      )(
        // then combine them
        (a, bs) => cons(a, bs)
      );
    };
  }

  /**
   * Parses a list of at least `n` argument expressions.
   * @param R A range parser.
   * @param n Minimum number of arguments to parse.
   */
  export function argumentsAtLeastN(R: P.IParser<AST.Range>) {
    return (n: number) => {
      return P.pipe2<AST.Expression[], AST.Expression[], AST.Expression[]>(
        argumentsN(R)(n - 1)
      )(
        sepBy1<AST.Expression, CU.CharStream>(expr(R))(PP.Comma)
      )((prefixArgs, suffixArgs) => prefixArgs.concat(suffixArgs));
    };
  }

  /**
   * Parses a function application of arity n.
   * @param R Range parser.
   * @param n Arity.
   */
  export function arityNFunction(R: P.IParser<AST.Range>) {
    return (n: number) => {
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
          P.left<AST.Expression[], CU.CharStream>(argumentsN(R)(n))(P.char(")"))
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
    };
  }

  /**
   * Parses a function application of arity at least n.
   * @param R Range parser.
   * @param n Arity.
   */
  export function arityAtLeastNFunction(R: P.IParser<AST.Range>) {
    // here, we ignore whatever Range parser we are given
    // and use rangeContig instead
    return (n: number) => {
      return P.pipe2<CU.CharStream, AST.Expression[], AST.ReferenceFunction>(
        // parse the function name
        P.left<CU.CharStream, CU.CharStream>(PRW.arityAtLeastNName(n))(
          P.char("(")
        )
      )(
        // parse the arguments
        P.left<AST.Expression[], CU.CharStream>(
          argumentsAtLeastN(PR.rangeContig)(n)
        )(P.char(")"))
      )(
        (name, es) =>
          new AST.ReferenceFunction(
            PP.EnvStub,
            name.toString(),
            es,
            new AST.LowBoundArity(n)
          )
      );
    };
  }

  /**
   * Parses a function application of arity at least zero.
   * @param R Range parser.
   */
  export function varArgsFunction(R: P.IParser<AST.Range>) {
    // here, we ignore whatever Range parser we are given
    // and use rangeAny instead (i.e., try both)
    return P.pipe2<CU.CharStream, AST.Expression[], AST.ReferenceFunction>(
      // parse the function name
      P.left<CU.CharStream, CU.CharStream>(PRW.varArgsFunctionName)(P.char("("))
    )(
      // parse the arguments
      P.left<AST.Expression[], CU.CharStream>(
        argumentsAtLeastN(PR.rangeAny)(0)
      )(P.char(")"))
    )(
      (name, es) =>
        new AST.ReferenceFunction(
          PP.EnvStub,
          name.toString(),
          es,
          AST.VarArgsArity
        )
    );
  }

  /**
   * Parses a function of arbitrary arity.
   */
  export function fApply(
    R: P.IParser<AST.Range>
  ): P.IParser<AST.ReferenceFunction> {
    return P.choices(
      choicesFrom(
        fillTo(PRW.arityNNameArray.length).map((e, i) => arityNFunction(R)(i))
      ),
      choicesFrom(
        fillTo(PRW.arityAtLeastNNameArray.length).map((e, i) =>
          arityAtLeastNFunction(R)(i + 1)
        )
      ),
      varArgsFunction(R)
    );
  }

  /**
   * Parses a parenthesized expression.
   * @param R A range parser.
   * @returns
   */
  export function exprParens(R: P.IParser<AST.Range>) {
    return P.between<CU.CharStream, CU.CharStream, AST.ParensExpr>(P.char("("))(
      P.char(")")
    )(
      P.pipe<AST.Expression, AST.ParensExpr>(expr(R))(
        (e) => new AST.ParensExpr(e)
      )
    );
  }

  /**
   * Parses either functions or data.
   */
  export function exprAtom(R: P.IParser<AST.Range>) {
    return P.choice<AST.ReferenceExpr>(fApply(R))(PRF.data(R));
  }

  /**
   * Parses a simple expression.
   * @param R A range parser.
   */
  export function exprSimple(R: P.IParser<AST.Range>) {
    return P.choice<AST.Expression>(exprAtom(R))(exprParens(R));
  }

  /**
   * Parses an arbitrarily complex expression.
   * @param R A range parser.
   */
  exprImpl.contents = (R: P.IParser<AST.Range>) => exprSimple(R);
}
