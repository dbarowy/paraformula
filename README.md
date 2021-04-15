# paraformula

An Excel formula language parser, written in Typescript

![A blurry picture of the Excel logo flying over some trees.](assets/i_want_to_excel.png)

## Availability

Paraformula is available via [NPM](https://npmjs.org):

```
$ npm install --save paraformula
```

Paraformula has one dependency, the [Parsecco](https://github.com/williams-cs/parsecco) combinator library. Parsecco itself has **no** dependencies.

## Usage

Paraformula allows you to parse Excel formula expressions into an AST.

```typescript
import { Paraformula } from "paraformula";

const ast = Paraformula.parse('=COUNTIFS(C5:C14,"red",D5:D14,"tx")');
console.log(JSON.stringify(ast));
```

`parse` returns an AST on success, otherwise it throws an exception. A complete, runnable Node version of the above program is in the `examples/simple` directory. To run it:

```
$ cd example/simple
$ npm install
$ npm run build
$ npm run start
```

which prints something like:

```typescript
{
  "tag": "ReferenceFunction",
  "path": "",
  "workbookName": "",
  "worksheetName": "",
  "name": "COUNTIFS",
  "args": [
    {
      "tag": "ReferenceExpr",
      "path": "",
      "workbookName": "",
      "worksheetName": "",
      "rng": {
        "regions": [
          [
            {
              "row": 5,
              "column": 3,
              "rowMode": {"kind": "RelativeAddress"},
              "colMode": {"kind": "RelativeAddress"},
              "env": {"path": "", "workbookName": "", "worksheetName": ""}
            },
            {
              "row": 14,
              "column": 3,
              "rowMode": {"kind": "RelativeAddress"},
              "colMode": {"kind": "RelativeAddress"},
              "env": {"path": "", "workbookName": "", "worksheetName": ""}
            }
          ]
        ]
      }
    },
    {
      "tag": "ReferenceExpr",
      "path": "",
      "workbookName": "",
      "worksheetName": "",
      "value": "red"
    },
    {
      "tag": "ReferenceExpr",
      "path": "",
      "workbookName": "",
      "worksheetName": "",
      "rng": {
        "regions": [
          [
            {
              "row": 5,
              "column": 4,
              "rowMode": {"kind": "RelativeAddress"},
              "colMode": {"kind": "RelativeAddress"},
              "env": {"path": "", "workbookName": "", "worksheetName": ""}
            },
            {
              "row": 14,
              "column": 4,
              "rowMode": {"kind": "RelativeAddress"},
              "colMode": {"kind": "RelativeAddress"},
              "env": {"path": "", "workbookName": "", "worksheetName": ""}
            }
          ]
        ]
      }
    },
    {
      "tag": "ReferenceExpr",
      "path": "",
      "workbookName": "",
      "worksheetName": "",
      "value": "tx"
    }
  ],
  "arity": {"num": 2}
}
```

## Partial Parses (coming soon)

Paraformula has the ability to parse a partial Excel expression.

## Reference Extraction (coming soon)

Paraformula can also extract all of a formula's references, either addresses or ranges.

## More Documentation (coming soon)

Stay tuned.
