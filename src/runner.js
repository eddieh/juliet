var execute = function(className) {
  // initialize classes
  for (var c in Juliet.program) {
    // TODO: remove this kludge
    if (c == 'package') continue;
    if (c == 'imports') continue;

    var klass = Juliet.program[c];
    if (klass['<static-initializers>']) {
      var len = klass['<static-initializers>'].length;
      for (var i = 0; i < len; i++) {
        var si = klass['<static-initializers>'][i];
        if (typeof(si) === 'function') si.call();
      }
    }
  }

  if (Juliet.program[className]) {
    //var main = Juliet.program[className].public_static_void_main;
    var main = Juliet.program[className]['main___String[]'];
    if (!main) {
      print(className + ' does not have a main mehtod.');
      quit();
    }
    main.call();
  } else {
    if (className == '') {
      print('You must specify which class to run.');
    } else {
      print(className + ' not found.');
    }
    quit();
  }
};
