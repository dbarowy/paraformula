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

```yaml
{
  "tag": "FunctionApplication",
  "path": "",
  "workbookName": "",
  "worksheetName": "",
  "name": "COUNTIFS",
  "args":
    [
      {
        "tag": "ReferenceRange",
        "path": "",
        "workbookName": "",
        "worksheetName": "",
        "rng":
          {
            "tag": "Range",
            "regions":
              [
                [
                  {
                    "tag": "Address",
                    "row": 5,
                    "column": 3,
                    "rowMode": { "tag": "RelativeAddress" },
                    "colMode": { "tag": "RelativeAddress" },
                    "env":
                      {
                        "tag": "Env",
                        "path": "",
                        "workbookName": "",
                        "worksheetName": "",
                      },
                  },
                  {
                    "tag": "Address",
                    "row": 14,
                    "column": 3,
                    "rowMode": { "tag": "RelativeAddress" },
                    "colMode": { "tag": "RelativeAddress" },
                    "env":
                      {
                        "tag": "Env",
                        "path": "",
                        "workbookName": "",
                        "worksheetName": "",
                      },
                  },
                ],
              ],
          },
      },
      {
        "tag": "StringLiteral",
        "path": "",
        "workbookName": "",
        "worksheetName": "",
        "value": "red",
      },
      {
        "tag": "ReferenceRange",
        "path": "",
        "workbookName": "",
        "worksheetName": "",
        "rng":
          {
            "tag": "Range",
            "regions":
              [
                [
                  {
                    "tag": "Address",
                    "row": 5,
                    "column": 4,
                    "rowMode": { "tag": "RelativeAddress" },
                    "colMode": { "tag": "RelativeAddress" },
                    "env":
                      {
                        "tag": "Env",
                        "path": "",
                        "workbookName": "",
                        "worksheetName": "",
                      },
                  },
                  {
                    "tag": "Address",
                    "row": 14,
                    "column": 4,
                    "rowMode": { "tag": "RelativeAddress" },
                    "colMode": { "tag": "RelativeAddress" },
                    "env":
                      {
                        "tag": "Env",
                        "path": "",
                        "workbookName": "",
                        "worksheetName": "",
                      },
                  },
                ],
              ],
          },
      },
      {
        "tag": "StringLiteral",
        "path": "",
        "workbookName": "",
        "worksheetName": "",
        "value": "tx",
      },
    ],
  "arity": { "num": 2 },
}
```

## Partial Parses (coming soon)

Paraformula has the ability to parse a partial Excel expression.

## Reference Extraction (coming soon)

Paraformula can also extract all of a formula's references, either addresses or ranges.

## More Documentation (coming soon)

Stay tuned.
