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

if (typeof(load) === 'undefined') {
  if (typeof(require) !== 'undefined') {
    nodeRequire = require;
    load = function(filename) {
      var fs = require('fs');
      var script = fs.readFileSync(filename, 'utf8');
      var evalGlobal = eval.bind(this);
      evalGlobal(script);
    };
  }
}

if (typeof(load) !== 'undefined') {
  load('src/util.js');
  load('src/platform.js');
  load('src/lexer.js');
  load('src/parser.js');
  load('src/compiler.js');
  load('src/runtime.js');
  load('src/stdlib.js');
  load('src/runner.js');
  load('src/main.js');
} else {
  include('src/util.js');
  include('src/lexer.js');
  include('src/parser.js');
  include('src/compiler.js');
  include('src/runtime.js');
  include('src/stdlib.js');
  include('src/runner.js');
}
