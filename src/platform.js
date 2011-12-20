/*
  Copyright 2011 James Dean Palmer, Eddie Hillenbrand

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/


if (typeof(arguments) === 'undefined') {
  if (typeof(scriptArgs) !== 'undefined') {
    // save arguments in spidermonkey
    arguments = scriptArgs;
  }
}

if (typeof(process) !== 'undefined' && process.argv) {
  // save arguments in Node.js
  arguments = process.argv;
}

if (typeof(print) === 'undefined') {
  if (typeof(console) !== 'undefined' && console.log) {
    print = console.log;
  }
}

if (typeof(quit) === 'undefined') {
  if (typeof(process) !== 'undefined' && process.exit) {
    quit = process.exit;
  }
}

// save native read function
if (typeof(readFile) === 'undefined') {
  if (typeof(read) !== 'undefined') {
    readFile = read;
  } else if (typeof(nodeRequire) !== 'undefined') {
    // could be Node.js
    readFile = function (filename) {
      var fs = nodeRequire('fs');
      return fs.readFileSync(filename, 'utf8');
    }
  }
}

if (typeof(readFile) === 'undefined') {
  print('Could not find a suitable readFile function.');
  quit();
}
