# paraformula

An Excel formula language parser, written in Typescript

![A blurry picture of the Excel logo flying over some trees.](assets/i_want_to_excel.png)

## Availability

(coming soon) Paraformula is available via [NPM](https://npmjs.org). Paraformula has one dependency, on the [parsecco](https://github.com/williams-cs/parsecco) combinator library, which itself has **no** dependencies.

## Usage

Paraformula allows you to parse Excel formula expressions into an AST.

```
import { Paraformula } from "paraformula";

// ...

try {
    const ast = Paraformula.parse('=COUNTIFS(A1:A1,"red",B2:B2,"tx")');
} catch (e) {
    // parsing failed
    console.log(e);
}

```

`parse` returns an AST on success, otherwise it throws an exception.

## Partial Parses (coming soon)

Paraformula has the ability to parse a partial Excel expression.

## Reference Extraction (coming soon)

Paraformula can also extract all of a formula's references, either addresses or ranges.

## More Documentation (coming soon)

Stay tuned.
