import { Paraformula } from "paraformula";

console.time("total");
const input = "=SUM(A1,B2:B77,5)";
const output = Paraformula.parse(input);
console.log(output);
console.timeEnd("total");
