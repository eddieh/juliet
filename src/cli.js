Juliet.CLI = function() {

  /* Privates */
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
        for (var i = 0; i < argc; i++) {
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
          } else filepath = scriptArgs[i];
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
