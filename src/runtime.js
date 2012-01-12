Juliet.runtime = function() {
  return {
    'new': function (klass, constructor) {
      var inst = Object.create(klass);
      var args = [];
      if (arguments.length > 2) {
        // collect arguments
        for (var i = 2; i < arguments.length; i++) {
          args.push(arguments[i]);
        }
      }
      // find appropriate constructor
      if (!constructor) {
        constructor = '<init>___';
      }
      if (typeof(inst['<class>']) === 'function')
        inst['<class>'].call(inst);
      if (inst['<instance-initializers>']) {
        var len = inst['<instance-initializers>'].length;
        for (var i = 0; i < len; i++) {
          var ii = inst['<instance-initializers>'][i];
          if (typeof(ii) === 'function') ii.call(inst);
        }
      }
      if (typeof(inst[constructor]) === 'function')
        inst[constructor].apply(inst, args);
      return inst;
    },

    'dispatch': function (name, context) {
      if (typeof(context) === 'string') {
        context = Juliet.program[context];
      }

      var args = [];
      var argTypeSig = '___';
      for (var i = 2; i < arguments.length; i++) {
        var a = arguments[i];
        args.push(a);
        switch(typeof(a)) {
        case 'object':
          // TODO: what is the objects Java type
          argTypeSig = argTypeSig + 'Object';
          break;
        case 'boolean':
          argTypeSig = argTypeSig + 'boolean';
          break;
        case 'number':
          // integer or double?
          var n = Number(a).toString();
          if (n.indexOf('.') == -1) {
            argTypeSig = argTypeSig + 'int';
          } else {
            argTypeSig = argTypeSig + 'double';
          }
          break;
        case 'string':
          // character or string?
          if (a.length == 1) {
            argTypeSig = argTypeSig + 'char';
          } else {
            argTypeSig = argTypeSig + 'String';
          }
          break;
        case 'function':
          // TODO: what is the objects Java type
          argTypeSig = argTypeSig + 'Object';
          break;
        default:
          break;

        }
        if (i < arguments.length - 1) argTypeSig = argTypeSig + '_';
      }

      if (context[name + argTypeSig]) {
        context[name + argTypeSig].apply(context, args);
      }

    }
  };
}();
