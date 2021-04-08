export module AST {
  export type Expr = ReferenceExpr;

  export class Env {
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
    kind: "AbsoluteAddress";
  }
  export interface RelativeAddressMode {
    kind: "RelativeAddress";
  }
  export const AbsoluteAddress: AbsoluteAddressMode = {
    kind: "AbsoluteAddress",
  };
  export const RelativeAddress: RelativeAddressMode = {
    kind: "RelativeAddress",
  };
  export type AddressMode = AbsoluteAddressMode | RelativeAddressMode;

  export class Address {
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
    path: string;
    workbookName: string;
    worksheetName: string;
    abstract toString(): string;

    constructor(env: Env) {
      this.path = env.path;
      this.workbookName = env.workbookName;
      this.worksheetName = env.worksheetName;
    }
  }

  export class ReferenceRange extends ReferenceExpr {
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
    public readonly varName: string;

    constructor(env: Env, varName: string) {
      super(env);
      this.varName = varName;
    }

    public toString(): string {
      return "ReferenceName(" + this.varName + ")";
    }
  }
}
