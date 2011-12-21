var filepath = '';
var showAST = false;
var verbose = false;
var run = false;
var className = '';

var argc = scriptArgs.length;
if (argc) {
  for (var i = 0; i < argc; i++) {
    if (scriptArgs[i] == '--trace') trace = true;
    else if (scriptArgs[i] == '--ast') showAST = true;
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
  init_parser();
  init_compiler();
  data = readFile(filepath);
  if (trace) print(data);
  parse();
  delete Parser.this_method;
  if (trace || showAST) Juliet.util.print_ast(Parser);

  compile(Parser);
  if (verbose) Juliet.util.print_ast(Result);

  if (run) {
    execute(className);
  }
}
