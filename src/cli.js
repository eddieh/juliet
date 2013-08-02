Juliet.CLI = function() {

  var filepath = '';
  var showAST = false;
  var showJS = false;
  var verbose = false;
  var run = false;
  var className = '';

  return {
    main: function() {
      var argc = scriptArgs.length;
      if (argc) {

        // Unfortunately the arguments can be ambiguous from the command
        // depending on shebang usage:
        //
        //    case1: node juliet-cli.js arg2 arg3 ...
        //    case2: ./juliet-cli.js arg1 arg2 ...
        //
        // So we *always* look for the .java extension on files to compile.

        for (var i = 1; i < argc; i++) {
          var ext = scriptArgs[i].split('.').pop();
          if (scriptArgs[i] == '--trace') Juliet.options.trace = true;
          else if (scriptArgs[i] == '--ast') showAST = true;
          else if (scriptArgs[i] == '--js') showJS = true;
          else if (scriptArgs[i] == '--verbose') verbose = true;
          else if (scriptArgs[i] == '--run') {
            run = true;
            i++;
            className = scriptArgs[i];
            if (!className) {
              print('Expected class name after --run.');
              quit();
            }
          } else if (ext == 'java') {
            // The argument was *probably* the file to compile
            filepath = scriptArgs[i];
          }
        }

        if (filepath == '') {
          print('No input file given.');
          quit();
        }

        if (verbose) print('Compiling :' + filepath);

        Juliet.lexer.init();
        Juliet.parser.init();
        Juliet.compiler.init();

        Juliet.source = readFile(filepath);
        if (Juliet.options.trace) {
          print(Juliet.source);
        }

        Juliet.parser.parse();
        if (Juliet.options.trace || showAST) {
          Juliet.util.print_ast(Juliet.AST);
        }

        Juliet.compiler.compile();
        if (verbose || showJS) {
          Juliet.util.print_ast(Juliet.program);
        }

        if (run) {
          Juliet.run(className);
        }
      }
    }
  };
}();

Juliet.CLI.main();
