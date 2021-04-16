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

  /*
   * The following classes represent partial function parses
   * for Excel operator precedence classes listed here:
   * https://support.microsoft.com/en-us/office/calculation-operators-and-precedence-in-excel-48be406d-4975-4d31-b2b8-7af9e0e2878a
   */
  abstract class PrecedenceClass {
    tag = "precedenceclass";
    public readonly op: string;
    public readonly expr: AST.Expression;
    constructor(op: string, e: AST.Expression) {
      this.op = op;
      this.expr = e;
    }
  }

  /**
   * Level 5: addition (+) and subtraction (-)
   */
  class PrecedenceLevel5 extends PrecedenceClass {
    tag = "precedencelevel5";
  }
  /**
   * Level 6: multiplication (*) and division (/)
   */
  class PrecedenceLevel6 extends PrecedenceClass {
    tag = "precedencelevel6";
  }
  /**
   * Level 7: concatenation (&)
   */
  class PrecedenceLevel7 extends PrecedenceClass {
    tag = "precedencelevel7";
    constructor(e: AST.Expression) {
      super("&", e);
    }
  }
  /**
   * Level 7: equal to(=), not equal to (<>), less than or equal to (<=),
   *          and greater than or equal to (>=).
   */
  class PrecedenceLevel8 extends PrecedenceClass {
    tag = "precedencelevel8";
  }

  function mult(R: P.IParser<AST.Range>) {
    // mult MUST consume something
    return P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(
      PP.wsPad(P.char("*"))
    )(level1(R))((sign, e) => e);
  }

  function divide(R: P.IParser<AST.Range>) {
    // divide MUST consume something
    return P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(
      PP.wsPad(P.char("/"))
    )(level1(R))((sign, e) => e);
  }

  function plus(R: P.IParser<AST.Range>) {
    // plus MUST consume something
    return P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(
      PP.wsPad(P.char("+"))
    )(level5(R))((sign, e) => e);
  }

  function minus(R: P.IParser<AST.Range>) {
    // minus MUST consume something
    return P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(
      PP.wsPad(P.char("-"))
    )(level5(R))((sign, e) => e);
  }

  function concatenation(R: P.IParser<AST.Range>) {
    // minus MUST consume something
    return P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(
      PP.wsPad(P.char("&"))
    )(level6(R))((sign, e) => e);
  }

  function equalTo(R: P.IParser<AST.Range>) {
    // minus MUST consume something
    return P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(
      PP.wsPad(P.char("="))
    )(level7(R))((sign, e) => e);
  }

  function notEqualTo(R: P.IParser<AST.Range>) {
    // minus MUST consume something
    return P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(
      PP.wsPad(P.str("<>"))
    )(level7(R))((sign, e) => e);
  }

  function greaterThan(R: P.IParser<AST.Range>) {
    // minus MUST consume something
    return P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(
      PP.wsPad(P.char(">"))
    )(level7(R))((sign, e) => e);
  }

  function lessThan(R: P.IParser<AST.Range>) {
    // minus MUST consume something
    return P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(
      PP.wsPad(P.char("<"))
    )(level7(R))((sign, e) => e);
  }

  function lessThanOrEqualTo(R: P.IParser<AST.Range>) {
    // minus MUST consume something
    return P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(
      PP.wsPad(P.str("<="))
    )(level7(R))((sign, e) => e);
  }

  function greaterThanOrEqualTo(R: P.IParser<AST.Range>) {
    // minus MUST consume something
    return P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(
      PP.wsPad(P.str(">="))
    )(level7(R))((sign, e) => e);
  }

  function level1(R: P.IParser<AST.Range>) {
    // we now MUST consume something
    return P.choice<AST.Expression>(
      // try a parenthesized expression
      exprParens(R)
    )(
      // barring that, try a simple (i.e., nonrecursive) expression
      exprSimple(R)
    );
  }

  /**
   * Parses left-associative multiplication or division expressions.
   * @param R A Range parser.
   */
  function level5(R: P.IParser<AST.Range>): P.IParser<AST.Expression> {
    return P.prefix<AST.Expression, PrecedenceLevel5[]>(
      // first the term
      level1(R)
    )(
      // then the operation and another term
      P.many1(
        P.choice(
          P.pipe<AST.Expression, PrecedenceLevel5>(mult(R))(
            (e) => new PrecedenceLevel5("*", e)
          )
        )(
          P.pipe<AST.Expression, PrecedenceLevel5>(divide(R))(
            (e) => new PrecedenceLevel5("/", e)
          )
        )
      )
    )(
      // yields a binop from a list of multiplicands
      (t1, t2) =>
        t2.reduce(
          (acc, rhs) => new AST.BinOpExpression(rhs.op, acc, rhs.expr),
          t1
        )
    );
  }

  /**
   * Parses left-associative addition or subtraction expressions.
   * @param R A Range parser.
   */
  function level6(R: P.IParser<AST.Range>): P.IParser<AST.Expression> {
    return P.prefix<AST.Expression, PrecedenceLevel6[]>(
      // first the term
      level5(R)
    )(
      // then the operation and another term
      P.many1(
        P.choice(
          P.pipe<AST.Expression, PrecedenceLevel6>(plus(R))(
            (e) => new PrecedenceLevel6("+", e)
          )
        )(
          P.pipe<AST.Expression, PrecedenceLevel6>(minus(R))(
            (e) => new PrecedenceLevel6("-", e)
          )
        )
      )
    )(
      // yields a binop from a list of addends
      (t1, t2) =>
        t2.reduce(
          (acc, rhs) => new AST.BinOpExpression(rhs.op, acc, rhs.expr),
          t1
        )
    );
  }

  /**
   * Parses left-associative concatenation expressions.
   * @param R A Range parser.
   */
  function level7(R: P.IParser<AST.Range>): P.IParser<AST.Expression> {
    return P.prefix<AST.Expression, PrecedenceLevel7[]>(
      // first the term
      level6(R)
    )(
      // then the operation and another term
      P.many1(
        P.pipe<AST.Expression, PrecedenceLevel7>(concatenation(R))(
          (e) => new PrecedenceLevel7(e)
        )
      )
    )(
      // yields a binop from a list of addends
      (t1, t2) =>
        t2.reduce(
          (acc, rhs) => new AST.BinOpExpression(rhs.op, acc, rhs.expr),
          t1
        )
    );
  }

  /**
   * Parses left-associative comparison expressions.
   * @param R A Range parser.
   */
  function level8(R: P.IParser<AST.Range>): P.IParser<AST.Expression> {
    return P.prefix<AST.Expression, PrecedenceLevel8[]>(
      // first the term
      level7(R)
    )(
      // then the operation and another term
      P.many1(
        P.choices(
          P.pipe<AST.Expression, PrecedenceLevel8>(equalTo(R))(
            (e) => new PrecedenceLevel8("=", e)
          ),
          P.pipe<AST.Expression, PrecedenceLevel8>(lessThan(R))(
            (e) => new PrecedenceLevel8("<", e)
          ),
          P.pipe<AST.Expression, PrecedenceLevel8>(greaterThan(R))(
            (e) => new PrecedenceLevel8(">", e)
          ),
          P.pipe<AST.Expression, PrecedenceLevel8>(lessThanOrEqualTo(R))(
            (e) => new PrecedenceLevel8("<=", e)
          ),
          P.pipe<AST.Expression, PrecedenceLevel8>(greaterThanOrEqualTo(R))(
            (e) => new PrecedenceLevel8(">=", e)
          ),
          P.pipe<AST.Expression, PrecedenceLevel8>(notEqualTo(R))(
            (e) => new PrecedenceLevel8("<>", e)
          )
        )
      )
    )(
      // yields a binop from a list of addends
      (t1, t2) =>
        t2.reduce(
          (acc, rhs) => new AST.BinOpExpression(rhs.op, acc, rhs.expr),
          t1
        )
    );
  }

  /**
   * Parses unary expressions.
   * @param R A Range parser.
   */
  function unary(R: P.IParser<AST.Range>): P.IParser<AST.Expression> {
    return P.choice<AST.Expression>(
      P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(P.char("+"))(
        exprSimple(R)
      )((sign, e) => new AST.UnaryOpExpression("+", e))
    )(
      P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(P.char("-"))(
        exprSimple(R)
      )((sign, e) => new AST.UnaryOpExpression("-", e))
    );
  }

  /**
   * `binOp` parses any binary operator expression.  This parser should
   * ensure that Excel's operator precedence and associativity rules
   * are followed.
   */
  export function binOp(R: P.IParser<AST.Range>) {
    return P.choice(unary(R))(level8(R));
  }

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
    return (istream: CU.CharStream) => {
      let input = istream;
      let i = n;
      const results: T[] = [];
      let done = false;
      while (i > 0 && !done) {
        const output = p(input);
        switch (output.tag) {
          case "success":
            results.push(output.result);
            break;
          case "failure":
            done = true;
            break;
        }
        input = output.inputstream;
        i--;
      }
      return new P.Success(input, rev(results));
    };
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
        return P.pipe<CU.CharStream, AST.FunctionApplication>(
          P.left(PRW.arityNName(0))(P.str("()"))
        )(
          (name) =>
            new AST.FunctionApplication(
              PP.EnvStub,
              name.toString(),
              [],
              new AST.FixedArity(0)
            )
        );
      } else {
        return P.pipe2<
          CU.CharStream,
          AST.Expression[],
          AST.FunctionApplication
        >(
          // parse the function name
          P.left<CU.CharStream, CU.CharStream>(PRW.arityNName(n))(P.char("("))
        )(
          // parse the arguments
          P.left<AST.Expression[], CU.CharStream>(argumentsN(R)(n))(P.char(")"))
        )(
          (name, es) =>
            new AST.FunctionApplication(
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
      return P.pipe2<CU.CharStream, AST.Expression[], AST.FunctionApplication>(
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
          new AST.FunctionApplication(
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
    return P.pipe2<CU.CharStream, AST.Expression[], AST.FunctionApplication>(
      // parse the function name
      P.left<CU.CharStream, CU.CharStream>(PRW.varArgsFunctionName)(P.char("("))
    )(
      // parse the arguments
      P.left<AST.Expression[], CU.CharStream>(
        argumentsAtLeastN(PR.rangeAny)(0)
      )(P.char(")"))
    )(
      (name, es) =>
        new AST.FunctionApplication(
          PP.EnvStub,
          name.toString(),
          es,
          AST.VarArgsArityInst
        )
    );
  }

  /**
   * Parses a function of arbitrary arity.
   */
  export function fApply(
    R: P.IParser<AST.Range>
  ): P.IParser<AST.FunctionApplication> {
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
  exprImpl.contents = (R: P.IParser<AST.Range>) =>
    P.choice(exprSimple(R))(binOp(R));
}
