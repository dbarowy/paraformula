import { CharUtil as CU } from "parsecco";
import { Excello as XL } from "../src/excello";
// import { AST } from "../src/excello";
import { assert, expect } from "chai";
import "mocha";

describe("addrR", () => {
  it("should consume an R1 address", () => {
    const input = new CU.CharStream("R10C11");
    const output = XL.addrR(input);
    switch (output.tag) {
      case "success":
        expect(output.result).to.equal(10);
        break;
      default:
        assert.fail();
    }
  });
});
