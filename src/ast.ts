export module AST {
  export class Env {
    public static readonly type: "Env" = "Env";
    public readonly tag = Env.type;
    public readonly path: string;
    public readonly workbookName: string;
    public readonly worksheetName: string;

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
    type: "AbsoluteAddress";
  }
  export interface RelativeAddressMode {
    type: "RelativeAddress";
  }
  export const AbsoluteAddress: AbsoluteAddressMode = {
    type: "AbsoluteAddress",
  };
  export const RelativeAddress: RelativeAddressMode = {
    type: "RelativeAddress",
  };
  export type AddressMode = AbsoluteAddressMode | RelativeAddressMode;

  export class Address {
    public static readonly type: "Address" = "Address";
    public readonly type = Address.type;
    public readonly row: number;
    public readonly column: number;
    public readonly rowMode: AddressMode;
    public readonly colMode: AddressMode;
    public readonly env: Env;

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

    public get toFormula(): string {
      return "";
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

    private static intToColChars(dividend: number): string {
      let quot = Math.floor(dividend / 26);
      const rem = dividend % 26;
      if (rem === 0) {
        quot -= 1;
      }
      const ltr = rem === 0 ? "Z" : String.fromCharCode(64 + rem);
      if (quot === 0) {
        return ltr;
      } else {
        return Address.intToColChars(quot) + ltr;
      }
    }

    public toA1Ref(): string {
      return Address.intToColChars(this.column) + this.row.toString();
    }

    public toR1C1Ref(): string {
      return "R" + this.row + "C" + this.column;
    }

    public toFullyQualifiedR1C1Ref(): string {
      return this.env.worksheetName + "!" + this.toR1C1Ref();
    }

    public toFullyQualifiedA1Ref(): string {
      return this.env.worksheetName + "!" + this.toA1Ref();
    }
  }

  export class Range {
    public static readonly type: "Range" = "Range";
    public readonly type = Range.type;
    public readonly regions: [Address, Address][] = [];

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

    public get toFormula(): string {
      return this.regions
        .map(([tl, br]) => tl.toString() + ":" + br.toString())
        .join(",");
    }
  }

  export interface IExpr {
    /**
     * Returns the type tag for the expression subtype,
     * for use in pattern-matching expressions. Also
     * available as a static property on ReferenceExpr
     * types.
     */
    readonly type: string;

    /**
     * Generates a valid Excel formula from this expression.
     */
    toFormula: string;

    /**
     * Pretty-prints the AST as a string.  Note that this
     * does not produce a valid Excel formula.
     */
    toString(): string;
  }

  export class ReferenceRange implements IExpr {
    public static readonly type: "ReferenceRange" = "ReferenceRange";
    public readonly type = ReferenceRange.type;
    public readonly rng: Range;

    constructor(env: Env, r: Range) {
      this.rng = r.copyWithNewEnv(env);
    }

    public get toFormula(): string {
      return this.rng.toFormula;
    }

    public toString(): string {
      return "ReferenceRange(" + this.rng.toString() + ")";
    }
  }

  export class ReferenceAddress implements IExpr {
    public static readonly type: "ReferenceAddress" = "ReferenceAddress";
    public readonly type = ReferenceAddress.type;
    public readonly address: Address;

    constructor(env: Env, address: Address) {
      this.address = address.copyWithNewEnv(env);
    }

    public toString(): string {
      return "ReferenceAddress(" + this.address.toString() + ")";
    }

    public get toFormula(): string {
      return this.address.toFormula;
    }
  }

  export class ReferenceNamed implements IExpr {
    public static readonly type: "ReferenceNamed" = "ReferenceNamed";
    public readonly type = ReferenceNamed.type;
    public readonly varName: string;

    constructor(env: Env, varName: string) {
      this.varName = varName;
    }

    public toString(): string {
      return "ReferenceName(" + this.varName + ")";
    }

    public get toFormula(): string {
      return this.varName;
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

  export class FunctionApplication implements IExpr {
    public static readonly type: "FunctionApplication" = "FunctionApplication";
    public readonly type = FunctionApplication.type;
    public readonly name: string;
    public readonly args: IExpr[];
    public readonly arity: Arity;

    constructor(env: Env, name: string, args: IExpr[], arity: Arity) {
      this.name = name;
      this.args = args;
      this.arity = arity;
    }

    public toString(): string {
      return (
        "Function[" +
        this.name +
        "," +
        this.arity +
        "](" +
        this.args.map((arg) => arg.toFormula).join(",") +
        ")"
      );
    }

    public get toFormula(): string {
      return (
        this.name + "(" + this.args.map((arg) => arg.toFormula).join(",") + ")"
      );
    }
  }

  export class Number implements IExpr {
    public static readonly type: "Number" = "Number";
    public readonly type = Number.type;
    public readonly value: number;

    constructor(env: Env, value: number) {
      this.value = value;
    }

    public toString(): string {
      return "Number(" + this.value + ")";
    }

    public get toFormula(): string {
      return this.value.toString();
    }
  }

  export class StringLiteral implements IExpr {
    public static readonly type: "StringLiteral" = "StringLiteral";
    public readonly type = StringLiteral.type;
    public readonly value: string;

    constructor(env: Env, value: string) {
      this.value = value;
    }

    public toString(): string {
      return "String(" + this.value + ")";
    }

    public get toFormula(): string {
      return '"' + this.value + '"';
    }
  }

  export class Boolean implements IExpr {
    public static readonly type: "Boolean" = "Boolean";
    public readonly type = Boolean.type;
    public readonly value: boolean;

    constructor(env: Env, value: boolean) {
      this.value = value;
    }

    public toString(): string {
      return "Boolean(" + this.value + ")";
    }

    public get toFormula(): string {
      return this.value.toString().toUpperCase();
    }
  }

  // this should only ever be instantiated by
  // the reserved words class, which is designed
  // to fail
  export class PoisonPill implements IExpr {
    public static readonly type: "PoisonPill" = "PoisonPill";
    public readonly type = PoisonPill.type;

    public toString(): string {
      throw new Error("This object should never appear in an AST.");
    }

    public get toFormula(): string {
      throw new Error("This object should never appear in an AST.");
    }
  }

  export class ParensExpr implements IExpr {
    public static readonly type: "ParensExpr" = "ParensExpr";
    public readonly type = ParensExpr.type;
    public readonly expr: IExpr;

    constructor(expr: IExpr) {
      this.expr = expr;
    }

    public toString(): string {
      return "Parens(" + this.expr.toString() + ")";
    }

    public get toFormula(): string {
      return "(" + this.expr.toFormula + ")";
    }
  }

  export class BinOpExpr implements IExpr {
    public static readonly type: "BinOpExpr" = "BinOpExpr";
    public readonly type = BinOpExpr.type;
    public readonly op: string;
    public readonly exprL: IExpr;
    public readonly exprR: IExpr;

    constructor(op: string, exprL: IExpr, exprR: IExpr) {
      this.op = op;
      this.exprR = exprR;
      this.exprL = exprL;
    }

    public get toFormula(): string {
      return this.exprL.toFormula + " " + this.op + " " + this.exprR.toFormula;
    }

    public toString(): string {
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

  export class UnaryOpExpr implements IExpr {
    public static readonly type: "UnaryOpExpr" = "UnaryOpExpr";
    public readonly type = UnaryOpExpr.type;
    public readonly op: string;
    public readonly expr: IExpr;

    constructor(op: string, expr: IExpr) {
      this.op = op;
      this.expr = expr;
    }

    public get toFormula(): string {
      return this.op + this.expr.toFormula;
    }

    public toString(): string {
      return (
        "UnaryOpExpr(" + this.op.toString() + "," + this.expr.toFormula + ")"
      );
    }
  }

  export type Expression =
    | ReferenceRange
    | ReferenceAddress
    | ReferenceNamed
    | FunctionApplication
    | Number
    | StringLiteral
    | Boolean
    | BinOpExpr
    | UnaryOpExpr
    | ParensExpr;
}
