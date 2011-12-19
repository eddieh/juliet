if (typeof(load) !== 'undefined') {
  load('juliet.js');
} else if (typeof(require) !== 'undefined') {
  var fs = require('fs');
  var juliet = fs.readFileSync('juliet.js', 'utf8');
  eval(juliet);
}

(function() {
  var tests = [
    /*
      Base tests
    */
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

    /*
       Scope
    */
    {
      path:'tests/scope/test0.java',
      principal:'Test0',
      expected:'3\n'
    },

    // {
    //   path:'tests/scope/test1.java',
    //   principal:'Test1',
    //   expected:'undefined\n'
    // },

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
    },
    {
      path:'tests/scope/test15.java',
      principal:'Test15',
      expected:'Hello from static_method()\n' +
               'Hello from static_method()\n'
    },
    {
      path:'tests/scope/test16.java',
      principal:'Runner',
      expected:'Hello from static_method()\n' +
               'Hello from static_method()\n'
    },
    {
      path:'tests/scope/test17.java',
      principal:'Test17',
      expected:'instance_method is not defined\n'
    },
    {
      path:'tests/scope/test18.java',
      principal:'Test18',
      expected:'x is not defined\n'
    },

    /*
       Assignment
    */
    // {
    //   path:'tests/assignments/test0.java',
    //   principal:'Test0',
    //   expected:'3\n'
    // },
    // {
    //   path:'tests/assignments/test1.java',
    //   principal:'Test1',
    //   expected:'unexpected type: must assign to a variable\n'
    // },
    // {
    //   path:'tests/assignments/test2.java',
    //   principal:'Test2',
    //   expected:'3\n'
    // },
    // {
    //   path:'tests/assignments/test3.java',
    //   principal:'Test3',
    //   expected:'incompatible types\n'
    // },
    // {
    //   path:'tests/assignments/test4.java',
    //   principal:'Test4',
    //   expected:'9\n'
    // },
    // {
    //   path:'tests/assignments/test5.java',
    //   principal:'Runner',
    //   expected:'13\n'
    // },
    // {
    //   path:'tests/assignments/test6.java',
    //   principal:'Test6',
    //   expected:'5\n'
    // },
    // {
    //   path:'tests/assignments/test7.java',
    //   principal:'Test7',
    //   expected:'32\n'
    // },
    // {
    //   path:'tests/assignments/test8.java',
    //   principal:'Test8',
    //   expected:'32\n'
    // },

    /*
      Type checking
    */
    {
      path:'tests/typechecks/test000.java',
      expected:
        'incompatible types\n' +
        'found   : java.lang.String\n' +
        'required: int\n'
    },
    {
      path:'tests/typechecks/test001.java',
      expected:
        'incompatible types\n' +
        'found   : String\n' +
        'required: int\n'
    },
    {
      path:'tests/typechecks/test002.java',
      expected:
        'incompatible types\n' +
        'found   : String\n' +
        'required: int\n'
    },
    {
      path:'tests/typechecks/test003.java',
      expected:
        'incompatible types\n' +
        'found   : java.lang.String\n' +
        'required: int\n'
    },
    {
      path:'tests/typechecks/test004.java',
      expected:
        'incompatible types\n' +
        'found   : java.lang.String\n' +
        'required: int\n'
    },
    {
      path:'tests/typechecks/test005.java',
      expected:
        'incompatible types\n' +
        'found   : java.lang.String\n' +
        'required: int\n'
    },
    {
      path:'tests/typechecks/test006.java',
      expected:''
    },
    {
      path:'tests/typechecks/test007.java',
      expected:
        'incompatible types\n' +
        'found   : java.lang.String\n' +
        'required: int\n'
    },
    {
      path:'tests/typechecks/test008.java',
      expected:''
    },
    {
      path:'tests/typechecks/test009.java',
      expected:
        'incompatible types\n' +
        'found   : java.lang.String\n' +
        'required: int\n'
    },
    {
      path:'tests/typechecks/test010.java',
      expected:
        'incompatible types\n' +
        'found   : java.lang.String\n' +
        'required: int\n'
    },
    {
      path:'tests/typechecks/test011.java',
      expected:
        'incompatible types\n' +
        'found   : java.lang.String\n' +
        'required: int\n'
    },
    {
      path:'tests/typechecks/test012.java',
      expected:''
    },
    {
      path:'tests/typechecks/test013.java',
      expected:
        'incompatible types\n' +
        'found   : java.lang.String\n' +
        'required: int\n'
    },
    {
      path:'tests/typechecks/test014.java',
      expected:
        'incompatible types\n' +
        'found   : java.lang.String\n' +
        'required: int\n'
    },
    {
      path:'tests/typechecks/test015.java',
      expected:''
    },
    {
      path:'tests/typechecks/test016.java',
      expected:
        'incompatible types\n' +
        'found   : java.lang.String\n' +
        'required: int\n'
    },
    {
      path:'tests/typechecks/test017.java',
      expected:
        'incompatible types\n' +
        'found   : Object\n' +
        'required: int\n'
    },
    {
      path:'tests/typechecks/test018.java',
      expected:
        'unexpected type\n' +
        'required: variable\n' +
        'found   : literal\n'
    },
    {
      path:'tests/typechecks/test019.java',
      expected:
        'unexpected type\n' +
        'required: variable\n' +
        'found   : literal\n'
    },
    {
      path:'tests/typechecks/test020.java',
      expected:''
    },
    {
      path:'tests/typechecks/test021.java',
      expected:
        'possible loss of precision\n' +
        'found   : float\n' +
        'required: int\n'
      // TODO: this fails because 1.0 is tokenized as a double instead
      // of a float
    },
    {
      path:'tests/typechecks/test022.java',
      expected:
        'possible loss of precision\n' +
        'found   : double\n' +
        'required: int\n'
    },
    {
      path:'tests/typechecks/test023.java',
      expected:
        'unexpected type\n' +
        'required: variable\n' +
        'found   : literal\n'
    },
    {
      path:'tests/typechecks/test024.java',
      expected:''
    },
    {
      path:'tests/typechecks/test025.java',
      expected:
        'unexpected type\n' +
        'required: variable\n' +
        'found   : binary\n'
    },
    {
      path:'tests/typechecks/test026.java',
      expected:
        'unexpected type\n' +
        'required: variable\n' +
        'found   : method\n'
    },
    {
      path:'tests/typechecks/test027.java',
      expected:'operator ++ cannot be applied to String\n'
      // FIXME: when we have a stdlib this should be:
      // expected:'operator ++ cannot be applied to java.lang.String\n'
    },
    {
      path:'tests/typechecks/test028.java',
      expected:'operator -- cannot be applied to String\n'
      // FIXME: when we have a stdlib this should be:
      // expected:'operator -- cannot be applied to java.lang.String\n'
    },
    {
      path:'tests/typechecks/test029.java',
      expected:'operator + cannot be applied to String\n'
      // FIXME: when we have a stdlib this should be:
      // expected:'operator + cannot be applied to java.lang.String\n'
      // TODO: this fails because the parser discards leading +
      // operator
    },
    {
      path:'tests/typechecks/test030.java',
      expected:'operator - cannot be applied to String\n'
      // FIXME: when we have a stdlib this should be:
      // expected:'operator - cannot be applied to java.lang.String\n'
    },
    {
      path:'tests/typechecks/test031.java',
      expected:'operator ~ cannot be applied to String\n'
      // FIXME: when we have a stdlib this should be:
      // expected:'operator ~ cannot be applied to java.lang.String\n'
    },
    {
      path:'tests/typechecks/test032.java',
      expected:'operator ! cannot be applied to String\n'
      // FIXME: when we have a stdlib this should be:
      // expected:'operator ! cannot be applied to java.lang.String\n'
    },
    {
      path:'tests/typechecks/test033.java',
      expected:
        'unexpected type\n' +
        'required: variable\n' +
        'found   : literal\n'
    },
    {
      path:'tests/typechecks/test034.java',
      expected:
        'unexpected type\n' +
        'required: variable\n' +
        'found   : literal\n'
    },
    {
      path:'tests/typechecks/test035.java',
      expected:''
    },
    {
      path:'tests/typechecks/test036.java',
      expected:''
    },
    {
      path:'tests/typechecks/test037.java',
      expected:
        'unexpected type\n' +
        'required: variable\n' +
        'found   : literal\n'
    },
    {
      path:'tests/typechecks/test038.java',
      expected:''
    },
    {
      path:'tests/typechecks/test039.java',
      expected:'operator * cannot be applied to Widget, Widget\n'
    },
    {
      path:'tests/typechecks/test040.java',
      expected:'operator * cannot be applied to Widget, int\n'
    },
    {
      path:'tests/typechecks/test041.java',
      expected:''
    },
    {
      path:'tests/typechecks/test042.java',
      expected:
        'possible loss of precision\n' +
        'found   : double\n' +
        'required: int\n'
    },
    {
      path:'tests/typechecks/test043.java',
      expected:
        'incompatible types\n' +
        'found   : java.lang.String\n' +
        'required: int\n'
    },
    {
      path:'tests/typechecks/test044.java',
      expected:
        'incompatible types\n' +
        'found   : Widget\n' +
        'required: int\n'
    },
    {
      path:'tests/typechecks/test045.java',
      expected:'illegal initializer for int\n'
    },
    {
      path:'tests/typechecks/test046.java',
      expected:'illegal initializer for int\n'
    },
    {
      path:'tests/typechecks/test047.java',
      expected:''
    },
    {
      path:'tests/typechecks/test048.java',
      expected:''
    },
    {
      path:'tests/typechecks/test049.java',
      expected:
        'incompatible types\n' +
        'found   : int[][]\n' +
        'required: int[]\n'
    },
    {
      path:'tests/typechecks/test050.java',
      expected:''
    },
    {
      path:'tests/typechecks/test051.java',
      expected:
        'incompatible types\n' +
        'found   : int[]\n' +
        'required: int[][]\n'
    },
    {
      path:'tests/typechecks/test052.java',
      expected:'array dimension missing\n'
    },
    {
      path:'tests/typechecks/test053.java',
      expected:''
    },
    {
      path:'tests/typechecks/test054.java',
      expected:''
    },
    {
      path:'tests/typechecks/test055.java',
      expected:''
    },
    {
      path:'tests/typechecks/test056.java',
      expected:''
    },
    {
      path:'tests/typechecks/test057.java',
      expected:
        'incompatible types\n' +
        'found   : int\n' +
        'required: int[]\n'
    },
    {
      path:'tests/typechecks/test058.java',
      expected:
        'incompatible types\n' +
        'found   : int\n' +
        'required: int[]\n'
    },
    {
      path:'tests/typechecks/test059.java',
      expected:
        'incompatible types\n' +
        'found   : java.lang.String\n' +
        'required: int\n'
    },
    {
      path:'tests/typechecks/test060.java',
      expected:
        'incompatible types\n' +
        'found   : Widget\n' +
        'required: int\n'
    },
    {
      path:'tests/typechecks/test061.java',
      expected:
        'incompatible types\n' +
        'found   : double[]\n' +
        'required: int[]\n'
    },
    {
      path:'tests/typechecks/test062.java',
      expected:
        'incompatible types\n' +
        'found   : double[]\n' +
        'required: int[]\n'
    },
    {
      path:'tests/typechecks/test063.java',
      expected:''
    },
    {
      path:'tests/typechecks/test064.java',
      expected:''
    },
    {
      path:'tests/typechecks/test065.java',
      expected:
        'possible loss of precision\n' +
        'found   : double\n' +
        'required: int\n'
    },
    {
      path:'tests/typechecks/test066.java',
      expected:
        'incompatible types\n' +
        'found   : String\n' +
        'required: int\n'
      // FIXME: when we have a stdlib this should be:
      // expected:
      //   'incompatible types\n' +
      //   'found   : java.lang.String\n' +
      //   'required: int\n'
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
      if (tests[i].principal) {
        execute(tests[i].principal);
      }
    } catch (e) {
      //if (e.message != 'QUIT') print(e);
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
