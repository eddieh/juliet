if (typeof(process) !== 'undefined' && process.argv) {
  // save arguments in Node.js
  scriptArgs = process.argv;
}

if (typeof(arguments) !== 'undefined') {
  if (typeof(scriptArgs) === 'undefined') {
    // save arguments in V8
    scriptArgs = arguments;
  }
}

if (typeof(print) === 'undefined') {
  if (typeof(console) !== 'undefined' && console.log) {
    print = console.log;
  }
}

log = print;

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
    readFile = function(filename) {
      var fs = nodeRequire('fs');
      return fs.readFileSync(filename, 'utf8');
    };
  } else {
    try {
      readFile = function(filename) {
        var fs = require('fs');
        return fs.readFileSync(filename, 'utf8');
      };
    } catch (e) {
    }
  }
}

if (typeof(readFile) === 'undefined') {
  print('Could not find a suitable readFile function.');
  quit();
}
