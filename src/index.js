/*
 * index.js - convert a nodeunit-based unit test file to a jest-based one
 *
 * Copyright © 2023 JEDLSoft
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import fs from 'fs';

if (process.argv.length < 2) {
    console.log("Error: no unit test file specified.");
    process.exit(1);
}

const fileName = process.argv[2];
let old = true;
const outputFileName = fileName.replaceAll(/test(\w+)\.js$/g, "$1.test.js");

if (process.argv.length === 4 && process.argv[3] === "modern") {
    old = false;
}

if (!fs.existsSync(fileName)) {
    console.log(`Error: could not access file ${fileName}.`);
    process.exit(1);
}

let contents = fs.readFileSync(fileName, "utf-8");

const regexps = [
    {
       search: /test([A-Z]\S*): function\(test\)\s*\{/g,
       replaceModern: 'test("$1", () => {',
       replaceOld: 'test("$1", function() {'
    },
    {
       search: /test\.ok\((.*)\);/g,
       replaceModern: "expect($1).toBeTruthy();",
       replaceOld: "expect($1).toBeTruthy();",
    },
    {
       search: /test\.equal\((.*),\s+([^)]*)\)/g,
       replaceModern: "expect($1).toBe($2)",
       replaceOld: "expect($1).toBe($2)"
    },
    {
       search: /test\.deepEqual\((.*),\s+([^)]*)\)/g,
       replaceModern: "expect($1).toStrictEqual($2)",
       replaceOld: "expect($1).toStrictEqual($2)"
    },
    {
       search: /test\.roughlyEqual\((.*),\s+([^,]*),\s+([^)]*)\)/g,
       replaceModern: "expect($1).toBeCloseTo($2, $3)",
       replaceOld: "expect($1).toBeCloseTo($2, $3)"
    },
    {
       search: /test\.equalIgnoringOrder\((.*),\s+([^)]*)\)/g,
       replaceModern: "expect($1).toEqual($2)",
       replaceOld: "expect($1).toEqual($2)"
    }, // TODO: need to figure this out
    {
       search: /test\.expect\(([0-9]*)\)/g,
       replaceModern: "expect.assertions($1)",
       replaceOld: "expect.assertions($1)"
    },
    {
       search: /\s+test\.done\(\);/g,
       replaceModern: "",
       replaceOld: ""
    },
    {
       search: /\n    \},?\n/g,
       replaceModern: "\n    });\n",
       replaceOld: "\n    });\n"
    },
    {
       search: /\n\};/g,
       replaceModern: "\n});",
       replaceOld: "\n});"
    },
    {
       search: /module\.exports\.([^ ]*)\s=\s\{/g,
       replaceModern: 'describe("$1", () => {',
       replaceOld: 'describe("$1", function() {'
    },
    {
       search: /test.throws\(function\(\)\s*\{/g,
       replaceModern: "expect(() => { // TODO add .toThrow() below",
       replaceOld: "expect(function() { // TODO add .toThrow() below"
    },
    {
       search: /test(\w+)\.js/g,
       replaceModern: "$1.test.js",
       replaceOld: "$1.test.js"
    },
    {
       search: /\s+\n/g,
       replaceModern: "\n",
       replaceOld: "\n"
    },
    {
       search: /Copyright \(c\)/g,
       replaceModern: "Copyright ©",
       replaceOld: "Copyright ©"
    },
    {
       search: /Copyright © ([0-9\-, ]*)2022,? /g,
       replaceModern: "Copyright © $1 2022-2023",
       replaceOld: "Copyright © $1 2022-2023 "
    },
    {
       search: /Copyright © ([0-9\-, ]*)(202[01]),? /g,
       replaceModern: "Copyright © $1$2, 2023 ",
       replaceOld: "Copyright © $1$2, 2023 "
    },
    {
       search: /Copyright © ([0-9\-, ]*)(201\d),? /g,
       replaceModern: "Copyright © $1$2, 2023 ",
       replaceOld: "Copyright © $1$2, 2023 "
    }
];

for (let i = 0; i < regexps.length; i++) {
    const snr = regexps[i];
    const replacement = old ? snr.replaceOld : snr.replaceModern;

    contents = contents.replaceAll(snr.search, replacement); 
}

fs.writeFileSync(outputFileName, contents, "utf-8");

console.log(`Done. Output written to ${outputFileName}`);
