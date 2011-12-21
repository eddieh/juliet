/*
  Copyright 2011 James Dean Palmer, Eddie Hillenbrand

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

var JOG_QUALIFIER_PUBLIC      =   1;
var JOG_QUALIFIER_PROTECTED   =   2;
var JOG_QUALIFIER_PRIVATE     =   4;
var JOG_QUALIFIER_STATIC      =   8;
var JOG_QUALIFIER_NATIVE      =  16;
var JOG_QUALIFIER_CLASS       =  32;
var JOG_QUALIFIER_INTERFACE   =  64;
var JOG_QUALIFIER_PRIMITIVE   = 128;
var JOG_QUALIFIER_CONSTRUCTOR = 256;
var JOG_QUALIFIER_ABSTRACT    = 512;
var JOG_QUALIFIER_FINAL       = 1024;
var JOG_QUALIFIER_STRICTFP    = 2048;
var JOG_QUALIFIER_TRANSIENT   = 4096;
var JOG_QUALIFIER_VOLATILE    = 8192;
var JOG_QUALIFIER_SYNCRONIZED = 16384;

var JOG_QUALIFIER_REFERENCE = (JOG_QUALIFIER_CLASS | JOG_QUALIFIER_INTERFACE);

var Parser = {
  this_method: null,
  parsed_types: [],
};

var init_parser = function() {
  Parser = {
    this_method: null,
    parsed_types: [],
  };
};


var consume_ws = function() {
};

var has_another = function() {
  return (peek().type != TOKEN_EOF);
};

var read = function() {
  var t = null;
  if (Juliet.lexer.pending.length) {
    t = Juliet.lexer.pending.pop();
  } else {
    if (Juliet.lexer.tokenize() == false) return false;
    t = read();
  }

  Juliet.lexer.processed.push(t);
  if (Juliet.lexer.marks.length > 0) {
    for (var i = 0, len = Juliet.lexer.marks.length; i < len; i++) {
      Juliet.lexer.marks[i]++;
    }
  }

  return t;
};

var peek = function(num_ahead) {
  var t = null;
  if (num_ahead !== undefined) {
    if (num_ahead <= 1) return peek();

    set_mark();
    while (--num_ahead) read();
    t = peek();
    rewind_to_mark();
    return t;
  }

  var len = Juliet.lexer.pending.length;
  if (len) {
    return Juliet.lexer.pending[len - 1];
  } else if (Juliet.lexer.tokenize() == false) {
    return null;
  }

  return peek();
};

var set_mark = function() {
  Juliet.lexer.marks.push(0);
};

var clear_mark = function() {
  Juliet.lexer.marks.pop();
};

var rewind_to_mark = function() {
  var depth = Juliet.lexer.marks.pop();
  for (var i = 0; i < depth; i ++) {
    Juliet.lexer.pending.push(Juliet.lexer.processed.pop());
  }
};

var next_is = function(token_type) {
  var t = peek();

  if (Juliet.util.isArray(token_type) && t) {
    return token_type.some(function(tok) {
      return this == tok;
    },t.type);
  }

  return (t) ? (t.type == token_type) : false;
};

var consume = function(token_type) {
  var p = peek();

  if (Juliet.util.isArray(token_type) && p) {
    var match = token_type.some(function(tok) {
      return this == tok;
    },p.type);
    if (match) {
      read();
      return true;
    }
    return false;
  }

  if (p && ('type' in p) && (p.type == token_type)) {
    read();
    return true;
  }
  return false;
};

var must_consume = function(token_type, error_message) {
  if (trace) print('must_consume ' + Juliet.util.token_str(token_type));
  if (consume(token_type)) return;
  throw new Error(error_message);
};

var must_consume_semicolon = function(t) {
  if (trace) print('must_consume_semicolon');
  if (!consume(TOKEN_SEMICOLON)) {
    throw t.error('Syntax error: expected ;.');
    // TODO: complete semicolon handling
  }
};

var must_read_id = function(error_message) {
  if (trace) print('must_read_id');
  var t = peek();
  var result = '';

  if (t.type != TOKEN_ID) {
    throw t.error(error_message);
  }

  result = read().content;
  return result;
};

var is_class = function(a) {
  return a.qualifiers & JOG_QUALIFIER_CLASS;
};

var is_interface = function(a) {
  return a.qualifiers & JOG_QUALIFIER_INTERFACE;
};

var is_template = function(a) {
  return a.placeholder_types;
};

var is_static = function(a) {
  return a.qualifiers & JOG_QUALIFIER_STATIC;
};

var is_abstract = function(a) {
  return a.qualifiers & JOG_QUALIFIER_ABSTRACT;
};

var is_constructor = function(a) {
  return a.qualifiers & JOG_QUALIFIER_CONSTRUCTOR;
};

var reinterpret_as_type = function(a) {
  return a;
}

var cmd = function(op, t, lhs, rhs) {
};

var parse = function() {
  if (trace) print('parse');
  parse_compilation_unit();
}

var parse_compilation_unit = function(unit) {
  if (trace) print('parse_compilation_unit');
  var t = peek();
  if (next_is(TOKEN_PACKAGE)) {
    Parser['package'] = parse_package_decls();
  }
  while (next_is(TOKEN_IMPORT)) {
    if (!Parser.imports) Parser.imports = [];
    Parser.imports.push(parse_import_decls());
  }
  var type = parse_type_def();
  while (type) {
    type = parse_type_def();
  }
};

var parse_package_decls = function(){
  if (trace) print('parse_package_decls');
  var t = read();
  var name = must_read_id('Expected package name.');
  while (consume(TOKEN_PERIOD)) {
    name = name + '.' + must_read_id('Expected identifier.');
  }
  must_consume_semicolon(t);
  return {token:t.type,
          kind:'package',
          name:name};
};

var parse_import_decls = function() {
  if (trace) print('parse_import_decls');
  var t = read();
  var name = '';
  if (consume(TOKEN_STATIC)) name = 'static ';
  name = must_read_id('Expected package or type name.');
  while (consume(TOKEN_PERIOD)) {
    name = name + '.';
    if (next_is(TOKEN_STAR)) {
      read();
      name = name + '*';
      break;
    }
    name = name + must_read_id('Expected identifier.');
  }
  must_consume_semicolon(t);
  return {token:t.type,
          kind:'import',
          name:name};
};

var parse_type_def = function() {
  if (trace) print('parse_type_def');
  var quals = null;
  var t = null;
  var mesg = '';
  var name = '';
  var type = null;
  var t2 = null;

  if (arguments.length == 0) {
    quals = parse_type_qualifiers();
    t = peek();
    if (consume(TOKEN_CLASS)) {
      return parse_type_def(t, quals | JOG_QUALIFIER_CLASS , 'Class name expected.');
    } else if (consume(TOKEN_INTERFACE)) {
      return parse_type_def(t, quals | JOG_QUALIFIER_INTERFACE | JOG_QUALIFIER_ABSTRACT, 'Interface name expected.');
    } else {
      if (quals) throw t.error('Expected class or interface.');
    }

    // TODO: enums

    return null;
  } else if (arguments.length == 3) {
    t = arguments[0];
    quals = arguments[1];
    mesg = arguments[2];

    if ((quals & (JOG_QUALIFIER_PUBLIC | JOG_QUALIFIER_PROTECTED | JOG_QUALIFIER_PRIVATE)) == 0) {
      // default to protected
      quals |= JOG_QUALIFIER_PROTECTED;
    }

    name = must_read_id(mesg);
    type = {token:t.type,
            kind:'definition',
            qualifiers:quals,
            name:name};
    Parser.parsed_types.push(type);

    // parametrized types
    // template type (Jog implements templates instead of generics).
    if (consume(TOKEN_LT)) {
      type.placeholder_types = [parse_placeholder_type()];
      while(consume(TOKEN_COMMA)) {
        type.placeholder_types.push(parse_placeholder_type());
      }
      must_consume(TOKEN_GT, 'Expected >.');

      // Set a mark to ensure that all the tokens are buffered, parse
      // in the class, and collect the buffered tokens to use for
      // implementing the template later on.
      set_mark();

      parse_type_def(t, type);

      var start = Juliet.lexer.processed.length - Juliet.lexer.marks[Juliet.lexer.marks.length - 1];
      for (var i = start, len = Juliet.lexer.processed.length; i < len; i++) {
        if (!type.template_tokens) type.template_tokens = [];
        type.template_tokens.push(Juliet.lexer.processed[i]);
      }
      clear_mark();

      delete type.base_class;
      delete type.interfaces;

      return type;
    }

    parse_type_def(t, type);

    return type;
  } else if (arguments.length == 2) {
    t = arguments[0];
    type = arguments[1];

    if (consume(TOKEN_EXTENDS)) type.base_class = parse_data_type(true);

    t2 = peek();
    if (consume(TOKEN_IMPLEMENTS)) {
      if (is_interface(type)) throw t.error('Interface cannot implement another.');
      type.interfaces = [parse_data_type(true)];
      while (consume(TOKEN_COMMA)) {
        type.interfaces.push(parse_data_type(true));
      }
    }

    // make one empty static initializer for setting up initial class
    // property values
    if (is_class(type) && !is_template(type)) {
      type.static_initializers = [{token:t.type,
                                   kind:'static-initializer',
                                   qualifiers:JOG_QUALIFIER_STATIC,
                                   // TODO: type_context:type,
                                   return_type:null,
                                   name:'static'}];
    }

    must_consume(TOKEN_LCURLY, 'Expected {.');

    while (true) {
      set_mark();
      try {
        result = parse_member(type);
        clear_mark();
        if (!result) break;
      } catch (e) {
        rewind_to_mark();
        try {
          if (!parse_type_def()) throw e;
        } catch (e) { throw e; }
      }
    }

    must_consume(TOKEN_RCURLY, 'Expected }.');
  }
}

var parse_placeholder_type = function() {
  if (trace) print('parse_placeholder_type');
  var placeholder_type = parse_data_type(true);
  return placeholder_type;
}

var parse_type_qualifiers = function() {
  if (trace) print('parse_type_qualifiers');
  var quals = 0;
  var t = null;

  while (true) {
    t = peek();

    if (consume(TOKEN_ABSTRACT)) {
      quals |= JOG_QUALIFIER_ABSTRACT;
      if (quals & (JOG_QUALIFIER_FINAL)) {
        throw t.error('Cannot be abstract if final.');
      }
      continue;
    }

    if (consume(TOKEN_PUBLIC)) {
      quals |= JOG_QUALIFIER_PUBLIC;
      if (quals & (JOG_QUALIFIER_PROTECTED | JOG_QUALIFIER_PRIVATE)) {
        throw t.error('Cannot be public if protected or private.');
      }
      continue;
    }

    if (consume(TOKEN_PROTECTED)) {
      quals |= JOG_QUALIFIER_PROTECTED;
      if (quals & (JOG_QUALIFIER_PUBLIC | JOG_QUALIFIER_PRIVATE)) {
        throw t.error('Cannot be protected if public or private.');
      }
      continue;
    }

    if (consume(TOKEN_PRIVATE)) {
      quals |= JOG_QUALIFIER_PRIVATE;
      if (quals & (JOG_QUALIFIER_PUBLIC | JOG_QUALIFIER_PROTECTED)) {
        throw t.error('Cannot be private if public or protected.');
      }
      continue;
    }

    if (consume(TOKEN_FINAL)) {
      quals |= JOG_QUALIFIER_FINAL;
      if (quals & (JOG_QUALIFIER_ABSTRACT)) {
        throw t.error('Cannot be final if abstract.');
      }
      continue;
    }

    if (consume(TOKEN_STRICTFP)) {
      quals |= JOG_QUALIFIER_STRICTFP;
      continue;
    }

    return quals;
  }
}

var parse_member_qualifiers = function() {
  if (trace) print('parse_member_qualifiers');
  var quals = 0;
  var t = null;

  while(true) {
    t = peek();

    if (consume(TOKEN_ABSTRACT)) {
      quals |= JOG_QUALIFIER_ABSTRACT;
      continue;
    }

    if (consume(TOKEN_PUBLIC)) {
      quals |= JOG_QUALIFIER_PUBLIC;
      if (quals & (JOG_QUALIFIER_PROTECTED | JOG_QUALIFIER_PRIVATE)) {
        throw t.error('Cannot be public if protected or private.');
      }
      continue;
    }

    if (consume(TOKEN_PROTECTED)) {
      quals |= JOG_QUALIFIER_PROTECTED;
      if (quals & (JOG_QUALIFIER_PUBLIC | JOG_QUALIFIER_PRIVATE)) {
        throw t.error('Cannot be protected if public or private.');
      }
      continue;
    }

    if (consume(TOKEN_PRIVATE)) {
      quals |= JOG_QUALIFIER_PRIVATE;
      if (quals & (JOG_QUALIFIER_PUBLIC | JOG_QUALIFIER_PROTECTED)) {
        throw t.error('Cannot be private if public or protected.');
      }
      continue;
    }

    if (consume(TOKEN_STATIC)) {
      quals |= JOG_QUALIFIER_STATIC;
      continue;
    }

    if (consume(TOKEN_FINAL)) {
      quals |= JOG_QUALIFIER_FINAL;
      continue;
    }

    if (consume(TOKEN_TRANSIENT)) {
      quals |= JOG_QUALIFIER_TRANSIENT;
      continue;
    }

    if (consume(TOKEN_VOLATILE)) {
      quals |= JOG_QUALIFIER_VOLATILE;
      continue;
    }

    if (consume(TOKEN_SYNCHRONIZED)) {
      quals |= JOG_QUALIFIER_SYNCRONIZED;
      continue;
    }

    if (consume(TOKEN_NATIVE)) {
      quals |= JOG_QUALIFIER_NATIVE;
      continue;
    }

    if (consume(TOKEN_STRICTFP)) {
      quals |= JOG_QUALIFIER_STRICTFP;
      continue;
    }

    return quals;
  }
}

var parse_member = function(type) {
  if (trace) print('parse_member');
  if (next_is(TOKEN_RCURLY)) return false;

  var t = peek();
  var quals = parse_member_qualifiers();
  var t2 = peek();
  var m = null;
  var stm = null;
  var name_t = null;
  var name = '';
  var first = true;

  // static initializer
  if (quals == JOG_QUALIFIER_STATIC && next_is(TOKEN_LCURLY)) {
    if (trace) print('static initiaizer');
    if (is_interface(type)) {
      throw t.error('Static initialization block not allowed here.');
    }

    m = {token:t.type,
         kind:'static-initializer',
         qualifiers:quals,
         //type:type,
         return_type:null,
         name:'static'};
    Parser.this_method = m;
    if (!type.static_initializers) type.static_initializers = [];
    type.static_initializers.push(m);

    read();
    while (!next_is(TOKEN_RCURLY)) {
      stm = parse_statement(true);
      if (stm) {
        if (!m.statements) m.statements = [];
        m.statements.push(stm);
      }
    }
    must_consume(TOKEN_RCURLY, 'Expected }');
    if (next_is(TOKEN_SEMICOLON)) read();
    return true;
  }

  // instance initializer
  if (quals == 0 && next_is(TOKEN_LCURLY)) {
    if (trace) print('instance initializer');
    if (is_interface(type)) {
      throw t.error('Instance initialization block not allowed here.');
    }

    m = {token:t.type,
         kind:'instance-initializer',
         qualifiers:quals,
         //type:type,
         return_type:null,
         name:'instance'};
    Parser.this_method = m;
    if (!type.instance_initializers) type.instance_initializers = [];
    type.instance_initializers.push(m);

    read();
    while (!next_is(TOKEN_RCURLY)) {
      stm = parse_statement(true);
      if (stm) {
        if (!m.statements) m.statements = [];
        m.statements.push(stm);
      }
    }
    must_consume(TOKEN_RCURLY, 'Expected }');
    if (next_is(TOKEN_SEMICOLON)) read();
    return true;
  }

  data_type = parse_data_type(true);

  // constructor
  if (next_is(TOKEN_LPAREN)) {
    if (trace) print('constructor');
    if (data_type.name == type.name) {
      if (quals & JOG_QUALIFIER_STATIC) {
        throw t.error('Constructor cannot be static.');
      }
      if (is_interface(type)) {
        throw t.error('Constructor not allowed here.');
      }

      quals |= JOG_QUALIFIER_CONSTRUCTOR;
      m = {token:t.type,
           kind:'constructor',
           qualifiers:quals,
           //type:type, // TODO:
           return_type: null,
           name:'<init>'};
      Parser.this_method = m;
      parse_params(m);
      if (!type.methods) type.methods = [];
      type.methods.push(m);

      must_consume(TOKEN_LCURLY, 'Expected {.');
      while (!next_is(TOKEN_RCURLY)) {
        stm = parse_statement(true);
        if (stm) {
          if (!m.statements) m.statements = [];
          m.statements.push(stm);
        }
      }
      must_consume(TOKEN_RCURLY, 'Expected }.');

      return true;
    } else {
      throw t.error('Method missing return type.');
    }
  }

  name_t = peek();
  name = must_read_id('Expected identifier after type.');

  // Method
  if (next_is(TOKEN_LPAREN)) {
    if (trace) print('method');
    if (name == type.name) {
      throw t.error('Constructors cannot specify a return type.');
    }

    if (is_interface(type)) quals |= JOG_QUALIFIER_ABSTRACT;

    m = {token:t.type,
         kind:'method',
         qualifiers:quals,
         // TODO: type:type,
         return_type:data_type,
         name:name};

    if (is_interface(type) && is_static(m)) {
      throw t.error('Interface method cannot be static.');
    }

    Parser.this_method = m;
    parse_params(m);
    if (is_static(m)) {
      if (!type.class_methods) type.class_methods = [];
      type.class_methods.push(m);
    } else {
      if (!type.methods) type.methods = [];
      type.methods.push(m);
    }

    if (quals & JOG_QUALIFIER_NATIVE) {
      if (is_interface(m)) {
        throw t.error('Interface method cannot be native.');
      }
      must_consume(TOKEN_SEMICOLON, 'Expected ;.');
    } else if (consume(TOKEN_SEMICOLON)) {
      if (!is_abstract(m)) {
        throw t.error('Method missing body.');
      }
      if (!is_abstract(m)) {
        throw t.error('Abstract method not allowed in non-abstract class.');
      }
    } else {
      if (is_abstract(m)) {
        throw t.error('Abstract method cannot have body.');
      }

      must_consume(TOKEN_LCURLY, 'Expected {.');
      while (!next_is(TOKEN_RCURLY)) {
        stm = parse_statement(true);
        if (stm) {
          if (!m.statements) m.statements = [];
          m.statements.push(stm);
        }
      }
      must_consume(TOKEN_RCURLY, 'Expected }.');
    }
  } else {
    // property
    if (trace) print('property');
    if (data_type == null) {
      throw t.error('void cannot be use as property type.');
    }
    if (quals & JOG_QUALIFIER_NATIVE) {
      throw t.error('native qualifier cannot be used for properties.');
    }

    if (is_interface(type)) {
      // TODO: interfaces can in fact have field declarations, however
      // *every* field declaration in the body of an interface is
      // implicityly public, static, and final. As such, each field in
      // an interface must have an initial value.
      throw t.error('Interface cannot have properties.');
    }

    first = true;
    do {
      if (first) first = false;
      else {
        name_t = peek();
        name = must_read_id('Expected identifier.');
      }

      p = {token:name_t.type,
           kind:'property',
           qualifiers:quals,
           // TODO: type_context:type,
           type:data_type,
           name:name,
           initial_value:parse_initial_value(data_type)};
      if (is_static(p)) {
        if (!type.class_properties) type.class_properties = [];
        type.class_properties.push(p);
      } else {
        if (!type.properties) type.properties = [];
        type.properties.push(p);
      }
    } while (consume(TOKEN_COMMA));

    must_consume_semicolon(t);
  }

  return true;
};

var parse_params = function(m) {
  if (trace) print('parse_params');
  var t = null;
  var type = null;
  var name = '';

  must_consume(TOKEN_LPAREN, 'Expected (.');

  if (!consume(TOKEN_RPAREN)) {
    do {
      t = peek();
      type = parse_data_type(true);
      if (!type) {
        throw t.error('void cannot be parameter type');
      }

      name = must_read_id('Expected identifier.');
      if (!m.parameters) m.parameters = [];
      m.parameters.push({token:t.type,
                         kind:'parameter',
                         type:type,
                         name:name});
    } while (consume(TOKEN_COMMA));
    must_consume(TOKEN_RPAREN, 'Expected ).');
  }
};

var generic_depth = [];
var parse_data_type = function(parse_brackets, parse_wildcards) {
  if (trace) print('parse_data_type');
  var t = peek();
  var name = '';

  // primitive
  if (consume([TOKEN_CHAR, TOKEN_BYTE, TOKEN_SHORT, TOKEN_INT, TOKEN_LONG, TOKEN_FLOAT, TOKEN_DOUBLE, TOKEN_STRING, TOKEN_BOOLEAN])) {
    name = t.content;
  }

  // identifier
  if (!name) {
    try {
      name = must_read_id('Expected type.');
    } catch (e) {
      if (!parse_wildcards) throw e;
      must_consume(TOKEN_QUESTIONMARK, 'Expected ?.');
      name = name + '?';
      if (consume(TOKEN_EXTENDS)) {
        name = name + ' extends ';
        name = name + must_read_id('Expected type.');
      } else if (consume(TOKEN_SUPER)) {
        name = name + ' super ';
        name = name + must_read_id('Expected type.');
      }
    }
  }

  // templates for generics
  if (consume(TOKEN_LT)) {
    generic_depth.push(TOKEN_LT);

    name = name + '<';
    var subst_type = parse_data_type(true, true);
    name = name + subst_type.name;

    while (consume(TOKEN_COMMA)) {
      name = name + ',';
      subst_type = parse_data_type(true, true);
      name = name + subst_type.name;
    }

    if (generic_depth.length > 0) {
      try {
        must_consume(TOKEN_GT, 'Expected >.');
        if (generic_depth.pop() != TOKEN_LT)
          throw t.error('Syntax error.');
        name = name + '>';
      } catch (e) {
        try {
          must_consume(TOKEN_SHR, 'Expected >>.');
          if (generic_depth.pop() != TOKEN_LT)
            throw t.error('Syntax error.');
          if (generic_depth.pop() != TOKEN_LT)
            throw t.error('Syntax error.');
          name = name + '>>';
        } catch (e) {
          try {
            must_consume(TOKEN_SHRX, 'Expected >>>.');
            if (generic_depth.pop() != TOKEN_LT)
              throw t.error('Syntax error.');
            if (generic_depth.pop() != TOKEN_LT)
              throw t.error('Syntax error.');
            if (generic_depth.pop() != TOKEN_LT)
              throw t.error('Syntax error.');
            name = name + '>>>';
          } catch (e) { throw e; }
        }
      }
    }
  }

  // subscript
  if (parse_brackets) {
    while (consume(TOKEN_LBRACKET)) {
      name = name + '[]';
      must_consume(TOKEN_RBRACKET, 'Expected ] (Error#).');
    }
  }

  // TODO: add type to type table
  return {token:t.type,
          kind:'type',
          name:name};
};

var parse_initial_value = function(of_type) {
  if (trace) print('parse_initial_value');
  if (consume(TOKEN_ASSIGN)) {
    if (next_is(TOKEN_LCURLY)) {
      return parse_literal_array(of_type);
    } else {
      return parse_expression();
    }
  } else {
    return null;
  }
};

var parse_statement = function(require_semicolon) {
  if (trace) print('parse_statement');
  if (require_semicolon && consume(TOKEN_SEMICOLON)) return null;
  else if (next_is(TOKEN_RPAREN)) return null;

  var t = peek();
  var block = [];
  var stm = null;
  var cmd = null;
  var conditional = null;
  var loop = null;
  var init_expr;
  var local_type = null;
  var local_name = '';
  var iterable_expr = null;
  var condition = null;
  var var_mod = null;
  var expr = null;
  var var_type = null;

  if (consume(TOKEN_LCURLY)) {
    while (!consume(TOKEN_RCURLY)) {
      stm = parse_statement(true);
      if (stm) {
        block.push(stm);
      }
    }
    return {kind:'block', statements:block};
  }

  if (consume(TOKEN_RETURN)) {
    if (consume(TOKEN_SEMICOLON)) {
      if (Parser.this_method && Parser.this_method.return_type) {
        throw t.error('Missing return value.');
      }
      return {token:t.type,
              kind:'return',
              value:'void'};
    }

    cmd = {token:t.type,
           kind:'return',
           expression:parse_expression()};
    if (require_semicolon) must_consume_semicolon(t);
    return cmd;
  }

  if (consume(TOKEN_THROW)) {
    if (consume(TOKEN_SEMICOLON)) {
      throw t.error('Missing expression.');
    }
    expr = parse_expression();
    if (!expr) throw t.error('Missing expression.');
    cmd = {token:t.type,
           kind:'throw',
           expression:expr};
    if (require_semicolon) must_consume_semicolon(t);
    return cmd;
  }

  if (consume(TOKEN_IF)) {
    must_consume(TOKEN_LPAREN, 'Expected (.');
    conditional = {token:t.type,
                   kind:'if',
                   expression:parse_expression()};
    must_consume(TOKEN_RPAREN, 'Expected ).');

    if (next_is(TOKEN_SEMICOLON)) {
      throw t.error('Unexpected ;.');
    }

    conditional.body = parse_statement(true);
    if (consume(TOKEN_ELSE)) {
      if (next_is(TOKEN_SEMICOLON)) {
        throw t.error('Unexpected ;.');
      }
      conditional.else_body = parse_statement(true);
    }
    return conditional;
  }

  // TODO: TOKEN_DO

  if (consume(TOKEN_WHILE)) {
    must_consume(TOKEN_LPAREN, 'Expected (.');
    loop = {token:t.type,
            kind:'while',
            expression:parse_expression()};
    must_consume(TOKEN_RPAREN, 'Expected ).');
    if (next_is(TOKEN_SEMICOLON)) {
      throw t.error('Unexpected ;.');
    }
    loop.body = parse_statement(true);
    return loop;
  }

  if (consume(TOKEN_FOR)) {
    must_consume(TOKEN_LPAREN, 'Expected (.');

    set_mark();
    init_expr = parse_statement(false);
    if (next_is(TOKEN_COLON)) {
      rewind_to_mark();
      local_type = parse_data_type(true);
      local_name = must_read_id('Expected identifier.');

      must_consume(TOKEN_COLON, 'Expected :.');
      iterable_expr = parse_expression();
      must_consume(TOKEN_RPAREN, 'Expected ).');

      loop = {token:t.type,
              kind:'for-each',
              type:local_type,
              name:local_name,
              iterable:iterable_expr};
      if (next_is(TOKEN_SEMICOLON)) {
        throw t.error('Unexpected ;.');
      }
      loop.body = parse_statement(true);
      return loop;
    } else {
      clear_mark();
      must_consume(TOKEN_SEMICOLON,  'Expected ;.');
    }

    if (consume(TOKEN_SEMICOLON)) {
      condition = {token:t.type,
                   kind:'conditional',
                   expression:true};
    } else {
      condition = parse_expression();
      must_consume(TOKEN_SEMICOLON, 'Expected ;.');
    }
    var_mod = parse_statement(false);
    must_consume(TOKEN_RPAREN, 'Expected ).');
    loop = {token:t.type,
            kind:'for',
            initialization:init_expr,
            condition:condition,
            var_mod:var_mod};
    if (next_is(TOKEN_SEMICOLON)) {
      throw t.error('Unexpected ;.');
    }
    loop.body = parse_statement(true);
    return loop;
  }

  if (consume(TOKEN_BREAK)) {
    cmd = {token:t.type,
           kind:'abrupt'};
    // TODO: [Identifier]
    if (require_semicolon) must_consume_semicolon(t);
    return cmd;
  }

  if (consume(TOKEN_CONTINUE)) {
    cmd = {token:t.type,
           kind:'abrupt'};
    // TODO: [Identifier]
    if (require_semicolon) must_consume_semicolon(t);
    return cmd;
  }

  if (consume(TOKEN_ASSERT)) {
    must_consume(TOKEN_LPAREN, 'Expected (.');
    cmd = {token:t.type,
           kind:'assert',
           expression:parse_expression()};
    if (consume(TOKEN_COMMA)) {
      if (peek().type != LITERAL_STRING) {
        throw t.error('Expected string literal.');
      }
      cmd.message = read().content;
    }
    must_consume(TOKEN_RPAREN, 'Expected ).');
    return cmd;
  }

  // TODO: try
  // TODO: switch
  // TODO: synchronized
  // TODO: empty statement ';'
  // TODO: labled statements

  expr = parse_expression();
  if (next_is(TOKEN_ID)) {
    var var_type = reinterpret_as_type(expr);
    return parse_local_var_decl(expr.token, var_type, require_semicolon);
  }

  if (require_semicolon) must_consume_semicolon(t);

  return expr; // TODO: discarding_result
};

var parse_local_var_decl = function(t, var_type, req_semi) {
  if (trace) print('parse_local_var_decl');
  var locals = [];
  var t2 = null;
  var name = '';
  var decl = null;

  if (!var_type) {
    throw t.error('Expected datatype.');
  }

  do {
    t2 = peek();
    name = must_read_id('Expected identifier');
    decl = {token:t2.type,
            kind:'local',
            type:var_type,
            name:name,
            initial_value:parse_initial_value(var_type)};
    locals.push(decl);
  } while (consume(TOKEN_COMMA));

  if (req_semi) must_consume_semicolon(t);

  return locals;
};

var parse_expression = function() {
  if (trace) print('parse_expression');
  var cmd = parse_assignment();
  return cmd;
};

var parse_assignment = function() {
  if (trace) print('parse_assignment');
  var expr = parse_conditional();
  var t = peek();
  if (consume(TOKEN_ASSIGN)) {
    expr = {token:t.type,
            kind:'assignment',
            location:expr,
            new_value:parse_assignment()};
  } else if (consume(TOKEN_ADD_ASSIGN)) {
    expr = {token:t.type,
            kind:'assignment',
            location:expr,
            new_value:parse_assignment()};
  } else if (consume(TOKEN_SUB_ASSIGN)) {
    expr = {token:t.type,
            kind:'assignment',
            location:expr,
            new_value:parse_assignment()};
  } else if (consume(TOKEN_MUL_ASSIGN)) {
    expr = {token:t.type,
            kind:'assignment',
            location:expr,
            new_value:parse_assignment()};
  } else if (consume(TOKEN_DIV_ASSIGN)) {
    expr = {token:t.type,
            kind:'assignment',
            location:expr,
            new_value:parse_assignment()};
  } else if (consume(TOKEN_MOD_ASSIGN)) {
    expr = {token:t.type,
            kind:'assignment',
            location:expr,
            new_value:parse_assignment()};
  } else if (consume(TOKEN_AND_ASSIGN)) {
    expr = {token:t.type,
            kind:'assignment',
            location:expr,
            new_value:parse_assignment()};
  } else if (consume(TOKEN_OR_ASSIGN)) {
    expr = {token:t.type,
            kind:'assignment',
            location:expr,
            new_value:parse_assignment()};
  } else if (consume(TOKEN_XOR_ASSIGN)) {
    expr = {token:t.type,
            kind:'assignment',
            location:expr,
            new_value:parse_assignment()};
  } else if (consume(TOKEN_SHL_ASSIGN)) {
    expr = {token:t.type,
            kind:'assignment',
            location:expr,
            new_value:parse_assignment()};
  } else if (consume(TOKEN_SHRX_ASSIGN)) {
    expr = {token:t.type,
            kind:'assignment',
            location:expr,
            new_value:parse_assignment()};
  } else if (consume(TOKEN_SHR_ASSIGN)) {
    expr = {token:t.type,
            kind:'assignment',
            location:expr,
            new_value:parse_assignment()};
  }
  return expr;
};

var parse_conditional = function() {
  if (trace) print('parse_conditional');
  var expr = parse_logical_or();
  var t = peek();
  var true_value = null;
  var false_value = null;
  if (consume(TOKEN_QUESTIONMARK)) {
    true_value = parse_conditional();
    must_consume(TOKEN_COLON, 'Expected :.');
    false_value = parse_conditional();
    return {token:t.type,
            kind:'ternary',
            expression:expr,
            true_value:true_value,
            false_value:false_value};
  }
  return expr;
}

var parse_logical_or = function(lhs) {
  if (trace) print('parse_logical_or');
  var t = null;
  if (lhs === undefined) {
    return parse_logical_or(parse_logical_and());
  } else {
    t = peek();
    if (consume(TOKEN_LOGICAL_OR)) {
      return parse_logical_or({token:t.type,
                               kind:'binary',
                               lhs:lhs,
                               rhs:parse_logical_and()});
    }
    return lhs;
  }
}

var parse_logical_and = function(lhs) {
  if (trace) print('parse_logical_and');
  var t = null;
  if (lhs === undefined) {
    return parse_logical_and(parse_bitwise_or());
  } else {
    t = peek();
    if (consume(TOKEN_LOGICAL_AND)) {
      return parse_logical_and({token:t.type,
                                kind:'binary',
                                lhs:lhs,
                                rhs:parse_bitwise_or()});
    }
    return lhs;
  }
}

var parse_bitwise_or = function(lhs) {
  if (trace) print('parse_bitwise_or');
  var t = null;
  if (lhs === undefined) {
    return parse_bitwise_or(parse_bitwise_xor());
  } else {
    t = peek();
    if (consume(TOKEN_PIPE)) {
      return parse_bitwise_or({token:t.type,
                               kind:'binary',
                               lhs:lhs,
                               rhs:parse_bitwise_xor()});
    }
    return lhs;
  }
}

var parse_bitwise_xor = function(lhs) {
  if (trace) print('parse_bitwise_xor');
  var t = null;
  if (lhs === undefined) {
    return parse_bitwise_xor(parse_bitwise_and());
  } else {
    t = peek();
    if (consume(TOKEN_CARET)) {
      return parse_bitwise_xor({token:t.type,
                                kind:'binary',
                                lhs:lhs,
                                rhs:parse_bitwise_and()});
    }
    return lhs;
  }
}

var parse_bitwise_and = function(lhs) {
  if (trace) print('parse_bitwise_and');
  var t = null;
  if (lhs === undefined) {
    return parse_bitwise_and(parse_equality());
  } else {
    t = peek();
    if (consume(TOKEN_AMPERSAND)) {
      return parse_bitwise_and({token:t.type,
                                kind:'binary',
                                lhs:lhs,
                                rhs:parse_equality()});
    }
    return lhs;
  }
}

// <<, >>, >>>
var parse_shift = function(lhs) {
  if (trace) print('parse_shift');
  if (lhs === undefined) return parse_shift(parse_translate());
  var t = peek();
  if (consume(TOKEN_SHL))
    return parse_shift({token:t.type,
                        kind:'binary',
                        lhs:lhs,
                        rhs:parse_translate()});
  if (consume(TOKEN_SHR))
    return parse_shift({token:t.type,
                        kind:'binary',
                        lhs:lhs,
                        rhs:parse_translate()});
  if (consume(TOKEN_SHRX))
    return parse_shift({token:t.type,
                        kind:'binary',
                        lhs:lhs,
                        rhs:parse_translate()});
  return lhs;
};

// <, <=, >, >=, instanceof
var parse_relational = function(lhs) {
  if (trace) print('parse_relational');
  if (lhs === undefined)
    return parse_relational(parse_shift());
  var t = peek();
  if (consume(TOKEN_LT))
    return parse_relational({token:t.type,
                             kind:'binary',
                             lhs:lhs,
                             rhs:parse_shift()});
  if (consume(TOKEN_LE))
    return parse_relational({token:t.type,
                             kind:'binary',
                             lhs:lhs,
                             rhs:parse_shift()});
  if (consume(TOKEN_GT))
    return parse_relational({token:t.type,
                             kind:'binary',
                             lhs:lhs,
                             rhs:parse_shift()});
  if (consume(TOKEN_GE))
    return parse_relational({token:t.type,
                             kind:'binary',
                             lhs:lhs,
                             rhs:parse_shift()});
  if (consume(TOKEN_INSTANCEOF))
    return parse_relational({token:t.type,
                             kind:'binary',
                             lhs:lhs,
                             rhs:parse_data_type(true)});
  return lhs;
};


// ==, !=
var parse_equality = function(lhs) {
  if (lhs === undefined)
    return parse_equality(parse_relational());
  var t = peek();
  if (consume(TOKEN_EQ))
    return parse_equality({token:t.type,
                           kind:'binary',
                           lhs:lhs,
                           rhs:parse_relational()});
  if (consume(TOKEN_NE))
    return parse_equality({token:t.type,
                           kind:'binary',
                           lhs:lhs,
                           rhs:parse_relational()});
  return lhs;
};


// +, -
var parse_translate = function(lhs) {
  if (trace) print('parse_translate');
  if (lhs === undefined)
    return parse_translate(parse_scale());
  var t = peek();
  if (consume(TOKEN_PLUS))
    return parse_translate({token:t.type,
                            kind:'binary',
                            lhs:lhs,
                            rhs:parse_scale()});
  if (consume(TOKEN_MINUS))
    return parse_translate({token:t.type,
                            kind:'binary',
                            lhs:lhs,
                            rhs:parse_scale()});
  return lhs;
};


// *, /
var parse_scale = function(lhs) {
  if (trace) print('parse_scale');
  if (lhs === undefined)
    return parse_scale(parse_prefix_unary());
  var t = peek();
  if (consume(TOKEN_STAR))
    return parse_scale({token:t.type,
                        kind:'binary',
                        lhs:lhs,
                        rhs:parse_prefix_unary()});
  if (consume(TOKEN_SLASH))
    return parse_scale({token:t.type,
                        kind:'binary',
                        lhs:lhs,
                        rhs:parse_prefix_unary()});
  if (consume(TOKEN_PERCENT))
    return parse_scale({token:t.type,
                        kind:'binary',
                        lhs:lhs,
                        rhs:parse_prefix_unary()});
  return lhs;
};

// (cast), new, ++, --, +, -, !, ~
var parse_prefix_unary = function() {
  if (trace) print('parse_prefix_unary');
  var t = peek();
  var to_type = null;
  var result = null;
  var of_type = null;
  var args = null;
  if (next_is(TOKEN_LPAREN)) {
    // MIGHT have a cast
    set_mark();
    read();
    if (next_is([TOKEN_ID, TOKEN_CHAR, TOKEN_BYTE, TOKEN_SHORT, TOKEN_INT, TOKEN_LONG, TOKEN_FLOAT, TOKEN_DOUBLE, TOKEN_STRING, TOKEN_BOOLEAN])) {
      // Casts are ambiguous syntax - assume this is indeed a cast and
      // just try it.
      try {
        to_type = parse_data_type(true);
        must_consume(TOKEN_RPAREN, 'Expected ).');
        result = {token:t.type,
                  kind:'cast',
                  operand:parse_prefix_unary(),
                  to_type:to_type};
        clear_mark();
        return result;
      } catch (e) {
        // Didn't work, not a cast - just proceed.
      }
    }
    rewind_to_mark();
  }
  if (consume(TOKEN_NEW)) {
    of_type = parse_data_type(false);
    if (next_is(TOKEN_LBRACKET)) {
      return parse_array_decl(t, of_type);
    } else {
      args = parse_args(true);
      return {token:t.type,
              kind:'new',
              type:of_type,
              args:args};
    }
  }
  if (consume(TOKEN_INCREMENT))
    return {token:t.type,
            kind:'prefix',
            operand:parse_prefix_unary()};
  if (consume(TOKEN_DECREMENT))
    return {token:t.type,
            kind:'prefix',
            operand:parse_prefix_unary()};
  // discard '+a' and just keep 'a'.
  if (consume(TOKEN_PLUS))
    return parse_prefix_unary();
  if (consume(TOKEN_MINUS))
    return {token:t.type,
            kind:'prefix',
            operand:parse_prefix_unary()};
  if (consume(TOKEN_BANG))
    return {token:t.type,
            kind:'prefix',
            operand:parse_prefix_unary()};
  if (consume(TOKEN_TILDE))
    return {token:t.type,
            kind:'prefix',
            operand:parse_prefix_unary()};
  return parse_postfix_unary();
};

var parse_array_decl = function(t, array_type) {
  var saw_empty = false;
  var dim_specified = false;
  var dim_expr = [];
  var base_name = '';
  var new_array = null;
  var cur = null;
  var element_type = null;
  var element_expr = null;

  // Requires at least one specified dim ("[5]") OR a {literal,list}
  // following.

  // Read the dimensions - [] or [expr]
  while (consume(TOKEN_LBRACKET)) {
    if (consume(TOKEN_RBRACKET)) {
      saw_empty = true;
      dim_expr.push(null);
    } else {
      if (saw_empty) {
        throw t.error('Must provide proceeding dimension.');
      }
      dim_specified = true;
      dim_expr.push(parse_expression());
      must_consume(TOKEN_RBRACKET, 'Expected ].');
    }
  }

  base_name = array_type.name;
  array_type = {token:array_type.token,
                kind:'type',
                name:base_name,
                length:dim_expr.length};

  if (!dim_specified) {
    if (!next_is(TOKEN_LCURLY)) {
      //throw t.error('Expected literal array.');
      print('array dimension missing');
      //print('or expected literal array');
      quit();
    }
    return parse_literal_array(array_type);
  }

  new_array = {token:t.type,
               kind:'array',
               type:array_type,
               length:dim_expr[0]};
  if (dim_expr.length > 1) {
    cur = new_array;
    for (var i = 1; i < dim_expr.length; ++i) {
      if (dim_expr[i] == null) break;
      element_type = {token:dim_expr[i].token,
                      kind:'element',
                      name:base_name,
                      length:dim_expr.length-i};
      element_expr = {token:t.type,
                      kind:'expression',
                      type:element_type,
                      expression:dim_expr[i]};
      cur.element_expr = element_expr;
      cur = element_expr;
    }
  }
  return new_array;
};

// ++, --, ., (), []
var parse_postfix_unary = function(operand) {
  if (trace) print('parse_postfix_unary');
  var op_type = null;
  var new_name = '';
  var index = null;
  if (operand === undefined)
    return parse_postfix_unary(parse_term());
  var t = peek();
  if (consume(TOKEN_INCREMENT)) {
    return parse_postfix_unary({token:t.type,
                                kind:'postfix',
                                operand:operand});
  } else if (consume(TOKEN_DECREMENT)) {
    return parse_postfix_unary({token:t.type,
                                kind:'postfix',
                                operand:operand});
  } else if (consume(TOKEN_PERIOD)) {
    cmd = parse_postfix_unary({token:t.type,
                               kind:'postfix',
                               operand:operand,
                               term:parse_term()});
    return cmd;
  } else if (consume(TOKEN_LBRACKET)) {
    if (next_is(TOKEN_RBRACKET)) {
      op_type = reinterpret_as_type(operand);
      if (op_type == null) {
        throw t.error('Expected datatype.');
      }
      new_name = (op_type.name) ? op_type.name : op_type.value;
      must_consume(TOKEN_RBRACKET, 'Expected ] (Error2).');
      new_name = new_name + '[]';
      while (consume(TOKEN_LBRACKET)) {
        must_consume(TOKEN_RBRACKET, 'Expected ] (Error3).');
        new_name = new_name + '[]';
      }
      return parse_local_var_decl(t,
                                  {token:op_type.token,
                                   name:new_name},
                                  false);
    } else {
      index = parse_expression();
      must_consume(TOKEN_RBRACKET, 'Expected ] (Error4).');
      return parse_postfix_unary({token:t.type,
                                  kind:'postfix',
                                  operand:operand,
                                  expression:index});
    }
  }

  return operand;
};

var parse_construct = function() {
  if (trace) print('parse_construct');
  var t = peek();
  var name = '';
  var type = null;
  var args = null;

  set_mark();
  try {
    type = parse_data_type(true);
    name = type.name;
    clear_mark();
  } catch (e) {
    rewind_to_mark();
    name = must_read_id('Identifier expected.');
  }

  if (name[name.length - 1] != '>') args = parse_args(false);

  if (args == null) return {token:t.type,
                            kind:'construct',
                            name:name};

  return {token:t.type,
          kind:'construct',
          name:name,
          args:args};
};

var parse_args = function(required) {
  if (trace) print('parse_args');
  var t = peek();
  var args = [];

  if (!consume(TOKEN_LPAREN)) {
    if (required) {
      throw t.error('Expected (.');
    }
    return null;
  }

  if (!consume(TOKEN_RPAREN)) {
    do {
      args.push(parse_expression());
    } while(consume(TOKEN_COMMA));
    must_consume(TOKEN_RPAREN, 'Expected ).');
  }

  return args;
}

var parse_literal_array = function(of_type) {
  if (trace) print('parse_literal_array');
  var t = read();
  var first = true;
  var terms = [];
  var element_type_name = '';
  var element_type = null;

  if (!consume(TOKEN_RCURLY)) {
    first = true;
    while (first || consume(TOKEN_COMMA)) {
      first = false;
      if (next_is(TOKEN_LCURLY)) {
        // nexted literal array
        element_type_name = of_type.name.slice(0, -2);

        // This is now a compile time error rather than a parse time
        // error.
        // if (element_type_name.charAt(element_type_name.length - 1) != ']') {
        //   throw t.error('Array type does not support this many dimensions.');
        // }

        element_type = {token:of_type.token,
                        kind:'type',
                        name:element_type_name};
        terms.push(parse_literal_array(element_type));
      } else {
        terms.push(parse_expression());
      }
    }
    must_consume(TOKEN_RCURLY, 'Expected , or }.');
  }

  return {token:t.type,
          kind:'array',
          type:of_type,
          terms:terms};
}

var parse_term = function() {
  if (trace) print('parse_term');
  var p = null;
  var t = null;
  var expr = null;
  var args = null;
  var name = '';

  p = peek();
  if (trace) print_token(p.type);

  switch (p.type) {
  case LITERAL_DOUBLE:
    t = read();
    return {token:t.type,
            kind:'literal',
            value:t.content};
  case LITERAL_FLOAT:
    t = read();
    return {token:t.type,
            kind:'literal',
            value:t.content};
  case LITERAL_INT:
    t = read();
    return {token:t.type,
            kind:'literal',
            value:t.content};
  case LITERAL_LONG:
    t = read();
    return {token:t.type,
            kind:'literal',
            value:t.content};
  case LITERAL_CHAR:
    t = read();
    return {token:t.type,
            kind:'literal',
            value:t.content};
  case LITERAL_STRING:
    t = read();
    return {token:t.type,
            kind:'literal',
            value:t.content};
  // case TOKEN_FALSE:
  //   t = read();
  //   return {token:t.type, value:t.content};
  // case TOKEN_TRUE:
  //   t = read();
  //   return {token:t.type, value:t.content};
  case LITERAL_BOOLEAN:
    t = read();
    return {token:t.type,
            kind:'literal',
            value:t.content};
  case TOKEN_LPAREN:
    read();
    expr = parse_expression();
    must_consume(TOKEN_RPAREN, 'Expected ).');
    return expr;
  case TOKEN_SUPER:
    if (peek(2).type == TOKEN_LPAREN) {
      t = read();
      if (Parser.this_method && !is_constructor(Parser.this_method)) {
        throw t.error('Use "super.methodname" to call superclass method.');
      }
      if (Parser.this_method && Parser.this_method.statements) {
        if(Parser.this_method.statements.length) {
          throw t.error('Call to superclass constructor must be the first statement.');
        }
      }
      args = parse_args(true);
      if (Parser.this_method)
        Parser.this_method.calls_super_constructor = true;
      return {token:t.type,
              kind:'super',
              args:args};
    } else {
      t = read();
      must_consume(TOKEN_PERIOD, 'Expected ".".');
      name = must_read_id('Expected method or property name.');
      args = parse_args(false);
      return {token:t.type,
              kind:'super',
              name:name,
              args:args};
    }
  case TOKEN_CHAR:
  case TOKEN_BYTE:
  case TOKEN_SHORT:
  case TOKEN_INT:
  case TOKEN_LONG:
  case TOKEN_FLOAT:
  case TOKEN_DOUBLE:
  case TOKEN_STRING:
  case TOKEN_BOOLEAN:
  case TOKEN_ID:
    if (trace) print(p.content);
    return parse_construct();
  case TOKEN_NULL:
    t = read();
    return {token:t.type,
            kind:'literal',
            value:t.content};
  }

  // FIXME: this should possibly give an error more like the following
  // test056.java:4: illegal start of expression
  //       i[0] = {1};
  //              ^
  // test056.java:4: not a statement
  //         i[0] = {1};
  //                 ^
  // test056.java:4: ';' expected
  //         i[0] = {1};
  //                  ^
  // test056.java:8: class, interface, or enum expected
  // }
  // ^

  throw p.error('Something really bad!');
};
