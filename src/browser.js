Juliet.stdout = '';

System.out.println = function (a) {
  Juliet.stdout = Juliet.stdout + a + '\n';
};

quit = function () {
  throw new Error('QUIT');
};

print = System.out.println;

Juliet._compileAndRun = Juliet.compileAndRun;

Juliet.compileAndRun = function(source, className) {
  Juliet.stdout = '';

  try {
    Juliet._compileAndRun(source, className);
  } catch (e) {
    if (e.message == 'QUIT') e.message = '';
    System.out.println(e.message);
  }

  return Juliet.stdout;
};
