export module AST {
  export type Expr = ReferenceExpr;

  export class Env {
    tag = "Env";
    public path: string;
    public workbookName: string;
    public worksheetName: string;

    constructor(path: string, workbookName: string, worksheetName: string) {
      this.path = path;
      this.workbookName = workbookName;
      this.worksheetName = worksheetName;
    }

    public equals(e: Env): boolean {
      return (
        this.path === e.path &&
        this.workbookName === e.workbookName &&
        this.worksheetName === e.worksheetName
      );
    }
  }

  export interface AbsoluteAddressMode {
    tag: "AbsoluteAddress";
  }
  export interface RelativeAddressMode {
    tag: "RelativeAddress";
  }
  export const AbsoluteAddress: AbsoluteAddressMode = {
    tag: "AbsoluteAddress",
  };
  export const RelativeAddress: RelativeAddressMode = {
    tag: "RelativeAddress",
  };
  export type AddressMode = AbsoluteAddressMode | RelativeAddressMode;

  export class Address {
    tag = "Address";
    public row: number;
    public column: number;
    public rowMode: AddressMode;
    public colMode: AddressMode;
    public env: Env;

    constructor(
      row: number,
      column: number,
      rowMode: AddressMode,
      colMode: AddressMode,
      env: Env
    ) {
      this.row = row;
      this.column = column;
      this.rowMode = rowMode;
      this.colMode = colMode;
      this.env = env;
    }

    public get path() {
      return this.env.path;
    }

    public get workbookName() {
      return this.env.workbookName;
    }

    public get worksheetName() {
      return this.env.worksheetName;
    }

    public equals(a: Address) {
      // note that we explicitly do not compare paths since two different workbooks
      // can have the "same address" but will live at different paths
      return (
        this.row === a.row &&
        this.column === a.column &&
        this.worksheetName === a.worksheetName &&
        this.workbookName === a.workbookName
      );
    }

    public toString(): string {
      return "(" + this.column.toString() + "," + this.row.toString() + ")";
    }

    /**
     * Returns a copy of this Address but with an updated Env.
     * @param env An Env object.
     * @returns An Address.
     */
    public copyWithNewEnv(env: Env) {
      return new Address(
        this.row,
        this.column,
        this.rowMode,
        this.colMode,
        env
      );
    }
  }

  export class Range {
    tag = "Range";
    public regions: [Address, Address][] = [];

    constructor(regions: [Address, Address][]) {
      this.regions = regions;
    }

    /**
     * Merge this range and another range into a discontiguous range.
     * @param r The other range.
     * @returns A discontiguous range.
     */
    public merge(r: Range): Range {
      return new Range(this.regions.concat(r.regions));
    }

    /**
     * Returns true if the range object represents a contiguous range.
     */
    public get isContiguous(): boolean {
      return this.regions.length === 1;
    }

    /**
     * Returns a copy of this Range but with an updated Env.
     * @param env An Env object.
     * @returns A Range.
     */
    public copyWithNewEnv(env: Env): Range {
      return new Range(
        this.regions.map(([tl, br]) => [
          tl.copyWithNewEnv(env),
          br.copyWithNewEnv(env),
        ])
      );
    }

    public toString(): string {
      const sregs = this.regions.map(
        ([tl, br]) => tl.toString() + ":" + br.toString()
      );
      return "List(" + sregs.join(",") + ")";
    }
  }

  export abstract class ReferenceExpr {
    tag = "ReferenceExpr";
    path: string;
    workbookName: string;
    worksheetName: string;
    abstract toString(): string;

    constructor(env: Env) {
      this.path = env.path;
      this.workbookName = env.workbookName;
      this.worksheetName = env.worksheetName;
    }

    public get toFormula(): string {
      throw new Error("not implemented");
    }
  }

  export class ReferenceRange extends ReferenceExpr {
    tag = "ReferenceRange";
    public readonly rng: Range;

    constructor(env: Env, r: Range) {
      super(env);
      this.rng = r.copyWithNewEnv(env);
    }

    public toString(): string {
      return (
        "ReferenceRange(" +
        this.path +
        ",[" +
        this.workbookName +
        "]," +
        this.worksheetName +
        "," +
        this.rng.toString() +
        ")"
      );
    }
  }

  export class ReferenceAddress extends ReferenceExpr {
    tag = "ReferenceAddress";
    public readonly address: Address;

    constructor(env: Env, address: Address) {
      super(env);
      this.address = address.copyWithNewEnv(env);
    }

    public toString(): string {
      return (
        "ReferenceAddress(" +
        this.path +
        ",[" +
        this.workbookName +
        "]," +
        this.worksheetName +
        "," +
        this.address.toString() +
        ")"
      );
    }
  }

  export class ReferenceNamed extends ReferenceExpr {
    tag = "ReferenceNamed";
    public readonly varName: string;

    constructor(env: Env, varName: string) {
      super(env);
      this.varName = varName;
    }

    public toString(): string {
      return "ReferenceName(" + this.varName + ")";
    }
  }

  export class FixedArity {
    public num: number;
    constructor(num: number) {
      this.num = num;
    }
  }

  export class LowBoundArity {
    public num: number;
    constructor(num: number) {
      this.num = num;
    }
  }

  class VarArgsArity {}
  export const VarArgsArityInst = new VarArgsArity();

  export type Arity = FixedArity | LowBoundArity | VarArgsArity;

  export class FunctionApplication extends ReferenceExpr {
    tag = "FunctionApplication";
    public readonly name: string;
    public readonly args: Expression[];
    public readonly arity: Arity;

    constructor(env: Env, name: string, args: Expression[], arity: Arity) {
      super(env);
      this.name = name;
      this.args = args;
      this.arity = arity;
    }

    public toString(): string {
      return (
        this.name + "(" + this.args.map((arg) => arg.toFormula).join(",") + ")"
      );
    }
  }

  export class Number extends ReferenceExpr {
    tag = "Number";
    public readonly value: number;

    constructor(env: Env, value: number) {
      super(env);
      this.value = value;
    }

    public toString(): string {
      return "Number(" + this.value + ")";
    }
  }

  export class StringLiteral extends ReferenceExpr {
    tag = "StringLiteral";
    public readonly value: string;

    constructor(env: Env, value: string) {
      super(env);
      this.value = value;
    }

    public toString(): string {
      return "String(" + this.value + ")";
    }
  }

  export class Boolean extends ReferenceExpr {
    tag = "Boolean";
    public readonly value: boolean;

    constructor(env: Env, value: boolean) {
      super(env);
      this.value = value;
    }

    public toString(): string {
      return "Boolean(" + this.value + ")";
    }
  }

  // this should only ever be instantiated by
  // the reserved words class, which is designed
  // to fail
  export class PoisonPill extends ReferenceExpr {
    tag = "PoisonPill";
    constructor(env: Env) {
      super(env);
    }

    public toString(): string {
      throw new Error("This object should never be instantiated.");
    }
  }

  export class ParensExpr {
    tag = "ParensExpr";
    public expr: Expression;

    constructor(expr: Expression) {
      this.expr = expr;
    }

    public get toFormula(): string {
      return "(" + this.expr.toFormula + ")";
    }
  }

  export class BinOpExpression {
    tag = "BinOpExpression";
    public op: string;
    public exprL: Expression;
    public exprR: Expression;

    constructor(op: string, exprL: Expression, exprR: Expression) {
      this.op = op;
      this.exprR = exprR;
      this.exprL = exprL;
    }

    public get toFormula(): string {
      return (
        "BinOpExpr(" +
        this.op.toString() +
        "," +
        this.exprL.toFormula +
        "," +
        this.exprR.toFormula +
        ")"
      );
    }
  }

  export class UnaryOpExpression {
    tag = "UnaryOpExpression";
    public op: string;
    public expr: Expression;

    constructor(op: string, expr: Expression) {
      this.op = op;
      this.expr = expr;
    }

    public get toFormula(): string {
      return (
        "UnaryOpExpr(" + this.op.toString() + "," + this.expr.toFormula + ")"
      );
    }
  }

  export type Expression =
    | ReferenceExpr
    | ParensExpr
    | BinOpExpression
    | UnaryOpExpression;
}
