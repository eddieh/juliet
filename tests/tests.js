load('juliet.js');

(function() {
  var tests = [
    {
      path:'tests/arrays.java',
      principal:'Arrays',
      expected:'96\n42\n'
    },
    {
      path:'tests/assignments.java',
      principal:'Assignments',
      expected:'0\n'
    },
    {
      path:'tests/conditionals.java',
      principal:'Conditionals',
      expected:'You see me.\n' +
          'correct\n' +
          'one\n' +
          'two\n'
    },
    {
      path:'tests/fields.java',
      principal:'Runner',
      expected:'10\n'
    },
    {
      path:'tests/hello.java',
      principal:'Hello',
      expected:'I\'m alive!\n'
    },
    {
      path:'tests/inheritance.java',
      principal:'Runner',
      expected:'hello from A\n' +
          '  a = 1\n' +
          'hello from B\n' +
          '  a = 1\n' +
          '  b = 2\n' +
          'hello from B\n' +
          '  a = 1\n' +
          '  b = 2\n' +
          'hello from C\n' +
          '  a = 3\n' +
          '  b = 2\n'
    },
    {
      path:'tests/initializers.java',
      principal:'Runner',
      expected:'3\n7\n'
    },
    {
      path:'tests/interfaces.java',
      principal:'Runner',
      expected:'(2 3)\n'
    },
    {
      path:'tests/jclass.java',
      principal:'Runner',
      expected:'3\n' +
          '7\n' +
          '9\n' +
          '12\n' +
          '42\n' +
          '99\n'
    },
    {
      path:'tests/literals.java',
      principal:'Literals',
      expected:'string\n' +
          'c\n' +
          '3.14\n' +
          '42\n' +
          'false\n' +
          'true\n' +
          'null\n'
    },
    {
      path:'tests/loops.java',
      principal:'Loops',
      expected:'twice\n' +
          'twice\n' +
          'three\n' +
          'three\n' +
          'three\n'
    },
    {
      path:'tests/methods.java',
      principal:'Runner',
      expected:'11\n'
    },
    {
      path:'tests/overloading.java',
      principal:'Runner',
      expected:'character\n' +
          'string\n' +
          'double\n' +
          'int\n' +
          'boolean\n' +
          'Object\n' +
          'character\n' +
          'string\n' +
          'character\n' +
          'string\n' +
          'character\n' +
          'int\n' +
          'int\n' +
          'character\n' +
          'string\n'
    },
    {
      path:'tests/scope/test0.java',
      principal:'Test0',
      expected:'3\n'
    },
    {
      path:'tests/scope/test1.java',
      principal:'Test1',
      expected:'undefined\n'
    },
    {
      path:'tests/scope/test2.java',
      principal:'Test2',
      expected:'7\n'
    },
    {
      path:'tests/scope/test3.java',
      principal:'Test3',
      expected:'1\n2\n'
    },
    {
      path:'tests/scope/test4.java',
      principal:'Test4',
      expected:'x is not defined\n'
    },
    {
      path:'tests/scope/test5.java',
      principal:'Test5',
      expected:'3\n1\n'
    },
    {
      path:'tests/scope/test6.java',
      principal:'Test6',
      expected:'x is already defined\n'
    },
    {
      path:'tests/scope/test7.java',
      principal:'Test7',
      expected:'x is already defined\n'
    },
    {
      path:'tests/scope/test8.java',
      principal:'Test8',
      expected:'i is already defined\n'
    },
    {
      path:'tests/scope/test9.java',
      principal:'Test9',
      expected:''
    },
    {
      path:'tests/scope/test10.java',
      principal:'Test10',
      expected:'1\n2\n'
    },
    {
      path:'tests/scope/test11.java',
      principal:'Test11',
      expected:'1\n'
    },
    {
      path:'tests/scope/test12.java',
      principal:'Test12',
      expected:'x is already defined\n'
    },
    {
      path:'tests/scope/test13.java',
      principal:'Test13',
      expected:'9\n'
    },
    {
      path:'tests/scope/test14.java',
      principal:'Test14',
      expected:'4\n3\n'
    }
  ];

  var result = '';
  System.out.println = function (a) {
    result = result + a + '\n';
  };
  var tquit = quit;
  quit = function () {
    throw new Error('QUIT');
  };
  var tprint = print;
  print = System.out.println;

  var test_info = '';
  var put = function(a) {
    test_info = test_info + a;
  };
  var putln = function(a) {
    test_info = test_info + a + '\n';
  };
      
  tprint('BEGIN TESTS');
  tprint('');

  var pass_count = 0;
  var fail_count = 0;
  for (var i = 0; i < tests.length; i++) {
    result = '';
    try {
      init();
      init_parser();
      init_compiler();
      data = readFile(tests[i].path);
      parse();
      compile(Parser);
      execute(tests[i].principal);
    } catch (e) {
      
    }

    test_info = '';
    put('Running ' + tests[i].path + ' ' + tests[i].principal);
    if (tests[i].expected == result) {
      pass_count++;
      put(' pass');
    } else {
      fail_count++;
      putln(' FAIL');
      putln('Expected:');
      put(tests[i].expected);
      putln('Actual:');
      put(result);
      putln('Code:');
      putln(data);
    }
    tprint(test_info);
  }

  tprint('\nSUMMARY');
  tprint('=======');
  tprint('Passed ' + pass_count + ' tests.');
  tprint('Failed ' + fail_count + ' tests.');
  tprint('END TESTS');
})();
