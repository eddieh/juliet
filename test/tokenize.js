var test_tokenize = function () {
  var tests = [
    ['123', LITERAL_INT, 123],
    ['123l', LITERAL_LONG, 123],
    ['123L', LITERAL_LONG, 123],
    ['1.23f', LITERAL_FLOAT, 1.23],
    ['1.23F', LITERAL_FLOAT, 1.23],
    ['1.23', LITERAL_DOUBLE, 1.23],
    ['1.23d', LITERAL_DOUBLE, 1.23],
    ['1.23D', LITERAL_DOUBLE, 1.23],
    ['1.23e10', LITERAL_DOUBLE, 1.23e10],
    ['1.23e-10', LITERAL_DOUBLE, 1.23e-10],
    ['1.23e+10', LITERAL_DOUBLE, 1.23e10],
    ['1.23e+10.3', TOKEN_ERROR],
    ['1.23e10e3', TOKEN_ERROR],
    ['1_.23e10', TOKEN_ERROR],
    ['1._23e10', TOKEN_ERROR],
    ['5____2', LITERAL_INT, 52],
    ['52_', TOKEN_ERROR],
    ['2147483647', LITERAL_INT, 2147483647],
    ['2147483648', TOKEN_ERROR], // Too large
    ['0x_52', TOKEN_ERROR],
    ['0_x52', TOKEN_ERROR],
    ['0x5_a', LITERAL_INT, 0x5a],
    ['26', LITERAL_INT, 26],
    ['032', LITERAL_INT, 26],
    ['0b11010', LITERAL_INT, 26],
    ['0b11310', TOKEN_ERROR],
    ['039', TOKEN_ERROR],
    ['093', TOKEN_ERROR],
    ['0000032', LITERAL_INT, 26],
    ['0x00005a', LITERAL_INT, 0x5a],
    ['0.3', LITERAL_DOUBLE, 0.3],
    ['0.3d', LITERAL_DOUBLE, 0.3],
    ['0.3D', LITERAL_DOUBLE, 0.3],
    ['0.3f', LITERAL_FLOAT, 0.3],
    ['.3', LITERAL_DOUBLE, 0.3],
    ['.3e10', LITERAL_DOUBLE, 0.3e10],
    ['0.e10', LITERAL_DOUBLE, 0.0e10],
    ['.0e10', LITERAL_DOUBLE, 0.0e10],
    ['.e10', [TOKEN_PERIOD, TOKEN_ID]],
    ['2e5000', TOKEN_ERROR],
    ['00.03', LITERAL_DOUBLE, 0.03],
    ['03e2', LITERAL_DOUBLE, 3e2],
    ['1.23fz', TOKEN_ERROR],
    ['999_99_9999L', LITERAL_LONG, 999999999],
    ['3.14_15F', LITERAL_FLOAT, 3.1415],
    ['0xFF_EC_DE_5E', TOKEN_ERROR],
    ['0xCAFE_BABE', TOKEN_ERROR], // Too large
    ['0b0010_0101', LITERAL_INT, 37],
    ['-42', LITERAL_INT, -42],
    ['-0x0001', LITERAL_INT, -1],
    ['-0b0001', LITERAL_INT, -1],
    ['-01', LITERAL_INT, -1],
    ['-0.42', LITERAL_DOUBLE, -0.42],
    ['-.42', LITERAL_DOUBLE, -0.42],
    ['-.42e-2', LITERAL_DOUBLE, -0.42e-2],
    ['\'a\'', LITERAL_CHAR, 'a'],
    ['\'Z\'', LITERAL_CHAR, 'Z'],
    ['\'0\'', LITERAL_CHAR, '0'],
    ['\'9\'', LITERAL_CHAR, '9'],
    ['\'\\n\'', LITERAL_CHAR, '\n'],
    ['\'\\\"\'', LITERAL_CHAR, '\"'],
    ['\'\\\'\'', LITERAL_CHAR, '\''],
    ['\'\\\\\'', LITERAL_CHAR, '\\'],
    ['\'\\z\'', TOKEN_ERROR],
    ['\'\\u0061\'', LITERAL_CHAR, 'a'],
    ["'a", TOKEN_ERROR],
    ['\'aaa\'', TOKEN_ERROR],
    ['abc', TOKEN_ID, 'abc'],
    ['ab_c', TOKEN_ID, 'ab_c'],
    ['ab123', TOKEN_ID, 'ab123'],
    ['$abc', TOKEN_ID, '$abc'],
    ['"abc"', LITERAL_STRING, 'abc'],
    ['"abc",', LITERAL_STRING, 'abc'],
    ['"abc"z', TOKEN_ERROR],
    ['\'c\'z', TOKEN_ERROR],
    ['\'c\'\'', TOKEN_ERROR],
    ['\'c\'\"', TOKEN_ERROR],
    ['\'c\',', LITERAL_CHAR, 'c'],
    ['77\'', TOKEN_ERROR],
    ['77\"', TOKEN_ERROR],
    ['77a', TOKEN_ERROR],
    ['<', TOKEN_LT],
    ['>', TOKEN_GT],
    ['<54', TOKEN_LT],
    ['+++3', TOKEN_ERROR],
    ['---3', TOKEN_ERROR],
    ['--3', TOKEN_DECREMENT],
    ['""', LITERAL_STRING, ''],
    ['while', TOKEN_WHILE],
    ['while()',
     [TOKEN_WHILE, TOKEN_LPAREN, TOKEN_RPAREN]],
    ['while ()',
     [TOKEN_WHILE, TOKEN_LPAREN, TOKEN_RPAREN]],
    ['while ( ) ',
     [TOKEN_WHILE, TOKEN_LPAREN, TOKEN_RPAREN]],
    ['while() {}',
     [TOKEN_WHILE, TOKEN_LPAREN, TOKEN_RPAREN, TOKEN_LCURLY, TOKEN_RCURLY]],
    ['int a = 7;',
     [TOKEN_INT, TOKEN_ID, TOKEN_ASSIGN, LITERAL_INT, TOKEN_SEMICOLON]],
    ['int[] a = new int[77];',
     [TOKEN_INT, TOKEN_LBRACKET, TOKEN_RBRACKET, TOKEN_ID, TOKEN_ASSIGN,
      TOKEN_NEW, TOKEN_INT, TOKEN_LBRACKET, LITERAL_INT, TOKEN_RBRACKET,
      TOKEN_SEMICOLON]],
    ['"\\n"', LITERAL_STRING, '\n'],
    ['"\\u77"', TOKEN_ERROR],
    ['"Hello\\nWorld"', LITERAL_STRING, 'Hello\nWorld'],
    ['"abc', TOKEN_ERROR],
    ['int a = 1 + 2;', [TOKEN_INT, TOKEN_ID, TOKEN_ASSIGN, LITERAL_INT,
                        TOKEN_PLUS, LITERAL_INT, TOKEN_SEMICOLON]],
    ['int a = b + c;', [TOKEN_INT, TOKEN_ID, TOKEN_ASSIGN, TOKEN_ID,
                        TOKEN_PLUS, TOKEN_ID, TOKEN_SEMICOLON]],
    ['int a = 1 << 2;', [TOKEN_INT, TOKEN_ID, TOKEN_ASSIGN, LITERAL_INT,
                        TOKEN_SHL, LITERAL_INT, TOKEN_SEMICOLON]],
    ['a.b', [TOKEN_ID, TOKEN_PERIOD, TOKEN_ID]],
    ['a . b', [TOKEN_ID, TOKEN_PERIOD, TOKEN_ID]],
    ['a. b', [TOKEN_ID, TOKEN_PERIOD, TOKEN_ID]],
    ['a .b', [TOKEN_ID, TOKEN_PERIOD, TOKEN_ID]],
    ['Foo.e10', [TOKEN_ID, TOKEN_PERIOD, TOKEN_ID]],
    ['Foo .e10', [TOKEN_ID, TOKEN_PERIOD, TOKEN_ID]],
  ];

  print('BEGIN TESTS');
  print('');

  var pass_count = 0;
  var fail_count = 0;
  for (i in tests) {
    var t = tests[i];
    print('Testing the tokenization of ' + t[0]);
    init();
    data = t[0];

    if (isArray(t[1])) {
      for (var i = 0; i < t[1].length; i++) {
        tokenize();
        if (pending[i].type == t[1][i]) {
          pass_count++;
          print(i + '. Type passed.');
        } else {
          fail_count++;
          print(i + '. Type FAILED:' + pending[i].type);
        }
      }
    } else {
      tokenize();
      if (pending[0].type == t[1]) {
        pass_count++;
        print('Type passed.');
      } else {
        fail_count++;
        print('Type FAILED. ***************');
      }
    }
    if ((t.length > 2) && (pending[0].type != TOKEN_ERROR)) {
      if (pending[0].content == t[2]) {
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
}
