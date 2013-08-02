Juliet.program = {};

Juliet.compiler = function() {
  var static_context = null;
  var prepared_units = [];
  var prepared_types = [];
  var unit_package = null;
  var basic_types = {
    'char': true,
    'int': true,
    'long': true,
    'short': true,
    'float': true,
    'double': true,
    'void': true
  };

  var forEach = Juliet.util.forEach;

  //  var is_class = function(a) {
  //    return a.modifiers & Juliet.MODIFIER_CLASS;
  //  };

  //  var is_interface = function(a) {
  //    return a.modifiers & Juliet.MODIFIER_INTERFACE;
  //  };

  //  var is_template = function(a) {
  //    return a.placeholder_types;
  //  };

  //  var is_static = function(a) {
  //    return a.modifiers & Juliet.MODIFIER_STATIC;
  //  };

  //  var is_abstract = function(a) {
  //    return a.modifiers & Juliet.MODIFIER_ABSTRACT;
  //  };

  //  var is_constructor = function(a) {
  //    return a.modifiers & Juliet.MODIFIER_CONSTRUCTOR;
  //  };


  var mangle = function(class_path, field_name, parameters) {
    if (parameters == undefined) {
      parameters = [];
    } else if (parameters.length == 0) {
      parameters = ['void'];
    } else {
      parameters = parameters.slice(0);
    }
    parameters.unshift(field_name);
    parameters = class_path.concat(parameters);

    var mangled = '';
    for (var i = 0; i < parameters.length; i++) {
      var pname = '';
      if (!parameters[i].kind) {
        pname = parameters[i];
      } else {
        if (parameters[i].kind == 'parameter') {
          pname = parameters[i].type.name;
        } else {
          print('Unknown element in parameter list.');
          quit();
        }
      }
      pname = pname.replace('[]', '___$');
      mangled += pname.length.toString();
      mangled += pname;
    }
    return mangled;
  };

  /*var clone = (function(){
    return function (obj) { Clone.prototype=obj; return new Clone() };
    function Clone(){}
    }());
  */

  var typeName = function(type) {
    var ret = '';
    var ch = 0;
    for (var i = 0; i < type.length; i++) {
      ch = type.charCodeAt(i);
      ret = ret + (((ch >= 97 && ch <= 122) ||
                    (ch >= 65 && ch <= 90) ||
                    (ch == 95) || (ch == 36) ||
                    (ch >= 48 && ch <= 57)) ? type.charAt(i) : ch);
    }
    return ret;
  };

  var parameterList = function(params) {
    if (Juliet.options.trace) print('parameterList');
    if (!params) return [];

    var lst = [];
    for (var i = 0; i < params.length; i++) {
      var name = params[i].name;
      var type = typeName(params[i].type.name);
      var typedName = type + '_' + name;
      lst.push(name);
      addIdentifier(name, name, params[i].type, false, 'local');
    }
    return lst;
  };

  function printScope(obj) {
    function fn(obj, i) {
      forEach(obj.scope, function(member, member_name) {
        print('scope[' + i + ']: ' + member_name);
      });
      fn(obj.scopeParent, i++);
    }
    fn(obj, 0);
  }

  function typeFromNode(obj, ast) {
    function fn(obj, ast) {
      if (ast.name in obj.scope) {
        return obj.scope[ast.name];
      }
      if (obj.scopeParent) {
        return fn(obj.scopeParent, ast);
      }
    }
    var t = fn(obj, ast);
    if (t) return t;
    printScope(unit);
    throw token.name + ' is undefined.';
  }

  function newScope(obj, parent) {
    obj.scope = {};
    obj.scopeParent = parent;
  }

  function addToScope(obj, name, obj2) {
    obj.scope[name] = obj2;
  }

  function fullyQualifiedName(type, sep) {
    if (type.name in basic_types) return type.name;
    if (sep === undefined) sep = '.';
    return type.path.join(sep) + sep + type.name;
  }

/*
  function typeDescriptorForName(id) {
    var name = (typeof(id) === 'object') ? id.name : id;
    if (Juliet.options.trace) print('typeDescriptorForName: ' + name);
    var curScope = scope.length - 1;
    for (var i = curScope; i >= 0; i--) {
      if (name in scope[i]) {
        var n = scope[i][name];
        return n;
      }
    }
    // TODO: super
    return null;
  }
*/

  function typeListSignature(typeList) {
    var ret = '';
    var arity = 0;
    if (typeList) arity = typeList.length;
    ret = ret + '___';
    for (var i = 0; i < arity; i++) {
      switch (typeList[i].kind) {
      case 'parameter':
        ret = ret + typeList[i].type.name;
        break;
      case 'literal':
        switch (typeList[i].token) {
        case Juliet.LITERAL_CHAR:
          ret = ret + 'char';
          break;
        case Juliet.LITERAL_STRING:
          ret = ret + 'String';
          break;
        case Juliet.LITERAL_DOUBLE:
          ret = ret + 'double';
          break;
        case Juliet.LITERAL_INT:
          ret = ret + 'int';
          break;
        case Juliet.LITERAL_BOOLEAN:
          ret = ret + 'boolean';
          break;
        case Juliet.TOKEN_NULL:
          ret = ret + 'Object';
          break;
        }
      case 'construct':
        // method call
        if (typeList[i].args) {
          return '';
        }

        var t = typeDescriptorForName(typeList[i].name);
        if (t && t.type) ret = ret + t.type.name;
        break;
      default:
        // can't determine at compile-time return the empty string so
        // that the methods base name is used

        // NOTE: this case will happen when the arguments are
        // expressions, etc.

        return '';
        break;
      }
      if (i < arity - 1) ret = ret + '_';
    }
    //if (arity > 0) ret = ret + ')';
    return ret;
  }

  var methodSignature = function(m) {
    var sig = m.name;
    return sig + typeListSignature(m.parameters);
  };

  var nameInContextClass = function(cxt_class, id) {
    // Is it just the name, or an object with the name in it?
    //var name = (typeof(id) === 'object') ? id.name : name;
    var name = undefined;

    if (id.kind == 'new') {
      name = id.type.name;
    } else {
      name = id.name;
    }

    // Use the class to lookup the appropriate field.
    while (cxt_class && cxt_class.name) {

      if (Juliet.options.trace) print('  cxt_class: ' + cxt_class.name);
      var mname = mangle(cxt_class.name, name);

      if ('_I' + mname in cxt_class) {

        if (id.args) {
          var methods = cxt_class['_I' + mname];

          if (!Juliet.util.isArray(methods)) {
            print(name + ' is defined as a field, not a method in ' + context);
            quit();
          }

          // Overloading:
          // We have to find the most specific signature.
          // http://docs.oracle.com/javase/specs/jls/se7/html/jls-15.html#jls-15.12
          var best_method = null;

          for (var k = 0; k < methods.length; k++) {
            var method_name = methods[k];
            var method = cxt_class[method_name];
            // TODO: Find the most specific signature.  Currently we
            // only find the first fit based on arity.
            if (id.args.length == method.parameters.length) {
              best_method = method_name;
            }
          }

          // TODO: Check access qualifiers

          if (best_method) {
            return '_Z' + best_method.substring(2);
          }

          // TODO: Better error.
          print('No matching signature for call to \'' + name + '\' in ' +
                context);
          quit();

        } else {

          // Property lookup
          if (Juliet.util.isArray(methods)) {
            print(name + ' is defined as a method, not a field in ' + context);
            quit();
          }

          // TODO: Check access qualifiers

          return '_Z' + mname;
        }

      }

      if (cxt_class.base_class) {
        cxt_class = Juliet.program[cxt_class.base_class];
      } else {
        cxt_class = null;
      }
    }

    return cxt_class;
  };

  // context: string like 'this'
  // name: construct dict or just a name..?
  var nameInContext = function(context, id) {

    // Is it just the name, or an object with the name in it?
    var name = (typeof(id) === 'object') ? id.name : name;

    if (Juliet.options.trace) print('nameInContext: ' + context);
    //if (Juliet.options.trace) print('  name: ' + name);

    // Get the type for the context.
    var cxt_type = typeDescriptorForName(context);

    // Then look up the class for the type.
    var cxt_class = Juliet.program[cxt_type.type.name];

    var r = nameInContextClass(cxt_class, id);

    if (r) return r;

    print(name + ' is not a member of ' + context);
    quit();
  };

  var nameInScope = function(id, simple) {
    var name = (typeof(id) === 'object') ? id.name : id;
    if (Juliet.options.trace) print('nameInScope: ' + name);

    var args = id.args;
    var argTypeSig = '';
    if (args) {
      argTypeSig = typeListSignature(args);
      //if (argTypeSig === '') {
      //    return 'Juliet.runtime.dispatch(\'' + name + '\',this,';
      //
      //}
    }

    var curScope = scope.length - 1;
    for (var i = curScope; i >= 0; i--) {

      //Juliet.util.print_ast(scope[i]);

      if (name in scope[i]) {
        var n = scope[i][name];
        return n.name;
      }

      cname = name.split('.');
      cname = cname[cname.length - 1];
      if ((cname in scope[i]) && (scope[i][cname].name == name)) {
        return n.name;
      }


      if ((name + argTypeSig) in scope[i]) {
        var context = 'this.';

        if (static_context) {
          context = 'Juliet.program.' + static_context.name + '.';
        }

        if (simple) {
          context = '';
        }

        var n = context + name + argTypeSig;
        return n;
      }

    }

    var typeDescriptor = typeDescriptorForName('this');
    var typeName = null;
    if (typeDescriptor && typeDescriptor.type) {
      typeName = typeDescriptor.type.name;
    }

    // TODO: super
    // TODO: single-static-import declarations
    // TODO: static-import-on-demand declarations
    // TODO: if in static context, check if this is an instance
    // identifier and print appropriate message
    // (update tests/scope/test17.java to reflect this change)
    print(name + ' is not defined');
    quit();
  };

  var addIdentifier = function(name, canonicalName, type, shadowable, kind) {
    if (Juliet.options.trace) print('addIdentifier');

    var curScope = scope.length - 1;
    for (var i = curScope; i >= 0; i--) {
      if (name in scope[i]) {
        if (!scope[i][name].shadowable) {
          print(name + ' is already defined');
          quit();
        }
      }
    }

    scope[scope.length - 1][name] = {
      name: canonicalName,
      type: type,
      shadowable: shadowable,
      kind: kind};
  };

  function getPackage(pkg) {
    var partial = Juliet.packages;
    for (var i in pkg) {
      var name = pkg[i].name;
      if (!(name in partial)) {
        return null;
      }
      partial = partial[name];
    }
    return partial;
  }

  function makePackage(pkg) {
    var partial = Juliet.packages;
    for (var i in pkg) {
      var name = pkg[i].name;
      if (!(name in partial)) {
        partial[name] = {
          $types: {}
        };
      }
      partial = partial[name];
    }
    return partial;
  }

  //  var constructorForArguments = function(args) {
  //    return '\'__init__' + typeListSignature(args) + '\'';
  //  };

  var pushScope = function() {
    if (Juliet.options.trace) print('pushScope');
    scope.push({});
  };

  var popScope = function() {
    if (Juliet.options.trace) print('popScope');
    scope.pop();
  };

  var isLocal = function(id) {
    return id.kind == 'local';
  };

  var isField = function(id) {
    return id.kind == 'property';
  };

  var isArrayAccess = function(id) {
    return true;
  };

  var isLeftHandSide = function(lhs) {

  };

  var booleanType = function(name) {
    switch (name) {
    case 'boolean':
    case 'Boolean':
      return true;
    }
    return false;
  };

  var integralType = function(name) {
    switch (name) {
    case 'byte':
    case 'short':
    case 'int':
    case 'long':
    case 'char':
      return true;
    }
    return false;
  };

  var numericType = function(name) {
    switch (name) {
    case 'byte':
    case 'short':
    case 'int':
    case 'long':
    case 'char':
    case 'float':
    case 'double':
      return true;
    }
    return false;
  };

  var primitiveType = function(name) {
    switch (name) {
    case 'boolean':
    case 'byte':
    case 'short':
    case 'int':
    case 'long':
    case 'char':
    case 'float':
    case 'double':
      return true;
    }
    return false;
  };

  var primitiveTypeWidth = function(name) {
    switch (name) {
    case 'boolean': return 1;
    case 'byte': return 2;
    case 'short': return 3;
    case 'char': return 4;
    case 'int': return 5;
    case 'long': return 6;
    case 'float': return 7;
    case 'double': return 8;
    }
    return 0;
  };

  var referenceType = function(name) {
    return !primitiveType(name);
  };

  var stringType = function(type) {
    switch (type) {
    case 'java.lang.String':
    case 'String':
      return true;
    }
    return false;
  };

  var arrayType = function(name) {
    var i = name.indexOf('[');
    if (i == -1) return name;
    return name.substring(0, i);
  };

  var arrayDimension = function(name) {
    var i = name.indexOf('[');
    return name.substring(i).split('[]').length - 1;
  };

  function primitiveStr(t) {
    switch (t) {
    case Juliet.LITERAL_DOUBLE:
      return 'double';
    case Juliet.LITERAL_FLOAT:
      return 'float';
    case Juliet.LITERAL_LONG:
      return 'long';
    case Juliet.LITERAL_INT:
      return 'int';
    case Juliet.LITERAL_CHAR:
      return 'char';
    case Juliet.LITERAL_SHORT:
      return 'short';
    case Juliet.LITERAL_BYTE:
      return 'byte';
    case Juliet.LITERAL_BOOLEAN:
      return 'boolean';
    case Juliet.LITERAL_STRING:
      return 'java.lang.String';
    case Juliet.TOKEN_NULL:
      return 'null';
    }
  }

  var getType = function(a) {
    if (a.kind == 'literal') {
      return a;
    }

    if (a.kind == 'construct') {
      if (a.token == Juliet.TOKEN_ID) {
        var typeDescriptor = typeDescriptorForName(a.name);
        if (typeDescriptor.type) {
          return typeDescriptor.type;
        }

      } else {
        return a;
      }
    }

    if (a.kind == 'property') {
      return a.type;
    }

    if (a.kind == 'type' || a.kind == 'definition') {
      return a;
    }

    if (a.kind == 'array') {
      return a.type;
    }

    if (a.kind == 'local') {
      return a.type;
    }

    if (a.kind == 'method') {
      return a.return_type;
    }

    print('getType: no handler for ' + a.kind);
    quit();
  };

  var getTypeName = function(a) {
    if (a.kind == 'literal') {
      return primitiveStr(a.token);
    }

    if (a.kind == 'construct') {
      if (a.token == Juliet.TOKEN_ID) {
        var typeDescriptor = typeDescriptorForName(a.name);

        if (!typeDescriptor) {
          var name = nameInScope(a, true);
          typeDescriptor = typeDescriptorForName(name);
        }

        if (typeDescriptor.type) {
          if (typeDescriptor.type.name) {
            return typeDescriptor.type.name;
          }
        }
      } else {
        return a.name;
      }
    }

    if (a.kind == 'property') {
      return a.type.name;
    }

    if (a.kind == 'type' || a.kind == 'definition') {
      return a.name;
    }

    if (a.kind == 'array') {
      return a.type.name;
    }

    if (a.kind == 'local') {
      return a.type.name;
    }

    if (a.kind == 'method') {
      return a.return_type.name;
    }

    print('getTypeName: no handler for ' + a.kind);
    quit();
  };

  var compatibleTypes = function(leftType, rightType) {
    var leftTypeName = getTypeName(leftType);
    var rightTypeName = getTypeName(rightType);

    if (primitiveType(leftTypeName)) {

      // TODO: is this helpful?
      if (rightType.kind == 'array') {
        print('illegal initializer for ' + leftTypeName);
        quit();
      }

      if (leftTypeName == 'double') {
        switch (rightTypeName) {
        case 'double':
        case 'float':
        case 'long':
        case 'int':
        case 'char':
        case 'short':
        case 'byte':
        case 'null':
          return;
        }
        print('incompatible types');
        print('found   : ' + rightTypeName);
        print('required: ' + leftTypeName);
        quit();
      }

      if (leftTypeName == 'float') {
        switch (rightTypeName) {
        case 'float':
        case 'long':
        case 'int':
        case 'char':
        case 'short':
        case 'byte':
        case 'null':
          return;
        }
        if (primitiveType(rightTypeName))
          print('possible loss of precision');
        else
          print('incompatible types');
        print('found   : ' + rightTypeName);
        print('required: ' + leftTypeName);
        quit();
      }

      if (leftTypeName == 'long') {
        switch (rightTypeName) {
        case 'long':
        case 'int':
        case 'char':
        case 'short':
        case 'byte':
        case 'null':
          return;
        }
        if (primitiveType(rightTypeName))
          print('possible loss of precision');
        else
          print('incompatible types');
        print('found   : ' + rightTypeName);
        print('required: ' + leftTypeName);
        quit();
      }

      if (leftTypeName == 'int') {
        switch (rightTypeName) {
        case 'int':
        case 'char':
        case 'short':
        case 'byte':
        case 'null':
          return;
        }
        if (primitiveType(rightTypeName))
          print('possible loss of precision');
        else
          print('incompatible types');
        print('found   : ' + rightTypeName);
        print('required: ' + leftTypeName);
        quit();
      }

      if (leftTypeName == 'char') {
        switch (rightTypeName) {
        case 'char':
        case 'short':
        case 'byte':
        case 'null':
          return;
        }
        if (primitiveType(rightTypeName))
          print('possible loss of precision');
        else
          print('incompatible types');
        print('found   : ' + rightTypeName);
        print('required: ' + leftTypeName);
        quit();
      }

      if (leftTypeName == 'short') {
        switch (rightTypeName) {
        case 'char':
        case 'short':
        case 'byte':
        case 'null':
          return;
        }
        if (primitiveType(rightTypeName))
          print('possible loss of precision');
        else
          print('incompatible types');
        print('found   : ' + rightTypeName);
        print('required: ' + leftTypeName);
        quit();
      }

      if (leftTypeName == 'byte') {
        switch (rightTypeName) {
        case 'byte':
        case 'null':
          return;
        }
        if (primitiveType(rightTypeName))
          print('possible loss of precision');
        else
          print('incompatible types');
        print('found   : ' + rightTypeName);
        print('required: ' + leftTypeName);
        quit();
      }
    } else {

      if (leftTypeName[leftTypeName.length - 1] == ']') {
        if (Juliet.options.trace) print('  ARRAY');

        // Juliet.util.print_ast(leftType);
        // Juliet.util.print_ast(rightType);

        // print('leftTypeName: ' + arrayType(leftTypeName));
        // print('rightTypeName: ' + arrayType(rightTypeName));

        // compatible types?
        if (arrayType(leftTypeName) != arrayType(rightTypeName)) {
          print('incompatible types');
          print('found   : ' + rightTypeName);
          print('required: ' + leftTypeName);
          quit();
        }

        // compatible dimensions?
        var ldim = arrayDimension(leftTypeName);
        var rdim = 0;
        if (rightType.length) {
          rdim = rightType.length;
        } else {
          rdim = arrayDimension(rightTypeName);
        }

        // print('l.length: ' + ldim);
        // print('r.length: ' + rdim);

        if (ldim != rdim) {
          var displayName = rightTypeName;
          if (rightType.length) {
            for (var i = 0, len = rightType.length; i < len; i++) {
              displayName = displayName + '[]';
            }
          }

          print('incompatible types');
          print('found   : ' + displayName);
          print('required: ' + leftTypeName);
          quit();
        }
      }
    }
  };

  var reduceByOneDimension = function(name) {
    var i = name.lastIndexOf('[');
    return name.substring(0, i);
  };

  var arrayAccessExpressionType = function(expr) {
    var depth = 1;
    while (expr.operand.kind != 'construct') {
      expr = expr.operand;
      depth++;
    }

    print('R');
    var name = nameInScope(expr.operand, true);
    typeDescriptor = typeDescriptorForName(name);

    var effectiveTypeName = typeDescriptor.type.name;
    for (var i = 0; i < depth; i++) {
      effectiveTypeName = reduceByOneDimension(effectiveTypeName);
    }

    var type = Juliet.util.copy(typeDescriptor.type);
    type.name = effectiveTypeName;
    return type;
  };

  var typeCheckArray = function(array) {
    if (Juliet.options.trace) print('typeCheckArray');
    var name = array.type.name;
    if (array.token == Juliet.TOKEN_LCURLY && array.terms) {
      var arrayElements = array.terms;
      for (elementKey in arrayElements) {
        if (!arrayElements.hasOwnProperty(elementKey)) continue;

        var t = Juliet.util.copy(array.type);
        t.name = reduceByOneDimension(name);

        var t2 = arrayElements[elementKey];

        // TODO: this needs to be recursive!

        // Juliet.util.print_ast(array.type);
        // print('t:');Juliet.util.print_ast(t);
        // print('t2:');Juliet.util.print_ast(t2);

        compatibleTypes(t, t2);
      }
    }
    return array.type;
  };

  var typeCheckNew = function(expr) {
    if (Juliet.options.trace) print('typeCheckNew');
    return expr.type;
  };

  var typeCheckWiderNumericType = function(leftType, rightType) {
    if (Juliet.options.trace) print('typeCheckWiderNumericType');
    var leftTypeName = getTypeName(leftType);
    var rightTypeName = getTypeName(rightType);

    var leftWidth = primitiveTypeWidth(leftTypeName);
    var rightWidth = primitiveTypeWidth(rightTypeName);

    if (leftWidth > rightWidth) return leftType;
    return rightType;

    // TODO: should we return a special value type?
    return {
      token: Juliet.TOKEN_INT,
      kind: 'value'
    };
  };

  var typeCheckIncDecExpr = function(expr) {
    if (Juliet.options.trace) print('typeCheckIncDecExpr');
    // variable?
    if (expr.operand) {
      if (expr.operand.kind != 'construct') {
        print('unexpected type');
        print('required: variable');
        print('found   : ' + expr.operand.kind);
        quit();
      }

      print('S');
      var name = nameInScope(expr.operand, true);
      var type = typeDescriptorForName(name);
      if ((type.kind != 'local') && (type.kind != 'property')) {
        print('unexpected type');
        print('required: variable');
        print('found   : ' + type.kind);
        quit();
      }

      // TODO: we'll need to check if it's been declared final, etc
    }

    // numeric?
    var operandType = getType(expr.operand);
    var operandTypeName = getTypeName(expr.operand);

    if (!numericType(operandTypeName)) {
      print('operator ' +
            Juliet.lexer.operatorStr(expr.token) +
            ' cannot be applied to ' +
            operandTypeName);
      quit();
    }

    return operandType;
  };

  var typeCheckPostfixExpr = function(expr) {
    if (Juliet.options.trace) print('typeCheckPostfixExpr');
    // TODO: hmmmm?
    // var operand = typeCheckExpr(expr.operand);

    // ++, -- must be applied to variables with numeric types
    if ((expr.token == Juliet.TOKEN_INCREMENT) ||
        (expr.token == Juliet.TOKEN_DECREMENT)) {
      return typeCheckIncDecExpr(expr);
    }

    return typeCheckContextualAccess(expr);
  };

  var typeCheckPrefixExpr = function(expr) {
    if (Juliet.options.trace) print('typeCheckPrefixExpr');
    var operand = typeCheckExpr(expr.operand);

    // ++, -- must be applied to variables with numeric types
    if ((expr.token == Juliet.TOKEN_INCREMENT) ||
        (expr.token == Juliet.TOKEN_DECREMENT)) {
      return typeCheckIncDecExpr(expr);
    }

    var operandType = getType(operand);
    var operandTypeName = getTypeName(operand);

    // +, - must be applied to a type that can be converted to a
    // numeric (primitive?) type
    if ((expr.token == Juliet.TOKEN_PLUS) ||
        (expr.token == Juliet.TOKEN_MINUS)) {
      if (!numericType(operandTypeName)) {
        print('operator ' +
              Juliet.lexer.operatorStr(expr.token) +
              ' cannot be applied to ' +
              operandTypeName);
        quit();
      }

      // TODO:
      // See 15.15.3, 15.15.4
      // See 5.6.1 Unary Numeric Promotion
      return operandType;
    }

    // ~ must be applied to a type that can be converted to a
    // primitive integral type
    if (expr.token == Juliet.TOKEN_TILDE) {
      if (!integralType(operandTypeName)) {
        print('operator ' +
              Juliet.lexer.operatorStr(expr.token) +
              ' cannot be applied to ' +
              operandTypeName);
        quit();
      }

      // TODO:
      return operandType;
    }

    // ! must be applied to boolean or Boolean
    if (expr.token == Juliet.TOKEN_BANG) {
      if (operandTypeName != 'boolean' || operandTypeName != 'Boolean') {
        print('operator ' +
              Juliet.lexer.operatorStr(expr.token) +
              ' cannot be applied to ' +
              operandTypeName);
        quit();
      }

      // TODO:
      return operandType;
    }
  };

  var typeCheckBinaryExpr = function(expr) {
    if (Juliet.options.trace) print('typeCheckBinaryExpr');

    var multiplicative = function(a) {
      switch (a) {
      case Juliet.TOKEN_STAR:
      case Juliet.TOKEN_SLASH:
      case Juliet.TOKEN_PERCENT:
        return true;
      }
      return false;
    };

    var shift = function(a) {
      switch (a) {
      case Juliet.TOKEN_SHL:
      case Juliet.TOKEN_SHR:
      case Juliet.TOKEN_SHRX:
        return true;
      }
      return false;
    };

    var relational = function(a) {
      switch (a) {
      case Juliet.TOKEN_LT:
      case Juliet.TOKEN_LE:
      case Juliet.TOKEN_GT:
      case Juliet.TOKEN_GE:
        return true;
      }
      return false;
    };

    var equality = function(a) {
      switch (a) {
      case Juliet.TOKEN_EQ:
      case Juliet.TOKEN_NE:
        return true;
      }
      return false;
    };

    var bitwiseAndLogical = function(a) {
      switch (a) {
      case Juliet.TOKEN_AMPERSAND:
      case Juliet.TOKEN_PIPE:
      case Juliet.TOKEN_CARET:
        return true;
      }
      return false;
    };

    var conditional = function(a) {
      switch (a) {
      case Juliet.TOKEN_LOGICAL_AND:
      case Juliet.TOKEN_LOGICAL_OR:
        return true;
      }
      return false;
    };

    var lhs = typeCheckExpr(expr.lhs);
    var rhs = typeCheckExpr(expr.rhs);

    var leftType = getType(lhs);
    var rightType = getType(rhs);

    var leftTypeName = getTypeName(lhs);
    var rightTypeName = getTypeName(rhs);

    // Multiplicative Operators
    if (multiplicative(expr.token)) {
      if (!numericType(leftTypeName) || !numericType(rightTypeName)) {
        print('operator ' +
              Juliet.lexer.operatorStr(expr.token) +
              ' cannot be applied to ' +
              leftTypeName + ', ' + rightTypeName);
        quit();
      }

      // TODO:
      // for now just use whichever kind is wider
      return typeCheckWiderNumericType(leftType, rightType);
    }

    // Additive Operators
    if (expr.token == Juliet.TOKEN_PLUS) {
      // if either operand of + is String the operation is string
      // concatenation
      if (stringType(leftTypeName) || stringType(rightTypeName)) {
        return {
          token: Juliet.TOKEN_ID,
          kind: 'type',
          name: 'java.lang.String'
        };
      }

      // otherwise each operand must be a numeric type
      if (!numericType(leftTypeName) || !numericType(rightTypeName)) {
        print('operator ' +
              Juliet.lexer.operatorStr(expr.token) +
              ' cannot be applied to ' +
              leftTypeName + ', ' + rightTypeName);
        quit();
      }

      // TODO:
      // See 15.18.2 on how to determine the tpe of the additive
      // expression
      // See 5.6.2 Binary Numeric Promotion

      // for now just use whichever kind is wider
      return typeCheckWiderNumericType(leftType, rightType);
    }

    if (expr.token == Juliet.TOKEN_MINUS) {
      if (!numericType(leftTypeName) || !numericType(rightTypeName)) {
        print('operator ' +
              Juliet.lexer.operatorStr(expr.token) +
              ' cannot be applied to ' +
              leftTypeName + ', ' + rightTypeName);
        quit();
      }

      // TODO:
      // for now just use whichever kind is wider
      return typeCheckWiderNumericType(leftType, rightType);
    }

    // Shift Operators
    if (shift(expr.token)) {
      if (!integralType(leftTypeName) || !integralType(rightTypeName)) {
        print('operator ' +
              Juliet.lexer.operatorStr(expr.token) +
              ' cannot be applied to ' +
              leftTypeName + ', ' + rightTypeName);
        quit();
      }

      // TODO:
      // for now just use whichever kind is wider
      return typeCheckWiderNumericType(leftType, rightType);
    }

    // Relational Operators
    if (relational(expr.token)) {
      if (!numericType(leftTypeName) || !numericType(rightTypeName)) {
        print('operator ' +
              Juliet.lexer.operatorStr(expr.token) +
              ' cannot be applied to ' +
              leftTypeName + ', ' + rightTypeName);
        quit();
      }

      // TODO:
      // for now just use whichever kind is wider
      return typeCheckWiderNumericType(leftType, rightType);
    }

    if (expr.token == Juliet.TOKEN_INSTANCEOF) {
      // see langspec-3.0 15.20.2

      print('instanceof type checking not implemented');
      quit();
    }

    // Equality Operators
    if (equality(expr.token)) {
      // 15.21.1
      // 15.21.2
      // 15.21.3
      print('Warning: equality operators type checking not implemented');
      //quit();
    }

    // Bitwise and Logical Operators
    if (bitwiseAndLogical(expr.token)) {
      // integral
      if (integralType(leftTypeName)) {
        if (!integralType(rightTypeName)) {
          print('operator ' +
                Juliet.lexer.operatorStr(expr.token) +
                ' cannot be applied to ' +
                leftTypeName + ', ' + rightTypeName);
          quit();
        }
      }
      if (integralType(rightTypeName)) {
        if (!integralType(leftTypeName)) {
          print('operator ' +
                Juliet.lexer.operatorStr(expr.token) +
                ' cannot be applied to ' +
                leftTypeName + ', ' + rightTypeName);
          quit();
        }
      }

      // boolean
      if (booleanType(leftTypeName)) {
        if (!booleanType(rightTypeName)) {
          print('operator ' +
                Juliet.lexer.operatorStr(expr.token) +
                ' cannot be applied to ' +
                leftTypeName + ', ' + rightTypeName);
          quit();
        }
      }
      if (booleanType(rightTypeName)) {
        if (!booleanType(leftTypeName)) {
          print('operator ' +
                Juliet.lexer.operatorStr(expr.token) +
                ' cannot be applied to ' +
                leftTypeName + ', ' + rightTypeName);
          quit();
        }
      }

      // TODO:
      // for now just use whichever kind is wider
      return typeCheckWiderNumericType(leftType, rightType);
    }

    if (conditional(expr.token)) {
      if (booleanType(leftTypeName) || booleanType(rightTypeName)) {
        print('operator ' +
              Juliet.lexer.operatorStr(expr.token) +
              ' cannot be applied to ' +
              leftTypeName + ', ' + rightTypeName);
        quit();
      }

      // TODO:
      // for now just use whichever kind is wider
      return typeCheckWiderNumericType(leftType, rightType);
    }
  };

  var typeCheckTernary = function(expr) {
    if (Juliet.options.trace) print('typeCheckTernary');
    var trueValue = typeCheckExpr(expr.true_value);
    var falseValue = typeCheckExpr(expr.false_value);

    // Juliet.util.print_ast(expr);
    var expressionType = getType(expr.expression);
    var expressionTypeName = getTypeName(expr.expression);

    if (!booleanType(expressionTypeName)) {
      print('incompatible types');
      print('found   : ' + expressionTypeName);
      print('required: ' + 'boolean');
      quit();
    }

    var trueValueType = getType(trueValue);
    var falseValueType = getType(falseValue);
    var trueValueTypeName = getTypeName(trueValue);
    var falseValueTypeName = getTypeName(falseValue);

    // Juliet.util.print_ast(trueValue);
    // Juliet.util.print_ast(falseValue);
    // print('trueValueType:');Juliet.util.print_ast(trueValueType);
    // print('falseValueType:');Juliet.util.print_ast(falseValueType);

    if (trueValueTypeName == 'void') {
      print('cannot invoke void method here');
      quit();
    }

    if (falseValueTypeName == 'void') {
      print('cannot invoke void method here');
      quit();
    }

    if (trueValueTypeName == falseValueTypeName) {
      return trueValueType;
    }

    if (trueValueTypeName == 'boolean') {
      if (falseValueTypeName == 'Boolean') {
        return trueValueType;
      }
    }

    if (falseValueTypeName == 'boolean') {
      if (trueValueTypeName == 'Boolean') {
        return falseValueType;
      }
    }

    if (trueValueTypeName == 'null') {
      if (referenceType(falseValueTypeName)) {
        return falseValueType;
      }
    }

    if (falseValueTypeName == 'null') {
      if (referenceType(trueValueTypeName)) {
        return trueValueType;
      }
    }

    if (numericType(trueValueTypeName) && numericType(falseValueTypeName)) {

      if (trueValueTypeName == 'byte' || trueValueTypeName == 'Byte') {
        if (falseValueTypeName == 'short' || falseValueTypeName == 'Short') {
          return {
            token: Juliet.TOKEN_SHORT,
            kind: 'type',
            name: 'short'
          };
        }
      }

      if (Juliet.util.contains(['byte', 'short', 'char'], trueValueTypeName)) {
        if (falseValueType.token == Juliet.LITERAL_INT) {
          switch (trueValueTypeName) {
          case 'byte':
            if (falseValue.value >= -128 && falseValue.value <= 127) {
              return {
                token: Juliet.TOKEN_BYTE,
                kind: 'type',
                name: 'byte'
              };
            }
          case 'short':
            if (falseValue.value >= -32768 && falseValue.value <= 32767) {
              return {
                token: Juliet.TOKEN_SHORT,
                kind: 'type',
                name: 'short'
              };
            }
          case 'char':
            if (falseValue.value >= -32768 && falseValue.value <= 32767) {
              return {
                token: Juliet.TOKEN_CHAR,
                kind: 'type',
                name: 'char'
              };
            }
          }
        }
      }

      if (Juliet.util.contains(['byte', 'short', 'char'], falseValueTypeName)) {
        if (trueValueType.token == Juliet.LITERAL_INT) {
          switch (falseValueTypeName) {
          case 'byte':
            if (trueValue.value >= -128 && trueValue.value <= 127) {
              return {
                token: Juliet.TOKEN_BYTE,
                kind: 'type',
                name: 'byte'
              };
            }
          case 'short':
            if (trueValue.value >= -32768 && trueValue.value <= 32767) {
              return {
                token: Juliet.TOKEN_SHORT,
                kind: 'type',
                name: 'short'
              };
            }
          case 'char':
            if (trueValue.value >= -32768 && trueValue.value <= 32767) {
              return {
                token: Juliet.TOKEN_CHAR,
                kind: 'type',
                name: 'char'
              };
            }
          }
        }
      }

      if (Juliet.util.contains(['Byte', 'Short', 'Character'],
                               trueValueTypeName)) {
        if (falseValueType.token == Juliet.LITERAL_INT) {
          switch (trueValueTypeName) {
          case 'Byte':
            if (falseValue.value >= -128 && falseValue.value <= 127) {
              return {
                token: Juliet.TOKEN_BYTE,
                kind: 'type',
                name: 'byte'
              };
            }
          case 'Short':
            if (falseValue.value >= -32768 && falseValue.value <= 32767) {
              return {
                token: Juliet.TOKEN_SHORT,
                kind: 'type',
                name: 'short'
              };
            }
          case 'Character':
            if (falseValue.value >= -32768 && falseValue.value <= 32767) {
              return {
                token: Juliet.TOKEN_CHAR,
                kind: 'type',
                name: 'char'
              };
            }
          }
        }
      }

      if (Juliet.util.contains(['Byte', 'Short', 'Character'],
                               falseValueTypeName)) {
        if (trueValueType.token == Juliet.LITERAL_INT) {
          switch (falseValueTypeName) {
          case 'Byte':
            if (trueValue.value >= -128 && trueValue.value <= 127) {
              return {
                token: Juliet.TOKEN_BYTE,
                kind: 'type',
                name: 'byte'
              };
            }
          case 'Short':
            if (trueValue.value >= -32768 && trueValue.value <= 32767) {
              return {
                token: Juliet.TOKEN_SHORT,
                kind: 'type',
                name: 'short'
              };
            }
          case 'Character':
            if (trueValue.value >= -32768 && trueValue.value <= 32767) {
              return {
                token: Juliet.TOKEN_CHAR,
                kind: 'type',
                name: 'char'
              };
            }
          }
        }
      }

      // TODO: unboxing conversion see 5.1.8
      // TODO: value set conversion see 5.1.13
      return typeCheckWiderNumericType(trueValueType, falseValueType);
    }

    // TODO: box see 5.1.7
    // TODO: capture conversion see 5.1.10

    // FIXME: these are not proper rules
    if (referenceType(trueValueTypeName)) {
      return trueValueType;
    }

    if (referenceType(falseValueTypeName)) {
      return falseValueType;
    }

    print('no other rules for determining the type of ?: expression');
    quit();

  };

  var typeCheckExpr = function(expr) {
    if (Juliet.options.trace) print('typeCheckExpr: ' + expr.kind);

    if (expr.kind == 'literal') {
      return expr;
    }

    if (expr.kind == 'construct') {
      var name = nameInScope(expr, true);
      typeDescriptor = typeDescriptorForName(name);
      //if (Juliet.options.trace) {
      //    Juliet.util.print_ast(typeDescriptor.type);
      //}

      return typeDescriptor.type;
    }

    if (expr.kind == 'binary') {
      return typeCheckBinaryExpr(expr);
    }

    if (expr.kind == 'postfix') {
      return typeCheckPostfixExpr(expr);
    }

    if (expr.kind == 'prefix') {
      return typeCheckPrefixExpr(expr);
    }

    if (expr.kind == 'array') {
      return typeCheckArray(expr);
    }

    if (expr.kind == 'new') {
      return typeCheckNew(expr);
    }

    if (expr.kind == 'ternary') {
      return typeCheckTernary(expr);
    }

    if (expr.kind == 'assignment') {
      return typeCheckAssignmentExpr(expr);
    }

  };

  var typeCheckLocalDecl = function(decl) {
    if (Juliet.options.trace) print('typeCheckLocalDecl');
    var localType = decl.type;
    var initialValueType = typeCheckExpr(decl.initial_value);

    var localTypeName = getTypeName(localType);
    var initialValueTypeName = getTypeName(initialValueType);

    // sanity check, remove later maybe?
    if (!localTypeName) {
      print('***');
      print('localType has no name?');
      Juliet.util.print_ast(localType);
      quit();
    }

    if (!initialValueTypeName) {
      print('***');
      print('initialValueType has no name?');
      Juliet.util.print_ast(initialValueType);
      quit();
    }

    // print(localTypeName);
    // print(initialValueTypeName);

    // TODO: is this helpful?
    if (primitiveType(localTypeName)) {
      if (decl.initial_value.kind == 'array') {
        print('illegal initializer for ' + localTypeName);
        quit();
      }
    }

    compatibleTypes(localType, initialValueType);
  };

  function getContext(expr) {
    var context = null;
    while (expr.kind != 'construct') {
      context = expr.operand.name;
      if (expr.term) expr = expr.term;
      else if (expr.operand) expr = expr.operand;
    }
    return context;
  };

  function propertyInContext(context, name) {
    // instance propery?
    var typeDescriptor = typeDescriptorForName(context);
    var staticContext = false;

    if (typeDescriptor && typeDescriptor.type) {
      var tn = typeDescriptor.type.name;

      if (tn) {
        if (!referenceType(tn)) {
          print(tn + ' cannot be dereferenced');
          quit();
        }
      }

      if (typeDescriptor.type.kind == 'definition') {
        if (context != 'this') { // TODO: not super too?
          // print('STATIC CONTEXT');
          staticContext = true;
        }
      }

      // property?
      var props = typeDescriptor.type.properties;
      if (!props) {
        typeDescriptor = typeDescriptorForName(typeDescriptor.type.name);
        if (typeDescriptor && typeDescriptor.type) {
          props = typeDescriptor.type.properties;
        }
      }
      if (props) {
        for (var i = 0; i < props.length; i++) {
          if (props[i].name == name) {
            //print('INSTANCE IN CONTEXT: ' + context);
            //Juliet.util.print_ast(props[i]);
            if (staticContext) {
              print('non-static variable ' + name +
                    ' cannot be referenced from a static context');
              quit();
            }
            return props[i];
          }
        }
      }

      // method?
      var methods = typeDescriptor.type.methods;
      if (!methods) {
        typeDescriptor = typeDescriptorForName(typeDescriptor.type.name);
        if (typeDescriptor && typeDescriptor.type) {
          methods = typeDescriptor.type.methods;
        }
      }
      if (methods) {
        for (var i = 0; i < methods.length; i++) {
          if (methods[i].name == name) {
            // print('INSTANCE IN CONTEXT: ' + context);
            // Juliet.util.print_ast(methods[i]);
            if (staticContext) {
              print('non-static method ' + name +
                    ' cannot be referenced from a static context');
              quit();
            }
            return methods[i];
          }
        }
      }

      // class/static property?
      var cprops = typeDescriptor.type.class_properties;
      if (!cprops) {
        typeDescriptor = typeDescriptorForName(typeDescriptor.type.name);
        if (typeDescriptor && typeDescriptor.type) {
          cprops = typeDescriptor.type.class_properties;
        }
      }
      if (cprops) {
        for (var i = 0; i < cprops.length; i++) {
          if (cprops[i].name == name) {
            // print('STATIC IN CONTEXT: ' + context);
            // Juliet.util.print_ast(cprops[i]);
            return cprops[i];
          }
        }
      }

      // class/static method?
      var cmethods = typeDescriptor.type.class_methods;
      if (!cmethods) {
        typeDescriptor = typeDescriptorForName(typeDescriptor.type.name);
        if (typeDescriptor && typeDescriptor.type) {
          cmethods = typeDescriptor.type.class_methods;
        }
      }
      if (cmethods) {
        for (var i = 0; i < cmethods.length; i++) {
          if (cmethods[i].name == name) {
            // print('STATIC IN CONTEXT: ' + context);
            // Juliet.util.print_ast(cmethods[i]);
            return cmethods[i];
          }
        }
      }

    }
    print('SHOULD NOT GET HERE');
    quit();
  };

  var typeCheckContextualAccess = function(expr) {
    if (Juliet.options.trace) print('typeCheckContextualAccess');

    if (expr.kind == 'postfix' && expr.token == Juliet.TOKEN_PERIOD) {
      return typeCheckFieldAccessExpression(expr);
    }

    if (expr.kind == 'postfix' && expr.token == Juliet.TOKEN_LBRACKET) {
      return typeCheckArrayAccessExpression(expr);
    }

    print('unexpected type: must assign to a variable');
    quit();
  };

  var typeCheckFieldAccessExpression = function(expr) {
    if (Juliet.options.trace) print('typeCheckFieldAccessExpression');

    var name = identifierForExpression(expr);

    var typeDescriptor = null;
    if (expr.operand.kind == 'postfix') {
      typeDescriptor = typeCheckContextualAccess(expr.operand);
    }

    if (typeDescriptor) {
      typeDescriptor = propertyInContext(typeDescriptor.type.name, name);
    } else {
      //print('EXPRESSION');
      //Juliet.util.print_ast(expr);
      var context = getContext(expr);
      //print('CONTEXT');
      //Juliet.util.print_ast(context);
      typeDescriptor = propertyInContext(context, name);
    }

    return typeDescriptor;
  };

  var typeCheckArrayAccessExpression = function(expr) {
    if (Juliet.options.trace) print('typeCheckArrayAccessExpression');

    var name = identifierForExpression(expr);

    var typeDescriptor = null;
    if (expr.kind == 'postfix' && expr.token == Juliet.TOKEN_PERIOD) {
      typeDescriptor = typeCheckFieldAccessExpression(expr);
    }

    var depth = 0;
    while (expr.expression) {
      expr = expr.operand;
      depth++;
    }

    if (!typeDescriptor) {
      typeDescriptor = typeDescriptorForName(name);
    }

    var effectiveTypeName = typeDescriptor.type.name;
    for (var i = 0; i < depth; i++) {
      effectiveTypeName = reduceByOneDimension(effectiveTypeName);
    }
    // TODO: error if there are too many array accesses
    // Consider: int[] i = {}; i[0][0] = 1; // should error

    var effectiveTypeDescriptor = Juliet.util.copy(typeDescriptor);
    delete effectiveTypeDescriptor['initial_value'];

    effectiveTypeDescriptor.type.name = effectiveTypeName;

    // print('ARRAY ACCESS');
    // Juliet.util.print_ast(typeDescriptor);
    // Juliet.util.print_ast(effectiveTypeDescriptor);
    return effectiveTypeDescriptor;
  };

  var identifierForExpression = function(expr) {
    while (expr && (expr.kind != 'construct')) {
      if (expr.term) expr = expr.term;
      else if (expr.operand) expr = expr.operand;
      else expr = null;
    }
    return (expr && expr.kind == 'construct') ? expr.name : null;
  };

  var typeCheckLeftHandSide = function(lhs) {
    var name = identifierForExpression(lhs);
    if (!name) {
      print('unexpected type: must assign to a variable');
      quit();
    }

    // simple name in scope
    if (lhs.kind == 'construct' && lhs.token == Juliet.TOKEN_ID) {
      var curScope = scope.length - 1;
      for (var i = curScope; i >= 0; i--) {
        if (name in scope[i]) {
          var x = scope[i][name];
          if (isLocal(x) || isField(x)) {
            //print('SIMPLE NAME depth: ' + i);
            //Juliet.util.print_ast(x);
            return x;
          }
        }
      }
    }

    return typeCheckContextualAccess(lhs);
  };

  var typeCheckAssignmentExpr = function(assign) {
    if (Juliet.options.trace) print('typeCheckAssignmentExpr');

    //Juliet.util.print_ast(assign);
    var leftHandSide = typeCheckLeftHandSide(assign.location);
    var newValue = typeCheckExpr(assign.new_value);

    //Juliet.util.print_ast(leftHandSide);
    //Juliet.util.print_ast(newValue);

    if (leftHandSide.qualifiers & Juliet.QUALIFIER_PRIVATE) {
    }

    var leftHandSideType = getType(leftHandSide.type);
    var newValueType = getType(newValue);
    // Juliet.util.print_ast(leftHandSideType);
    // Juliet.util.print_ast(newValueType);

    var leftHandSideTypeName = getTypeName(leftHandSide.type);
    var newValueTypeName = getTypeName(newValue);
    // print(leftHandSideTypeName);
    // print(newValueTypeName);

    if (assign.token == Juliet.TOKEN_ASSIGN) {
      compatibleTypes(leftHandSideType, newValueType);
    } else {
      // TODO: 15.26.2
    }

    return leftHandSideType;

  };

  var flatten = function(stm, sep, context) {
    if (Juliet.options.trace) print('flatten');
    if (!stm) return '';
    var ret = '';
    var flatten_for_body = function(body) {
      if (Juliet.options.trace) print('flatten_for_body');
      if (body.kind == 'block') {
        // since a for loop introduces a scope
        // we don't introduce a new scope here
        ret = ret + '{';
        ret = ret + flatten(body.statements);
        ret = ret + '}';
      } else {
        ret = ret + flatten(body);
      }
      return ret;
    };
    var flatten_in_context = function(cntx, stm, sep) {
      if (Juliet.options.trace) print('flatten_in_context: ' + cntx);
      return flatten(stm, sep, cntx);
    };
    if (Juliet.util.isArray(stm)) {
      if (sep === undefined) sep = ';';

      for (var i = 0; i < stm.length; i++) {
        ret = ret + flatten(stm[i]);

        // insert semicolon or other separators
        if ((stm[i].token != Juliet.TOKEN_LCURLY) &&
            (stm[i].token != Juliet.TOKEN_IF) &&
            (stm[i].token != Juliet.TOKEN_WHILE) &&
            (stm[i].token != Juliet.TOKEN_FOR)) {
          if ((sep == ',') && (i == stm.length - 1)) {
            sep = '';
          }
          ret = ret + sep;
        }

      }
    } else {
      var token = stm.token;
      var kind = stm.kind;
      switch (kind) {
      case 'block':
        if (Juliet.options.trace) print('block');
        sep = '';
        pushScope();
        ret = ret + '{';
        ret = ret + flatten(stm.statements);
        ret = ret + '}';
        popScope();
        break;
      case 'local':
        if (Juliet.options.trace) print('local');
        var name = stm.name;
        // TODO: qualified type names?
        var type = typeName(stm.type.name);
        var typedName = type + '_' + name;
        addIdentifier(name, name, stm.type, false, 'local');
        ret = ret + 'var ';
        ret = ret + name;
        if (stm.initial_value) {
          //compatibleTypes(stm, stm.initial_value);
          typeCheckLocalDecl(stm);
          ret = ret + '=' + flatten(stm.initial_value);
        }
        break;
      case 'assignment':
        if (Juliet.options.trace) print('assignment');
        //compatibleTypes(stm.location, stm.new_value);
        typeCheckAssignmentExpr(stm);
        var loc = flatten(stm.location, sep, context);
        ret = ret + loc;
        ret = ret + Juliet.lexer.operatorStr(token);
        ret = ret + flatten(stm.new_value);
        break;
      case 'ternary':
        if (Juliet.options.trace) print('ternary');
        ret = ret + flatten(stm.expression);
        ret = ret + '?';
        ret = ret + flatten(stm.true_value);
        ret = ret + ':';
        ret = ret + flatten(stm.false_value);
        break;
      case 'binary':
        if (Juliet.options.trace) print('binary');
        //binaryTypeCheck(stm);
        typeCheckBinaryExpr(stm);
        ret = ret + '(';
        ret = ret + flatten(stm.lhs);
        ret = ret + Juliet.lexer.operatorStr(token);
        ret = ret + flatten(stm.rhs);
        ret = ret + ')';
        break;
      case 'cast':
        if (Juliet.options.trace) print('cast');
        throw new Error('casting is not implemented');
        quit();
        break;
      case 'new':
        if (Juliet.options.trace) print('new');
        ret = ret + 'Juliet.runtime.new(' + flatten(stm.type) + ',';
        var cxt_class = Juliet.program[stm.type.name];
        var n = nameInContextClass(cxt_class, stm);
        if (!n) {
          print('Unknown constructor for class ' + cxt_class.name + '.');
          quit();
        }
        ret = ret + '\'' + n + '\'';
        if (stm.args && stm.args.length > 0) {
          ret = ret + ',';
          ret = ret + flatten(stm.args, ',');
        }
        ret = ret + ');';
        break;
      case 'prefix':
        if (Juliet.options.trace) print('prefix');
        //prefixTypeCheck(stm);
        typeCheckPrefixExpr(stm);
        ret = ret + Juliet.lexer.operatorStr(token);
        ret = ret + flatten(stm.operand);
        break;
      case 'postfix':
        if (Juliet.options.trace) print('postfix');
        //postfixTypeCheck(stm);
        ret = ret + flatten(stm.operand);
        if (stm.term) {
          var cntx = stm.operand.name;
          var term = flatten_in_context(cntx, stm.term);
          ret = ret + '.';
          ret = ret + term;
        } else if (stm.expression) {
          ret = ret + '[';
          ret = ret + flatten(stm.expression);
          ret = ret + ']';
        } else {
          ret = ret + Juliet.lexer.operatorStr(token);
        }
        break;
      case 'return':
        if (Juliet.options.trace) print('return');
        ret = ret + 'return';
        if (stm.expression)
          ret = ret + ' ' + flatten(stm.expression);
        break;
      case 'abrupt':
        if (Juliet.options.trace) print('abrupt');
        if (token == Juliet.TOKEN_BREAK)
          ret = ret + 'break';
        if (token == Juliet.TOKEN_CONTINUE)
          ret = ret + 'continue';
        if (stm.identifier)
          ret = ret + ' ' + flatten(stm.identifier);
        break;
      case 'assert':
        if (Juliet.options.trace) print('assert');
        throw new Errot('assert not implemented');
        quit();
        break;
      case 'if':
        if (Juliet.options.trace) print('if');
        ret = ret + 'if (' + flatten(stm.expression) + ')';

        // TODO: verify this is the correct behavior
        if (stm.body.kind == 'block') {
          ret = ret + flatten(stm.body, ';');
        } else {
          ret = ret + flatten(stm.body) + ';';
        }

        if (stm.else_body) {
          ret = ret + ' else ';
          ret = ret + flatten(stm.else_body);
        }
        break;
      case 'while':
        if (Juliet.options.trace) print('while');
        ret = ret + 'while (' + flatten(stm.expression) + ')';
        ret = ret + flatten(stm.body);
        break;
      case 'for':
        if (Juliet.options.trace) print('for');
        pushScope();
        ret = ret + 'for (' + flatten(stm.initialization, ',') + ';';
        ret = ret + flatten(stm.condition) + ';';
        ret = ret + flatten(stm.var_mod) + ')';
        ret = ret + flatten_for_body(stm.body);
        popScope();
        break;
      case 'for-each':
        if (Juliet.options.trace) print('for-each');
        pushScope();
        var name = stm.name;
        var type = typeName(stm.type.name);
        var typedName = type + '_' + name;
        //addIdentifier(name, name);
        // the variable introduced in the for-each statement is
        // semantically equivalent to iterable[current] when referred to
        // in the loop body
        ret = ret + 'var ' + name + '_iter=' + flatten(stm.iterable, ';');
        var inferedType = {};
        // TODO: possible name collision
        addIdentifier('iter', name + '_iter', inferedType, false, 'local');
        addIdentifier(name,
                      nameInScope('iter') + '[' + name + ']',
                      stm.type,
                      false, 'local');
        ret = ret + 'for (var ' + name;
        ret = ret + ' in ' + nameInScope('iter');
        ret = ret + ')';
        ret = ret + flatten_for_body(stm.body);
        popScope();
        break;
      case 'array':
        if (Juliet.options.trace) print('array');
        ret = ret + '[';
        ret = ret + flatten(stm.terms, ',');
        ret = ret + ']';
        break;
      case 'super':
        if (Juliet.options.trace) print('super');
        throw new Error('super is not implemented');
        quit();
        break;
      case 'type':
        if (Juliet.options.trace) print('type');
      case 'construct':
        if (Juliet.options.trace) print('construct');
        var name = '';

        // TODO: remove this kludge
        if (stm.name == 'System' ||
            stm.name == 'out' ||
            stm.name == 'println' ||
            stm.name == 'print')
          if (stm.name == 'System') {
            name = 'Juliet.stdlib.System';
          } else {
            name = stm.name;
          }
        else {
          if (context) {
            name = nameInContext(context, stm);
          } else {
            //Juliet.util.print_ast(stm);

            name = nameInScope(stm);
          }
        }

        if (/<mutate>/.test(name)) {
          name = name + ')';
        }
        ret = ret + name;
        if (stm.args) {
          if (typeListSignature(stm.args) !== '') {
            ret = ret + '(';
          } else {
            // TODO: remove this too
            if (stm.name == 'println')
              ret = ret + '(';
          }
          ret = ret + flatten(stm.args, ',');
          ret = ret + ')';
        }
        break;
      case 'literal':
        if (Juliet.options.trace) print('literal: ' + token);
        switch (token) {
        case Juliet.LITERAL_CHAR:
        case Juliet.LITERAL_STRING:
          ret = ret + '\'';
          ret = ret + Juliet.util.escapeStr(stm.value);
          ret = ret + '\'';
          break;
        case Juliet.LITERAL_DOUBLE:
        case Juliet.LITERAL_INT:
        case Juliet.LITERAL_BOOLEAN:
        case Juliet.TOKEN_NULL:
          ret = ret + stm.value;
          break;
        }
      default:
        // TODO: empty statements, etc
      }
      if (sep) ret = ret + sep;
    }
    return ret;
  };

  var addStaticInitializer = function(type, si) {
    if (Juliet.options.trace) print('addStaticInitializer');
    if (!type['static_initializers']) type['static_initializers'] = [];
    var body = flatten(si.statements);
    type['static_initializers'].push(new Function(body));
  };

  var addInstanceInitializer = function(type, ii) {
    if (Juliet.options.trace) print('addInstanceInitializer');
    if (!type['instance_initializers']) type['instance_initializers'] = [];
    var body = flatten(ii.statements);
    type['instance_initializers'].push(new Function(body));
  };

  var addClassProperty = function(type, cp) {
    if (Juliet.options.trace) print('addClassProperty');
    //var name = qualifiers_str(cp.qualifiers) + cp.name
    // TODO: type check
    var value = cp.initial_value;
    if (value && value.kind == 'literal')
      value = value.value;
    else
      value = flatten(value);
    type[cp.name] = value;
  };

  var addProperty = function(ast_type, ctype, property) {
    if (Juliet.options.trace) print('addProperty:' + property);

    var mangled_name = '_Z' + mangle(ast_type.name, property.name);

    if (property.initial_value && property.initial_value.kind == 'literal') {
      ctype[mangled_name] = property.initial_value.value;
    } else {
      // TODO: non-static initializer block
      ctype[mangled_name] = flatten(property.initial_value);
    }
  };


  var addClassMethod = function(type, cm) {
    if (Juliet.options.trace) print('addClassMethod: ' + cm.name);
    var name = methodSignature(cm);
    pushScope();
    static_context = type;
    var params = parameterList(cm.parameters);
    var body = '';
    if (Juliet.util.isArray(cm.statements)) {
      body = flatten(cm.statements);
    } else {
      if (cm.statements) {
        body = cm.statements.value;
      }
    }
    type[name] = new Function(params, body);
    static_context = null;
    popScope();
  };


  var addMethod = function(ast_type, ctype, m) {
    if (Juliet.options.trace) print('addMethod: ' + m.name);

    pushScope();
    var params = parameterList(m.parameters);

    var parameter_types = [];
    for (var i = 0; i < m.parameters.length; i++) {
      parameter_types.push(m.parameters[i].type.name);
    }

    var mangled_name = mangle(ast_type.name, m.name, parameter_types);
    var mangled_poly = mangle('_', m.name, parameter_types);

    var body = flatten(m.statements);
    print(mangled_name);
    ctype['_Z' + mangled_name] = new Function(params, body);
    body = 'this._Z' + mangled_name + '(' + params.join() + ');';
    ctype['_Z' + mangled_poly] = new Function(params, body);
    popScope();
  };


  function generateRTTI(js_type) {

    /*
    // Inheritance: incorporate parent class RTTI
    if (ast_type.extends) {
    var base_class = unit_package['<namespace>'][ast_type.extends.name];
    if (base_class == undefined) {
    print('Class '  + ast_type.base_class.name + ' is undefined.');
    quit();
    }
    for (var mangled_name in base_class) {
    if (mangled_name.length > 2 && mangled_name.substring(0, 2) == '_I') {
    ctype[mangled_name] = base_class[mangled_name];
    }
    }
    }
    */

    js_type.members = {};

    // Create RTTI for new properties
    log('generateRTTI: adding fields');
    forEach(js_type.ast_type.members, function(member) {

      var path = js_type.path.slice(0);
      path.push(js_type.name);

      if (member.kind == 'field') {
        var mangled_name = '_I' + mangle(path, member.name);
        var type = typeFromNode(js_type.unit, member.type);
        js_type.members[mangled_name] = {
          name: member.name,
          kind: member.kind,
          mname: '_Z' + mangled_name,
          type: type,
          modifiers: member.modifiers
        };
      }

      if (member.kind == 'method') {
        // Create RTTI for new methods
        // RTTI for methods has three entry points:
        // 1. The full (mangled) method name prefixed by class and
        //    suffixed by parameters. This points to the RTTI record
        //    with return type and qualifier information.
        // 2. sname = The (mangled) class prefixed method name that
        //    points to an array of (1).
        // 3. dname = The (mangled) unprefixed name that points to an
        //    array of (1).
        // (2) is used for super lookups (3) is used for polymorphic calls.

        var parameters = [];
        var parameters_ = [];
        forEach(member.parameters, function(parameter) {
          //if (parameter.type.kind == 'basic_type') {
          //parameters.push(parameter.type.name);
          // parameters_.push(parameter.type.name);
          //} else {
          var type = typeFromNode(js_type.unit, parameter.type);
          parameters.push(fullyQualifiedName(type, '$'));
          parameters_.push(type);
          //}
        });

        var sname = '_I' + mangle(path, member.name);
        var fname = '_I' + mangle(path, member.name, parameters);

        // Add fname to the sname record
        if (!js_type.members[sname]) {
          js_type.members[sname] = [];
        }
        js_type.members[sname].push(fname);

        if (member.return_type) {
          var ast_type = member.return_type;
        } else {
          var ast_type = {
            name: 'void',
            kind: 'type',
            token: null};
        }

        type = typeFromNode(js_type.unit, ast_type);

        // Create the fname record
        js_type.members[fname] = {
          kind: member.kind,
          name: member.name,
          type: type,
          parameters: parameters_
        };

      }

    });

  }


  // Add accessible instance identifiers to the current scope based on RTTI
  var addClassIdentifiers = function(ctype, klass, allow_private, is_static) {

    if (Juliet.options.trace) print('addClassIdentifiers: ' + klass);

    base_class = Juliet.program[klass].base_class;
    if (base_class) {
      addClassIdentifiers(ctype, base_class, false);
    }

    // Layer the most recent class on top.
    var mangled_prefix = '_I' + klass.length.toString() + klass;
    for (var mangled_name in ctype) {
      if (mangled_name.length > mangled_prefix.length &&
          mangled_name.substring(0, mangled_prefix.length) == mangled_prefix) {
        var field = ctype[mangled_name];
        var field_static = field.modifiers | Juliet.QUALIFIER_STATIC;
        if (is_static && field_static) {
          addIdentifier(field.name,
                        'Juliet.program.' + klass + '._Z' +
                          mangled_name.substring(2),
                        field.type,
                        true,
                        field.kind);
        } else {
          addIdentifier(field.name,
                        'this._Z' + mangled_name.substring(2),
                        field.type,
                        true,
                        field.kind);
        }
      }
    }
  };

  function generateCode(js_type) {
    log('generateCode: ' + ast_type.name);

    //var ctype = Juliet.program[ast_type.name];

    // Inheritance: incorporate parent class generated code
    /*
      if (ast_type.base_class && ast_type.base_class.name) {
      var base_class = Juliet.program[ast_type.base_class.name];
      if (base_class == undefined) {
      print('Class '  + ast_type.base_class.name + ' is undefined.');
      quit();
      }
      for (var mangled_name in base_class) {
      if (mangled_name.length > 2 && mangled_name.substring(0, 2) == '_Z') {
      ctype[mangled_name] = base_class[mangled_name];
      }
      }
      }
    */

    addIdentifier(ast_type.name,
                  'Juliet.program.' + ast_type.name,
                  ast_type,
                  true,
                  'class');

    pushScope();

    /*
     * Interfaces: TODO
     *
     if (type.interfaces) {
     if (Juliet.options.trace) print('have interfaces');
     for (var j = 0; j < type.interfaces.length; j++) {
     // look up the named interface
     var anInterface = classByName(type.interfaces[j].name);

     // incorporate its static members
     if (anInterface.class_properties) {
     if (Juliet.options.trace) print('have interface class_properties');
     for (var j = 0; j < anInterface.class_properties.length; j++) {
     var cp = anInterface.class_properties[j];
     if (!type.class_properties) type.class_properties = [];
     // add to the fron of the class properties
     type.class_properties.unshift(cp);
     }
     }

     // require implementation of its abstract methods
     if (anInterface.methods) {
     if (Juliet.options.trace) print('have interface methods');
     // TODO: ensure methods are implemented
     }
     }
     }
    */

    // Add static identifiers
    addClassIdentifiers(ctype, ctype.name, true, true);

    // Add code for class properties
    for (var j = 0; j < ast_type.properties.length; j++) {
      var property = ast_type.properties[j];
      if (property.qualifiers & Juliet.QUALIFER_STATIC) {
        addClassProperty(ctype, property);
      }
    }

    // Add code for class methods
    for (var j = 0; j < ast_type.methods.length; j++) {
      var method = ast_type.methods[j];
      if (method.qualifiers & Juliet.QUALIFER_STATIC) {
        addClassMethod(ctype, method);
      }
    }

    // Add instance identifiers
    addClassIdentifiers(ctype, ctype.name, true, false);

    // Add code for instance properties
    for (var j = 0; j < ast_type.properties.length; j++) {
      var property = ast_type.properties[j];
      if (!(property.qualifiers & Juliet.QUALIFER_STATIC)) {
        addProperty(ast_type, ctype, property);
      }
    }

    // add 'this' to the scope
    addIdentifier('this',
                  'this',
                  ast_type,
                  false,
                  'this');

    // Add code for instance methods
    for (var j = 0; j < ast_type.methods.length; j++) {
      var method = ast_type.methods[j];
      if (!(method.qualifiers & Juliet.QUALIFER_STATIC)) {
        addMethod(ast_type, ctype, method);
      }
    }

    /*
     * Static Initializers
     */
    if (ast_type.static_initializers) {
      if (Juliet.options.trace) print('have static_initializers');
      for (var j = 0; j < ast_type.static_initializers.length; j++) {
        var si = ast_type.static_initializers[j];
        addStaticInitializer(ctype, si);
      }
    }

    /*
     * Instance Initializers
     */
    if (ast_type.instance_initializers) {
      if (Juliet.options.trace) print('have instance_initializers');
      for (var j = 0; j < ast_type.instance_initializers.length; j++) {
        var si = ast_type.instance_initializers[j];
        addInstanceInitializer(ctype, si);
      }
    }

    //print('ENDING ================');
    //Juliet.util.print_ast(ctype);
    //quit();

    popScope();
  };

  var classByName = function(name) {
    return Juliet.AST.parsed_types[name];
  };

  return {
    init: function()  {
      Juliet.packages = {
        java: {
          lang: {
            $types: {
              int: {
                name: 'int',
                path: ['java', 'lang'],
                superclass: null,
                interfaces: []
              },
              long: {
                name: 'long'
              },
              char: {
                name: 'char'
              },
              float: {
                name: 'float'
              },
              double: {
                name: 'double'
              },
              void: {
                name: 'void'
              },
              Object: {
                name: 'Object',
                path: ['java', 'lang'],
                superclass: null,
                interfaces: []
              }
            }
          }
        }
      };
      //scope = [];
      static_context = null;
    },

    reset: function() {
      prevScope = null;
    },

    prepare: function(unit) {
      if (!unit) {
        print('Nothing to compile.');
        return;
      }

      newScope(unit, null);

      var package = getPackage(unit.package);
      if (!package) {
        package = makePackage(unit.package);
      }

      var path = [];
      forEach(unit.package, function(element) {
        path.push(element.name);
      });

      // Juliet.util.print_ast(unit.types);

      forEach(unit.types, function(ast_type) {

        if (ast_type.name in package.$types) {
          throw 'Error: ' + ast_type.name +
            ' already defined in package ' + path.join('.') + '.';
        }

        package.$types[ast_type.name] = {
          name: ast_type.name,
          path: path,
          superclass: null,
          interfaces: [],
          // We hold onto references to the ast_type and unit until
          // the compilation process is over.
          ast_type: ast_type,
          unit: unit
        };
        prepared_types.push(package.$types[ast_type.name]);
      });

      prepared_units.push(unit);
    },

    generateRTTI: function() {
      // Step 1. Import types into scopes and verify that they exist.

      forEach(prepared_units, function(unit) {
        // The compilation unit scope only exists explicitly during
        // compilation so we attach it temporarily to the
        // compilation unit AST.
        unit.scope = [{}];
        var package_path = [];
        var package = null;
        var typeName = null;

        forEach(unit.package, function(p) {
          package_path.push(p.name);
        });

        // TODO: Remove any java.lang imports already in unit.imports.

        // java.lang is always imported.
        var imports =
          [{token: null,
            kind: 'import',
            name: [
              {token: null,
               kind: 'id',
               name: 'java'},
              {token: null,
               kind: 'id',
               name: 'lang'},
              {token: null,
               kind: 'id',
               name: '*'}]}].concat(unit.imports);

        // Handle types that are imported:
        forEach(imports, function(_import) {
          if (_import.length == 1) {
            package = getPackage([{name: '$default'}]);
            typeName = _import.name[0].name;
          } else {
            package = getPackage(_import.name.slice(0, -1));
            typeName = _import.name[_import.name.length - 1].name;
          }
          if (!package) throw 'Could not find package ' +
            package_path.join('.');

          if (typeName == '*') {
            // Case 1: Star imports.
            // e.g., import foo.bar.*
            forEach(package.$types, function(type) {
              //Juliet.util.print_ast(type);
              addToScope(unit, type.name, type);
            });
          } else {
            // Case 2: Class imports.
            // e.g., import foo.bar.MyClass;
            if (!(typeName in package.$types))
              throw 'Could not find ' + typeName + ' in package ' +
              package_path.join('.');
            addToScope(unit, typeName, package.$types[typeName]);
          }
        });

        // Handle types that are defined in this compilation unit:
        var package = getPackage(unit.package);
        if (!package) throw 'Could not find package ' + unit.package.join('.');

        forEach(unit.types, function(type) {
          if (!(type.name in package.$types))
            throw 'Could not find ' + type.name + ' in package ' +
            package_path.join('.');
          addToScope(unit, type.name, package.$types[type.name]);
        });
      });

      // Step 2. Fill in superclass relationships.

      forEach(prepared_types, function(js_type) {

        if (js_type.ast_type.superclass == null) {
          js_type.superclass = Juliet.packages.java.lang.$types.Object;
        } else {
          var superclass = typeFromNode(js_type.unit,
                                        js_type.ast_type.superclass);
          if (!superclass)
            throw js_type.ast_type.superclass.name + ' is undefined.';
          js_type.superclass = superclass;
        }

      });

      // Step 3. Find any circular class dependencies

      forEach(prepared_types, function(js_type) {

        var path = [];

        function verify_superclass(js_type) {
          if (js_type.superclass == null) {
            throw 'Internal compiler error: bad superclass for ' +
              js_type.name;
          }
          if (js_type.superclass === Juliet.packages.java.lang.$types.Object) {
            return;
          }
          path.push(js_type);
          if (Juliet.utils.contains(path, js_type.superclass)) {
            throw 'Found circular super class dependency from ' +
              js_type.name + ' to ' + js_type.superclass.name;
          }
          verify_superclass(js_type.superclass);
          forEach(js_type.interfaces, function(interface) {
            verify_superclass(interface);
          });
          path.pop();
          return;
        }

        verify_superclass(js_type);

      });

      // Step 4. Fill out RTTI for methods and fields.

      log('Generating RTTI.');

      forEach(prepared_types, function(js_type) {
        generateRTTI(js_type);
      });

    },

    compile: function() {

      // Step 5. Generate code.

      log('Generating code.');

      forEach(prepared_types, function(js_type) {
        generateCode(js_type);
      });

      // Done!

      if (scope.length != 1) {
        log('there should be only 1 level in the scope stack');
        quit();
      }

      prevScope = Juliet.util.copy(scope);
      popScope();
    }
  };
}();
