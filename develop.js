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
  load('src/platform.js');
  load('src/juliet.js');
  load('src/util.js');
  load('src/lexer.js');
  load('src/parser.js');
  load('src/compiler.js');
  load('src/runtime.js');
  load('src/stdlib.js');
  load('src/cli.js');
} else {
  include('src/juliet.js');
  include('src/util.js');
  include('src/lexer.js');
  include('src/parser.js');
  include('src/compiler.js');
  include('src/runtime.js');
  include('src/stdlib.js');
  include('src/browser.js');
}
