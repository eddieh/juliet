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

var test_tokenize = function () {
  var tests = [
    ['123', Juliet.LITERAL_INT, 123],
    ['123l', Juliet.LITERAL_LONG, 123],
    ['123L', Juliet.LITERAL_LONG, 123],
    ['1.23f', Juliet.LITERAL_FLOAT, 1.23],
    ['1.23F', Juliet.LITERAL_FLOAT, 1.23],
    ['1.23', Juliet.LITERAL_DOUBLE, 1.23],
    ['1.23d', Juliet.LITERAL_DOUBLE, 1.23],
    ['1.23D', Juliet.LITERAL_DOUBLE, 1.23],
    ['1.23e10', Juliet.LITERAL_DOUBLE, 1.23e10],
    ['1.23e-10', Juliet.LITERAL_DOUBLE, 1.23e-10],
    ['1.23e+10', Juliet.LITERAL_DOUBLE, 1.23e10],
    ['1.23e+10.3', Juliet.TOKEN_ERROR],
    ['1.23e10e3', Juliet.TOKEN_ERROR],
    ['1_.23e10', Juliet.TOKEN_ERROR],
    ['1._23e10', Juliet.TOKEN_ERROR],
    ['5____2', Juliet.LITERAL_INT, 52],
    ['52_', Juliet.TOKEN_ERROR],
    ['2147483647', Juliet.LITERAL_INT, 2147483647],
    ['2147483648', Juliet.TOKEN_ERROR], // Too large
    ['0x_52', Juliet.TOKEN_ERROR],
    ['0_x52', Juliet.TOKEN_ERROR],
    ['0x5_a', Juliet.LITERAL_INT, 0x5a],
    ['26', Juliet.LITERAL_INT, 26],
    ['032', Juliet.LITERAL_INT, 26],
    ['0b11010', Juliet.LITERAL_INT, 26],
    ['0b11310', Juliet.TOKEN_ERROR],
    ['039', Juliet.TOKEN_ERROR],
    ['093', Juliet.TOKEN_ERROR],
    ['0000032', Juliet.LITERAL_INT, 26],
    ['0x00005a', Juliet.LITERAL_INT, 0x5a],
    ['0.3', Juliet.LITERAL_DOUBLE, 0.3],
    ['0.3d', Juliet.LITERAL_DOUBLE, 0.3],
    ['0.3D', Juliet.LITERAL_DOUBLE, 0.3],
    ['0.3f', Juliet.LITERAL_FLOAT, 0.3],
    ['.3', Juliet.LITERAL_DOUBLE, 0.3],
    ['.3e10', Juliet.LITERAL_DOUBLE, 0.3e10],
    ['0.e10', Juliet.LITERAL_DOUBLE, 0.0e10],
    ['.0e10', Juliet.LITERAL_DOUBLE, 0.0e10],
    ['.e10', [Juliet.TOKEN_PERIOD, Juliet.TOKEN_ID]],
    ['2e5000', Juliet.TOKEN_ERROR],
    ['00.03', Juliet.LITERAL_DOUBLE, 0.03],
    ['03e2', Juliet.LITERAL_DOUBLE, 3e2],
    ['1.23fz', Juliet.TOKEN_ERROR],
    ['999_99_9999L', Juliet.LITERAL_LONG, 999999999],
    ['3.14_15F', Juliet.LITERAL_FLOAT, 3.1415],
    ['0xFF_EC_DE_5E', Juliet.TOKEN_ERROR],
    ['0xCAFE_BABE', Juliet.TOKEN_ERROR], // Too large
    ['0b0010_0101', Juliet.LITERAL_INT, 37],
    ['-42', Juliet.LITERAL_INT, -42],
    ['-0x0001', Juliet.LITERAL_INT, -1],
    ['-0b0001', Juliet.LITERAL_INT, -1],
    ['-01', Juliet.LITERAL_INT, -1],
    ['-0.42', Juliet.LITERAL_DOUBLE, -0.42],
    ['-.42', Juliet.LITERAL_DOUBLE, -0.42],
    ['-.42e-2', Juliet.LITERAL_DOUBLE, -0.42e-2],
    ['\'a\'', Juliet.LITERAL_CHAR, 'a'],
    ['\'Z\'', Juliet.LITERAL_CHAR, 'Z'],
    ['\'0\'', Juliet.LITERAL_CHAR, '0'],
    ['\'9\'', Juliet.LITERAL_CHAR, '9'],
    ['\'\\n\'', Juliet.LITERAL_CHAR, '\n'],
    ['\'\\\"\'', Juliet.LITERAL_CHAR, '\"'],
    ['\'\\\'\'', Juliet.LITERAL_CHAR, '\''],
    ['\'\\\\\'', Juliet.LITERAL_CHAR, '\\'],
    ['\'\\z\'', Juliet.TOKEN_ERROR],
    ['\'\\u0061\'', Juliet.LITERAL_CHAR, 'a'],
    ["'a", Juliet.TOKEN_ERROR],
    ['\'aaa\'', Juliet.TOKEN_ERROR],
    ['abc', Juliet.TOKEN_ID, 'abc'],
    ['ab_c', Juliet.TOKEN_ID, 'ab_c'],
    ['ab123', Juliet.TOKEN_ID, 'ab123'],
    ['$abc', Juliet.TOKEN_ID, '$abc'],
    ['"abc"', Juliet.LITERAL_STRING, 'abc'],
    ['"abc",', Juliet.LITERAL_STRING, 'abc'],
    ['"abc"z', Juliet.TOKEN_ERROR],
    ['\'c\'z', Juliet.TOKEN_ERROR],
    ['\'c\'\'', Juliet.TOKEN_ERROR],
    ['\'c\'\"', Juliet.TOKEN_ERROR],
    ['\'c\',', Juliet.LITERAL_CHAR, 'c'],
    ['77\'', Juliet.TOKEN_ERROR],
    ['77\"', Juliet.TOKEN_ERROR],
    ['77a', Juliet.TOKEN_ERROR],
    ['<', Juliet.TOKEN_LT],
    ['>', Juliet.TOKEN_GT],
    ['<54', Juliet.TOKEN_LT],
    ['+++3', Juliet.TOKEN_ERROR],
    ['---3', Juliet.TOKEN_ERROR],
    ['--3', Juliet.TOKEN_DECREMENT],
    ['""', Juliet.LITERAL_STRING, ''],
    ['while', Juliet.TOKEN_WHILE],
    ['while()',
     [Juliet.TOKEN_WHILE, Juliet.TOKEN_LPAREN, Juliet.TOKEN_RPAREN]],
    ['while ()',
     [Juliet.TOKEN_WHILE, Juliet.TOKEN_LPAREN, Juliet.TOKEN_RPAREN]],
    ['while ( ) ',
     [Juliet.TOKEN_WHILE, Juliet.TOKEN_LPAREN, Juliet.TOKEN_RPAREN]],
    ['while() {}',
     [Juliet.TOKEN_WHILE, Juliet.TOKEN_LPAREN, Juliet.TOKEN_RPAREN, Juliet.TOKEN_LCURLY, Juliet.TOKEN_RCURLY]],
    ['int a = 7;',
     [Juliet.TOKEN_INT, Juliet.TOKEN_ID, Juliet.TOKEN_ASSIGN, Juliet.LITERAL_INT, Juliet.TOKEN_SEMICOLON]],
    ['int[] a = new int[77];',
     [Juliet.TOKEN_INT, Juliet.TOKEN_LBRACKET, Juliet.TOKEN_RBRACKET, Juliet.TOKEN_ID, Juliet.TOKEN_ASSIGN,
      Juliet.TOKEN_NEW, Juliet.TOKEN_INT, Juliet.TOKEN_LBRACKET, Juliet.LITERAL_INT, Juliet.TOKEN_RBRACKET,
      Juliet.TOKEN_SEMICOLON]],
    ['"\\n"', Juliet.LITERAL_STRING, '\n'],
    ['"\\u77"', Juliet.TOKEN_ERROR],
    ['"Hello\\nWorld"', Juliet.LITERAL_STRING, 'Hello\nWorld'],
    ['"abc', Juliet.TOKEN_ERROR],
    ['int a = 1 + 2;', [Juliet.TOKEN_INT, Juliet.TOKEN_ID, Juliet.TOKEN_ASSIGN, Juliet.LITERAL_INT,
                        Juliet.TOKEN_PLUS, Juliet.LITERAL_INT, Juliet.TOKEN_SEMICOLON]],
    ['int a = b + c;', [Juliet.TOKEN_INT, Juliet.TOKEN_ID, Juliet.TOKEN_ASSIGN, Juliet.TOKEN_ID,
                        Juliet.TOKEN_PLUS, Juliet.TOKEN_ID, Juliet.TOKEN_SEMICOLON]],
    ['int a = 1 << 2;', [Juliet.TOKEN_INT, Juliet.TOKEN_ID, Juliet.TOKEN_ASSIGN, Juliet.LITERAL_INT,
                        Juliet.TOKEN_SHL, Juliet.LITERAL_INT, Juliet.TOKEN_SEMICOLON]],
    ['a.b', [Juliet.TOKEN_ID, Juliet.TOKEN_PERIOD, Juliet.TOKEN_ID]],
    ['a . b', [Juliet.TOKEN_ID, Juliet.TOKEN_PERIOD, Juliet.TOKEN_ID]],
    ['a. b', [Juliet.TOKEN_ID, Juliet.TOKEN_PERIOD, Juliet.TOKEN_ID]],
    ['a .b', [Juliet.TOKEN_ID, Juliet.TOKEN_PERIOD, Juliet.TOKEN_ID]],
    ['Foo.e10', [Juliet.TOKEN_ID, Juliet.TOKEN_PERIOD, Juliet.TOKEN_ID]],
    ['Foo .e10', [Juliet.TOKEN_ID, Juliet.TOKEN_PERIOD, Juliet.TOKEN_ID]],
  ];

  print('BEGIN TESTS');
  print('');

  var pass_count = 0;
  var fail_count = 0;
  for (i in tests) {
    var t = tests[i];
    print('Testing the tokenization of ' + t[0]);

    Juliet.lexer.init();

    Juliet.source = t[0];

    if (Juliet.util.isArray(t[1])) {
      for (var i = 0; i < t[1].length; i++) {
        Juliet.lexer.tokenize();
        if (Juliet.lexer.pending[i].type == t[1][i]) {
          pass_count++;
          print(i + '. Type passed.');
        } else {
          fail_count++;
          print(i + '. Type FAILED:' + Juliet.lexer.pending[i].type);
        }
      }
    } else {
      Juliet.lexer.tokenize();
      if (Juliet.lexer.pending[0].type == t[1]) {
        pass_count++;
        print('Type passed.');
      } else {
        fail_count++;
        print('Type FAILED. ***************');
      }
    }
    if ((t.length > 2) && (Juliet.lexer.pending[0].type != Juliet.TOKEN_ERROR)) {
      if (Juliet.lexer.pending[0].content == t[2]) {
        print('Value passed.');
        pass_count++;
      }
      else {
        fail_count++;
        print('Value FAILED. ***************');
      }
    }
    print('');
  }

  print('SUMMARY');
  print('=======');
  print('Passed ' + pass_count + ' tests.');
  print('Failed ' + fail_count + ' tests.');
  print('END TESTS');
}();
