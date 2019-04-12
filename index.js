#!/usr/bin/env node

const xlsx = require("node-xlsx");
const argv = require("minimist")(process.argv.slice(2));
const path = require("path");
const fs = require("fs");

// input is a xlsx file to be be parsed
let input = argv.input || argv.i;
let columns = argv.columns || argv.c;
let outdir = argv.outdir || argv.o;
let help = argv.help || argv.h;
let sheet = argv.sheet || argv.s;

// addToErrorQueue(argv);
q = [];
function addToErrorQueue(...args) {
  q = q.concat(args);
}

function processErrorQueueAndExit() {
  if (q.length > 0) {
    q.unshift(helpstr);
    console.log(q.join("\n"));
    process.exit(0);
  }
}

let helpstr = `
====================================================================================================================

Translations extractor

This is a simple utility for extracting translations from excel worksheets to be used in applications that
utilize language-named translation JSON files. 

usage: --outdir ./some-dir --columns key:0,en:1 --input 'translations_master.xlsx' --sheet someTab

This will retrieve the file at translate.json, extract the columns 0 and 1, using the 0 as the translation keys.
The translations will then be extracted into a separate JSON file named en.json, and saved in the outdir directory.

|key        |en                   |
|BUTTON_TEXT|Super special action!|
|FOO_BAR    |Foo bar baz          |

=>

{
  "BUTTON_TEXT": "Super special action!",
  "FOO_BAR": "Foo bar baz"
}

====================================================================================================================

 options:
 --help/-h:     show this message
 --input/-i:    (mandatory) the file to extract translations from
 --outdir/-o:   (mandatory) the directory to store the extracted JSON files in
 --columns/-c:  (mandatory) the columns to extract, and their column position: key is mandatory.
 --sheet/-s:    (mandatory) the worksheet tab name to use
 `;

if (help) {
  addToErrorQueue(helpstr);
}

if (!sheet) {
  addToErrorQueue(
    `--sheet/-s missing: the correct worksheet tab must be specified`
  );
}

if (!outdir) {
  addToErrorQueue(`--outdir/-o must be specified`);
}

if (!columns) {
  addToErrorQueue(
    "--columns/-c must be specified ( format: <name>:<colindex>,<name2>:<colindex2> )"
  );
}

if (!input) {
  addToErrorQueue(`--input/-i must be specified`);
}

// process any found issues until now, and exit
processErrorQueueAndExit();

// read the file into a buffer
let buf = fs.readFileSync(path.resolve(input));

// parse a worksheet from the buffer
const workSheetsFromFile = xlsx.parse(buf);

let webui = workSheetsFromFile.find(x => x.name === sheet);

if (!webui) {
  addToErrorQueue(
    `worksheet tab with the name ${sheet} not found in file ${input}, \
    \nfile contains tabs [${workSheetsFromFile.map(x => x.name).join(",")}]`
  );
  processErrorQueueAndExit();
}

columns = columns.split(",").reduce((acc, pair) => {
  acc[pair.split(":")[0]] = pair.split(":")[1];
  return acc;
}, {});

if (!columns.key || columns.length < 2) {
  addToErrorQueue(
    `columns must contain at least 'key:<number>' and one other column to extract`
  );
}

cols = columns;

columnsToExtract = Object.keys(columns);

/**
  allow default value
*/
let extractValue = (arr, column, def) => {
  if (arr[cols[column]] !== undefined && arr[cols[column]] !== null) {
    return arr[cols[column]];
  } else {
    return def;
  }
};

let splitFormat = webui.data.map(arr => {
  return columnsToExtract.reduce((acc, col) => {
    acc[col] = extractValue(arr, col, "").trim();
    return acc;
  }, {});
});
let reduced = splitFormat.reduce((acc, obj) => {
  let colKeys = Object.keys(obj).filter(x => x !== "key");
  colKeys.forEach(colKey => {
    if (!acc[colKey]) acc[colKey] = {};
    acc[colKey][obj.key] = obj[colKey];
  });
  return acc;
}, {});
Object.keys(reduced).forEach(lang => {
  let str = JSON.stringify(reduced[lang], null, 2);
  fs.writeFileSync(path.resolve(outdir, `${lang}.json`), str);
});
