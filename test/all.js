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

noMain = true;
load('juliet.js');

Juliet.stdout = '';

Juliet.test = function() {
  var test_info = '';

  return {
    quit: quit,
    print: print,
    put: function(a) {
      test_info = test_info + a;
    },
    putln: function(a) {
      test_info = test_info + a + '\n';
    },
    getTestInfo: function() {
      return test_info;
    },
    init: function() {
      test_info = ''
    }
  }
}();

(function(args) {

  Juliet.stdlib.System.out.println = function (a) {
    Juliet.stdout = Juliet.stdout + a + '\n';
  };

  quit = function () {
    throw new Error('QUIT');
  };

  print = Juliet.stdlib.System.out.println;


  var tests = [
    /*
      Base tests
    */
    {
      path:'test/arrays.java',
      principal:'Arrays',
      expected:'96\n42\n'
    },
    {
      path:'test/assignments.java',
      principal:'Assignments',
      expected:'0\n'
    },
    {
      path:'test/conditionals.java',
      principal:'Conditionals',
      expected:'You see me.\n' +
          'correct\n' +
          'one\n' +
          'two\n'
    },
    {
      path:'test/fields.java',
      principal:'Runner',
      expected:'10\n'
    },
    {
      path:'test/hello.java',
      principal:'Hello',
      expected:'I\'m alive!\n'
    },
    {
      path:'test/inheritance.java',
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
      path:'test/initializers.java',
      principal:'Runner',
      expected:'3\n7\n'
    },
    {
      path:'test/interfaces.java',
      principal:'Runner',
      expected:'(2 3)\n'
    },
    {
      path:'test/jclass.java',
      principal:'Runner',
      expected:'3\n' +
          '7\n' +
          '9\n' +
          '12\n' +
          '42\n' +
          '99\n'
    },
    {
      path:'test/literals.java',
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
      path:'test/loops.java',
      principal:'Loops',
      expected:'twice\n' +
          'twice\n' +
          'three\n' +
          'three\n' +
          'three\n'
    },
    {
      path:'test/methods.java',
      principal:'Runner',
      expected:'11\n'
    },
    {
      path:'test/overloading.java',
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
      path:'test/scope/test0.java',
      principal:'Test0',
      expected:'3\n'
    },

    // {
    //   path:'test/scope/test1.java',
    //   principal:'Test1',
    //   expected:'undefined\n'
    // },

    {
      path:'test/scope/test2.java',
      principal:'Test2',
      expected:'7\n'
    },
    {
      path:'test/scope/test3.java',
      principal:'Test3',
      expected:'1\n2\n'
    },
    {
      path:'test/scope/test4.java',
      principal:'Test4',
      expected:'x is not defined\n'
    },
    {
      path:'test/scope/test5.java',
      principal:'Test5',
      expected:'3\n1\n'
    },
    {
      path:'test/scope/test6.java',
      principal:'Test6',
      expected:'x is already defined\n'
    },
    {
      path:'test/scope/test7.java',
      principal:'Test7',
      expected:'x is already defined\n'
    },
    {
      path:'test/scope/test8.java',
      principal:'Test8',
      expected:'i is already defined\n'
    },
    {
      path:'test/scope/test9.java',
      principal:'Test9',
      expected:''
    },
    {
      path:'test/scope/test10.java',
      principal:'Test10',
      expected:'1\n2\n'
    },
    {
      path:'test/scope/test11.java',
      principal:'Test11',
      expected:'1\n'
    },
    {
      path:'test/scope/test12.java',
      principal:'Test12',
      expected:'x is already defined\n'
    },
    {
      path:'test/scope/test13.java',
      principal:'Test13',
      expected:'9\n'
    },
    {
      path:'test/scope/test14.java',
      principal:'Test14',
      expected:'4\n3\n'
    },
    {
      path:'test/scope/test15.java',
      principal:'Test15',
      expected:'Hello from static_method()\n' +
               'Hello from static_method()\n'
    },
    {
      path:'test/scope/test16.java',
      principal:'Runner',
      expected:'Hello from static_method()\n' +
               'Hello from static_method()\n'
    },
    {
      path:'test/scope/test17.java',
      principal:'Test17',
      expected:'instance_method is not defined\n'
    },
    {
      path:'test/scope/test18.java',
      principal:'Test18',
      expected:'x is not defined\n'
    },

    /*
       Assignment
    */
    // {
    //   path:'test/assignments/test0.java',
    //   principal:'Test0',
    //   expected:'3\n'
    // },
    // {
    //   path:'test/assignments/test1.java',
    //   principal:'Test1',
    //   expected:'unexpected type: must assign to a variable\n'
    // },
    // {
    //   path:'test/assignments/test2.java',
    //   principal:'Test2',
    //   expected:'3\n'
    // },
    // {
    //   path:'test/assignments/test3.java',
    //   principal:'Test3',
    //   expected:'incompatible types\n'
    // },
    // {
    //   path:'test/assignments/test4.java',
    //   principal:'Test4',
    //   expected:'9\n'
    // },
    // {
    //   path:'test/assignments/test5.java',
    //   principal:'Runner',
    //   expected:'13\n'
    // },
    // {
    //   path:'test/assignments/test6.java',
    //   principal:'Test6',
    //   expected:'5\n'
    // },
    // {
    //   path:'test/assignments/test7.java',
    //   principal:'Test7',
    //   expected:'32\n'
    // },
    // {
    //   path:'test/assignments/test8.java',
    //   principal:'Test8',
    //   expected:'32\n'
    // },

    /*
      Type checking
    */
    {
      path:'test/typechecks/test000.java',
      expected:
        'incompatible types\n' +
        'found   : java.lang.String\n' +
        'required: int\n'
    },
    {
      path:'test/typechecks/test001.java',
      expected:
        'incompatible types\n' +
        'found   : String\n' +
        'required: int\n'
    },
    {
      path:'test/typechecks/test002.java',
      expected:
        'incompatible types\n' +
        'found   : String\n' +
        'required: int\n'
    },
    {
      path:'test/typechecks/test003.java',
      expected:
        'incompatible types\n' +
        'found   : java.lang.String\n' +
        'required: int\n'
    },
    {
      path:'test/typechecks/test004.java',
      expected:
        'incompatible types\n' +
        'found   : java.lang.String\n' +
        'required: int\n'
    },
    {
      path:'test/typechecks/test005.java',
      expected:
        'incompatible types\n' +
        'found   : java.lang.String\n' +
        'required: int\n'
    },
    {
      path:'test/typechecks/test006.java',
      expected:''
    },
    {
      path:'test/typechecks/test007.java',
      expected:
        'incompatible types\n' +
        'found   : java.lang.String\n' +
        'required: int\n'
    },
    {
      path:'test/typechecks/test008.java',
      expected:''
    },
    {
      path:'test/typechecks/test009.java',
      expected:
        'incompatible types\n' +
        'found   : java.lang.String\n' +
        'required: int\n'
    },
    {
      path:'test/typechecks/test010.java',
      expected:
        'incompatible types\n' +
        'found   : java.lang.String\n' +
        'required: int\n'
    },
    {
      path:'test/typechecks/test011.java',
      expected:
        'incompatible types\n' +
        'found   : java.lang.String\n' +
        'required: int\n'
    },
    {
      path:'test/typechecks/test012.java',
      expected:''
    },
    {
      path:'test/typechecks/test013.java',
      expected:
        'incompatible types\n' +
        'found   : java.lang.String\n' +
        'required: int\n'
    },
    {
      path:'test/typechecks/test014.java',
      expected:
        'incompatible types\n' +
        'found   : java.lang.String\n' +
        'required: int\n'
    },
    {
      path:'test/typechecks/test015.java',
      expected:''
    },
    {
      path:'test/typechecks/test016.java',
      expected:
        'incompatible types\n' +
        'found   : java.lang.String\n' +
        'required: int\n'
    },
    {
      path:'test/typechecks/test017.java',
      expected:
        'incompatible types\n' +
        'found   : Object\n' +
        'required: int\n'
    },
    {
      path:'test/typechecks/test018.java',
      expected:
        'unexpected type\n' +
        'required: variable\n' +
        'found   : literal\n'
    },
    {
      path:'test/typechecks/test019.java',
      expected:
        'unexpected type\n' +
        'required: variable\n' +
        'found   : literal\n'
    },
    {
      path:'test/typechecks/test020.java',
      expected:''
    },
    {
      path:'test/typechecks/test021.java',
      expected:
        'possible loss of precision\n' +
        'found   : float\n' +
        'required: int\n'
      // TODO: this fails because 1.0 is tokenized as a double instead
      // of a float
    },
    {
      path:'test/typechecks/test022.java',
      expected:
        'possible loss of precision\n' +
        'found   : double\n' +
        'required: int\n'
    },
    {
      path:'test/typechecks/test023.java',
      expected:
        'unexpected type\n' +
        'required: variable\n' +
        'found   : literal\n'
    },
    {
      path:'test/typechecks/test024.java',
      expected:''
    },
    {
      path:'test/typechecks/test025.java',
      expected:
        'unexpected type\n' +
        'required: variable\n' +
        'found   : binary\n'
    },
    {
      path:'test/typechecks/test026.java',
      expected:
        'unexpected type\n' +
        'required: variable\n' +
        'found   : method\n'
    },
    {
      path:'test/typechecks/test027.java',
      expected:'operator ++ cannot be applied to String\n'
      // FIXME: when we have a stdlib this should be:
      // expected:'operator ++ cannot be applied to java.lang.String\n'
    },
    {
      path:'test/typechecks/test028.java',
      expected:'operator -- cannot be applied to String\n'
      // FIXME: when we have a stdlib this should be:
      // expected:'operator -- cannot be applied to java.lang.String\n'
    },
    {
      path:'test/typechecks/test029.java',
      expected:'operator + cannot be applied to String\n'
      // FIXME: when we have a stdlib this should be:
      // expected:'operator + cannot be applied to java.lang.String\n'
      // TODO: this fails because the parser discards leading +
      // operator
    },
    {
      path:'test/typechecks/test030.java',
      expected:'operator - cannot be applied to String\n'
      // FIXME: when we have a stdlib this should be:
      // expected:'operator - cannot be applied to java.lang.String\n'
    },
    {
      path:'test/typechecks/test031.java',
      expected:'operator ~ cannot be applied to String\n'
      // FIXME: when we have a stdlib this should be:
      // expected:'operator ~ cannot be applied to java.lang.String\n'
    },
    {
      path:'test/typechecks/test032.java',
      expected:'operator ! cannot be applied to String\n'
      // FIXME: when we have a stdlib this should be:
      // expected:'operator ! cannot be applied to java.lang.String\n'
    },
    {
      path:'test/typechecks/test033.java',
      expected:
        'unexpected type\n' +
        'required: variable\n' +
        'found   : literal\n'
    },
    {
      path:'test/typechecks/test034.java',
      expected:
        'unexpected type\n' +
        'required: variable\n' +
        'found   : literal\n'
    },
    {
      path:'test/typechecks/test035.java',
      expected:''
    },
    {
      path:'test/typechecks/test036.java',
      expected:''
    },
    {
      path:'test/typechecks/test037.java',
      expected:
        'unexpected type\n' +
        'required: variable\n' +
        'found   : literal\n'
    },
    {
      path:'test/typechecks/test038.java',
      expected:''
    },
    {
      path:'test/typechecks/test039.java',
      expected:'operator * cannot be applied to Widget, Widget\n'
    },
    {
      path:'test/typechecks/test040.java',
      expected:'operator * cannot be applied to Widget, int\n'
    },
    {
      path:'test/typechecks/test041.java',
      expected:''
    },
    {
      path:'test/typechecks/test042.java',
      expected:
        'possible loss of precision\n' +
        'found   : double\n' +
        'required: int\n'
    },
    {
      path:'test/typechecks/test043.java',
      expected:
        'incompatible types\n' +
        'found   : java.lang.String\n' +
        'required: int\n'
    },
    {
      path:'test/typechecks/test044.java',
      expected:
        'incompatible types\n' +
        'found   : Widget\n' +
        'required: int\n'
    },
    {
      path:'test/typechecks/test045.java',
      expected:'illegal initializer for int\n'
    },
    {
      path:'test/typechecks/test046.java',
      expected:'illegal initializer for int\n'
    },
    {
      path:'test/typechecks/test047.java',
      expected:''
    },
    {
      path:'test/typechecks/test048.java',
      expected:''
    },
    {
      path:'test/typechecks/test049.java',
      expected:
        'incompatible types\n' +
        'found   : int[][]\n' +
        'required: int[]\n'
    },
    {
      path:'test/typechecks/test050.java',
      expected:''
    },
    {
      path:'test/typechecks/test051.java',
      expected:
        'incompatible types\n' +
        'found   : int[]\n' +
        'required: int[][]\n'
    },
    {
      path:'test/typechecks/test052.java',
      expected:'array dimension missing\n'
    },
    {
      path:'test/typechecks/test053.java',
      expected:''
    },
    {
      path:'test/typechecks/test054.java',
      expected:''
    },
    {
      path:'test/typechecks/test055.java',
      expected:''
    },
    {
      path:'test/typechecks/test056.java',
      expected:''
    },
    {
      path:'test/typechecks/test057.java',
      expected:
        'incompatible types\n' +
        'found   : int\n' +
        'required: int[]\n'
    },
    {
      path:'test/typechecks/test058.java',
      expected:
        'incompatible types\n' +
        'found   : int\n' +
        'required: int[]\n'
    },
    {
      path:'test/typechecks/test059.java',
      expected:
        'incompatible types\n' +
        'found   : java.lang.String\n' +
        'required: int\n'
    },
    {
      path:'test/typechecks/test060.java',
      expected:
        'incompatible types\n' +
        'found   : Widget\n' +
        'required: int\n'
    },
    {
      path:'test/typechecks/test061.java',
      expected:
        'incompatible types\n' +
        'found   : double[]\n' +
        'required: int[]\n'
    },
    {
      path:'test/typechecks/test062.java',
      expected:
        'incompatible types\n' +
        'found   : double[]\n' +
        'required: int[]\n'
    },
    {
      path:'test/typechecks/test063.java',
      expected:''
    },
    {
      path:'test/typechecks/test064.java',
      expected:''
    },
    {
      path:'test/typechecks/test065.java',
      expected:
        'possible loss of precision\n' +
        'found   : double\n' +
        'required: int\n'
    },
    {
      path:'test/typechecks/test066.java',
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

  var summarize = false;
  var argc = args.length;
  if (argc) {
    for (var i = 0; i < argc; i++) {
      if (args[i] == '--summarize') summarize = true;
    }
  }

  if (!summarize) {
    Juliet.test.print('BEGIN TESTS');
    Juliet.test.print('');
  }

  var pass_count = 0;
  var fail_count = 0;
  for (var i = 0; i < tests.length; i++) {

    Juliet.stdout = '';

    try {

      Juliet.compile(readFile(tests[i].path));

      if (tests[i].principal) {
        Juliet.run(tests[i].principal);
      }

    } catch (e) {
      // if (e.message != 'QUIT') System.out.println(e);
      // if (e.message != 'QUIT') Juliet.test.print(e);
    }

    Juliet.test.init();
    Juliet.test.put('Running ' + tests[i].path + ' ' + tests[i].principal);

    if (tests[i].expected == Juliet.stdout) {
      pass_count++;
      Juliet.test.put(' pass');
    } else {
      fail_count++;
      Juliet.test.putln(' FAIL');

      Juliet.test.putln('Expected:');
      Juliet.test.put(tests[i].expected);

      Juliet.test.putln('Actual:');
      Juliet.test.put(Juliet.stdout);

      Juliet.test.putln('Code:');
      Juliet.test.putln(Juliet.source);
    }

    if (!summarize) {
      Juliet.test.print(Juliet.test.getTestInfo());
    }

  }

  if (!summarize) {
    Juliet.test.print('\nSUMMARY');
    Juliet.test.print('=======');
  }

  Juliet.test.print('Passed ' + pass_count + ' tests.');
  Juliet.test.print('Failed ' + fail_count + ' tests.');

  if (!summarize) {
    Juliet.test.print('END TESTS');
  } else {
    Juliet.test.print('');
  }

})(scriptArgs);
