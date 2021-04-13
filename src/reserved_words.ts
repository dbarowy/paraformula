import { Primitives as P, CharUtil as CU } from "parsecco";
import { AST } from "./ast";
import { Util } from "./util";
import { Primitives as PP } from "./primitives";

export module ReservedWords {
  const Arity0Names: string[] = [
    "COLUMN",
    "NA",
    "NOW",
    "PI",
    "RAND",
    "ROW",
    "SHEET",
    "SHEETS",
    "TODAY",
  ];

  const Arity1Names: string[] = [
    "ABS",
    "ACOS",
    "ACOSH",
    "ACOT",
    "ACOTH",
    "ARABIC",
    "AREAS",
    "ASC",
    "ASIN",
    "ASINH",
    "ATAN",
    "ATANH",
    "BAHTTEXT",
    "BIN2DEC",
    "BIN2HEX",
    "BIN2OCT",
    "CEILING.PRECISE",
    "CELL",
    "CHAR",
    "CLEAN",
    "CODE",
    "COLUMN",
    "COLUMNS",
    "COS",
    "COSH",
    "COT",
    "COTH",
    "COUNTBLANK",
    "CSC",
    "CSCH",
    "CUBESETCOUNT",
    "DAY",
    "DBCS",
    "DEC2BIN",
    "DEC2HEX",
    "DEC2OCT",
    "DEGREES",
    "DELTA",
    "DOLLAR",
    "ENCODEURL",
    "ERF",
    "ERF.PRECISE",
    "ERFC",
    "ERFC.PRECISE",
    "ERROR.TYPE",
    "EVEN",
    "EXP",
    "FACT",
    "FACTDOUBLE",
    "FISHER",
    "FISHERINV",
    "FIXED",
    "FLOOR.PRECISE",
    "FORMULATEXT",
    "GAMMA",
    "GAMMALN",
    "GAMMALN.PRECISE",
    "GAUSS",
    "GESTEP",
    "GROWTH",
    "HEX2BIN",
    "HEX2DEC",
    "HEX2OCT",
    "HOUR",
    "HYPERLINK",
    "IMABS",
    "IMAGINARY",
    "IMARGUMENT",
    "IMCONJUGATE",
    "IMCOS",
    "IMCOSH",
    "IMCOT",
    "IMCSC",
    "IMCSCH",
    "IMEXP",
    "IMLN",
    "IMLOG10",
    "IMLOG2",
    "IMREAL",
    "IMSEC",
    "IMSECH",
    "IMSIN",
    "IMSINH",
    "IMSQRT",
    "IMTAN",
    "INDEX",
    "INFO",
    "INT",
    "IRR",
    "ISBLANK",
    "ISERR",
    "ISERROR",
    "ISEVEN",
    "ISFORMULA",
    "ISLOGICAL",
    "ISNA",
    "ISNONTEXT",
    "ISNUMBER",
    "ISODD",
    "ISREF",
    "ISTEXT",
    "ISO.CEILING",
    "ISOWEEKNUM",
    "JIS",
    "LEFT",
    "LEFTB",
    "LEN",
    "LENB",
    "LINEST",
    "LN",
    "LOG",
    "LOG10",
    "LOGEST",
    "LOWER",
    "MDETERM",
    "MEDIAN",
    "MINUTE",
    "MDETERM",
    "MDETERM",
    "MINVERSE",
    "MONTH",
    "MUNIT",
    "N",
    "NORMSDIST",
    "NORM.S.INV",
    "NORMSINV",
    "NOT",
    "NUMBERVALUE",
    "OCT2BIN",
    "OCT2DEC",
    "OCT2HEX",
    "ODD",
    "OR",
    "PHI",
    "PHONETIC",
    "PRODUCT",
    "PROPER",
    "RADIANS",
    "RIGHT",
    "RIGHTB",
    "ROMAN",
    "ROW",
    "ROWS",
    "SEC",
    "SECH",
    "SECOND",
    "SHEET",
    "SHEETS",
    "SIGN",
    "SIN",
    "SINH",
    "SKEW",
    "SKEW.P",
    "SQL.REQUEST",
    "SQRT",
    "SQRTPI",
    "STDEV",
    "STDEV.P",
    "STDEV.S",
    "STDEVA",
    "STDEVP",
    "STDEVPA",
    "SUMPRODUCT",
    "SUMSQ",
    "T",
    "TAN",
    "TANH",
    "TIMEVALUE",
    "TRANSPOSE",
    "TREND",
    "TRIM",
    "TRUNC",
    "TYPE",
    "UNICHAR",
    "UNICODE",
    "UPPER",
    "VALUE",
    "VAR",
    "VAR.P",
    "VAR.S",
    "VARA",
    "VARP",
    "VARPA",
    "WEBSERVICE",
    "WEEKDAY",
    "WEEKNUM",
    "XOR",
    "YEAR",
  ];

  const Arity2Names: string[] = [
    "ADDRESS",
    "ATAN2",
    "AVERAGEIF",
    "BASE",
    "BESSELI",
    "BESSELJ",
    "BESSELK",
    "BESSELY",
    "BIN2HEX",
    "BIN2OCT",
    "BITAND",
    "BITLSHIFT",
    "BITOR",
    "BITRSHIFT",
    "BITXOR",
    "CEILING",
    "CEILING.PRECISE",
    "CELL",
    "CHIDIST",
    "CHIINV",
    "CHITEST",
    "CHISQ.DIST.RT",
    "CHISQ.TEST",
    "COMBIN",
    "COMBINA",
    "COMPLEX",
    "COUNTIF",
    "COVAR",
    "COVARIANCE.P",
    "COVARIANCE.S",
    "CUBEMEMBER",
    "CUBERANKEDMEMBER",
    "CUBESET",
    "DATEVALUE",
    "DAYS",
    "DAYS360",
    "DEC2BIN",
    "DEC2HEX",
    "DEC2OCT",
    "DECIMAL",
    "DELTA",
    "DOLLAR",
    "DOLLARDE",
    "DOLLARFR",
    "EDATE",
    "EFFECT",
    "EOMONTH",
    "ERF",
    "EXACT",
    "F.DIST",
    "FILTERXML",
    "FIND",
    "FINDB",
    "FIXED",
    "FLOOR",
    "FLOOR.PRECISE",
    "FORECAST.ETS.SEASONALITY",
    "FREQUENCY",
    "F.TEST",
    "FTEST",
    "FVSCHEDULE",
    "GESTEP",
    "GROWTH",
    "HEX2BIN",
    "HEX2OCT",
    "HYPERLINK",
    "IF",
    "IFERROR",
    "IFNA",
    "IMDIV",
    "IMPOWER",
    "IMSUB",
    "INDEX",
    "INTERCEPT",
    "IRR",
    "ISO.CEILING",
    "LARGE",
    "LEFT",
    "LEFTB",
    "LINEST",
    "LOG",
    "LOGEST",
    "LOOKUP",
    "MATCH",
    "MEDIAN",
    "MMULT",
    "MOD",
    "MROUND",
    "NETWORKDAYS.INTL",
    "NETWORKDAYS",
    "NOMINAL",
    "NORM.S.DIST",
    "NPV",
    "NUMBERVALUE",
    "OCT2BIN",
    "OCT2DEC",
    "OCT2HEX",
    "ODDFPRICE",
    "OR",
    "PEARSON",
    "PERCENTILE.EXC",
    "PERCENTILE.INC",
    "PERCENTILE",
    "PERCENTRANK.EXC",
    "PERCENTRANK.INC",
    "PERCENTRANK",
    "PERMUT",
    "PERMUTATIONA",
    "POWER",
    "PROB",
    "PRODUCT",
    "QUARTILE",
    "QUARTILE.EXC",
    "QUARTILE.INC",
    "QUOTIENT",
    "RANDBETWEEN",
    "RANK.AVG",
    "RANK.EQ",
    "RANK",
    "REGISTER.ID",
    "REPT",
    "RIGHT",
    "RIGHTB",
    "ROMAN",
    "ROUND",
    "ROUNDDOWN",
    "ROUNDUP",
    "RSQ",
    "SEARCH",
    "SEARCHB",
    "SKEW",
    "SKEW.P",
    "SLOPE",
    "SMALL",
    "SQL.REQUEST",
    "STDEV",
    "STDEV.P",
    "STDEV.S",
    "STDEVA",
    "STDEVP",
    "STDEVPA",
    "STEYX",
    "SUBTOTAL",
    "SUMIF",
    "SUMPRODUCT",
    "SUMSQ",
    "SUMX2MY2",
    "SUMX2PY2",
    "SUMXMY2",
    "TBILLYIELD",
    "T.DIST.RT",
    "TEXT",
    "T.INV",
    "TINV",
    "T.INV.2T",
    "TREND",
    "TRIMMEAN",
    "TRUNC",
    "VAR",
    "VAR.P",
    "VAR.S",
    "VARA",
    "VARP",
    "VARPA",
    "WEEKDAY",
    "WEEKNUM",
    "WORKDAY",
    "WORKDAY.INTL",
    "XIRR",
    "XOR",
    "YEARFRAC",
    "ZTEST",
    "Z.TEST",
  ];

  const Arity3Names: string[] = [
    "ADDRESS",
    "AVERAGEIF",
    "BASE",
    "BETADIST",
    "BETAINV",
    "BETA.INV",
    "BINOM.DIST.RANGE",
    "BINOM.INV",
    "CEILING.MATH",
    "CHISQ.DIST",
    "COMPLEX",
    "CONFIDENCE",
    "CONFIDENCE.NORM",
    "CONFIDENCE.T",
    "CONVERT",
    "CORREL",
    "COUPDAYBS",
    "COUPDAYS",
    "COUPDAYSNC",
    "COUPNCD",
    "COUPNUM",
    "COUPPCD",
    "CRITBINOM",
    "CUBEKPIMEMBER",
    "CUBEMEMBER",
    "CUBEMEMBERPROPERTY",
    "CUBERANKEDMEMBER",
    "CUBESET",
    "DATE",
    "DATEDIF",
    "DAVERAGE",
    "DAYS360",
    "DCOUNT",
    "DCOUNTA",
    "DGET",
    "DMAX",
    "DMIN",
    "DPRODUCT",
    "DSTDEV",
    "DSTDEVP",
    "DSUM",
    "DVAR",
    "DVARP",
    "EXPON.DIST",
    "EXPONDIST",
    "FDIST",
    "F.DIST.RT",
    "FIND",
    "FINDB",
    "F.INV",
    "F.INV.RT",
    "FINV",
    "FIXED",
    "FLOOR.MATH",
    "FORECAST",
    "FORECAST.ETS",
    "FORECAST.ETS.SEASONALITY",
    "FORECAST.LINEAR",
    "FORECAST.ETS.CONFINT",
    "FORECAST.ETS.STAT",
    "FV",
    "GAMMA.INV",
    "GAMMAINV",
    "GROWTH",
    "HLOOKUP",
    "IF",
    "INDEX",
    "LINEST",
    "LOGEST",
    "LOGINV",
    "LOGNORMDIST",
    "LOGNORM.INV",
    "LOOKUP",
    "MATCH",
    "MEDIAN",
    "MIRR",
    "MID",
    "MIDB",
    "MULTINOMIAL",
    "NEGBINOMDIST",
    "NETWORKDAYS",
    "NETWORKDAYS.INTL",
    "NORM.INV",
    "NORMINV",
    "NPER",
    "NPV",
    "NUMBERVALUE",
    "OFFSET",
    "OR",
    "PDURATION",
    "PERCENTRANK.EXC",
    "PERCENTRANK.INC",
    "PERCENTRANK",
    "PMT",
    "POISSON.DIST",
    "POISSON",
    "PROB",
    "PRODUCT",
    "PV",
    "RANK.AVG",
    "RANK.EQ",
    "RANK",
    "RATE",
    "REGISTER.ID",
    "RRI",
    "RTD",
    "SEARCH",
    "SEARCHB",
    "SKEW",
    "SKEW.P",
    "SLN",
    "SQL.REQUEST",
    "STANDARDIZE",
    "STDEV",
    "STDEV.P",
    "STDEV.S",
    "STDEVA",
    "STDEVP",
    "STDEVPA",
    "SUBSTITUTE",
    "SUBTOTAL",
    "SUMIF",
    "SUMIFS",
    "SUMPRODUCT",
    "SUMSQ",
    "SWITCH",
    "TBILLEQ",
    "TBILLPRICE",
    "T.DIST",
    "TDIST",
    "T.DIST.2T",
    "TEXTJOIN",
    "TIME",
    "TREND",
    "VAR",
    "VAR.P",
    "VAR.S",
    "VARA",
    "VARP",
    "VARPA",
    "VLOOKUP",
    "WORKDAY",
    "WORKDAY.INTL",
    "XIRR",
    "XNPV",
    "XOR",
    "YEARFRAC",
    "ZTEST",
    "Z.TEST",
  ];

  const Arity4Names: string[] = [
    "ADDRESS",
    "ACCRINTM",
    "BETADIST",
    "BETA.DIST",
    "BETAINV",
    "BETA.INV",
    "BINOMDIST",
    "BINOM.DIST",
    "BINOM.DIST.RANGE",
    "COUPDAYBS",
    "COUPDAYS",
    "COUPDAYSNC",
    "COUPNCD",
    "COUPNUM",
    "COUPPCD",
    "CUBESET",
    "DB",
    "DDB",
    "DISC",
    "F.DIST",
    "FORECAST.ETS",
    "FORECAST.ETS.SEASONALITY",
    "FORECAST.ETS.CONFINT",
    "FORECAST.ETS.STAT",
    "FV",
    "GAMMA.DIST",
    "GAMMADIST",
    "GROWTH",
    "HLOOKUP",
    "HYPGEOMDIST",
    "INTRATE",
    "LINEST",
    "LOGEST",
    "LOGNORM.DIST",
    "MEDIAN",
    "IPMT",
    "ISPMT",
    "NEGBINOM.DIST",
    "NETWORKDAYS.INTL",
    "NORM.DIST",
    "NORMDIST",
    "NPER",
    "NPV",
    "OFFSET",
    "OR",
    "PMT",
    "PPMT",
    "PRICEDISC",
    "PRICEMAT",
    "PROB",
    "PRODUCT",
    "PV",
    "RATE",
    "RECEIVED",
    "REPLACE",
    "REPLACEB",
    "RTD",
    "SERIESSUM",
    "SKEW",
    "SKEW.P",
    "SQL.REQUEST",
    "STDEV",
    "STDEV.P",
    "STDEV.S",
    "STDEVA",
    "STDEVP",
    "STDEVPA",
    "SUBSTITUTE",
    "SUBTOTAL",
    "SUMPRODUCT",
    "SUMSQ",
    "SWITCH",
    "SYD",
    "TEXTJOIN",
    "TREND",
    "T.TEST",
    "TTEST",
    "VAR",
    "VAR.P",
    "VAR.S",
    "VARA",
    "VARP",
    "VARPA",
    "VLOOKUP",
    "WEIBULL",
    "WEIBULL.DIST",
    "WORKDAY.INTL",
    "XOR",
    "YIELDDISC",
  ];

  const Arity5Names = [
    "ADDRESS",
    "ACCRINTM",
    "BETADIST",
    "BETA.DIST",
    "BETAINV",
    "BETA.INV",
    "CUBESET",
    "DB",
    "DDB",
    "DISC",
    "DURATION",
    "EUROCONVERT",
    "FORECAST.ETS",
    "FORECAST.ETS.CONFINT",
    "FORECAST.ETS.STAT",
    "FV",
    "HYPGEOM.DIST",
    "INTRATE",
    "IPMT",
    "MEDIAN",
    "MDURATION",
    "MDURATION",
    "NPER",
    "NPV",
    "OFFSET",
    "OR",
    "PMT",
    "PPMT",
    "PRICEDISC",
    "PRICEMAT",
    "PRODUCT",
    "PV",
    "RATE",
    "RECEIVED",
    "RTD",
    "SKEW",
    "SKEW.P",
    "SQL.REQUEST",
    "STDEV",
    "STDEV.P",
    "STDEV.S",
    "STDEVA",
    "STDEVP",
    "STDEVPA",
    "SUBTOTAL",
    "SUMIFS",
    "SUMPRODUCT",
    "SUMSQ",
    "SWITCH",
    "TEXTJOIN",
    "VAR",
    "VAR.P",
    "VARA",
    "VARP",
    "VARPA",
    "VDB",
    "XOR",
    "YIELDDISC",
    "YIELDMAT",
  ];

  const Arity6Names: string[] = [
    "ACCRINT",
    "AMORDEGRC",
    "AMORLINC",
    "BETA.DIST",
    "CUMIPMT",
    "CUMPRINC",
    "DURATION",
    "FORECAST.ETS",
    "FORECAST.ETS.CONFINT",
    "FORECAST.ETS.STAT",
    "IPMT",
    "MEDIAN",
    "MDURATION",
    "MDURATION",
    "NPV",
    "OR",
    "PPMT",
    "PRICE",
    "PRODUCT",
    "RATE",
    "RTD",
    "SKEW",
    "SKEW.P",
    "STDEV",
    "STDEV.P",
    "STDEV.S",
    "STDEVA",
    "STDEVP",
    "STDEVPA",
    "SUBTOTAL",
    "SUMPRODUCT",
    "SUMSQ",
    "SWITCH",
    "TEXTJOIN",
    "VAR",
    "VAR.P",
    "VAR.S",
    "VARA",
    "VARP",
    "VARPA",
    "VDB",
    "XOR",
    "YIELD",
    "YIELDMAT",
  ];

  const Arity7Names: string[] = [
    "ACCRINT",
    "AMORDEGRC",
    "AMORLINC",
    "FORECAST.ETS.CONFINT",
    "MEDIAN",
    "MULTINOMIAL",
    "NPV",
    "ODDLPRICE",
    "ODDLYIELD",
    "OR",
    "PRICE",
    "PRODUCT",
    "RTD",
    "STDEV",
    "STDEV.P",
    "STDEV.S",
    "STDEVA",
    "STDEVP",
    "STDEVPA",
    "SUBTOTAL",
    "SUMIFS",
    "SUMPRODUCT",
    "SUMSQ",
    "SWITCH",
    "TEXTJOIN",
    "VAR",
    "VAR.P",
    "VAR.S",
    "VARA",
    "VARP",
    "VARPA",
    "VDB",
    "XOR",
    "YIELD",
  ];

  const Arity8Names: string[] = [
    "ACCRINT",
    "MEDIAN",
    "MULTINOMIAL",
    "NPV",
    "ODDFPRICE",
    "ODDFYIELD",
    "ODDLPRICE",
    "ODDLYIELD",
    "OR",
    "PRODUCT",
    "RTD",
    "STDEV",
    "STDEV.P",
    "STDEV.S",
    "STDEVA",
    "STDEVP",
    "STDEVPA",
    "SUBTOTAL",
    "SUMPRODUCT",
    "SUMSQ",
    "SWITCH",
    "TEXTJOIN",
    "VAR",
    "VAR.P",
    "VAR.S",
    "VARA",
    "VARP",
    "VARPA",
    "XOR",
  ];

  const Arity9Names: string[] = [
    "ACCRINT",
    "MEDIAN",
    "MULTINOMIAL",
    "NPV",
    "ODDFPRICE",
    "ODDFYIELD",
    "OR",
    "PRODUCT",
    "RTD",
    "STDEV",
    "STDEV.P",
    "STDEV.S",
    "STDEVA",
    "STDEVP",
    "STDEVPA",
    "SUBTOTAL",
    "SUMPRODUCT",
    "SUMSQ",
    "SWITCH",
    "VAR",
    "VAR.P",
    "VAR.S",
    "VARA",
    "VARP",
    "VARPA",
    "XOR",
  ];

  const ArityAtLeast1Names: string[] = [
    "AND",
    "AVEDEV",
    "AVERAGEA",
    "AVERAGE",
    "CALL",
    "CONCATENATE",
    "CONCAT",
    "COUNTA",
    "COUNT",
    "CUBEVALUE",
    "DEVSQ",
    "GCD",
    "GEOMEAN",
    "HARMEAN",
    "IMPRODUCT",
    "IMSUM",
    "KURT",
    "LCM",
    "MAXA",
    "MAX",
    "MINA",
    "MIN",
    "MODE.MULT",
    "MODE.SNGL",
    "MODE",
    "MULTINOMIAL",
  ];

  const ArityAtLeast2Names: string[] = [
    "CHOOSE",
    "COUNTIFS",
    "GETPIVOTDATA",
    "IFS",
  ];

  const ArityAtLeast3Names: string[] = [
    "AGGREGATE",
    "AVERAGEIFS",
    "MAXIFS",
    "MINIFS",
  ];

  const VarArgsNames: string[] = ["SUM"];

  /**
   * Parses function names that take no arguments.
   */
  export const arity0FunctionName = Util.strAlternatives(Arity0Names);

  /**
   * Parses function names that take one arguments.
   */
  export const arity1FunctionName = Util.strAlternatives(Arity1Names);

  /**
   * Parses function names that take two arguments.
   */
  export const arity2FunctionName = Util.strAlternatives(Arity2Names);

  /**
   * Parses function names that take three arguments.
   */
  export const arity3FunctionName = Util.strAlternatives(Arity3Names);

  /**
   * Parses function names that take four arguments.
   */
  export const arity4FunctionName = Util.strAlternatives(Arity4Names);

  /**
   * Parses function names that take five arguments.
   */
  export const arity5FunctionName = Util.strAlternatives(Arity5Names);

  /**
   * Parses function names that take six arguments.
   */
  export const arity6FunctionName = Util.strAlternatives(Arity6Names);

  /**
   * Parses function names that take seven arguments.
   */
  export const arity7FunctionName = Util.strAlternatives(Arity7Names);

  /**
   * Parses function names that take eight arguments.
   */
  export const arity8FunctionName = Util.strAlternatives(Arity8Names);

  /**
   * Parses function names that take nine arguments.
   */
  export const arity9FunctionName = Util.strAlternatives(Arity9Names);

  /**
   * Parses function names that take at least one argument.
   */
  export const arityAtLeast1FunctionName = Util.strAlternatives(
    ArityAtLeast1Names
  );

  /**
   * Parses function names that take at least two arguments.
   */
  export const arityAtLeast2FunctionName = Util.strAlternatives(
    ArityAtLeast2Names
  );

  /**
   * Parses function names that take at least three arguments.
   */
  export const arityAtLeast3FunctionName = Util.strAlternatives(
    ArityAtLeast3Names
  );

  /**
   * Parses function names that take any number of arguments.
   */
  export const varArgsFunctionName = Util.strAlternatives(VarArgsNames);

  /**
   * Fails if any reserved word is encountered, succeeds otherwise.
   * Never consumes input.
   */
  export const reservedWord: P.IParser<AST.ReferenceExpr> = P.fail(
    // the poison pill generic type parameter
    // is purely so that this parser returns
    // a type that is a "reference".
    P.pipe<CU.CharStream, AST.PoisonPill>(
      P.choices(
        arity0FunctionName,
        arity1FunctionName,
        arity2FunctionName,
        arity3FunctionName,
        arity4FunctionName,
        arity5FunctionName,
        arity6FunctionName,
        arity7FunctionName,
        arity8FunctionName,
        arity9FunctionName,
        arityAtLeast1FunctionName,
        arityAtLeast2FunctionName,
        arityAtLeast3FunctionName,
        varArgsFunctionName
      )
    )((cs) => new AST.PoisonPill(PP.EnvStub))
  )("Cannot parse a reserved word.") as P.IParser<AST.ReferenceExpr>;

  /**
   * An array of all fixed-arity function parsers, indexed by arity.
   */
  export const arityNNameArray: P.IParser<CU.CharStream>[] = [
    arity0FunctionName,
    arity1FunctionName,
    arity2FunctionName,
    arity3FunctionName,
    arity4FunctionName,
    arity5FunctionName,
    arity6FunctionName,
    arity7FunctionName,
    arity8FunctionName,
    arity9FunctionName,
  ];

  /**
   * An array of all "at least"-arity function parsers, indexed by minimum arity.
   */
  export const arityAtLeastNNameArray: P.IParser<CU.CharStream>[] = [
    // NOTE: "ArityAtLeast0" is just VarArgs
    arityAtLeast1FunctionName,
    arityAtLeast2FunctionName,
    arityAtLeast3FunctionName,
  ];

  /**
   * Returns a function name parser for all functions of fixed arity n.
   * @param n Arity.
   */
  export function arityNName(n: number): P.IParser<CU.CharStream> {
    return arityNNameArray[n];
  }

  /**
   * Returns a function name parser for all functions of at least arity n.
   * @param n Arity.
   */
  export function arityAtLeastNName(n: number): P.IParser<CU.CharStream> {
    return arityAtLeastNNameArray[n - 1];
  }
}
