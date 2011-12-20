var scope = [];
Result = {}; // no var
var static_context = null;
var init_compiler = function ()  {
  scope = [];
  static_context = null;
  Result = {};
};

var qualifiers_str = function(quals) {
  var ret = '';
  if (quals & JOG_QUALIFIER_PUBLIC) ret = ret + 'public_';
  if (quals & JOG_QUALIFIER_PROTECTED) ret = ret + 'protected_';
  if (quals & JOG_QUALIFIER_PRIVATE) ret = ret + 'private_';
  if (quals & JOG_QUALIFIER_STATIC) ret = ret + 'static_';
  if (quals & JOG_QUALIFIER_NATIVE) ret = ret + 'native_';
  //if (quals & JOG_QUALIFIER_CLASS) ret = ret + 'class_';
  if (quals & JOG_QUALIFIER_INTERFACE) ret = ret + 'interface_';
  if (quals & JOG_QUALIFIER_PRIMITIVE) ret = ret + 'primitive_';
  if (quals & JOG_QUALIFIER_CONSTRUCTOR) ret = ret + 'constructor_';
  if (quals & JOG_QUALIFIER_ABSTRACT) ret = ret + 'abstract_';
  if (quals & JOG_QUALIFIER_FINAL) ret = ret + 'final_';
  if (quals & JOG_QUALIFIER_STRICTFP) ret = ret + 'strictfp_';
  if (quals & JOG_QUALIFIER_TRANSIENT) ret = ret + 'transient_';
  if (quals & JOG_QUALIFIER_VOLATILE) ret = ret + 'volatile_';
  if (quals & JOG_QUALIFIER_SYNCRONIZED) ret = ret + 'syncronized_';
  return ret;
};

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

var escapeQuotes = function(str) {
  var ret = '';
  var ch = 0;
  for (var i = 0; i < str.length; i++) {
    ch = str.charCodeAt(i);
    ret = ret + ((ch == 39) ? '\\\'' : str.charAt(i));
  }
  return ret;
}

var parameterList = function(params) {
  if (trace) print('parameterList');
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

var operatorStr = function(a) {
  for (op in operators) {
    if (a == operators[op]) return op;
  }
  print(token_str(a) + ' not an operator or assignment.');
  quit();
};

var typeDescriptorForName = function(id) {
  var name = (typeof(id) === 'object') ? id.name : id;
  if (trace) print('typeDescriptorForName: ' + name);
  var curScope = scope.length - 1;
  for (var i = curScope; i >= 0; i--) {
    if (name in scope[i]) {
      var n = scope[i][name];
      return n;
    }
  }
  // TODO: super
  return null;
};

var typeListSignature = function(typeList) {
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
      case LITERAL_CHAR:
        ret = ret + 'char';
        break;
      case LITERAL_STRING:
        ret = ret + 'String';
        break;
      case LITERAL_DOUBLE:
        ret = ret + 'double';
        break
      case LITERAL_INT:
        ret = ret + 'int';
        break;
      case LITERAL_BOOLEAN:
        ret = ret + 'boolean';
        break;
      case TOKEN_NULL:
        ret = ret + 'Object';
        break;
      }
    case 'construct':
      var t = typeDescriptorForName(typeList[i].name);
      if (t && t.type) ret = ret + t.type.name;
      break;
    default:
      // can't determine at compile-time return the empty string so
      // that the methods base name is used
      return '';
      break;
    }
    if (i < arity - 1) ret = ret + '_';
  }
  //if (arity > 0) ret = ret + ')';
  return ret;
}

var methodSignature = function (m) {
  var sig = m.name;
  return sig + typeListSignature(m.parameters);
};

var methodDescriptor = function () {
};

var mostApplicableMethod = function () {
};

var nameInContext = function(context, id) {
  var name = (typeof(id) === 'object') ? id.name : id;
  if (trace) print('nameInContext: ' + context);
  if (trace) print('  name: ' + name);

  var args = id.args;
  var argTypeSig = '';
  if (args) {
    argTypeSig = typeListSignature(args);
    if (argTypeSig === '') {
      return 'Java.dispatch(\'' + name + '\',\'' + context + '\',';
    }
  }

  // if context is a variable we need to check if id is a
  // field of the type
  var typeDescriptor = typeDescriptorForName(context);
  var typeName = null;

  if (typeDescriptor && typeDescriptor.type) {
    typeName = typeDescriptor.type.name;
    if (name in Result[typeName]) {
      // TODO: accessible?
      return name;
    } else if ((name + argTypeSig) in Result[typeName]) {
      // TODO: accessible?
      return name + argTypeSig;
    }
  }

  var cononicalName = nameInScope(context) + '.';
  var curScope = scope.length - 1;
  for (var i = curScope; i >= 0; i--) {
    if ((context in scope[i])) {
      if (name in scope[i]) {
        var n = scope[i][name].name;
        // TODO: accessible?
        return n.replace(cononicalName, '');
      } else if ((name + argTypeSig) in scope[i]) {
        //var n = scope[i][name].name;
        //return n.replace(cononicalName, '');
        var n = name + argTypeSig;
        // TODO: accessible?
        return n;
      } else break;
    } else {
      continue;
    }
  }

  var privateName = privateMemberName(typeName, name);
  if (privateName) return privateName;

  print(name + ' is not a member of ' + context);
  quit();
};

var nameInScope = function(id, simple) {
  var name = (typeof(id) === 'object') ? id.name : id;
  if (trace) print('nameInScope: ' + name);

  var args = id.args;
  var argTypeSig = '';
  if (args) {
    argTypeSig = typeListSignature(args);
    if (argTypeSig === '') {
      return 'Java.dispatch(\'' + name + '\',this,';
    }
  }

  var curScope = scope.length - 1;
  for (var i = curScope; i >= 0; i--) {

    if (name in scope[i]) {
      var n = scope[i][name];
      return n.name;
    }

    if ((name + argTypeSig) in scope[i]) {
      var context = 'this.';

      if (static_context) {
        context = 'Result.' + static_context.name + '.';
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
  var privateName = privateMemberName(typeName, name);
  if (privateName) return 'this' + privateName;

  // TODO: super

  // TODO: single-static-import declarations
  // TODO: static-import-on-demand declarations

  // TODO: if in static context, check if this is an instance
  // identifier and print appropriate message
  // (update tests/scope/test17.java to reflect this change)
  print(name + ' is not defined');
  quit();
};

var privateMemberName = function(typeName, name) {
  if (typeName) {
    var type = Result[typeName];
    if (type && type.private_methods) {
      var privMethods = type.private_methods;
      if (name in privMethods) {
        return '[\'<private>\'].' + name;
      } else {
        print(name + ' is a private method');
        quit();
      }
    } else if (type && type.private_properties) {
      var privProps = type.private_properties;
      if (name in privProps) {
        return '[\'<private>\'][\'<mutate>\'](\'' + name + '\'';
      } else {
        print(name + ' is private');
        quit();
      }
    }
  }
}

var addIdentifier = function(name, cononicalName, type, shadowable, kind) {
  if (trace) print('addIdentifier');

  var curScope = scope.length - 1;
  for (var i = curScope; i >= 0; i--) {
    if (name in scope[i]) {
      if (!scope[i][name].shadowable) {
        print(name + ' is already defined');
        quit();
      }
    }
  }

  scope[scope.length - 1][name] = {name:cononicalName,
                                   type:type,
                                   shadowable:shadowable,
                                   kind:kind};
};

var constructorForArguments = function(args) {
  return '\'<init>' + typeListSignature(args) + '\'';
};

var pushScope = function() {
  if (trace) print('pushScope');
  scope.push({});
};

var popScope = function() {
  if (trace) print('popScope');
  scope.pop();
};

var isLocal = function(id) {
  return id.kind == 'local';
};

var isField = function(id) {
  return id.kind == 'field';
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
  case 'byte':    return 2;
  case 'short':   return 3;
  case 'char':    return 4;
  case 'int':     return 5;
  case 'long':    return 6;
  case 'float':   return 7;
  case 'double':  return 8;
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

var primitiveStr = function(t) {
  switch (t) {
  case LITERAL_DOUBLE:
    return 'double';
  case LITERAL_FLOAT:
    return 'float';
  case LITERAL_LONG:
    return 'long';
  case LITERAL_INT:
    return 'int';
  case LITERAL_CHAR:
    return 'char';
  case LITERAL_SHORT:
    return 'short';
  case LITERAL_BYTE:
    return 'byte';
  case LITERAL_BOOLEAN:
    return 'boolean';
  case LITERAL_STRING:
    return 'java.lang.String';
  case TOKEN_NULL:
    return 'null';
  }
}

var getType = function(a) {
  if (a.kind == 'literal') {
    return a;
  }

  if (a.kind == 'construct') {
    if (a.token == TOKEN_ID) {
      var typeDescriptor = typeDescriptorForName(a.name);
      if (typeDescriptor.type) {
        return typeDescriptor.type;
      }

    } else {
      return a;
    }
  }

  if (a.kind == 'type') {
    return a;
  }

  return null;
}

var getTypeName = function(a) {
  if (a.kind == 'literal') {
    return primitiveStr(a.token);
  } else if (a.kind == 'type') {
    return a.name;
  } else if (a.kind == 'construct') {
    if (a.token == TOKEN_ID) {
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

  if (a.kind == 'type') {
    return a.name;
  }

  return null;
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
      if (trace) print('  ARRAY');

      // print_ast(leftType);
      // print_ast(rightType);

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
}

var arrayAccessExpressionType = function(expr) {
  var depth = 1;
  while (expr.operand.kind != 'construct') {
    expr = expr.operand;
    depth++;
  }

  var name = nameInScope(expr.operand, true);
  typeDescriptor = typeDescriptorForName(name);

  var effectiveTypeName = typeDescriptor.type.name;
  for (var i = 0; i < depth; i++) {
    effectiveTypeName = reduceByOneDimension(effectiveTypeName);
  }

  var type = copy(typeDescriptor.type);
  type.name = effectiveTypeName;
  return type;
};

var typeCheckArray = function(array) {
  var name = array.type.name;
  if (array.token == TOKEN_LCURLY && array.terms) {
    var arrayElements = array.terms;
    for (elementKey in arrayElements) {
      if (!arrayElements.hasOwnProperty(elementKey)) continue;

      var t = copy(array.type);
      t.name = reduceByOneDimension(name);

      var t2 = arrayElements[elementKey];

      // TODO: this needs to be recursive!

      // print_ast(array.type);
      // print('t:');print_ast(t);
      // print('t2:');print_ast(t2);

      compatibleTypes(t, t2);
    }
  }
  return array.type;
};

var typeCheckNew = function(expr) {
  return expr.type;
};

var typeCheckWiderNumericType = function(leftType, rightType) {
  var leftTypeName = getTypeName(leftType);
  var rightTypeName = getTypeName(rightType);

  var leftWidth = primitiveTypeWidth(leftTypeName);
  var rightWidth = primitiveTypeWidth(rightTypeName);

  if (leftWidth > rightWidth) return leftType;
  return rightType;

  // TODO: should we return a special value type?
  return {
    token:TOKEN_INT,
    kind:'value',
  };
};

var typeCheckIncDecExpr = function(expr) {
  // variable?
  if (expr.operand) {
    if (expr.operand.kind != 'construct') {
      print('unexpected type');
      print('required: variable');
      print('found   : ' + expr.operand.kind);
      quit();
    }

    var name = nameInScope(expr.operand, true);
    var type = typeDescriptorForName(name);
    if ((type.kind != 'local') && (type.kind != 'field')) {
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
          operatorStr(expr.token) +
          ' cannot be applied to ' +
          operandTypeName);
    quit();
  }

  return operandType;
};

var typeCheckPostfixExpr = function(expr) {
  var operand = typeCheckExpr(expr.operand);

  // ++, -- must be applied to variables with numeric types
  if ((expr.token == TOKEN_INCREMENT) || (expr.token == TOKEN_DECREMENT)) {
    return typeCheckIncDecExpr(expr);
  }

  if (expr.token == TOKEN_LBRACKET) {
    return arrayAccessExpressionType(expr);
  }

};

var typeCheckPrefixExpr = function(expr) {
  var operand = typeCheckExpr(expr.operand);

  // ++, -- must be applied to variables with numeric types
  if ((expr.token == TOKEN_INCREMENT) || (expr.token == TOKEN_DECREMENT)) {
    return typeCheckIncDecExpr(expr);
  }

  var operandType = getType(operand);
  var operandTypeName = getTypeName(operand);

  // +, - must be applied to a type that can be converted to a
  // numeric (primitive?) type
  if ((expr.token == TOKEN_PLUS) || (expr.token == TOKEN_MINUS)) {
    if (!numericType(operandTypeName)) {
      print('operator ' +
            operatorStr(expr.token) +
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
  if (expr.token == TOKEN_TILDE) {
    if (!integralType(operandTypeName)) {
      print('operator ' +
            operatorStr(expr.token) +
            ' cannot be applied to ' +
            operandTypeName);
      quit();
    }

    // TODO:
    return operandType;
  }

  // ! must be applied to boolean or Boolean
  if (expr.token == TOKEN_BANG) {
    if (operandTypeName != 'boolean' || operandTypeName != 'Boolean') {
      print('operator ' +
            operatorStr(expr.token) +
            ' cannot be applied to ' +
            operandTypeName);
      quit();
    }

    // TODO:
    return operandType;
  }
};

var typeCheckBinaryExpr = function(expr) {

  var multiplicative = function(a) {
    switch (a) {
    case TOKEN_STAR:
    case TOKEN_SLASH:
    case TOKEN_PERCENT:
      return true;
    }
    return false;
  };

  var shift = function(a) {
    switch (a) {
    case TOKEN_SHL:
    case TOKEN_SHR:
    case TOKEN_SHRX:
      return true;
    }
    return false;
  };

  var relational = function(a) {
    switch (a) {
    case TOKEN_LT:
    case TOKEN_LE:
    case TOKEN_GT:
    case TOKEN_GE:
      return true;
    }
    return false;
  };

  var equality = function (a) {
    switch (a) {
    case TOKEN_EQ:
    case TOKEN_NE:
      return true;
    }
    return false;
  };

  var bitwiseAndLogical = function(a) {
    switch (a) {
    case TOKEN_AMPERSAND:
    case TOKEN_PIPE:
    case TOKEN_CARET:
      return true;
    }
    return false;
  };

  var conditional = function(a) {
    switch (a) {
    case TOKEN_LOGICAL_AND:
    case TOKEN_LOGICAL_OR:
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
            operatorStr(expr.token) +
            ' cannot be applied to ' +
            leftTypeName + ', ' + rightTypeName);
      quit();
    }

    // TODO:
    // for now just use whichever kind is wider
    return typeCheckWiderNumericType(leftType, rightType);
  }

  // Additive Operators
  if (expr.token == TOKEN_PLUS) {
    // if either operand of + is String the operation is string
    // concatenation
    if (stringType(leftTypeName) || stringType(rightTypeName)) {
      return {
        token:TOKEN_ID,
        kind:'type',
        name:'java.lang.String'
      };
    }

    // otherwise each operand must be a numeric type
    if (!numericType(leftTypeName) || !numericType(rightTypeName)) {
      print('operator ' +
            operatorStr(expr.token) +
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

  if (expr.token == TOKEN_MINUS) {
    if (!numericType(leftTypeName) || !numericType(rightTypeName)) {
      print('operator ' +
            operatorStr(expr.token) +
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
            operatorStr(expr.token) +
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
            operatorStr(expr.token) +
            ' cannot be applied to ' +
            leftTypeName + ', ' + rightTypeName);
      quit();
    }

    // TODO:
    // for now just use whichever kind is wider
    return typeCheckWiderNumericType(leftType, rightType);
  }

  if (expr.token == TOKEN_INSTANCEOF) {
    // see langspec-3.0 15.20.2

    print('instanceof type checking not implemented');
    quit();
  }

  // Equality Operators
  if (equality(expr.token)) {
    // 15.21.1
    // 15.21.2
    // 15.21.3
    print('equality operators type checking not implemented');
    quit();
  }

  // Bitwise and Logical Operators
  if (bitwiseAndLogical(expr.token)) {
    // integral
    if (integralType(leftTypeName)) {
      if (!integralType(rightTypeName)) {
        print('operator ' +
              operatorStr(expr.token) +
              ' cannot be applied to ' +
              leftTypeName + ', ' + rightTypeName);
        quit();
      }
    }
    if (integralType(rightTypeName)) {
      if (!integralType(leftTypeName)) {
        print('operator ' +
              operatorStr(expr.token) +
              ' cannot be applied to ' +
              leftTypeName + ', ' + rightTypeName);
        quit();
      }
    }

    // boolean
    if (booleanType(leftTypeName)) {
      if (!booleanType(rightTypeName)) {
        print('operator ' +
              operatorStr(expr.token) +
              ' cannot be applied to ' +
              leftTypeName + ', ' + rightTypeName);
        quit();
      }
    }
    if (booleanType(rightTypeName)) {
      if (!booleanType(leftTypeName)) {
        print('operator ' +
              operatorStr(expr.token) +
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
            operatorStr(expr.token) +
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
  var trueValue = typeCheckExpr(expr.true_value);
  var falseValue = typeCheckExpr(expr.false_value);

  // print_ast(expr);
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

  // print_ast(trueValue);
  // print_ast(falseValue);
  // print('trueValueType:');print_ast(trueValueType);
  // print('falseValueType:');print_ast(falseValueType);

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
          token:TOKEN_SHORT,
          kind:'type',
          name:'short'
        };
      }
    }

    if (has(['byte', 'short', 'char'], trueValueTypeName)) {
      if (falseValueType.token == LITERAL_INT) {
        switch (trueValueTypeName) {
        case 'byte':
          if (falseValue.value >= -128 && falseValue.value <= 127) {
            return {
              token:TOKEN_BYTE,
              kind:'type',
              name:'byte'
            };
          }
        case 'short':
          if (falseValue.value >= -32768 && falseValue.value <= 32767) {
            return {
              token:TOKEN_SHORT,
              kind:'type',
              name:'short'
            };
          }
        case 'char':
          if (falseValue.value >= -32768 && falseValue.value <= 32767) {
            return {
              token:TOKEN_CHAR,
              kind:'type',
              name:'char'
            };
          }
        }
      }
    }

    if (has(['byte', 'short', 'char'], falseValueTypeName)) {
      if (trueValueType.token == LITERAL_INT) {
        switch (falseValueTypeName) {
        case 'byte':
          if (trueValue.value >= -128 && trueValue.value <= 127) {
            return {
              token:TOKEN_BYTE,
              kind:'type',
              name:'byte'
            };
          }
        case 'short':
          if (trueValue.value >= -32768 && trueValue.value <= 32767) {
            return {
              token:TOKEN_SHORT,
              kind:'type',
              name:'short'
            };
          }
        case 'char':
          if (trueValue.value >= -32768 && trueValue.value <= 32767) {
            return {
              token:TOKEN_CHAR,
              kind:'type',
              name:'char'
            };
          }
        }
      }
    }

    if (has(['Byte', 'Short', 'Character'], trueValueTypeName)) {
      if (falseValueType.token == LITERAL_INT) {
        switch (trueValueTypeName) {
        case 'Byte':
          if (falseValue.value >= -128 && falseValue.value <= 127) {
            return {
              token:TOKEN_BYTE,
              kind:'type',
              name:'byte'
            };
          }
        case 'Short':
          if (falseValue.value >= -32768 && falseValue.value <= 32767) {
            return {
              token:TOKEN_SHORT,
              kind:'type',
              name:'short'
            };
          }
        case 'Character':
          if (falseValue.value >= -32768 && falseValue.value <= 32767) {
            return {
              token:TOKEN_CHAR,
              kind:'type',
              name:'char'
            };
          }
        }
      }
    }

    if (has(['Byte', 'Short', 'Character'], falseValueTypeName)) {
      if (trueValueType.token == LITERAL_INT) {
        switch (falseValueTypeName) {
        case 'Byte':
          if (trueValue.value >= -128 && trueValue.value <= 127) {
            return {
              token:TOKEN_BYTE,
              kind:'type',
              name:'byte'
            };
          }
        case 'Short':
          if (trueValue.value >= -32768 && trueValue.value <= 32767) {
            return {
              token:TOKEN_SHORT,
              kind:'type',
              name:'short'
            };
          }
        case 'Character':
          if (trueValue.value >= -32768 && trueValue.value <= 32767) {
            return {
              token:TOKEN_CHAR,
              kind:'type',
              name:'char'
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
  if (expr.kind == 'literal') {
    return expr;
  }

  if (expr.kind == 'construct') {
    var name = nameInScope(expr, true);
    typeDescriptor = typeDescriptorForName(name);

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

};

var typeCheckLocalDecl = function(decl) {
  var localType = decl.type;
  var initialValueType = typeCheckExpr(decl.initial_value);

  var localTypeName = getTypeName(localType);
  var initialValueTypeName = getTypeName(initialValueType);

  // sanity check, remove later maybe?
  if (!localTypeName || !initialValueTypeName) {
    print('***');
    print('no name?');
    print_ast(localType);
    print_ast(initialValueType);
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
}

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
  // print('CONTEXT: ');
  // print_ast(typeDescriptor);

  if (typeDescriptor && typeDescriptor.type) {
    var tn = typeDescriptor.type.name;

    if (tn) {
      if (!referenceType(tn)) {
        print(tn + ' cannot be dereferenced');
        quit();
      }
    }

    if (typeDescriptor.type.kind == 'definition') {
      // print('STATIC CONTEXT');
      staticContext = true;
    }

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
          // print('INSTANCE IN CONTEXT: ' + context);
          // print_ast(props[i]);
          if (staticContext) {
            print('non-static variable ' + name +
                  ' cannot be referenced from a static context');
            quit();
          }
          return props[i];
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
          // print_ast(cprops[i]);
          return cprops[i];
        }
      }
    }
  }
};

var typeCheckContextualAccess = function(expr) {
  if (expr.kind == 'postfix' && expr.token == TOKEN_PERIOD) {
    return typeCheckFieldAccessExpression(expr);
  }

  if (expr.kind == 'postfix' && expr.token == TOKEN_LBRACKET) {
    return typeCheckArrayAccessExpression(expr);
  }

  print('unexpected type: must assign to a variable');
  quit();
}

var typeCheckFieldAccessExpression = function(expr) {
  var name = identifierForExpression(expr);

  var typeDescriptor = null;
  if (expr.operand.kind == 'postfix') {
    typeDescriptor = typeCheckContextualAccess(expr.operand);
  }

  if (typeDescriptor) {
    typeDescriptor = propertyInContext(typeDescriptor.type.name, name);
  } else {
    var context = getContext(expr);
    typeDescriptor = propertyInContext(context, name);
  }

  return typeDescriptor;
};

var typeCheckArrayAccessExpression = function(expr) {
  var name = identifierForExpression(expr);

  var typeDescriptor = null;
  if (expr.operand.kind == 'postfix') {
    typeDescriptor = typeCheckContextualAccess(expr.operand);
  }
  // print(name);
  // print_ast(typeDescriptor);

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

  var effectiveTypeDescriptor = copy(typeDescriptor, ['initial_value']);
  effectiveTypeDescriptor.type.name = effectiveTypeName;

  // print('ARRAY ACCESS');
  // print_ast(typeDescriptor);
  // print_ast(effectiveTypeDescriptor);
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
  if (lhs.kind == 'construct' && lhs.token == TOKEN_ID) {
    var curScope = scope.length - 1;
    for (var i = curScope; i >= 0; i--) {
      if (name in scope[i]) {
        var x = scope[i][name];
        if (isLocal(x) || isField(x)) {
          // print('SIMPLE NAME');
          // print_ast(x);
          return x;
        }
      }
    }
  }

  return typeCheckContextualAccess(lhs);
};

var typeCheckAssignmentExpr = function(assign) {
  // print_ast(assign);
  var leftHandSide = typeCheckLeftHandSide(assign.location);
  var newValue = typeCheckExpr(assign.new_value);

  // print_ast(leftHandSide);
  // print_ast(newValue);

  var leftHandSideType = getType(leftHandSide.type);
  var newValueType = getType(newValue);
  // print_ast(leftHandSideType);
  // print_ast(newValueType);

  var leftHandSideTypeName = getTypeName(leftHandSide.type);
  var newValueTypeName = getTypeName(newValue);
  // print(leftHandSideTypeName);
  // print(newValueTypeName);

  if (assign.token == TOKEN_ASSIGN) {
    compatibleTypes(leftHandSideType, newValueType);
  } else {
    // TODO: 15.26.2
  }

};

var flatten = function(stm, sep, context) {
  if (trace) print('flatten');
  if (!stm) return '';
  var ret = '';
  var flatten_for_body = function(body) {
    if (trace) print('flatten_for_body');
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
    if (trace) print('flatten_in_context: ' + cntx);
    return flatten(stm, sep, cntx);
  };
  if (isArray(stm)) {
    if (sep === undefined) sep = ';';

    for (var i = 0; i < stm.length; i++) {
      ret = ret + flatten(stm[i]);

      // insert semicolon or other separators
      if ((stm[i].token != TOKEN_LCURLY) &&
          (stm[i].token != TOKEN_IF) &&
          (stm[i].token != TOKEN_WHILE) &&
          (stm[i].token != TOKEN_FOR)) {
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
      if (trace) print('block');
      sep = '';
      pushScope();
      ret = ret + '{';
      ret = ret + flatten(stm.statements);
      ret = ret + '}';
      popScope();
      break;
    case 'local':
      if (trace) print('local');
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
      if (trace) print('assignment');
      //compatibleTypes(stm.location, stm.new_value);
      typeCheckAssignmentExpr(stm);
      var loc = flatten(stm.location, sep, context);
      if (/<private>/.test(loc)) {
        // must use private access method
        ret = ret + loc.replace('this.', 'this').slice(0, -1);
        var new_value = flatten(stm.new_value);
        if (token == TOKEN_ASSIGN) {
          ret = ret + ',' + new_value + ')';
        } else {
          var val = flatten(stm.location, sep, context);
          // TODO: we want the non-compound operator string
          var op = operatorStr(token);
          ret = ret + ',' + val + op + new_value + ')';
        }
      } else {
        // directly assignable
        ret = ret + loc;
        ret = ret + operatorStr(token);
        ret = ret + flatten(stm.new_value);
      }
      break;
    case 'ternary':
      if (trace) print('ternary');
      ret = ret + flatten(stm.expression);
      ret = ret + '?';
      ret = ret + flatten(stm.true_value);
      ret = ret + ':';
      ret = ret + flatten(stm.false_value);
      break;
    case 'binary':
      if (trace) print('binary');
      //binaryTypeCheck(stm);
      typeCheckBinaryExpr(stm);
      ret = ret + '(';
      ret = ret + flatten(stm.lhs);
      ret = ret + operatorStr(token);
      ret = ret + flatten(stm.rhs);
      ret = ret + ')';
      break;
    case 'cast':
      if (trace) print('cast');
      throw new Error('casting is not implemented');
      quit();
      break;
    case 'new':
      if (trace) print('new');
      ret = ret + 'Java.new(' + flatten(stm.type) + ',';
      ret = ret + constructorForArguments(stm.args);
      if (stm.args && stm.args.length > 0) {
        ret = ret + ',';
        ret = ret + flatten(stm.args, ',');
      }
      ret = ret + ');'
      break;
    case 'prefix':
      if (trace) print('prefix');
      //prefixTypeCheck(stm);
      typeCheckPrefixExpr(stm);
      ret = ret + operatorStr(token);
      ret = ret + flatten(stm.operand);
      break;
    case 'postfix':
      if (trace) print('postfix');
      //postfixTypeCheck(stm);
      ret = ret + flatten(stm.operand);
      if (stm.term) {
        var cntx = stm.operand.name;
        var term = flatten_in_context(cntx, stm.term);
        if (!(/<private>/.test(term))) {
          ret = ret + '.'
        }
        ret = ret + term;
      } else if (stm.expression) {
        ret = ret + '[';
        ret = ret + flatten(stm.expression);
        ret = ret + ']';
      } else {
        ret = ret + operatorStr(token);
      }
      break;
    case 'return':
      if (trace) print('return');
      ret = ret + 'return';
      if (stm.expression)
        ret = ret + ' ' + flatten(stm.expression);
      break;
    case 'abrupt':
      if (trace) print('abrupt');
      if (token == TOKEN_BREAK)
        ret = ret + 'break';
      if (token == TOKEN_CONTINUE)
        ret = ret + 'continue';
      if (stm.identifier)
        ret = ret + ' ' + flatten(stm.identifier);
      break;
    case 'assert':
      if (trace) print('assert');
      throw new Errot('assert not implemented');
      quit();
      break;
    case 'if':
      if (trace) print('if');
      ret = ret + 'if (' + flatten(stm.expression) + ')';
      ret = ret + flatten(stm.body, ';');
      if (stm.else_body) {
        ret = ret + ' else ';
        ret = ret + flatten(stm.else_body);
      }
      break;
    case 'while':
      if (trace) print('while');
      ret = ret + 'while (' + flatten(stm.expression) + ')';
      ret = ret + flatten(stm.body);
      break;
    case 'for':
      if (trace) print('for');
      pushScope();
      ret = ret + 'for (' + flatten(stm.initialization, ',') + ';';
      ret = ret + flatten(stm.condition) + ';';
      ret = ret + flatten(stm.var_mod) + ')';
      ret = ret + flatten_for_body(stm.body);
      popScope();
      break;
    case 'for-each':
      if (trace) print('for-each');
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
      if (trace) print('array');
      ret = ret + '[';
      ret = ret + flatten(stm.terms, ',');
      ret = ret + ']';
      break;
    case 'super':
      if (trace) print('super');
      throw new Error('super is not implemented');
      quit();
      break;
    case 'type':
      if (trace) print('type');
    case 'construct':
      if (trace) print('construct');
      var name = '';
      // TODO: remove this kludge
      if (stm.name == 'System' || stm.name == 'out' || stm.name == 'println')
        name = stm.name;
      else {
        if (context) {
          name = nameInContext(context, stm);
        } else {
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
      if (trace) print('literal');
      switch(token) {
      case LITERAL_CHAR:
      case LITERAL_STRING:
        ret = ret + '\'';
        ret = ret + escapeQuotes(stm.value);
        ret = ret + '\'';
        break;
      case LITERAL_DOUBLE:
      case LITERAL_INT:
      case LITERAL_BOOLEAN:
      case TOKEN_NULL:
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
  if (trace) print('addStaticInitializer');
  if (!type['<static-initializers>']) type['<static-initializers>'] = [];
  var body = flatten(si.statements);
  type['<static-initializers>'].push(new Function(body));
};

var addInstanceInitializer = function(type, ii) {
  if (trace) print('addInstanceInitializer');
  if (!type['<instance-initializers>']) type['<instance-initializers>'] = [];
  var body = flatten(ii.statements);
  type['<instance-initializers>'].push(new Function(body));
};

var addClassProperty = function(type, cp) {
  if (trace) print('addClassProperty');
  //var name = qualifiers_str(cp.qualifiers) + cp.name
  addIdentifier(cp.name,
                'Result.' + type.name + '.' + cp.name,
                cp.type,
                true,
               'field');
  // TODO: type check
  var value = cp.initial_value;
  if (value && value.kind == 'literal')
    value = value.value;
  else
    value = flatten(value);
  type[cp.name] = value;
};

var addProperty = function(type, p, processPriv) {
  if (trace) print('addPropery');
  if ((p.qualifiers & JOG_QUALIFIER_PRIVATE) && !processPriv) {
    if (!type.private_properies) type.private_properties = {};
    type.private_properties[p.name] = p;
  } else {
    addIdentifier(p.name, 'this.' + p.name, p.type, true, 'field');
    // TODO: type check
    if (p.initial_value && p.initial_value.kind == 'literal') {
      type[p.name] = p.initial_value.value;
    } else {
      // TODO: non-static initializer block
      type[p.name] = flatten(p.initial_value);
    }
  }
};

var addClassMethod = function(type, cm) {
  if (trace) print('addClassMethod: ' + cm.name);
  var name = methodSignature(cm);
  addIdentifier(name, name, cm.return_type, true, 'method');
  pushScope();
  static_context = type;
  var params = parameterList(cm.parameters);
  var body = flatten(cm.statements);
  type[name] = new Function(params, body);
  static_context = null;
  popScope();
};

var addMethod = function(type, m, processPriv) {
  if (trace) print('addMehtod: ' + m.name);
  var name = methodSignature(m);
  //print('Signature: ' + name);
  if ((m.qualifiers & JOG_QUALIFIER_PRIVATE) && !processPriv) {
    if (!type.private_methods) type.private_methods = {};
    type.private_methods[m.name] = m;
  } else {
    //addIdentifier(m.name, m.name, null, true);
    addIdentifier(name, name, m.return_type, true, 'method');
    pushScope();
    var params = parameterList(m.parameters);
    var body = flatten(m.statements);
    type[name] = new Function(params, body);
    popScope();
  }
};

var addClass = function(type) {
  if (trace) print('Class: ' + type.name);

  var ctype = Result[type.name] = {name:type.name};

  addIdentifier(type.name,
                'Result.' + type.name,
                type,
                true,
               'class');

  pushScope();


  if (type.interfaces) {
    if (trace) print('have interfaces');
    for (var j = 0; j < type.interfaces.length; j++) {
      var anInterface = classByName(type.interfaces[j].name);
      if (anInterface.class_properties) {
        if (trace) print('have interface class_properties');
        for (var j = 0; j < anInterface.class_properties.length; j++) {
          var cp = anInterface.class_properties[j];
          if (!type.class_properties) type.class_properties = [];
          type.class_properties.unshift(cp);
          //addClassProperty(ctype, cp);
        }
      }
      if (anInterface.methods) {
        if (trace) print('have interface methods');
        // TODO: ensure methods are implemented
      }
    }
  }

  var base_class = null;
  if (type.base_class) {
    base_class = classByName(type.base_class.name);
    if (base_class.class_properties) {
      if (trace) print('have super class_properties');
      for (var j = 0; j < base_class.class_properties.length; j++) {
        var cp = base_class.class_properties[j];
        if (!(cp.qualifiers & JOG_QUALIFIER_PRIVATE)) {
          if (!type.class_properties) type.class_properties = [];
          type.class_properties.unshift(cp);
          //addClassProperty(ctype, cp);
        }
      }
    }
    if (base_class.properties) {
      if (trace) print('have super properties');
      for (var j = 0; j < base_class.properties.length; j++) {
        var p = base_class.properties[j];
        if (!(p.qualifiers & JOG_QUALIFIER_PRIVATE)) {
          if (!type.properties) type.properties = [];
          type.properties.unshift(p);
          //addProperty(ctype, p);
        }
      }
    }
    if (base_class.class_methods) {
      if (trace) print('have super class_methods');
      for (var j = 0; j < base_class.class_methods.length; j++) {
        var cm = base_class.class_methods[j];
        if (!(cm.qualifiers & JOG_QUALIFIER_PRIVATE)) {
          if (!type.class_methods) type.class_methods = [];
          type.class_methods.unshift(cm);
          //addClassMethod(ctype, cm);
        }
      }
    }
  }

  if (type.class_properties) {
    if (trace) print('have class_properties');
    for (var j = 0; j < type.class_properties.length; j++) {
      var cp = type.class_properties[j];
      addClassProperty(ctype, cp);
    }
  }
  if (type.properties) {
    if (trace) print('have properties');
    for (var j = 0; j < type.properties.length; j++) {
      var p = type.properties[j];
      addProperty(ctype, p);
    }
  }
  if (type.class_methods) {
    if (trace) print('have class_methods');
    for (var j = 0; j < type.class_methods.length; j++) {
      var cm = type.class_methods[j];
      addClassMethod(ctype, cm);
    }
  }

  addIdentifier('this',
                'this',
                type,
                false,
               'this');
  if (base_class && base_class.methods) {
    if (trace) print('have super methods');
    for (var j = 0; j < base_class.methods.length; j++) {
      var m = base_class.methods[j];
      if (!(m.qualifiers & JOG_QUALIFIER_PRIVATE))
        if (m.kind != 'constructor') {
          if (!type.methods) type.methods = [];
          type.methods.unshift(m);
          //addMethod(ctype, m);
        }
    }
  }
  if (type.methods) {
    if (trace) print('have methods');
    for (var j = 0; j < type.methods.length; j++) {
      var m = type.methods[j];
      addMethod(ctype, m);
    }
  }

  var private_methods = '';
  if (ctype.private_methods) {
    if (trace) print('have private methods');
    for (var mKey in ctype.private_methods) {
      var m = ctype.private_methods[mKey];
      pushScope();
      var params = parameterList(m.parameters);
      var body = flatten(m.statements);
      addIdentifier(m.name, m.name, m.type, true, 'field');
      private_methods = private_methods
          + m.name + ': function (' + params.join(',') + ') {'
          + body
          + '}';
      popScope();
      private_methods = private_methods + ',';
    }
    delete ctype.private_methods;
  }
  var private_properties = {};
  if (ctype.private_properties) {
    if (trace) print('have private properties');
    for (var p in ctype.private_properties) {
      addProperty(private_properties, ctype.private_properties[p], true);
    }
    delete ctype.private_properties;
  }

  ctype['<class>'] =
      (new Function(
        'if (this[\'<private>\']) {'
            + 'print(\'class already initialized.\');'
            + 'quit();'
            + '}'
            + 'this[\'<private>\'] = function(self) {'
            + 'var privates = ' + JSON.stringify(private_properties) + ';'
            + 'return {' + private_methods
            + '\'<mutate>\': function (field, x) {'
            + 'if (typeof(x) === \'undefined\') {'
            + ' return privates[field];'
            + '} else {'
            + ' privates[field] = x;'
            + '}}}}(this);'));

  if (type.static_initializers) {
    if (trace) print('have static_initializers');
    for (var j = 0; j < type.static_initializers.length; j++) {
      var si = type.static_initializers[j];
      addStaticInitializer(ctype, si);
    }
  }
  if (type.instance_initializers) {
    if (trace) print('have instance_initializers');
    for (var j = 0; j < type.instance_initializers.length; j++) {
      var si = type.instance_initializers[j];
      addInstanceInitializer(ctype, si);
    }
  }

  popScope();
};

var classByName = function(name) {
  var ast = Parser;
  var type = null;
  for (var i = 0; i < ast.parsed_types.length; i++) {
    type = ast.parsed_types[i];
    if (type.name == name) return type;
  }
  return null;
};

var compile = function(ast) {
  if (trace) print('compile');
  if (!ast) { print('Nothing to compile.'); return; }
  // TODO: there is a possible naming collision here if
  // someone defines a class named "package" or a class
  // named "imports"
  if (ast['package']) Result['package'] = ast['package'];
  if (ast.imports) {
    // TODO: recursively add imports
  }
  var type = null;
  pushScope();
  for (var i = 0; i < ast.parsed_types.length; i++) {
    type = ast.parsed_types[i];
    addClass(type);
  }
  popScope();
};