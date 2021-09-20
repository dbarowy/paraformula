import { CharUtil as CU } from 'parsecco';
import { Primitives as PP } from '../src/primitives';
import { Address as PA } from '../src/address';
import { Range as PR } from '../src/range';
import { Reference as PRF } from '../src/reference';
import { ReservedWords as PRW } from '../src/reserved_words';
import { Expression as PE } from '../src/expression';
import { Paraformula } from '../src/paraformula';
import { AST } from '../src/ast';
import { assert, expect } from 'chai';
import 'mocha';

// instruct mocha to look for generator tests
require('mocha-generators').install();

describe('Z', () => {
  it('should consume an integer with a leading plus sign', function* () {
    const input = new CU.CharStream('+645');
    const output = yield* PP.Z(input);
    switch (output.tag) {
      case 'success':
        expect(output.result).to.equal(645);
        break;
      default:
        assert.fail();
    }
  });
  it('should consume an integer with a leading minus sign', function* () {
    const input = new CU.CharStream('-1000');
    const output = yield* PP.Z(input);
    switch (output.tag) {
      case 'success':
        expect(output.result).to.equal(-1000);
        break;
      default:
        assert.fail();
    }
  });
  it('should consume an integer with no leading sign', function* () {
    const input = new CU.CharStream('0');
    const output = yield* PP.Z(input);
    switch (output.tag) {
      case 'success':
        expect(output.result).to.equal(0);
        break;
      default:
        assert.fail();
    }
  });
});

describe('addrR', () => {
  it('should consume an absolute R1 address', function* () {
    const input = new CU.CharStream('R10C11');
    const output = yield* PA.addrR(input);
    switch (output.tag) {
      case 'success':
        expect(output.result).to.equal(10);
        break;
      default:
        assert.fail();
    }
  });

  it('should not consume an A1 address', function* () {
    const input = new CU.CharStream('B33');
    const output = yield* PA.addrR(input);
    switch (output.tag) {
      case 'success':
        assert.fail();
      default:
        assert(true);
    }
  });

  it('should not consume a relative R1 address', function* () {
    const input = new CU.CharStream('R[10]C11');
    const output = yield* PA.addrR(input);
    switch (output.tag) {
      case 'success':
        assert.fail();
      default:
        assert(true);
    }
  });
});

describe('addrRRel', () => {
  it('should consume a relative R1 address', function* () {
    const input = new CU.CharStream('R[10]C11');
    const output = yield* PA.addrRRel(input);
    switch (output.tag) {
      case 'success':
        expect(output.result).to.equal(10);
        break;
      default:
        assert.fail();
    }
  });

  it('should not consume an A1 address', function* () {
    const input = new CU.CharStream('B33');
    const output = yield* PA.addrRRel(input);
    switch (output.tag) {
      case 'success':
        assert.fail();
      default:
        assert(true);
    }
  });

  it('should not consume an absolute R1 address', function* () {
    const input = new CU.CharStream('R10C11');
    const output = yield* PA.addrRRel(input);
    switch (output.tag) {
      case 'success':
        assert.fail();
      default:
        assert(true);
    }
  });
});

describe('addrC', () => {
  it('should consume an R1 address', function* () {
    const input = new CU.CharStream('C11');
    const output = yield* PA.addrC(input);
    switch (output.tag) {
      case 'success':
        expect(output.result).to.equal(11);
        break;
      default:
        assert.fail();
    }
  });

  it('should not consume an A1 address', function* () {
    const input = new CU.CharStream('B33');
    const output = yield* PA.addrC(input);
    switch (output.tag) {
      case 'success':
        assert.fail();
      default:
        assert(true);
    }
  });

  it('should not consume a relative R1 address', function* () {
    const input = new CU.CharStream('C[33]');
    const output = yield* PA.addrC(input);
    switch (output.tag) {
      case 'success':
        assert.fail();
      default:
        assert(true);
    }
  });
});

describe('addrCRel', () => {
  it('should consume a relative R1 address', function* () {
    const input = new CU.CharStream('C[11]');
    const output = yield* PA.addrCRel(input);
    switch (output.tag) {
      case 'success':
        expect(output.result).to.equal(11);
        break;
      default:
        assert.fail();
    }
  });

  it('should not consume an A1 address', function* () {
    const input = new CU.CharStream('B33');
    const output = yield* PA.addrCRel(input);
    switch (output.tag) {
      case 'success':
        assert.fail();
      default:
        assert(true);
    }
  });

  it('should not consume an absolute R1 address', function* () {
    const input = new CU.CharStream('C33');
    const output = yield* PA.addrCRel(input);
    switch (output.tag) {
      case 'success':
        assert.fail();
      default:
        assert(true);
    }
  });
});

describe('addrMode', () => {
  it('should return absolute address mode for $', function* () {
    const input = new CU.CharStream('$');
    const output = yield* PA.addrMode(input);
    switch (output.tag) {
      case 'success':
        expect(output.result).to.equal(AST.AbsoluteAddress);
        break;
      default:
        assert.fail();
    }
  });

  it('should return relative address mode for anything else', function* () {
    const input = new CU.CharStream('B33');
    const output = yield* PA.addrMode(input);
    switch (output.tag) {
      case 'success':
        expect(output.result).to.equal(AST.RelativeAddress);
        break;
      default:
        // should never fail
        assert.fail();
    }
  });
});

describe('addrA1', () => {
  it('should consume an ordinary A1 address', function* () {
    const input = new CU.CharStream('V43');
    const output = yield* PA.addrA1(input);
    switch (output.tag) {
      case 'success':
        expect(output.result.row).to.equal(43);
        expect(output.result.rowMode).to.equal(AST.RelativeAddress);
        expect(output.result.column).to.equal(22);
        expect(output.result.colMode).to.equal(AST.RelativeAddress);
        break;
      default:
        assert.fail();
    }
  });

  it('should consume an absolutely-addressed A1 address', function* () {
    const input = new CU.CharStream('$C$12');
    const output = yield* PA.addrA1(input);
    switch (output.tag) {
      case 'success':
        expect(output.result.row).to.equal(12);
        expect(output.result.rowMode).to.equal(AST.AbsoluteAddress);
        expect(output.result.column).to.equal(3);
        expect(output.result.colMode).to.equal(AST.AbsoluteAddress);
        break;
      default:
        assert.fail();
    }
  });

  it('should consume an A1 address with mixed modes (case 1)', function* () {
    const input = new CU.CharStream('$B1');
    const output = yield* PA.addrA1(input);
    switch (output.tag) {
      case 'success':
        expect(output.result.row).to.equal(1);
        expect(output.result.rowMode).to.equal(AST.RelativeAddress);
        expect(output.result.column).to.equal(2);
        expect(output.result.colMode).to.equal(AST.AbsoluteAddress);
        break;
      default:
        assert.fail();
    }
  });

  it('should consume an A1 address with mixed modes (case 2)', function* () {
    const input = new CU.CharStream('AA$770');
    const output = yield* PA.addrA1(input);
    switch (output.tag) {
      case 'success':
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

describe('addrR1C1', () => {
  it('should consume an absolute R1 address', function* () {
    const input = new CU.CharStream('R23C4');
    const output = yield* PA.addrR1C1(input);
    switch (output.tag) {
      case 'success':
        expect(output.result.row).to.equal(23);
        expect(output.result.rowMode).to.equal(AST.AbsoluteAddress);
        expect(output.result.column).to.equal(4);
        expect(output.result.colMode).to.equal(AST.AbsoluteAddress);
        break;
      default:
        assert.fail();
    }
  });

  it('should consume a relative R1 address', function* () {
    const input = new CU.CharStream('R[-23]C[7]');
    const output = yield* PA.addrR1C1(input);
    switch (output.tag) {
      case 'success':
        expect(output.result.row).to.equal(-23);
        expect(output.result.rowMode).to.equal(AST.RelativeAddress);
        expect(output.result.column).to.equal(7);
        expect(output.result.colMode).to.equal(AST.RelativeAddress);
        break;
      default:
        assert.fail();
    }
  });

  it('should consume a mixed R1 address (case 1)', function* () {
    const input = new CU.CharStream('R223C[7]');
    const output = yield* PA.addrR1C1(input);
    switch (output.tag) {
      case 'success':
        expect(output.result.row).to.equal(223);
        expect(output.result.rowMode).to.equal(AST.AbsoluteAddress);
        expect(output.result.column).to.equal(7);
        expect(output.result.colMode).to.equal(AST.RelativeAddress);
        break;
      default:
        assert.fail();
    }
  });

  it('should consume a mixed R1 address (case 2)', function* () {
    const input = new CU.CharStream('R[105]C1');
    const output = yield* PA.addrR1C1(input);
    switch (output.tag) {
      case 'success':
        expect(output.result.row).to.equal(105);
        expect(output.result.rowMode).to.equal(AST.RelativeAddress);
        expect(output.result.column).to.equal(1);
        expect(output.result.colMode).to.equal(AST.AbsoluteAddress);
        break;
      default:
        assert.fail();
    }
  });

  it('should not consume an A1 address', function* () {
    const input = new CU.CharStream('R1');
    const output = yield* PA.addrR1C1(input);
    switch (output.tag) {
      case 'success':
        assert.fail();
      default:
        assert(true);
    }
  });
});

describe('rangeA1Contig', () => {
  it('should parse a contiguous A1-style range', function* () {
    const input = new CU.CharStream('A1:B1');
    const output = yield* PR.rangeA1Contig(input);
    const correct = new AST.Range([
      [
        new AST.Address(1, 1, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub),
        new AST.Address(1, 2, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub),
      ],
    ]);
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(correct);
        break;
      default:
        assert.fail();
    }
  });

  it('should parse a contiguous R1C1-style range', function* () {
    const input = new CU.CharStream('R[1]C[-1]:R34C11102');
    const output = yield* PR.rangeR1C1Contig(input);
    const correct = new AST.Range([
      [
        new AST.Address(1, -1, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub),
        new AST.Address(34, 11102, AST.AbsoluteAddress, AST.AbsoluteAddress, PP.EnvStub),
      ],
    ]);
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(correct);
        break;
      default:
        assert.fail();
    }
  });

  it('should not parse a mixed-style range (case 1)', function* () {
    const input = new CU.CharStream('A1:R1C2');
    const output = yield* PR.rangeR1C1Contig(input);
    switch (output.tag) {
      case 'success':
        assert.fail();
      default:
        assert(true);
    }
  });

  it('should not parse a mixed-style range (case 2)', function* () {
    const input = new CU.CharStream('R1C1:B1');
    const output = yield* PR.rangeR1C1Contig(input);
    switch (output.tag) {
      case 'success':
        assert.fail();
      default:
        assert(true);
    }
  });
});

describe('rangeA1Discontig', () => {
  it('should consume a discontiguous A1-style range', function* () {
    const input = new CU.CharStream('A1:B10,C1:D10');
    const output = yield* PR.rangeA1Discontig(input);
    const correct = new AST.Range([
      [
        new AST.Address(1, 1, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub),
        new AST.Address(10, 2, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub),
      ],
      [
        new AST.Address(1, 3, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub),
        new AST.Address(10, 4, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub),
      ],
    ]);
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(correct);
        break;
      default:
        assert.fail();
    }
  });
});

describe('rangeR1C1Discontig', () => {
  it('should consume a discontiguous R1C1-style range', function* () {
    const input = new CU.CharStream('R1C1:R10C2,R1C3:R10C4');
    const output = yield* PR.rangeR1C1Discontig(input);
    const correct = new AST.Range([
      [
        new AST.Address(1, 1, AST.AbsoluteAddress, AST.AbsoluteAddress, PP.EnvStub),
        new AST.Address(10, 2, AST.AbsoluteAddress, AST.AbsoluteAddress, PP.EnvStub),
      ],
      [
        new AST.Address(1, 3, AST.AbsoluteAddress, AST.AbsoluteAddress, PP.EnvStub),
        new AST.Address(10, 4, AST.AbsoluteAddress, AST.AbsoluteAddress, PP.EnvStub),
      ],
    ]);
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(correct);
        break;
      default:
        assert.fail();
    }
  });
});

describe('rangeAny', () => {
  it('should consume any A1 range', function* () {
    const input = new CU.CharStream('A1:B10,C1:D10');
    const output = yield* PR.rangeAny(input);
    const correct = new AST.Range([
      [
        new AST.Address(1, 1, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub),
        new AST.Address(10, 2, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub),
      ],
      [
        new AST.Address(1, 3, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub),
        new AST.Address(10, 4, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub),
      ],
    ]);
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(correct);
        break;
      default:
        assert.fail();
    }
  });

  it('should parse a contiguous R1C1-style range', function* () {
    const input = new CU.CharStream('R[1]C[-1]:R34C11102');
    const output = yield* PR.rangeAny(input);
    const correct = new AST.Range([
      [
        new AST.Address(1, -1, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub),
        new AST.Address(34, 11102, AST.AbsoluteAddress, AST.AbsoluteAddress, PP.EnvStub),
      ],
    ]);
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(correct);
        break;
      default:
        assert.fail();
    }
  });
});

describe('worksheetNameQuoted', () => {
  it('should parse a quoted string', function* () {
    const input = new CU.CharStream("'worksheet'");
    const output = yield* PRF.worksheetNameQuoted(input);
    switch (output.tag) {
      case 'success':
        expect(output.result.toString()).to.equal('worksheet');
        break;
      case 'failure':
        assert.fail();
    }
  });

  it('should not parse an unquoted string', function* () {
    const input = new CU.CharStream('worksheet');
    const output = yield* PRF.worksheetNameQuoted(input);
    switch (output.tag) {
      case 'success':
        assert.fail();
      case 'failure':
        assert(true);
    }
  });
});

describe('worksheetNameUnquoted', () => {
  it('should parse an unquoted string', function* () {
    const input = new CU.CharStream('worksheet');
    const output = yield* PRF.worksheetNameUnquoted(input);
    switch (output.tag) {
      case 'success':
        expect(output.result.toString()).to.equal('worksheet');
        break;
      case 'failure':
        assert.fail();
    }
  });

  it('should not parse a quoted string', function* () {
    const input = new CU.CharStream("'worksheet'");
    const output = yield* PRF.worksheetNameUnquoted(input);
    switch (output.tag) {
      case 'success':
        assert.fail();
      case 'failure':
        assert(true);
    }
  });
});

describe('worksheetName', () => {
  it('should parse an unquoted string', function* () {
    const input = new CU.CharStream('worksheet');
    const output = yield* PRF.worksheetName(input);
    switch (output.tag) {
      case 'success':
        expect(output.result.toString()).to.equal('worksheet');
        break;
      case 'failure':
        assert.fail();
    }
  });

  it('should parse a quoted string', function* () {
    const input = new CU.CharStream("'worksheet'");
    const output = yield* PRF.worksheetName(input);
    switch (output.tag) {
      case 'success':
        expect(output.result.toString()).to.equal('worksheet');
        break;
      case 'failure':
        assert.fail();
    }
  });
});

describe('workbookName', () => {
  it('should parse a valid workbook name', function* () {
    const input = new CU.CharStream('[workbook]');
    const output = yield* PRF.workbookName(input);
    switch (output.tag) {
      case 'success':
        expect(output.result.toString()).to.equal('workbook');
        break;
      case 'failure':
        assert.fail();
    }
  });

  it('should not parse a malformed name', function* () {
    const input = new CU.CharStream('[workbook');
    const output = yield* PRF.workbookName(input);
    switch (output.tag) {
      case 'success':
        assert.fail();
      case 'failure':
        assert(true);
    }
  });
});

describe('rangePrefixQuoted', () => {
  it('should parse a workbook-worksheet prefix', function* () {
    const input = new CU.CharStream("'[workbook]worksheet'");
    const output = yield* PRF.quotedPrefix(input);
    switch (output.tag) {
      case 'success':
        const [[p, wb], ws] = output.result;
        expect(p.toString()).to.equal('');
        expect(wb.toString()).to.equal('workbook');
        expect(ws.toString()).to.equal('worksheet');
        break;
      case 'failure':
        assert.fail();
    }
  });

  it('should parse a path-workbook-worksheet prefix', function* () {
    const input = new CU.CharStream("'path[workbook]worksheet'");
    const output = yield* PRF.quotedPrefix(input);
    switch (output.tag) {
      case 'success':
        const [[p, wb], ws] = output.result;
        expect(p.toString()).to.equal('path');
        expect(wb.toString()).to.equal('workbook');
        expect(ws.toString()).to.equal('worksheet');
        break;
      case 'failure':
        assert.fail();
    }
  });
});

describe('rangeReference', () => {
  it('should parse a bare range reference', function* () {
    const input = new CU.CharStream('A1:B2');
    const output = yield* PRF.rangeReference(PR.rangeAny)(input);
    const expected = new AST.ReferenceRange(
      PP.EnvStub,
      new AST.Range([
        [
          new AST.Address(1, 1, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub),
          new AST.Address(2, 2, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub),
        ],
      ])
    );
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      case 'failure':
        assert.fail();
    }
  });

  it('should parse a range reference with only a worksheet', function* () {
    const input = new CU.CharStream('sheetysheet!A1:B2');
    const output = yield* PRF.rangeReference(PR.rangeAny)(input);
    const expected = new AST.ReferenceRange(
      new AST.Env('', '', 'sheetysheet'),
      new AST.Range([
        [
          new AST.Address(1, 1, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub),
          new AST.Address(2, 2, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub),
        ],
      ])
    );
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      case 'failure':
        assert.fail();
    }
  });

  it('should parse a range reference with a worksheet and a workbook', function* () {
    const input = new CU.CharStream("'[foobar.xlsx]sheetysheet'!A1:B2");
    const output = yield* PRF.rangeReference(PR.rangeAny)(input);
    const expected = new AST.ReferenceRange(
      new AST.Env('', 'foobar.xlsx', 'sheetysheet'),
      new AST.Range([
        [
          new AST.Address(1, 1, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub),
          new AST.Address(2, 2, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub),
        ],
      ])
    );
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      case 'failure':
        assert.fail();
    }
  });

  it("should parse this example from Microsoft's documentation", function* () {
    const input = new CU.CharStream("'C:\\Reports\\[SourceWorkbook.xlsx]Sheet1'!$A$1:$B$2");
    const output = yield* PRF.rangeReference(PR.rangeAny)(input);
    const expectedEnv = new AST.Env('C:\\Reports\\', 'SourceWorkbook.xlsx', 'Sheet1');
    const expected = new AST.ReferenceRange(
      expectedEnv,
      new AST.Range([
        [
          new AST.Address(1, 1, AST.AbsoluteAddress, AST.AbsoluteAddress, expectedEnv),
          new AST.Address(2, 2, AST.AbsoluteAddress, AST.AbsoluteAddress, expectedEnv),
        ],
      ])
    );
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      case 'failure':
        assert.fail();
    }
  });
});

describe('addressReference', () => {
  it('should parse a bare address reference', function* () {
    const input = new CU.CharStream('A1');
    const output = yield* PRF.addressReference(input);
    const expected = new AST.ReferenceAddress(
      PP.EnvStub,
      new AST.Address(1, 1, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub)
    );
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      case 'failure':
        assert.fail();
    }
  });

  it('should parse an address reference with a worksheet', function* () {
    const input = new CU.CharStream('Sheet1!A1');
    const output = yield* PRF.addressReference(input);
    const expectedEnv = new AST.Env('', '', 'Sheet1');
    const expected = new AST.ReferenceAddress(
      expectedEnv,
      new AST.Address(1, 1, AST.RelativeAddress, AST.RelativeAddress, expectedEnv)
    );
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      case 'failure':
        assert.fail();
    }
  });

  it('should parse an address reference with a quoted worksheet', function* () {
    const input = new CU.CharStream("'Sheet1'!A1");
    const output = yield* PRF.addressReference(input);
    const expectedEnv = new AST.Env('', '', 'Sheet1');
    const expected = new AST.ReferenceAddress(
      expectedEnv,
      new AST.Address(1, 1, AST.RelativeAddress, AST.RelativeAddress, expectedEnv)
    );
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      case 'failure':
        assert.fail();
    }
  });

  it('should parse an address reference with a workbook and worksheet', function* () {
    const input = new CU.CharStream("'[Foobar]Sheet1'!A1");
    const output = yield* PRF.addressReference(input);
    const expectedEnv = new AST.Env('', 'Foobar', 'Sheet1');
    const expected = new AST.ReferenceAddress(
      expectedEnv,
      new AST.Address(1, 1, AST.RelativeAddress, AST.RelativeAddress, expectedEnv)
    );
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      case 'failure':
        assert.fail();
    }
  });

  it("should parse this example similar to Microsoft's documentation", function* () {
    const input = new CU.CharStream("'C:\\Reports\\[SourceWorkbook.xlsx]Sheet1'!R34C[-78]");
    const output = yield* PRF.addressReference(input);
    const expectedEnv = new AST.Env('C:\\Reports\\', 'SourceWorkbook.xlsx', 'Sheet1');
    const expected = new AST.ReferenceAddress(
      expectedEnv,
      new AST.Address(34, -78, AST.AbsoluteAddress, AST.RelativeAddress, expectedEnv)
    );
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      case 'failure':
        assert.fail();
    }
  });
});

describe('namedReference', () => {
  it('should parse a named reference', function* () {
    const input = new CU.CharStream('My_Great_Ref8');
    const output = yield* PRF.namedReference(input);
    const expected = new AST.ReferenceNamed('My_Great_Ref8');
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      case 'failure':
        assert.fail();
    }
  });
});

describe('constant', () => {
  it('should parse a float', function* () {
    const input = new CU.CharStream('1.234');
    const output = yield* PRF.constant(input);
    const expected = new AST.Number(1.234);
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      case 'failure':
        assert.fail();
    }
  });

  it('should parse an integer', function* () {
    const input = new CU.CharStream('1');
    const output = yield* PRF.constant(input);
    const expected = new AST.Number(1);
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      case 'failure':
        assert.fail();
    }
  });

  it('should parse the percent sign at the end of a number', function* () {
    // because it should acutally be handed by the unary operator parser
    const input = new CU.CharStream('123%');
    const output = yield* PRF.constant(input);
    const expected = new AST.Number(123);
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      case 'failure':
        assert.fail();
    }
  });
});

describe('stringLiteral', () => {
  it('should parse a string literal', function* () {
    const input = new CU.CharStream('"Half shark alligator half man"');
    const output = yield* PRF.stringLiteral(input);
    const expected = new AST.StringLiteral('Half shark alligator half man');
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      case 'failure':
        assert.fail();
    }
  });
});

describe('booleanLiteral', () => {
  it('should parse TRUE', function* () {
    const input = new CU.CharStream('TRUE');
    const output = yield* PRF.booleanLiteral(input);
    const expected = new AST.Boolean(true);
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      case 'failure':
        assert.fail();
    }
  });

  it('should parse FALSE', function* () {
    const input = new CU.CharStream('FALSE');
    const output = yield* PRF.booleanLiteral(input);
    const expected = new AST.Boolean(false);
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      case 'failure':
        assert.fail();
    }
  });
});

describe('varArgsFunctionName', () => {
  it('should succeed on SUM', function* () {
    const input = new CU.CharStream('SUM');
    const output = yield* PRW.varArgsFunctionName(input);
    switch (output.tag) {
      case 'success':
        expect(output.result.toString()).to.equal('SUM');
        break;
      case 'failure':
        assert.fail();
    }
  });
});

describe('reservedWord', () => {
  it('should fail if it encounters a reserved word', function* () {
    const input = new CU.CharStream('SUM');
    const output = yield* PRW.reservedWord(input);
    switch (output.tag) {
      case 'success':
        assert.fail();
      case 'failure':
        assert(true);
    }
  });
});

describe('data', () => {
  it('should parse any reference to numeric data', function* () {
    const input = new CU.CharStream('3');
    const output = yield* PRF.data(PR.rangeAny)(input);
    const expected = new AST.Number(3);
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      case 'failure':
        assert.fail();
    }
  });

  it('should parse any named reference', function* () {
    const input = new CU.CharStream('Joe');
    const output = yield* PRF.data(PR.rangeAny)(input);
    const expected = new AST.ReferenceNamed('Joe');
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      case 'failure':
        assert.fail();
    }
  });

  it('should parse any string literal', function* () {
    const input = new CU.CharStream('"Joe Biden"');
    const output = yield* PRF.data(PR.rangeAny)(input);
    const expected = new AST.StringLiteral('Joe Biden');
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      case 'failure':
        assert.fail();
    }
  });

  it('should parse any boolean', function* () {
    const input = new CU.CharStream('FALSE');
    const output = yield* PRF.data(PR.rangeAny)(input);
    const expected = new AST.Boolean(false);
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      case 'failure':
        assert.fail();
    }
  });

  it('should fail if it encounters a reserved word', function* () {
    const input = new CU.CharStream('SUMPRODUCT');
    const output = yield* PRF.data(PR.rangeAny)(input);
    switch (output.tag) {
      case 'success':
        assert.fail();
      case 'failure':
        assert(true);
    }
  });
});

describe('fApply', () => {
  it('should parse an at-least-arity-two function application like COUNTIFS()', function* () {
    const input = new CU.CharStream('COUNTIFS(A1:A1,"red",B2:B2,"tx")');
    const output = yield* PE.fApply(PR.rangeAny)(input);
    const expected = new AST.FunctionApplication(
      'COUNTIFS',
      [
        new AST.ReferenceRange(
          PP.EnvStub,
          new AST.Range([
            [
              new AST.Address(1, 1, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub),
              new AST.Address(1, 1, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub),
            ],
          ])
        ),
        new AST.StringLiteral('red'),
        new AST.ReferenceRange(
          PP.EnvStub,
          new AST.Range([
            [
              new AST.Address(2, 2, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub),
              new AST.Address(2, 2, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub),
            ],
          ])
        ),
        new AST.StringLiteral('tx'),
      ],
      new AST.FixedArity(2)
    );
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      case 'failure':
        assert.fail();
    }
  });

  it('should parse a more-than-zero-arity function application like CEILING()', function* () {
    const input = new CU.CharStream('CEILING(A1,5)');
    const output = yield* PE.fApply(PR.rangeAny)(input);
    const expected = new AST.FunctionApplication(
      'CEILING',
      [
        new AST.ReferenceAddress(
          PP.EnvStub,
          new AST.Address(1, 1, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub)
        ),
        new AST.Number(5),
      ],
      new AST.FixedArity(2)
    );
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      case 'failure':
        assert.fail();
    }
  });

  it('should parse a zero-arity function application like RAND()', function* () {
    const input = new CU.CharStream('RAND()');
    const output = yield* PE.fApply(PR.rangeAny)(input);
    const expected = new AST.FunctionApplication('RAND', [], new AST.FixedArity(0));
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      case 'failure':
        assert.fail();
    }
  });

  it('should parse a varargs function application like SUM()', function* () {
    const input = new CU.CharStream('SUM(A1,B2:B77,5)');
    const output = yield* PE.fApply(PR.rangeAny)(input);
    const expected = new AST.FunctionApplication(
      'SUM',
      [
        new AST.ReferenceAddress(
          PP.EnvStub,
          new AST.Address(1, 1, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub)
        ),
        new AST.ReferenceRange(
          PP.EnvStub,
          new AST.Range([
            [
              new AST.Address(2, 2, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub),
              new AST.Address(77, 2, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub),
            ],
          ])
        ),
        new AST.Number(5),
      ],
      AST.VarArgsArityInst
    );
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      case 'failure':
        assert.fail();
    }
  });
});

describe('binOp', () => {
  it('should parse an addition expression like A1 + B2', function* () {
    const input = new CU.CharStream('A1 + B2');
    const output = yield* PE.binOp(PR.rangeAny)(input);
    const expected = new AST.BinOpExpr(
      '+',
      new AST.ReferenceAddress(PP.EnvStub, new AST.Address(1, 1, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub)),
      new AST.ReferenceAddress(PP.EnvStub, new AST.Address(2, 2, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub))
    );
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      default:
        assert.fail();
    }
  });

  it('should correctly deal with precedence in an expresion like A1 * B2 + C3', function* () {
    const input = new CU.CharStream('A1 * B2 + C3');
    const output = yield* PE.binOp(PR.rangeAny)(input);
    const expected = new AST.BinOpExpr(
      '+',
      new AST.BinOpExpr(
        '*',
        new AST.ReferenceAddress(
          PP.EnvStub,
          new AST.Address(1, 1, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub)
        ),
        new AST.ReferenceAddress(
          PP.EnvStub,
          new AST.Address(2, 2, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub)
        )
      ),
      new AST.ReferenceAddress(PP.EnvStub, new AST.Address(3, 3, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub))
    );
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      default:
        assert.fail();
    }
  });

  it('should parse a subtraction expression like A1 - B2', function* () {
    const input = new CU.CharStream('A1 - B2');
    const output = yield* PE.binOp(PR.rangeAny)(input);
    const expected = new AST.BinOpExpr(
      '-',
      new AST.ReferenceAddress(PP.EnvStub, new AST.Address(1, 1, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub)),
      new AST.ReferenceAddress(PP.EnvStub, new AST.Address(2, 2, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub))
    );
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      default:
        assert.fail();
    }
  });

  it('should parse a division expression like A1 / B2', function* () {
    const input = new CU.CharStream('A1 / B2');
    const output = yield* PE.binOp(PR.rangeAny)(input);
    const expected = new AST.BinOpExpr(
      '/',
      new AST.ReferenceAddress(PP.EnvStub, new AST.Address(1, 1, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub)),
      new AST.ReferenceAddress(PP.EnvStub, new AST.Address(2, 2, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub))
    );
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      default:
        assert.fail();
    }
  });

  it('should handle left-associativity in A1 - B2 + C3', function* () {
    const input = new CU.CharStream('A1 - B2 + C3');
    const output = yield* PE.binOp(PR.rangeAny)(input);
    const expected = new AST.BinOpExpr(
      '+',
      new AST.BinOpExpr(
        '-',
        new AST.ReferenceAddress(
          PP.EnvStub,
          new AST.Address(1, 1, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub)
        ),
        new AST.ReferenceAddress(
          PP.EnvStub,
          new AST.Address(2, 2, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub)
        )
      ),
      new AST.ReferenceAddress(PP.EnvStub, new AST.Address(3, 3, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub))
    );
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      default:
        assert.fail();
    }
  });

  it('should handle left-associativity in A1 / B2 * C3', function* () {
    const input = new CU.CharStream('A1 / B2 * C3');
    const output = yield* PE.binOp(PR.rangeAny)(input);
    const expected = new AST.BinOpExpr(
      '*',
      new AST.BinOpExpr(
        '/',
        new AST.ReferenceAddress(
          PP.EnvStub,
          new AST.Address(1, 1, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub)
        ),
        new AST.ReferenceAddress(
          PP.EnvStub,
          new AST.Address(2, 2, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub)
        )
      ),
      new AST.ReferenceAddress(PP.EnvStub, new AST.Address(3, 3, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub))
    );
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      default:
        assert.fail();
    }
  });

  it('should parse unary expressions', function* () {
    const input = new CU.CharStream('-R23C45');
    const output = yield* PE.binOp(PR.rangeAny)(input);
    const expected = new AST.UnaryOpExpr(
      '-',
      new AST.ReferenceAddress(
        PP.EnvStub,
        new AST.Address(23, 45, AST.AbsoluteAddress, AST.AbsoluteAddress, PP.EnvStub)
      )
    );
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      default:
        assert.fail();
    }
  });

  it('should parse a concatenation expression like "foo"&"bar"', function* () {
    const input = new CU.CharStream('"foo"&"bar"');
    const output = yield* PE.binOp(PR.rangeAny)(input);
    const expected = new AST.BinOpExpr('&', new AST.StringLiteral('foo'), new AST.StringLiteral('bar'));
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      default:
        assert.fail();
    }
  });

  it('should parse a comparison expression like "foo"<>"bar"', function* () {
    const input = new CU.CharStream('"foo"<>"bar"');
    const output = yield* PE.binOp(PR.rangeAny)(input);
    const expected = new AST.BinOpExpr('<>', new AST.StringLiteral('foo'), new AST.StringLiteral('bar'));
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      default:
        assert.fail();
    }
  });

  it('should parse a comparison expression like 1=2', function* () {
    const input = new CU.CharStream('1=2');
    const output = yield* PE.binOp(PR.rangeAny)(input);
    const expected = new AST.BinOpExpr('=', new AST.Number(1), new AST.Number(2));
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      default:
        assert.fail();
    }
  });

  it('should parse a comparison expression like A1>2', function* () {
    const input = new CU.CharStream('A1>2');
    const output = yield* PE.binOp(PR.rangeAny)(input);
    const expected = new AST.BinOpExpr(
      '>',
      new AST.ReferenceAddress(PP.EnvStub, new AST.Address(1, 1, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub)),
      new AST.Number(2)
    );
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      default:
        assert.fail();
    }
  });

  it('should parse an exponentiation expression like A1^2', function* () {
    const input = new CU.CharStream('A1^2');
    const output = yield* PE.binOp(PR.rangeAny)(input);
    const expected = new AST.BinOpExpr(
      '^',
      new AST.ReferenceAddress(PP.EnvStub, new AST.Address(1, 1, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub)),
      new AST.Number(2)
    );
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      default:
        assert.fail();
    }
  });

  it('should correctly parse exponentiation as right-associative as in A1^(1-2)^B2', function* () {
    const input = new CU.CharStream('A1^(1-2)^B2');
    const output = yield* PE.binOp(PR.rangeAny)(input);
    const expected = new AST.BinOpExpr(
      '^',
      new AST.ReferenceAddress(PP.EnvStub, new AST.Address(1, 1, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub)),
      new AST.BinOpExpr(
        '^',
        new AST.ParensExpr(new AST.BinOpExpr('-', new AST.Number(1), new AST.Number(2))),
        new AST.ReferenceAddress(
          PP.EnvStub,
          new AST.Address(2, 2, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub)
        )
      )
    );
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      default:
        assert.fail();
    }
  });

  it('should parse a percentage expression like 2%', function* () {
    const input = new CU.CharStream('2%');
    const output = yield* PE.binOp(PR.rangeAny)(input);
    const expected = new AST.UnaryOpExpr('%', new AST.Number(2));
    switch (output.tag) {
      case 'success':
        expect(output.result).to.eql(expected);
        break;
      default:
        assert.fail();
    }
  });
});

describe('parse', () => {
  it('should be able to parse anything', () => {
    const input = '=SUM(A1,B2:B77,5)';
    const output = Paraformula.parse(input);
    const expected = new AST.FunctionApplication(
      'SUM',
      [
        new AST.ReferenceAddress(
          PP.EnvStub,
          new AST.Address(1, 1, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub)
        ),
        new AST.ReferenceRange(
          PP.EnvStub,
          new AST.Range([
            [
              new AST.Address(2, 2, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub),
              new AST.Address(77, 2, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub),
            ],
          ])
        ),
        new AST.Number(5),
      ],
      AST.VarArgsArityInst
    );
    expect(output).to.eql(expected);
  });
  it('should parse the real-world expression "=MAX(B6-40,0)"', () => {
    const input = '=MAX(B6-40,0)';
    const output = Paraformula.parse(input);
    const expected = new AST.FunctionApplication(
      'MAX',
      [
        new AST.BinOpExpr(
          '-',
          new AST.ReferenceAddress(
            PP.EnvStub,
            new AST.Address(6, 2, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub)
          ),
          new AST.Number(40)
        ),
        new AST.Number(0),
      ],
      new AST.LowBoundArity(1)
    );
    expect(output).to.eql(expected);
  });
});

describe('yieldableParse', () => {
  it('should be able to parse anything', function* () {
    const input = '=SUM(A1,B2:B77,5)';
    const output = yield* Paraformula.yieldableParse(input);
    const expected = new AST.FunctionApplication(
      'SUM',
      [
        new AST.ReferenceAddress(
          PP.EnvStub,
          new AST.Address(1, 1, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub)
        ),
        new AST.ReferenceRange(
          PP.EnvStub,
          new AST.Range([
            [
              new AST.Address(2, 2, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub),
              new AST.Address(77, 2, AST.RelativeAddress, AST.RelativeAddress, PP.EnvStub),
            ],
          ])
        ),
        new AST.Number(5),
      ],
      AST.VarArgsArityInst
    );
    expect(output).to.eql(expected);
  });
});

describe('AST.Expression', () => {
  it('should be pattern-matchable', () => {
    const input = '=A1';
    const output = Paraformula.parse(input);
    switch (output.type) {
      case AST.ReferenceAddress.type:
        expect(output.address.column).to.eql(1);
        expect(output.address.colMode).to.eql(AST.RelativeAddress);
        expect(output.address.row).to.eql(1);
        expect(output.address.rowMode).to.eql(AST.RelativeAddress);
        break;
      default:
        assert.fail();
    }
  });
});

describe('Formula pretty printer', () => {
  it("should reproduce the parser's input for ranges", () => {
    const input = '=SUM(A1:A10)';
    const output = Paraformula.parse(input);
    const input2 = output.toFormula();
    // input2 won't contain an '=' but should otherwise be the same
    expect('=' + input2).to.eql(input);
  });
});
