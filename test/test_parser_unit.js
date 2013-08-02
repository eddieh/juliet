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

(function() {
  var tests = [
    ['class Empty {}',
     {
       package: [{
         name: '$default',
         token: null,
         kind: 'id'
       }],
       imports: [],
       types: [
         {
           token: Juliet.TOKEN_CLASS,
           kind: 'definition',
           modifiers: 34,
           members: [],
           types: [],
           interfaces: [],
           superclass: null,
           name: 'Empty'
         }
       ]
     }
    ],
    ['package foo.bar;\n' +
     'class Empty {}',
     {
       package: [{
         name: 'foo',
         token: Juliet.TOKEN_ID,
         kind: 'id'
       }, {
         name: 'bar',
         token: Juliet.TOKEN_ID,
         kind: 'id'
       }],
       imports: [],
       types: [
         {
           token: Juliet.TOKEN_CLASS,
           kind: 'definition',
           modifiers: 34,
           members: [],
           types: [],
           interfaces: [],
           superclass: null,
           name: 'Empty'
         }
       ]
     }
    ],
    ['import foo.bar.MyClass;\n' +
     'class Empty {}',
     {
       package: [{
         name: '$default',
         token: null,
         kind: 'id'
       }],
       imports: [
         {
           token: Juliet.TOKEN_IMPORT,
           kind: 'import',
           name: [
             {
               token: Juliet.TOKEN_ID,
               kind: 'id',
               name: 'foo'
             },
             {
               token: Juliet.TOKEN_ID,
               kind: 'id',
               name: 'bar'
             },
             {
               token: Juliet.TOKEN_ID,
               kind: 'id',
               name: 'MyClass'
             }
           ]
         }
       ],
       types: [
         {
           token: Juliet.TOKEN_CLASS,
           kind: 'definition',
           modifiers: 34,
           members: [],
           types: [],
           interfaces: [],
           superclass: null,
           name: 'Empty'
         }
       ]
     }
    ],
    ['package a.b;' +
     'import foo.bar.MyClass;\n' +
     'class Empty {}',
     {
       package: [
         {
           token: Juliet.TOKEN_ID,
           kind: 'id',
           name: 'a'
         },
         {
           token: Juliet.TOKEN_ID,
           kind: 'id',
           name: 'b'
         }],
       imports: [
         {
           token: Juliet.TOKEN_IMPORT,
           kind: 'import',
           name: [
             {
               token: Juliet.TOKEN_ID,
               kind: 'id',
               name: 'foo'
             },
             {
               token: Juliet.TOKEN_ID,
               kind: 'id',
               name: 'bar'
             },
             {
               token: Juliet.TOKEN_ID,
               kind: 'id',
               name: 'MyClass'
             }
           ]
         }
       ],
       types: [
         {
           token: Juliet.TOKEN_CLASS,
           kind: 'definition',
           modifiers: 34,
           members: [],
           types: [],
           interfaces: [],
           superclass: null,
           name: 'Empty'
         }
       ]
     }
    ]
  ];

  print('BEGIN TESTS');
  print('');

  var pass_count = 0;
  var fail_count = 0;
  for (i in tests) {
    var t = tests[i];
    print('Testing the parsing of ' + t[0]);

    Juliet.lexer.init();
    Juliet.parser.init();

    Juliet.source = t[0];

    stm = Juliet.parser.parse();

    if (Juliet.util.equal(stm, t[1])) {
      print('Passed.');
      pass_count++;
    } else {
      print('Expected: ');
      Juliet.util.print_ast(t[1]);

      print('Actual: ');
      Juliet.util.print_ast(stm);

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
