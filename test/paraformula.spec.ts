import { CharUtil as CU } from "parsecco";
import { Primitives as PP } from "../src/primitives";
import { Address as PA } from "../src/address";
import { Range as PR } from "../src/range";
import { Reference as PRF } from "../src/reference";
import { ReservedWords as PRW } from "../src/reserved_words";
import { Expression as PE } from "../src/expression";
import { Util } from "../src/util";

import { AST } from "../src/ast";
import { assert, Assertion, expect } from "chai";
import "mocha";

describe("Z", () => {
  it("should consume an integer with a leading plus sign", () => {
    const input = new CU.CharStream("+645");
    const output = PP.Z(input);
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
    const output = PP.Z(input);
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
    const output = PP.Z(input);
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
    const output = PA.addrR(input);
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
    const output = PA.addrR(input);
    switch (output.tag) {
      case "success":
        assert.fail();
      default:
        assert(true);
    }
  });

  it("should not consume a relative R1 address", () => {
    const input = new CU.CharStream("R[10]C11");
    const output = PA.addrR(input);
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
    const output = PA.addrRRel(input);
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
    const output = PA.addrRRel(input);
    switch (output.tag) {
      case "success":
        assert.fail();
      default:
        assert(true);
    }
  });

  it("should not consume an absolute R1 address", () => {
    const input = new CU.CharStream("R10C11");
    const output = PA.addrRRel(input);
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
    const output = PA.addrC(input);
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
    const output = PA.addrC(input);
    switch (output.tag) {
      case "success":
        assert.fail();
      default:
        assert(true);
    }
  });

  it("should not consume a relative R1 address", () => {
    const input = new CU.CharStream("C[33]");
    const output = PA.addrC(input);
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
    const output = PA.addrCRel(input);
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
    const output = PA.addrCRel(input);
    switch (output.tag) {
      case "success":
        assert.fail();
      default:
        assert(true);
    }
  });

  it("should not consume an absolute R1 address", () => {
    const input = new CU.CharStream("C33");
    const output = PA.addrCRel(input);
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
    const output = PA.addrMode(input);
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
    const output = PA.addrMode(input);
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
    const output = PA.addrA1(input);
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
    const output = PA.addrA1(input);
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
    const output = PA.addrA1(input);
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
    const output = PA.addrA1(input);
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
    const output = PA.addrR1C1(input);
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
    const output = PA.addrR1C1(input);
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
    const output = PA.addrR1C1(input);
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
    const output = PA.addrR1C1(input);
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
    const output = PA.addrR1C1(input);
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
    const output = PR.rangeA1Contig(input);
    const correct = new AST.Range([
      [
        new AST.Address(
          1,
          1,
          AST.RelativeAddress,
          AST.RelativeAddress,
          PP.EnvStub
        ),
        new AST.Address(
          1,
          2,
          AST.RelativeAddress,
          AST.RelativeAddress,
          PP.EnvStub
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
    const output = PR.rangeR1C1Contig(input);
    const correct = new AST.Range([
      [
        new AST.Address(
          1,
          -1,
          AST.RelativeAddress,
          AST.RelativeAddress,
          PP.EnvStub
        ),
        new AST.Address(
          34,
          11102,
          AST.AbsoluteAddress,
          AST.AbsoluteAddress,
          PP.EnvStub
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
    const output = PR.rangeR1C1Contig(input);
    switch (output.tag) {
      case "success":
        assert.fail();
      default:
        assert(true);
    }
  });

  it("should not parse a mixed-style range (case 2)", () => {
    const input = new CU.CharStream("R1C1:B1");
    const output = PR.rangeR1C1Contig(input);
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
    const output = PR.rangeA1Discontig(input);
    const correct = new AST.Range([
      [
        new AST.Address(
          1,
          1,
          AST.RelativeAddress,
          AST.RelativeAddress,
          PP.EnvStub
        ),
        new AST.Address(
          10,
          2,
          AST.RelativeAddress,
          AST.RelativeAddress,
          PP.EnvStub
        ),
      ],
      [
        new AST.Address(
          1,
          3,
          AST.RelativeAddress,
          AST.RelativeAddress,
          PP.EnvStub
        ),
        new AST.Address(
          10,
          4,
          AST.RelativeAddress,
          AST.RelativeAddress,
          PP.EnvStub
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
    const output = PR.rangeR1C1Discontig(input);
    const correct = new AST.Range([
      [
        new AST.Address(
          1,
          1,
          AST.AbsoluteAddress,
          AST.AbsoluteAddress,
          PP.EnvStub
        ),
        new AST.Address(
          10,
          2,
          AST.AbsoluteAddress,
          AST.AbsoluteAddress,
          PP.EnvStub
        ),
      ],
      [
        new AST.Address(
          1,
          3,
          AST.AbsoluteAddress,
          AST.AbsoluteAddress,
          PP.EnvStub
        ),
        new AST.Address(
          10,
          4,
          AST.AbsoluteAddress,
          AST.AbsoluteAddress,
          PP.EnvStub
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
    const output = PR.rangeAny(input);
    const correct = new AST.Range([
      [
        new AST.Address(
          1,
          1,
          AST.RelativeAddress,
          AST.RelativeAddress,
          PP.EnvStub
        ),
        new AST.Address(
          10,
          2,
          AST.RelativeAddress,
          AST.RelativeAddress,
          PP.EnvStub
        ),
      ],
      [
        new AST.Address(
          1,
          3,
          AST.RelativeAddress,
          AST.RelativeAddress,
          PP.EnvStub
        ),
        new AST.Address(
          10,
          4,
          AST.RelativeAddress,
          AST.RelativeAddress,
          PP.EnvStub
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
    const output = PR.rangeAny(input);
    const correct = new AST.Range([
      [
        new AST.Address(
          1,
          -1,
          AST.RelativeAddress,
          AST.RelativeAddress,
          PP.EnvStub
        ),
        new AST.Address(
          34,
          11102,
          AST.AbsoluteAddress,
          AST.AbsoluteAddress,
          PP.EnvStub
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
    const output = PRF.worksheetNameQuoted(input);
    switch (output.tag) {
      case "success":
        expect(output.result.toString()).to.equal("worksheet");
        break;
      case "failure":
        assert.fail();
    }
  });

  it("should not parse an unquoted string", () => {
    const input = new CU.CharStream("worksheet");
    const output = PRF.worksheetNameQuoted(input);
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
    const output = PRF.worksheetNameUnquoted(input);
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
    const output = PRF.worksheetNameUnquoted(input);
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
    const output = PRF.worksheetName(input);
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
    const output = PRF.worksheetName(input);
    switch (output.tag) {
      case "success":
        expect(output.result.toString()).to.equal("worksheet");
        break;
      case "failure":
        assert.fail();
    }
  });
});

describe("workbookName", () => {
  it("should parse a valid workbook name", () => {
    const input = new CU.CharStream("[workbook]");
    const output = PRF.workbookName(input);
    switch (output.tag) {
      case "success":
        expect(output.result.toString()).to.equal("workbook");
        break;
      case "failure":
        assert.fail();
    }
  });

  it("should not parse a malformed name", () => {
    const input = new CU.CharStream("[workbook");
    const output = PRF.workbookName(input);
    switch (output.tag) {
      case "success":
        assert.fail();
      case "failure":
        assert(true);
    }
  });
});

describe("rangePrefixQuoted", () => {
  it("should parse a workbook-worksheet prefix", () => {
    const input = new CU.CharStream("'[workbook]worksheet'");
    const output = PRF.quotedPrefix(input);
    switch (output.tag) {
      case "success":
        const [[p, wb], ws] = output.result;
        expect(p.toString()).to.equal("");
        expect(wb.toString()).to.equal("workbook");
        expect(ws.toString()).to.equal("worksheet");
        break;
      case "failure":
        assert.fail();
    }
  });

  it("should parse a path-workbook-worksheet prefix", () => {
    const input = new CU.CharStream("'path[workbook]worksheet'");
    const output = PRF.quotedPrefix(input);
    switch (output.tag) {
      case "success":
        const [[p, wb], ws] = output.result;
        expect(p.toString()).to.equal("path");
        expect(wb.toString()).to.equal("workbook");
        expect(ws.toString()).to.equal("worksheet");
        break;
      case "failure":
        assert.fail();
    }
  });
});

describe("rangeReference", () => {
  it("should parse a bare range reference", () => {
    const input = new CU.CharStream("A1:B2");
    const output = PRF.rangeReference(PR.rangeAny)(input);
    const expected = new AST.ReferenceRange(
      PP.EnvStub,
      new AST.Range([
        [
          new AST.Address(
            1,
            1,
            AST.RelativeAddress,
            AST.RelativeAddress,
            PP.EnvStub
          ),
          new AST.Address(
            2,
            2,
            AST.RelativeAddress,
            AST.RelativeAddress,
            PP.EnvStub
          ),
        ],
      ])
    );
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(expected);
        break;
      case "failure":
        assert.fail();
    }
  });

  it("should parse a range reference with only a worksheet", () => {
    const input = new CU.CharStream("sheetysheet!A1:B2");
    const output = PRF.rangeReference(PR.rangeAny)(input);
    const expected = new AST.ReferenceRange(
      new AST.Env("", "", "sheetysheet"),
      new AST.Range([
        [
          new AST.Address(
            1,
            1,
            AST.RelativeAddress,
            AST.RelativeAddress,
            PP.EnvStub
          ),
          new AST.Address(
            2,
            2,
            AST.RelativeAddress,
            AST.RelativeAddress,
            PP.EnvStub
          ),
        ],
      ])
    );
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(expected);
        break;
      case "failure":
        assert.fail();
    }
  });

  it("should parse a range reference with a worksheet and a workbook", () => {
    const input = new CU.CharStream("'[foobar.xlsx]sheetysheet'!A1:B2");
    const output = PRF.rangeReference(PR.rangeAny)(input);
    const expected = new AST.ReferenceRange(
      new AST.Env("", "foobar.xlsx", "sheetysheet"),
      new AST.Range([
        [
          new AST.Address(
            1,
            1,
            AST.RelativeAddress,
            AST.RelativeAddress,
            PP.EnvStub
          ),
          new AST.Address(
            2,
            2,
            AST.RelativeAddress,
            AST.RelativeAddress,
            PP.EnvStub
          ),
        ],
      ])
    );
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(expected);
        break;
      case "failure":
        assert.fail();
    }
  });

  it("should parse this example from Microsoft's documentation", () => {
    const input = new CU.CharStream(
      "'C:\\Reports\\[SourceWorkbook.xlsx]Sheet1'!$A$1:$B$2"
    );
    const output = PRF.rangeReference(PR.rangeAny)(input);
    const expectedEnv = new AST.Env(
      "C:\\Reports\\",
      "SourceWorkbook.xlsx",
      "Sheet1"
    );
    const expected = new AST.ReferenceRange(
      expectedEnv,
      new AST.Range([
        [
          new AST.Address(
            1,
            1,
            AST.AbsoluteAddress,
            AST.AbsoluteAddress,
            expectedEnv
          ),
          new AST.Address(
            2,
            2,
            AST.AbsoluteAddress,
            AST.AbsoluteAddress,
            expectedEnv
          ),
        ],
      ])
    );
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(expected);
        break;
      case "failure":
        assert.fail();
    }
  });
});

describe("addressReference", () => {
  it("should parse a bare address reference", () => {
    const input = new CU.CharStream("A1");
    const output = PRF.addressReference(input);
    const expected = new AST.ReferenceAddress(
      PP.EnvStub,
      new AST.Address(
        1,
        1,
        AST.RelativeAddress,
        AST.RelativeAddress,
        PP.EnvStub
      )
    );
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(expected);
        break;
      case "failure":
        assert.fail();
    }
  });

  it("should parse an address reference with a worksheet", () => {
    const input = new CU.CharStream("Sheet1!A1");
    const output = PRF.addressReference(input);
    const expectedEnv = new AST.Env("", "", "Sheet1");
    const expected = new AST.ReferenceAddress(
      expectedEnv,
      new AST.Address(
        1,
        1,
        AST.RelativeAddress,
        AST.RelativeAddress,
        expectedEnv
      )
    );
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(expected);
        break;
      case "failure":
        assert.fail();
    }
  });

  it("should parse an address reference with a quoted worksheet", () => {
    const input = new CU.CharStream("'Sheet1'!A1");
    const output = PRF.addressReference(input);
    const expectedEnv = new AST.Env("", "", "Sheet1");
    const expected = new AST.ReferenceAddress(
      expectedEnv,
      new AST.Address(
        1,
        1,
        AST.RelativeAddress,
        AST.RelativeAddress,
        expectedEnv
      )
    );
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(expected);
        break;
      case "failure":
        assert.fail();
    }
  });

  it("should parse an address reference with a workbook and worksheet", () => {
    const input = new CU.CharStream("'[Foobar]Sheet1'!A1");
    const output = PRF.addressReference(input);
    const expectedEnv = new AST.Env("", "Foobar", "Sheet1");
    const expected = new AST.ReferenceAddress(
      expectedEnv,
      new AST.Address(
        1,
        1,
        AST.RelativeAddress,
        AST.RelativeAddress,
        expectedEnv
      )
    );
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(expected);
        break;
      case "failure":
        assert.fail();
    }
  });

  it("should parse this example similar to Microsoft's documentation", () => {
    const input = new CU.CharStream(
      "'C:\\Reports\\[SourceWorkbook.xlsx]Sheet1'!R34C[-78]"
    );
    const output = PRF.addressReference(input);
    const expectedEnv = new AST.Env(
      "C:\\Reports\\",
      "SourceWorkbook.xlsx",
      "Sheet1"
    );
    const expected = new AST.ReferenceAddress(
      expectedEnv,
      new AST.Address(
        34,
        -78,
        AST.AbsoluteAddress,
        AST.RelativeAddress,
        expectedEnv
      )
    );
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(expected);
        break;
      case "failure":
        assert.fail();
    }
  });
});

describe("namedReference", () => {
  it("should parse a named reference", () => {
    const input = new CU.CharStream("My_Great_Ref8");
    const output = PRF.namedReference(input);
    const expected = new AST.ReferenceNamed(PP.EnvStub, "My_Great_Ref8");
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(expected);
        break;
      case "failure":
        assert.fail();
    }
  });
});

describe("constant", () => {
  it("should parse a float", () => {
    const input = new CU.CharStream("1.234");
    const output = PRF.constant(input);
    const expected = new AST.Number(PP.EnvStub, 1.234);
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(expected);
        break;
      case "failure":
        assert.fail();
    }
  });

  it("should parse an integer", () => {
    const input = new CU.CharStream("1");
    const output = PRF.constant(input);
    const expected = new AST.Number(PP.EnvStub, 1);
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(expected);
        break;
      case "failure":
        assert.fail();
    }
  });

  it("should parse a number ending with a % sign", () => {
    const input = new CU.CharStream("123%");
    const output = PRF.constant(input);
    const expected = new AST.Number(PP.EnvStub, 1.23);
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(expected);
        break;
      case "failure":
        assert.fail();
    }
  });
});

describe("stringLiteral", () => {
  it("should parse a string literal", () => {
    const input = new CU.CharStream('"Half shark alligator half man"');
    const output = PRF.stringLiteral(input);
    const expected = new AST.StringLiteral(
      PP.EnvStub,
      "Half shark alligator half man"
    );
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(expected);
        break;
      case "failure":
        assert.fail();
    }
  });
});

describe("booleanLiteral", () => {
  it("should parse TRUE", () => {
    const input = new CU.CharStream("TRUE");
    const output = PRF.booleanLiteral(input);
    const expected = new AST.Boolean(PP.EnvStub, true);
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(expected);
        break;
      case "failure":
        assert.fail();
    }
  });

  it("should parse FALSE", () => {
    const input = new CU.CharStream("FALSE");
    const output = PRF.booleanLiteral(input);
    const expected = new AST.Boolean(PP.EnvStub, false);
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(expected);
        break;
      case "failure":
        assert.fail();
    }
  });
});

describe("strAlternatives", () => {
  it("should succeed on something", () => {
    const input = new CU.CharStream("on");
    const output = Util.strAlternatives(["on", "off"])(input);
    switch (output.tag) {
      case "success":
        expect(output.result.toString()).to.equal("on");
        break;
      case "failure":
        assert.fail();
    }
  });
});

describe("varArgsFunctionName", () => {
  it("should succeed on SUM", () => {
    const input = new CU.CharStream("SUM");
    const output = PRW.varArgsFunctionName(input);
    switch (output.tag) {
      case "success":
        expect(output.result.toString()).to.equal("SUM");
        break;
      case "failure":
        assert.fail();
    }
  });
});

describe("reservedWord", () => {
  it("should fail if it encounters a reserved word", () => {
    const input = new CU.CharStream("SUM");
    const output = PRW.reservedWord(input);
    switch (output.tag) {
      case "success":
        assert.fail();
      case "failure":
        assert(true);
    }
  });
});

describe("data", () => {
  it("should parse any reference to numeric data", () => {
    const input = new CU.CharStream("3");
    const output = PRF.data(PR.rangeAny)(input);
    const expected = new AST.Number(PP.EnvStub, 3);
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(expected);
        break;
      case "failure":
        assert.fail();
    }
  });

  it("should parse any named reference", () => {
    const input = new CU.CharStream("Joe");
    const output = PRF.data(PR.rangeAny)(input);
    const expected = new AST.ReferenceNamed(PP.EnvStub, "Joe");
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(expected);
        break;
      case "failure":
        assert.fail();
    }
  });

  it("should parse any string literal", () => {
    const input = new CU.CharStream('"Joe Biden"');
    const output = PRF.data(PR.rangeAny)(input);
    const expected = new AST.StringLiteral(PP.EnvStub, "Joe Biden");
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(expected);
        break;
      case "failure":
        assert.fail();
    }
  });

  it("should parse any boolean", () => {
    const input = new CU.CharStream("FALSE");
    const output = PRF.data(PR.rangeAny)(input);
    const expected = new AST.Boolean(PP.EnvStub, false);
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(expected);
        break;
      case "failure":
        assert.fail();
    }
  });

  it("should fail if it encounters a reserved word", () => {
    const input = new CU.CharStream("SUMPRODUCT");
    const output = PRF.data(PR.rangeAny)(input);
    switch (output.tag) {
      case "success":
        assert.fail();
      case "failure":
        assert(true);
    }
  });
});

describe("argumentsN", () => {
  it("should parse an argument list", () => {
    const input = new CU.CharStream("1, TRUE, henry");
    const output = PE.argumentsN(PR.rangeAny)(3)(input);
    const expected = [
      new AST.Number(PP.EnvStub, 1),
      new AST.Boolean(PP.EnvStub, true),
      new AST.ReferenceNamed(PP.EnvStub, "henry"),
    ];
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(expected);
        break;
      case "failure":
        assert.fail();
    }
  });
});

describe("argumentsAtLeastN", () => {
  it("should parse an argument list", () => {
    const input = new CU.CharStream("1, TRUE, henry, FALSE, A1");
    const output = PE.argumentsAtLeastN(PR.rangeAny)(3)(input);
    const expected = [
      new AST.Number(PP.EnvStub, 1),
      new AST.Boolean(PP.EnvStub, true),
      new AST.ReferenceNamed(PP.EnvStub, "henry"),
      new AST.Boolean(PP.EnvStub, false),
      new AST.ReferenceAddress(
        PP.EnvStub,
        new AST.Address(
          1,
          1,
          AST.RelativeAddress,
          AST.RelativeAddress,
          PP.EnvStub
        )
      ),
    ];
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(expected);
        break;
      case "failure":
        assert.fail();
    }
  });
});

describe("arityNFunction", () => {
  it("should parse a zero-arity function application like RAND()", () => {
    const input = new CU.CharStream("RAND()");
    const output = PE.arityNFunction(PR.rangeAny)(0)(input);
    const expected = new AST.ReferenceFunction(
      PP.EnvStub,
      "RAND",
      [],
      new AST.FixedArity(0)
    );
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(expected);
        break;
      case "failure":
        assert.fail();
    }
  });

  it("should parse a more-than-zero-arity function application like CEILING()", () => {
    const input = new CU.CharStream("CEILING(A1,5)");
    const output = PE.arityNFunction(PR.rangeAny)(2)(input);
    const expected = new AST.ReferenceFunction(
      PP.EnvStub,
      "CEILING",
      [
        new AST.ReferenceAddress(
          PP.EnvStub,
          new AST.Address(
            1,
            1,
            AST.RelativeAddress,
            AST.RelativeAddress,
            PP.EnvStub
          )
        ),
        new AST.Number(PP.EnvStub, 5),
      ],
      new AST.FixedArity(2)
    );
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(expected);
        break;
      case "failure":
        assert.fail();
    }
  });
});

describe("arityAtLeastNFunction", () => {
  it("should parse an at-least-arity-two function application like COUNTIFS()", () => {
    const input = new CU.CharStream('COUNTIFS(A1:A1,"red",B2:B2,"tx")');
    const output = PE.arityAtLeastNFunction(PR.rangeAny)(2)(input);
    const expected = new AST.ReferenceFunction(
      PP.EnvStub,
      "COUNTIFS",
      [
        new AST.ReferenceRange(
          PP.EnvStub,
          new AST.Range([
            [
              new AST.Address(
                1,
                1,
                AST.RelativeAddress,
                AST.RelativeAddress,
                PP.EnvStub
              ),
              new AST.Address(
                1,
                1,
                AST.RelativeAddress,
                AST.RelativeAddress,
                PP.EnvStub
              ),
            ],
          ])
        ),
        new AST.StringLiteral(PP.EnvStub, "red"),
        new AST.ReferenceRange(
          PP.EnvStub,
          new AST.Range([
            [
              new AST.Address(
                2,
                2,
                AST.RelativeAddress,
                AST.RelativeAddress,
                PP.EnvStub
              ),
              new AST.Address(
                2,
                2,
                AST.RelativeAddress,
                AST.RelativeAddress,
                PP.EnvStub
              ),
            ],
          ])
        ),
        new AST.StringLiteral(PP.EnvStub, "tx"),
      ],
      new AST.FixedArity(2)
    );
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(expected);
        break;
      case "failure":
        assert.fail();
    }
  });
});

describe("fApply", () => {
  it("should parse a fixed arity function application like CEILING()", () => {
    const input = new CU.CharStream("CEILING(A1,5)");
    const output = PE.arityNFunction(PR.rangeAny)(2)(input);
    const expected = new AST.ReferenceFunction(
      PP.EnvStub,
      "CEILING",
      [
        new AST.ReferenceAddress(
          PP.EnvStub,
          new AST.Address(
            1,
            1,
            AST.RelativeAddress,
            AST.RelativeAddress,
            PP.EnvStub
          )
        ),
        new AST.Number(PP.EnvStub, 5),
      ],
      new AST.FixedArity(2)
    );
    switch (output.tag) {
      case "success":
        expect(output.result).to.eql(expected);
        break;
      case "failure":
        assert.fail();
    }
  });
});

// it("should parse a varargs function application like SUM()", () => {
//   const input = new CU.CharStream("SUM(A1,B2:B77,5)");
//   const output = PE.arityNFunction(2)(input);
//   const expected = new AST.ReferenceFunction(
//     PP.EnvStub,
//     "SUM",
//     [
//       new AST.ReferenceAddress(
//         PP.EnvStub,
//         new AST.Address(
//           1,
//           1,
//           AST.RelativeAddress,
//           AST.RelativeAddress,
//           PP.EnvStub
//         )
//       ),
//       new AST.ReferenceRange(
//         PP.EnvStub,
//         new AST.Range([
//           [
//             new AST.Address(
//               2,
//               2,
//               AST.RelativeAddress,
//               AST.RelativeAddress,
//               PP.EnvStub
//             ),
//             new AST.Address(
//               77,
//               2,
//               AST.RelativeAddress,
//               AST.RelativeAddress,
//               PP.EnvStub
//             ),
//           ],
//         ])
//       ),
//       new AST.Number(PP.EnvStub, 5),
//     ],
//     AST.VarArgsArity
//   );
//   switch (output.tag) {
//     case "success":
//       expect(output.result).to.eql(expected);
//       break;
//     case "failure":
//       assert.fail();
//   }
// });
