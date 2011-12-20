var filepath = '';
var showAST = false;
var verbose = false;
var run = false;
var className = '';

var argc = arguments.length;
if (argc) {
  for (var i = 0; i < argc; i++) {
    if (arguments[i] == '--trace') trace = true;
    else if (arguments[i] == '--ast') showAST = true;
    else if (arguments[i] == '--verbose') verbose = true;
    else if (arguments[i] == '--run') {
      run = true;
      i++;
      className = arguments[i];
      if (!className) {
        print('Expected class name after --run.');
        quit();
      }
    } else filepath = arguments[i];
  }

  if (verbose) print('Compiling :' + filepath);

  init();
  init_parser();
  init_compiler();
  data = readFile(filepath);
  if (trace) print(data);
  parse();
  delete Parser.this_method;
  if (trace || showAST) print_ast(Parser);

  compile(Parser);
  if (verbose) print_ast(Result);

  if (run) {
    execute(className);
  }
}
