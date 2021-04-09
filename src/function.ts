import { Primitives as P, CharUtil as CU } from "parsecco";
import { AST } from "./ast";
import { Reference as PR } from "./reference";

export module Function {
  function notYet(): P.IParser<AST.ReferenceFunction> {
    throw new Error("Not implemented.");
  }
  export const func: P.IParser<AST.ReferenceFunction> = notYet();
}
