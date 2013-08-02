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

load('src/platform.js');
load('src/juliet.js');
load('src/util.js');
load('src/lexer.js');
load('src/parser.js');
load('src/compiler.js');

var forEach = Juliet.util.forEach;

function filter(obj) {
  if (obj == null) return;
  if (Juliet.util.isString(obj)) return;
  if (Juliet.util.isNumber(obj)) return;

  if ('parameters' in obj) {
    var new_parameters = [];
    forEach(obj.parameters, function(p) {
      new_parameters.push('[object name: ' + p.name + ']');
    });
    obj.parameters = new_parameters;
  }
  if ('type' in obj) {
    obj.type = '[object name: ' + obj.type.name + ']';
  }
  if ('superclass' in obj) {
    obj.superclass = '[object name: ' + obj.superclass.name + ']';
  }
  forEach(obj, function(prop) {
    filter(prop);
  });
}


(function() {
  var tests = [
    ['class Empty {' +
     ' public int xf;' +
     '}',
     function() { return Juliet.packages.$default.$types.Empty.members; },
     {
       _I8$default5Empty2xf: {
         name: 'xf',
         kind: 'field',
         mname: '_Z_I8$default5Empty2xf',
         type: '[object name: int]',
         modifiers: 1
       }
     }],
    ['class Empty {' +
     ' public int xf;' +
     ' public int a() { return 0; }' +
     '}',
     function() { return Juliet.packages.$default.$types.Empty.members; },
     {
       _I8$default5Empty2xf: {
         name: 'xf',
         kind: 'field',
         mname: '_Z_I8$default5Empty2xf',
         type: '[object name: int]',
         modifiers: 1
       },
       _I8$default5Empty1a: [
         '_I8$default5Empty1a4void'
       ],
       _I8$default5Empty1a4void: {
         kind: 'method',
         name: 'a',
         type: '[object name: int]',
         parameters: [
         ]
       }
     }],
    ['class Empty {' +
     ' public int xf;' +
     ' public int a(int x, int y, Object z) { return 0; }' +
     '}',
     function() { return Juliet.packages.$default.$types.Empty.members; },
     {
       _I8$default5Empty2xf: {
         name: 'xf',
         kind: 'field',
         mname: '_Z_I8$default5Empty2xf',
         type: '[object name: int]',
         modifiers: 1
       },
       _I8$default5Empty1a: [
         '_I8$default5Empty1a3int3int16java$lang$Object'
       ],
       _I8$default5Empty1a3int3int16java$lang$Object: {
         kind: 'method',
         name: 'a',
         type: '[object name: int]',
         parameters: [
           '[object name: int]',
           '[object name: int]',
           '[object name: Object]'
         ]
       }
     }],
    ['class Empty {' +
     ' public Empty identity(Empty n) { return this; }' +
     '}',
     function() { return Juliet.packages.$default.$types.Empty.members; },
     {
       _I8$default5Empty8identity: [
         '_I8$default5Empty8identity14$default$Empty'
       ],
       _I8$default5Empty8identity14$default$Empty: {
         kind: 'method',
         name: 'identity',
         type: '[object name: Empty]',
         parameters: [
           '[object name: Empty]'
         ]
       }
     }],
    ['class Empty extends Object {' +
     '}',
     function() { return {
       superclass: Juliet.packages.$default.$types.Empty.superclass
     }; },
     {
       superclass: '[object name: Object]'
     }],
    ['class Empty {' +
     '}',
     function() { return {
       superclass: Juliet.packages.$default.$types.Empty.superclass
     }; },
     {
       superclass: '[object name: Object]'
     }],
    ['class Empty {' +
     '  public Empty() {}' +
     '}',
     function() { return Juliet.packages.$default.$types.Empty.members; },
     {
       _I8$default5Empty5Empty: [
         '_I8$default5Empty5Empty4void'
       ],
       _I8$default5Empty5Empty4void: {
         kind: 'method',
         name: 'Empty',
         type: '[object name: void]',
         parameters: [
         ]
       }
     }]
  ];

  print('BEGIN TESTS');
  print('');

  var pass_count = 0;
  var fail_count = 0;
  for (i in tests) {
    var t = tests[i];
    print('Testing the RTTI for ' + t[0]);

    Juliet.lexer.init();
    Juliet.parser.init();
    Juliet.compiler.init();

    Juliet.source = t[0];

    var unit = Juliet.parser.parse();
    Juliet.compiler.prepare(unit);
    Juliet.compiler.generateRTTI();

    result = t[1]();
    filter(result);
    //filter(t[2]);

    if (Juliet.util.equal(result, t[2])) {
      print('Passed.');
      pass_count++;
    } else {
      print('Expected: ');
      Juliet.util.print_ast(t[2]);

      print('Actual: ');
      Juliet.util.print_ast(result);

      print('FAILED.');
      fail_count++;
      break;
    }

    print('');
  }

  print('SUMMARY');
  print('=======');
  print('Passed ' + pass_count + ' tests.');
  print('Failed ' + fail_count + ' tests.');
  print('END TESTS');

})();
