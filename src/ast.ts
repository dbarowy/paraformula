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
  }

  export class Range {
    public upperleft: Address;
    public bottomright: Address;

    constructor(upperleft: Address, bottomright: Address) {
      this.upperleft = upperleft;
      this.bottomright = bottomright;
    }
  }

  export interface ReferenceExpr {
    path: string;
    workbookName: string;
    worksheetName: string;
    toString(): string;
  }

  export class ReferenceAddress implements ReferenceExpr {
    public env: Env;
    public address: Address;

    constructor(env: Env, address: Address) {
      this.env = env;
      this.address = address;
    }

    public get path(): string {
      return this.env.path;
    }

    public get workbookName(): string {
      return this.env.workbookName;
    }

    public get worksheetName(): string {
      return this.env.worksheetName;
    }

    public toString(): string {
      return (
        "ReferenceAddress(" +
        this.env.path +
        ",[" +
        this.env.workbookName +
        "]," +
        this.env.worksheetName +
        "," +
        this.address.toString() +
        ")"
      );
    }
  }
}
