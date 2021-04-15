import { Paraformula } from "paraformula";
const stringify = require("json-stringify-pretty-compact");

const ast = Paraformula.parse('=COUNTIFS(C5:C14,"red",D5:D14,"tx")');
console.log(stringify(ast));
