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

Juliet.options.trace = true;

var test_parse_types = function () {
  var tests = [
    ['class Empty {}', 
     {
       token: Juliet.TOKEN_CLASS, 
       kind:'definition', 
       modifiers:34, 
       members:[
       ], 
       _implements:[
       ], 
       _extends:null, 
       types: [],
       name:'Empty'
     }
    ],
    ['class Test {' +
     '  Test () {' +
     '    Object obj = "Works";' +
     '    String str = (String)obj;' +
     '    println(str);' +
     '  }' +
     '}', 
     {
       token: Juliet.TOKEN_CLASS,
       kind: 'definition',
       modifiers: Juliet.MODIFIER_CLASS | Juliet.MODIFIER_PROTECTED,
       name: 'Test',
       members: [
         {
           token: Juliet.TOKEN_ID,
           kind: 'method',
           modifiers: Juliet.MODIFIER_CONSTRUCTOR,
           return_type: null,
           name: 'Test',
           parameters: [],
           block:[
             {
               token: Juliet.TOKEN_ID,
               kind: 'local',
               type:{token: Juliet.TOKEN_ID, name:'Object', kind: 'type'},
               name:'obj',
               initial_value:{token:Juliet.LITERAL_STRING, kind: 'literal', value:'Works'}
             },
             {
               name:'str',
               token: Juliet.TOKEN_ID,
               kind: 'local',
               type: {
                 token: Juliet.TOKEN_STRING,
                 name:'String',
                 kind: 'type'
               },
               initial_value:{
                 token: Juliet.TOKEN_LPAREN,
                 kind: 'cast',
                 operand:{token: Juliet.TOKEN_ID, name:'obj', kind: 'construct'},
                 to_type:{token: Juliet.TOKEN_STRING, name:'String', kind: 'type'}
               }
             },
             {
               token: Juliet.TOKEN_LPAREN,
               kind: 'call',
               operand: {
                 token: Juliet.TOKEN_ID,
                 kind: 'construct',
                 name:'println',
               },
               args:[
                 {token: Juliet.TOKEN_ID, name:'str', kind: 'construct'}
               ]
             }]}],
       _implements: [],
       _extends: null,
       types: []
       }
     ],
    ['class Test {' +
     '  public class A {' +
     '    public A () {;}' +
     '  }' +
     '}', 
     {
       token: Juliet.TOKEN_CLASS,
       modifiers:Juliet.MODIFIER_CLASS | Juliet.MODIFIER_PROTECTED,
       name:'Test',
       kind: 'definition',
       _implements: [],
       _extends: null,
       members: [],
       types: [{
         token: Juliet.TOKEN_CLASS,
         modifiers:Juliet.MODIFIER_CLASS | Juliet.MODIFIER_PUBLIC,
         name:'A',
       kind: 'definition',
       _implements: [],
       _extends: null,
         types: [],
         members: [
           {
             token:Juliet.TOKEN_ID, 
             name:'A', 
             kind:'method', 
             modifiers:257, 
             return_type:null, 
             parameters:[
             ], 
             block:[
               {
                 token:Juliet.TOKEN_SEMICOLON, 
                 kind:'noop'
               }
             ]
           }
         ]}]}],
    ['class Test {\n' +
     '  Test ()\n' +
     '  {\n' +
     '    Object obj = "Works";\n' +
     '    String st = (String) obj;\n' +
     '    println( st );\n' +
     '  }\n' +
     '\n' +
     '  public class A {\n' +
     '    public A () {;}\n' +
     '  }\n' +
     '\n' +
     '  public class B {\n' +
     '    public B () {;}\n' +
     '    public A something () {\n' +
     '      if (true) {return null;}\n' +
     '      return (A) new A ();\n' +
     '    }\n' +
     '  }\n' +
     '}', 

{
  token: Juliet.TOKEN_CLASS, 
  kind:'definition', 
  modifiers:34, 
  members:[
    {
      token: Juliet.TOKEN_ID, 
      name:'Test', 
      kind:'method', 
      modifiers:256, 
      return_type:null, 
      parameters:[
      ], 
      block:[
        {
          token: Juliet.TOKEN_ID, 
          name:'obj', 
          initial_value:{
            token: Juliet.LITERAL_STRING, 
            kind:'literal', 
            value:'Works'
          }, 
          kind:'local', 
          type:{
            token: Juliet.TOKEN_ID, 
            kind:'type', 
            name:'Object'
          }
        }, 
        {
          token: Juliet.TOKEN_ID, 
          name:'st', 
          initial_value:{
            token: Juliet.TOKEN_LPAREN, 
            kind:'cast', 
            operand:{
              token: Juliet.TOKEN_ID, 
              kind:'construct', 
              name:'obj'
            }, 
            to_type:{
              token: Juliet.TOKEN_STRING, 
              kind:'type', 
              name:'String'
            }
          }, 
          kind:'local', 
          type:{
            token: Juliet.TOKEN_STRING, 
            kind:'type', 
            name:'String'
          }
        }, 
        {
          token: Juliet.TOKEN_LPAREN, 
          kind:'call', 
          operand:{
            token: Juliet.TOKEN_ID, 
            kind:'construct', 
            name:'println'
          }, 
          args:[
            {
              token: Juliet.TOKEN_ID, 
              kind:'construct', 
              name:'st'
            }
          ]
        }
      ]
    }
  ], 
  types:[
    {
      token: Juliet.TOKEN_CLASS, 
      kind:'definition', 
      modifiers:33, 
      members:[
        {
          token: Juliet.TOKEN_ID, 
          name:'A', 
          kind:'method', 
          modifiers:257, 
          return_type:null, 
          parameters:[
          ], 
          block:[
            {
              token: Juliet.TOKEN_SEMICOLON, 
              kind:'noop'
            }
          ]
        }
      ], 
      types:[
      ], 
      _implements:[
      ], 
      _extends:null, 
      name:'A'
    }, 
    {
      token: Juliet.TOKEN_CLASS, 
      kind:'definition', 
      modifiers:33, 
      members:[
        {
          token: Juliet.TOKEN_ID, 
          name:'B', 
          kind:'method', 
          modifiers:257, 
          return_type:null, 
          parameters:[
          ], 
          block:[
            {
              token: Juliet.TOKEN_SEMICOLON, 
              kind:'noop'
            }
          ]
        }, 
        {
          name:'something', 
          token: Juliet.TOKEN_ID, 
          return_type:{
            token: Juliet.TOKEN_ID, 
            kind:'type', 
            name:'A'
          }, 
          kind:'method', 
          parameters:[
          ], 
          block:[
            {
              token: Juliet.TOKEN_IF, 
              kind:'if', 
              expression:{
                token: Juliet.LITERAL_BOOLEAN, 
                kind:'literal', 
                value:true
              }, 
              body:{
                kind:'block', 
                statements:[
                  {
                    token: Juliet.TOKEN_RETURN, 
                    kind:'return', 
                    expression:{
                      token: Juliet.TOKEN_NULL, 
                      kind:'literal', 
                      value:'null'
                    }
                  }
                ]
              }
            }, 
            {
              token: Juliet.TOKEN_RETURN, 
              kind:'return', 
              expression:{
                token: Juliet.TOKEN_LPAREN, 
                kind:'cast', 
                operand:{
                  token: Juliet.TOKEN_NEW, 
                  kind:'new', 
                  type:{
                    token: Juliet.TOKEN_ID, 
                    kind:'type', 
                    name:'A'
                  }, 
                  args:[
                  ]
                }, 
                to_type:{
                  token: Juliet.TOKEN_ID, 
                  kind:'type', 
                  name:'A'
                }
              }
            }
          ], 
          modifiers:1
        }
      ], 
      types:[
      ], 
      _implements:[
      ], 
      _extends:null, 
      name:'B'
    }
  ], 
  _implements:[
  ], 
  _extends:null, 
  name:'Test'
}
],
    ['class Outer<T> {\n' +
     '  T t;\n' +
     '  class Inner {\n' +
     '    T setOuterT(T t1) {t = t1;return t;}\n' +
     '  }\n' +
     '}', 
{
  token: Juliet.TOKEN_CLASS, 
  kind:'definition', 
  modifiers:34, 
  members:[
    {
      token: Juliet.TOKEN_ID, 
      name:'t', 
      initial_value:null, 
      kind:'field', 
      modifiers:0
    }
  ], 
  types:[
    {
      token: Juliet.TOKEN_CLASS, 
      kind:'definition', 
      modifiers:32, 
      members:[
        {
          name:'setOuterT', 
          token: Juliet.TOKEN_ID, 
          return_type:{
            token: Juliet.TOKEN_ID, 
            kind:'type', 
            name:'T'
          }, 
          kind:'method', 
          parameters:[
            {
              token: Juliet.TOKEN_ID, 
              kind:'parameter', 
              type:{
                token: Juliet.TOKEN_ID, 
                kind:'type', 
                name:'T'
              }, 
              name:'t1'
            }
          ], 
          block:[
            {
              token: Juliet.TOKEN_ASSIGN, 
              kind:'assignment', 
              location:{
                token: Juliet.TOKEN_ID, 
                kind:'construct', 
                name:'t'
              }, 
              new_value:{
                token: Juliet.TOKEN_ID, 
                kind:'construct', 
                name:'t1'
              }
            }, 
            {
              token: Juliet.TOKEN_RETURN, 
              kind:'return', 
              expression:{
                token: Juliet.TOKEN_ID, 
                kind:'construct', 
                name:'t'
              }
            }
          ], 
          modifiers:0
        }
      ], 
      types:[
      ], 
      _implements:[
      ], 
      _extends:null, 
      name:'Inner'
    }
  ], 
  _implements:[
  ], 
  _extends:null, 
  name:'Outer', 
  parameters:[
    {
      token: Juliet.TOKEN_ID, 
      kind:'construct', 
      name:'T'
    }
  ]
}
    ],
    ['/* Test class with comments */\n' +
     '/* 1\n' +
     '   2\n' +
     '*/\n' +
      'class Empty {\n' +
      '  // single-line comment\n' +
      '  /* multi-line comment */\n' +
     '}', 
     {
       token: Juliet.TOKEN_CLASS, 
       kind:'definition', 
       modifiers:34, 
       members:[
       ], 
       types:[
       ], 
       _implements:[
       ], 
       _extends:null, 
       name:'Empty'
     }]
/*,
    ['package java.lang;', {
      parsed_types:[
      ],
      'package':{
        token: Juliet.TOKEN_PACKAGE,
        name:'java.lang'
      }
    }],
    ['package java.lang;\n' +
     'import java.io;\n' +
     'import java.error.*;', {
       parsed_types:[
       ],
       'package':{
         token: Juliet.TOKEN_PACKAGE,
         name:'java.lang'
       },
       imports:[
         {
           token: Juliet.TOKEN_IMPORT,
           name:'java.io'
         },
         {
           token: Juliet.TOKEN_IMPORT,
           name:'java.error.*'
         }
       ]
     }],
    ['import java.io;\n' +
     'class Empty {}', {
      parsed_types:[{
        token: Juliet.TOKEN_CLASS,
        modifiers:Juliet.MODIFIER_CLASS | Juliet.MODIFIER_PROTECTED,
        name:'Empty',
        static_initializers:[{
          token: Juliet.TOKEN_CLASS,
          modifiers:Juliet.MODIFIER_STATIC,
          // TODO: type_context:,
          return_type:null,
          name:'static'
        }]
      }],
      imports:[
        {
          token: Juliet.TOKEN_IMPORT,
          name:'java.io'
        }
      ]
    }]
*/
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

    stm = Juliet.parser.parseTypeDeclaration();

    if (Juliet.util.equal(stm, t[1])) {
      print('Passed.');
      pass_count++;
    } else {
      print('Expected:');
      Juliet.util.print_ast(t[1]);

      print('Actual:');
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
}();

