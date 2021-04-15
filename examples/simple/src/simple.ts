import { Paraformula } from "paraformula";
// import * as Paraformula from "paraformula";
// const Paraformula = require("paraformula");
// import Paraformula from "paraformula";
// import { default as Paraformula } from "paraformula";
// import { Primitives as P, CharUtil as CU } from "parsecco";

const input = "=SUM(A1,B2:B77,5)";
const output2 = Paraformula.parse(input);
console.log(output2);
