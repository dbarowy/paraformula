import { Paraformula } from "paraformula";
import { Primitives as P, CharUtil as CU } from "parsecco";

console.time("total");
const input = "=SUM(A1,B2:B77,5)";
const p = P.str("=SUM");
// const output = Paraformula.parse(input);
const output = p(new CU.CharStream(input));
console.timeEnd("total");
