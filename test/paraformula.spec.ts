import { CharUtil as CU } from "parsecco";
import { Paraformula, Paraformula as XL } from "../src/paraformula";
import { AST } from "../src/ast";
import { assert, Assertion, expect } from "chai";
import "mocha";

describe("Z", () => {
  it("should consume an integer with a leading plus sign", () => {
    const input = new CU.CharStream("+645");
    const output = XL.Z(input);
    switch (output.tag) {
      case "success":
        expect(output.result).to.equal(645);
        break;
      default:
        assert.fail();
    }
  });
  it("should consume an integer with a leading minus sign", () => {
    const input = new CU.CharStream("-1000");
    const output = XL.Z(input);
    switch (output.tag) {
      case "success":
        expect(output.result).to.equal(-1000);
        break;
      default:
        assert.fail();
    }
  });
  it("should consume an integer with no leading sign", () => {
    const input = new CU.CharStream("0");
    const output = XL.Z(input);
    switch (output.tag) {
      case "success":
        expect(output.result).to.equal(0);
        break;
      default:
        assert.fail();
    }
  });
});

describe("addrR", () => {
  it("should consume an absolute R1 address", () => {
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

  it("should not consume an A1 address", () => {
    const input = new CU.CharStream("B33");
    const output = XL.addrR(input);
    switch (output.tag) {
      case "success":
        assert.fail();
      default:
        assert(true);
    }
  });

  it("should not consume a relative R1 address", () => {
    const input = new CU.CharStream("R[10]C11");
    const output = XL.addrR(input);
    switch (output.tag) {
      case "success":
        assert.fail();
      default:
        assert(true);
    }
  });
});

describe("addrRRel", () => {
  it("should consume a relative R1 address", () => {
    const input = new CU.CharStream("R[10]C11");
    const output = XL.addrRRel(input);
    switch (output.tag) {
      case "success":
        expect(output.result).to.equal(10);
        break;
      default:
        assert.fail();
    }
  });

  it("should not consume an A1 address", () => {
    const input = new CU.CharStream("B33");
    const output = XL.addrRRel(input);
    switch (output.tag) {
      case "success":
        assert.fail();
      default:
        assert(true);
    }
  });

  it("should not consume an absolute R1 address", () => {
    const input = new CU.CharStream("R10C11");
    const output = XL.addrRRel(input);
    switch (output.tag) {
      case "success":
        assert.fail();
      default:
        assert(true);
    }
  });
});

describe("addrC", () => {
  it("should consume an R1 address", () => {
    const input = new CU.CharStream("C11");
    const output = XL.addrC(input);
    switch (output.tag) {
      case "success":
        expect(output.result).to.equal(11);
        break;
      default:
        assert.fail();
    }
  });

  it("should not consume an A1 address", () => {
    const input = new CU.CharStream("B33");
    const output = XL.addrC(input);
    switch (output.tag) {
      case "success":
        assert.fail();
      default:
        assert(true);
    }
  });

  it("should not consume a relative R1 address", () => {
    const input = new CU.CharStream("C[33]");
    const output = XL.addrC(input);
    switch (output.tag) {
      case "success":
        assert.fail();
      default:
        assert(true);
    }
  });
});

describe("addrCRel", () => {
  it("should consume a relative R1 address", () => {
    const input = new CU.CharStream("C[11]");
    const output = XL.addrCRel(input);
    switch (output.tag) {
      case "success":
        expect(output.result).to.equal(11);
        break;
      default:
        assert.fail();
    }
  });

  it("should not consume an A1 address", () => {
    const input = new CU.CharStream("B33");
    const output = XL.addrCRel(input);
    switch (output.tag) {
      case "success":
        assert.fail();
      default:
        assert(true);
    }
  });

  it("should not consume an absolute R1 address", () => {
    const input = new CU.CharStream("C33");
    const output = XL.addrCRel(input);
    switch (output.tag) {
      case "success":
        assert.fail();
      default:
        assert(true);
    }
  });
});

describe("addrMode", () => {
  it("should return absolute address mode for $", () => {
    const input = new CU.CharStream("$");
    const output = XL.addrMode(input);
    switch (output.tag) {
      case "success":
        expect(output.result).to.equal(AST.AbsoluteAddress);
        break;
      default:
        assert.fail();
    }
  });

  it("should return relative address mode for anything else", () => {
    const input = new CU.CharStream("B33");
    const output = XL.addrMode(input);
    switch (output.tag) {
      case "success":
        expect(output.result).to.equal(AST.RelativeAddress);
        break;
      default:
        // should never fail
        assert.fail();
    }
  });
});

describe("addrA1", () => {
  it("should consume an ordinary A1 address", () => {
    const input = new CU.CharStream("V43");
    const output = XL.addrA1(input);
    switch (output.tag) {
      case "success":
        expect(output.result.row).to.equal(43);
        expect(output.result.rowMode).to.equal(AST.RelativeAddress);
        expect(output.result.column).to.equal(22);
        expect(output.result.colMode).to.equal(AST.RelativeAddress);
        break;
      default:
        assert.fail();
    }
  });

  it("should consume an absolutely-addressed A1 address", () => {
    const input = new CU.CharStream("$C$12");
    const output = XL.addrA1(input);
    switch (output.tag) {
      case "success":
        expect(output.result.row).to.equal(12);
        expect(output.result.rowMode).to.equal(AST.AbsoluteAddress);
        expect(output.result.column).to.equal(3);
        expect(output.result.colMode).to.equal(AST.AbsoluteAddress);
        break;
      default:
        assert.fail();
    }
  });

  it("should consume an A1 address with mixed modes (case 1)", () => {
    const input = new CU.CharStream("$B1");
    const output = XL.addrA1(input);
    switch (output.tag) {
      case "success":
        expect(output.result.row).to.equal(1);
        expect(output.result.rowMode).to.equal(AST.RelativeAddress);
        expect(output.result.column).to.equal(2);
        expect(output.result.colMode).to.equal(AST.AbsoluteAddress);
        break;
      default:
        assert.fail();
    }
  });

  it("should consume an A1 address with mixed modes (case 2)", () => {
    const input = new CU.CharStream("AA$770");
    const output = XL.addrA1(input);
    switch (output.tag) {
      case "success":
        expect(output.result.row).to.equal(770);
        expect(output.result.rowMode).to.equal(AST.AbsoluteAddress);
        expect(output.result.column).to.equal(27);
        expect(output.result.colMode).to.equal(AST.RelativeAddress);
        break;
      default:
        assert.fail();
    }
  });
});

describe("addrR1C1", () => {
  it("should consume an absolute R1 address", () => {
    const input = new CU.CharStream("R23C4");
    const output = XL.addrR1C1(input);
    switch (output.tag) {
      case "success":
        expect(output.result.row).to.equal(23);
        expect(output.result.rowMode).to.equal(AST.AbsoluteAddress);
        expect(output.result.column).to.equal(4);
        expect(output.result.colMode).to.equal(AST.AbsoluteAddress);
        break;
      default:
        assert.fail();
    }
  });

  it("should consume a relative R1 address", () => {
    const input = new CU.CharStream("R[-23]C[7]");
    const output = XL.addrR1C1(input);
    switch (output.tag) {
      case "success":
        expect(output.result.row).to.equal(-23);
        expect(output.result.rowMode).to.equal(AST.RelativeAddress);
        expect(output.result.column).to.equal(7);
        expect(output.result.colMode).to.equal(AST.RelativeAddress);
        break;
      default:
        assert.fail();
    }
  });

  it("should consume a mixed R1 address (case 1)", () => {
    const input = new CU.CharStream("R223C[7]");
    const output = XL.addrR1C1(input);
    switch (output.tag) {
      case "success":
        expect(output.result.row).to.equal(223);
        expect(output.result.rowMode).to.equal(AST.AbsoluteAddress);
        expect(output.result.column).to.equal(7);
        expect(output.result.colMode).to.equal(AST.RelativeAddress);
        break;
      default:
        assert.fail();
    }
  });

  it("should consume a mixed R1 address (case 2)", () => {
    const input = new CU.CharStream("R[105]C1");
    const output = XL.addrR1C1(input);
    switch (output.tag) {
      case "success":
        expect(output.result.row).to.equal(105);
        expect(output.result.rowMode).to.equal(AST.RelativeAddress);
        expect(output.result.column).to.equal(1);
        expect(output.result.colMode).to.equal(AST.AbsoluteAddress);
        break;
      default:
        assert.fail();
    }
  });

  it("should not consume an A1 address", () => {
    const input = new CU.CharStream("R1");
    const output = XL.addrR1C1(input);
    switch (output.tag) {
      case "success":
        assert.fail();
      default:
        assert(true);
    }
  });
});

describe("rangeA1Contig", () => {
  it("should parse a contiguous A1-style range", () => {
    const input = new CU.CharStream("A1:B1");
    const output = XL.rangeA1Contig(input);
    const correct = new AST.Range([
      [
        new AST.Address(
          1,
          1,
          AST.RelativeAddress,
          AST.RelativeAddress,
          Paraformula.EnvStub
        ),
        new AST.Address(
          1,
          2,
          AST.RelativeAddress,
          AST.RelativeAddress,
          Paraformula.EnvStub
        ),
      ],
    ]);
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(correct);
        break;
      default:
        assert.fail();
    }
  });

  it("should parse a contiguous R1C1-style range", () => {
    const input = new CU.CharStream("R[1]C[-1]:R34C11102");
    const output = XL.rangeR1C1Contig(input);
    const correct = new AST.Range([
      [
        new AST.Address(
          1,
          -1,
          AST.RelativeAddress,
          AST.RelativeAddress,
          Paraformula.EnvStub
        ),
        new AST.Address(
          34,
          11102,
          AST.AbsoluteAddress,
          AST.AbsoluteAddress,
          Paraformula.EnvStub
        ),
      ],
    ]);
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(correct);
        break;
      default:
        assert.fail();
    }
  });

  it("should not parse a mixed-style range (case 1)", () => {
    const input = new CU.CharStream("A1:R1C2");
    const output = XL.rangeR1C1Contig(input);
    switch (output.tag) {
      case "success":
        assert.fail();
      default:
        assert(true);
    }
  });

  it("should not parse a mixed-style range (case 2)", () => {
    const input = new CU.CharStream("R1C1:B1");
    const output = XL.rangeR1C1Contig(input);
    switch (output.tag) {
      case "success":
        assert.fail();
      default:
        assert(true);
    }
  });
});

describe("rangeA1Discontig", () => {
  it("should consume a discontiguous A1-style range", () => {
    const input = new CU.CharStream("A1:B10,C1:D10");
    const output = XL.rangeA1Discontig(input);
    const correct = new AST.Range([
      [
        new AST.Address(
          1,
          1,
          AST.RelativeAddress,
          AST.RelativeAddress,
          Paraformula.EnvStub
        ),
        new AST.Address(
          10,
          2,
          AST.RelativeAddress,
          AST.RelativeAddress,
          Paraformula.EnvStub
        ),
      ],
      [
        new AST.Address(
          1,
          3,
          AST.RelativeAddress,
          AST.RelativeAddress,
          Paraformula.EnvStub
        ),
        new AST.Address(
          10,
          4,
          AST.RelativeAddress,
          AST.RelativeAddress,
          Paraformula.EnvStub
        ),
      ],
    ]);
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(correct);
        break;
      default:
        assert.fail();
    }
  });
});

describe("rangeR1C1Discontig", () => {
  it("should consume a discontiguous R1C1-style range", () => {
    const input = new CU.CharStream("R1C1:R10C2,R1C3:R10C4");
    const output = XL.rangeR1C1Discontig(input);
    const correct = new AST.Range([
      [
        new AST.Address(
          1,
          1,
          AST.AbsoluteAddress,
          AST.AbsoluteAddress,
          Paraformula.EnvStub
        ),
        new AST.Address(
          10,
          2,
          AST.AbsoluteAddress,
          AST.AbsoluteAddress,
          Paraformula.EnvStub
        ),
      ],
      [
        new AST.Address(
          1,
          3,
          AST.AbsoluteAddress,
          AST.AbsoluteAddress,
          Paraformula.EnvStub
        ),
        new AST.Address(
          10,
          4,
          AST.AbsoluteAddress,
          AST.AbsoluteAddress,
          Paraformula.EnvStub
        ),
      ],
    ]);
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(correct);
        break;
      default:
        assert.fail();
    }
  });
});

describe("rangeAny", () => {
  it("should consume any A1 range", () => {
    const input = new CU.CharStream("A1:B10,C1:D10");
    const output = XL.rangeAny(input);
    const correct = new AST.Range([
      [
        new AST.Address(
          1,
          1,
          AST.RelativeAddress,
          AST.RelativeAddress,
          Paraformula.EnvStub
        ),
        new AST.Address(
          10,
          2,
          AST.RelativeAddress,
          AST.RelativeAddress,
          Paraformula.EnvStub
        ),
      ],
      [
        new AST.Address(
          1,
          3,
          AST.RelativeAddress,
          AST.RelativeAddress,
          Paraformula.EnvStub
        ),
        new AST.Address(
          10,
          4,
          AST.RelativeAddress,
          AST.RelativeAddress,
          Paraformula.EnvStub
        ),
      ],
    ]);
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(correct);
        break;
      default:
        assert.fail();
    }
  });

  it("should parse a contiguous R1C1-style range", () => {
    const input = new CU.CharStream("R[1]C[-1]:R34C11102");
    const output = XL.rangeAny(input);
    const correct = new AST.Range([
      [
        new AST.Address(
          1,
          -1,
          AST.RelativeAddress,
          AST.RelativeAddress,
          Paraformula.EnvStub
        ),
        new AST.Address(
          34,
          11102,
          AST.AbsoluteAddress,
          AST.AbsoluteAddress,
          Paraformula.EnvStub
        ),
      ],
    ]);
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(correct);
        break;
      default:
        assert.fail();
    }
  });
});

describe("worksheetNameQuoted", () => {
  it("should parse a quoted string", () => {
    const input = new CU.CharStream("'worksheet'");
    const output = XL.worksheetNameQuoted(input);
    switch (output.tag) {
      case "success":
        expect(output.result.toString()).to.equal("'worksheet'");
        break;
      case "failure":
        assert.fail();
    }
  });

  it("should not parse an unquoted string", () => {
    const input = new CU.CharStream("worksheet");
    const output = XL.worksheetNameQuoted(input);
    switch (output.tag) {
      case "success":
        assert.fail();
      case "failure":
        assert(true);
    }
  });
});

describe("worksheetNameUnquoted", () => {
  it("should parse an unquoted string", () => {
    const input = new CU.CharStream("worksheet");
    const output = XL.worksheetNameUnquoted(input);
    switch (output.tag) {
      case "success":
        expect(output.result.toString()).to.equal("worksheet");
        break;
      case "failure":
        assert.fail();
    }
  });

  it("should not parse a quoted string", () => {
    const input = new CU.CharStream("'worksheet'");
    const output = XL.worksheetNameUnquoted(input);
    switch (output.tag) {
      case "success":
        assert.fail();
      case "failure":
        assert(true);
    }
  });
});

describe("worksheetName", () => {
  it("should parse an unquoted string", () => {
    const input = new CU.CharStream("worksheet");
    const output = XL.worksheetName(input);
    switch (output.tag) {
      case "success":
        expect(output.result.toString()).to.equal("worksheet");
        break;
      case "failure":
        assert.fail();
    }
  });

  it("should parse a quoted string", () => {
    const input = new CU.CharStream("'worksheet'");
    const output = XL.worksheetName(input);
    switch (output.tag) {
      case "success":
        expect(output.result.toString()).to.equal("'worksheet'");
        break;
      case "failure":
        assert.fail();
    }
  });
});
