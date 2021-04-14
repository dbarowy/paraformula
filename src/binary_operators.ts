import { AST } from "./ast";
import { Primitives as P, CharUtil as CU } from "parsecco";
import { Primitives as PP } from "./primitives";
import { Expression as PE } from "./expression";

/**
 * This module parses binary expressions.  It ensures correct precedence and
 * associativity by implementing a hierarchical grammar instead of a stack
 * approach like the shunting yard algorithm.  Tries to avoid backtracking
 * by using the `prefix` parser.
 */
export module BinaryOperators {
  type Addend = Plus | Sub;
  class Plus {
    tag: "plus" = "plus";
    expr: AST.Expression;
    constructor(e: AST.Expression) {
      this.expr = e;
    }
  }
  class Sub {
    tag: "sub" = "sub";
    expr: AST.Expression;
    constructor(e: AST.Expression) {
      this.expr = e;
    }
  }
  type Multiplicand = Mult | Div;
  class Mult {
    tag: "mult" = "mult";
    expr: AST.Expression;
    constructor(e: AST.Expression) {
      this.expr = e;
    }
  }
  class Div {
    tag: "div" = "div";
    expr: AST.Expression;
    constructor(e: AST.Expression) {
      this.expr = e;
    }
  }

  function mult(R: P.IParser<AST.Range>) {
    // mult MUST consume something
    return P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(
      PP.wsPad(P.char("*"))
    )(factor(R))((sign, e) => e);
  }

  function divide(R: P.IParser<AST.Range>) {
    // divide MUST consume something
    return P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(
      PP.wsPad(P.char("/"))
    )(factor(R))((sign, e) => e);
  }

  function plus(R: P.IParser<AST.Range>) {
    // plus MUST consume something
    return P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(
      PP.wsPad(P.char("+"))
    )(multiplicand(R))((sign, e) => e);
  }

  function minus(R: P.IParser<AST.Range>) {
    // minus MUST consume something
    return P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(
      PP.wsPad(P.char("-"))
    )(multiplicand(R))((sign, e) => e);
  }

  function factor(R: P.IParser<AST.Range>) {
    // we now MUST consume something
    return P.choice<AST.Expression>(
      // try a parenthesized expression
      PE.exprParens(R)
    )(
      // barring that, try a simple (i.e., nonrecursive) expression
      PE.exprSimple(R)
    );
  }

  /**
   * Parses left-associative multiplication or division expressions.
   * @param R A Range parser.
   */
  function multiplicand(R: P.IParser<AST.Range>): P.IParser<AST.Expression> {
    return P.prefix<AST.Expression, Multiplicand[]>(
      // first the term
      factor(R)
    )(
      // then the operation and another term
      P.many1(
        P.choice(
          P.pipe<AST.Expression, Multiplicand>(mult(R))((e) => new Mult(e))
        )(P.pipe<AST.Expression, Multiplicand>(divide(R))((e) => new Div(e)))
      )
    )(
      // yields a binop from a list of multiplicands
      (t1, t2) => {
        const aexprs = t2.reduce((acc, rhs) => {
          switch (rhs.tag) {
            case "mult":
              return new AST.BinOpExpression("*", acc, rhs.expr);
            case "div":
              return new AST.BinOpExpression("/", acc, rhs.expr);
          }
        }, t1);
        return aexprs;
      }
    );
  }

  /**
   * Parses left-associative addition or subtraction expressions.
   * @param R A Range parser.
   */
  function addend(R: P.IParser<AST.Range>): P.IParser<AST.Expression> {
    return P.prefix<AST.Expression, Addend[]>(
      // first the term
      multiplicand(R)
    )(
      // then the operation and another term
      P.many1(
        P.choice(P.pipe<AST.Expression, Addend>(plus(R))((e) => new Plus(e)))(
          P.pipe<AST.Expression, Addend>(minus(R))((e) => new Sub(e))
        )
      )
    )(
      // yields a binop from a list of addends
      (t1, t2) => {
        const aexprs = t2.reduce((acc, rhs) => {
          switch (rhs.tag) {
            case "plus":
              return new AST.BinOpExpression("+", acc, rhs.expr);
            case "sub":
              return new AST.BinOpExpression("-", acc, rhs.expr);
          }
        }, t1);
        return aexprs;
      }
    );
  }

  /**
   * Parses unary expressions.
   * @param R A Range parser.
   */
  function unary(R: P.IParser<AST.Range>): P.IParser<AST.Expression> {
    return P.choice<AST.Expression>(
      P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(P.char("+"))(
        PE.exprSimple(R)
      )((sign, e) => new AST.UnaryOpExpression("+", e))
    )(
      P.pipe2<CU.CharStream, AST.Expression, AST.Expression>(P.char("-"))(
        PE.exprSimple(R)
      )((sign, e) => new AST.UnaryOpExpression("-", e))
    );
  }

  /**
   * `binOp` parses any binary operator expression.  This parser should
   * ensure that Excel's operator precedence and associativity rules
   * are followed.
   */
  export function binOp(R: P.IParser<AST.Range>) {
    return P.choice(unary(R))(addend(R));
  }
}
