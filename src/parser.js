Juliet.AST = function() {
  return {
    'package': null,
    imports: [],
    parsed_types: {}
  };
}();

Juliet.parser = function() {

  /* Privates*/
  var this_method =  null;

  var consume_ws = function() {
  };

  var has_another = function() {
    return (peek().type != Juliet.Juliet.TOKEN_EOF);
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
    if (Juliet.options.trace) print('must_consume ' + Juliet.util.token_str(token_type));
    if (consume(token_type)) return;
    throw new Error(error_message);
  };

  var must_consume_semicolon = function(t) {
    if (Juliet.options.trace) print('must_consume_semicolon');
    if (!consume(Juliet.TOKEN_SEMICOLON)) {
      throw t.error('Syntax error: expected ;.');
      // TODO: complete semicolon handling
    }
  };

  var must_read_id = function(error_message) {
    if (Juliet.options.trace) print('must_read_id');
    var t = peek();
    var result = '';

    if (t.type != Juliet.TOKEN_ID) {
      throw t.error(error_message);
    }

    result = read().content;
    return result;
  };

  var is_class = function(a) {
    return a.qualifiers & Juliet.QUALIFIER_CLASS;
  };

  var is_interface = function(a) {
    return a.qualifiers & Juliet.QUALIFIER_INTERFACE;
  };

  var is_template = function(a) {
    return a.placeholder_types;
  };

  var is_static = function(a) {
    return a.qualifiers & Juliet.QUALIFIER_STATIC;
  };

  var is_abstract = function(a) {
    return a.qualifiers & Juliet.QUALIFIER_ABSTRACT;
  };

  var is_constructor = function(a) {
    return a.qualifiers & Juliet.QUALIFIER_CONSTRUCTOR;
  };

  var reinterpret_as_type = function(a) {
    return a;
  }

  var cmd = function(op, t, lhs, rhs) {
  };

  var push_statement = function(m, stm) {
    if (stm) {
      if (!m.statements) m.statements = [];
      if (stm instanceof Array) m.statements = m.statements.concat(stm);
      else m.statements.push(stm);
    }
  }

  // 7.3
  // CompilationUnit:
  //   PackageDeclaration(opt) ImportDeclarations(opt) TypeDeclarations(opt)
  //
  // ImportDeclarations:
  //   ImportDeclaration
  //   ImportDeclarations ImportDeclaration
  //
  // TypeDeclarations:
  //   TypeDeclaration
  //   TypeDeclarations TypeDeclaration

  var parse_compilation_unit = function(unit) {
    if (Juliet.options.trace) print('parse_compilation_unit');
    var t = peek();

    if (next_is(Juliet.TOKEN_PACKAGE)) {
      Juliet.AST['package'] = parse_package_declaration();
    }
    while (next_is(Juliet.TOKEN_IMPORT)) {
      if (!Juliet.AST.imports) Juliet.AST.imports = [];
      Juliet.AST.imports.push(parse_import_declaration());
    }
    var type = parse_type_declaration();
    while (type) {
      type = parse_type_declaration();
    }
  };

  // 7.4
  // PackageDeclaration:
  //   Annotations(opt) package PackageName ;
  //
  // TODO: Annotations

  var parse_package_declaration = function(){
    if (Juliet.options.trace) print('parse_package_decls');
    var t = read();
    var name = must_read_id('Expected package name.');
    while (consume(Juliet.TOKEN_PERIOD)) {
      name = name + '.' + must_read_id('Expected identifier.');
    }
    must_consume_semicolon(t);
    return {token:t.type,
            kind:'package',
            name:name};
  };

  // 7.5
  // ImportDeclaration:
  //   SingleTypeImportDeclaration
  //   TypeImportOnDemandDeclaration
  //   SingleStaticImportDeclaration
  //   StaticImportOnDemandDeclaration
  //
  // SingleTypeImportDeclaration:
  //   import TypeName ;
  //
  // TypeImportOnDemandDeclaration:
  //   import PackageOrTypeName . * ;
  //
  // SingleStaticImportDeclaration:
  //   import static TypeName . Identifier ;
  //
  // StaticImportOnDemandDeclaration:
  //   import static TypeName . * ;

  var parse_import_declaration = function() {
    if (Juliet.options.trace) print('parse_import_decls');
    var t = read();
    var name = '';
    if (consume(Juliet.TOKEN_STATIC)) name = 'static ';
    name = must_read_id('Expected package or type name.');
    while (consume(Juliet.TOKEN_PERIOD)) {
      name = name + '.';
      if (next_is(Juliet.TOKEN_STAR)) {
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

  // 7.6
  // TypeDeclaration:
  //   ClassDeclaration
  //   InterfaceDeclaration
  //   ;
  //
  // 8.1
  // ClassDeclaration:
  //   NormalClassDeclaration
  //   EnumDeclaration
  //
  // NormalClassDeclaration:
  //   ClassModifiers(opt) class Identifier TypeParameters(opt)
  //     Super(opt) Interfaces(opt) ClassBody
  //
  // TODO: I find this implementation confusing - specifically the recursion.
  // TODO: Enums

  var parse_type_declaration = function() {
    if (Juliet.options.trace) print('parse_type_declaration');
    var quals = null;
    var t = null;
    var mesg = '';
    var name = '';
    var type = null;
    var t2 = null;

    if (arguments.length == 0) {
      quals = parse_type_modifiers();
      t = peek();
      if (consume(Juliet.TOKEN_CLASS)) {
        return parse_type_declaration(t, quals | Juliet.QUALIFIER_CLASS , 'Class name expected.');
      } else if (consume(Juliet.TOKEN_INTERFACE)) {
        if (quals & Juliet.QUALIFIER_FINAL) throw t.error('Interfaces can not be final.');
        return parse_type_declaration(t, quals | Juliet.QUALIFIER_INTERFACE | Juliet.QUALIFIER_ABSTRACT, 'Interface name expected.');
      } else {
        if (quals) throw t.error('Expected class or interface.');
      }

      // TODO: enums

      return null;
    } else if (arguments.length == 3) {
      t = arguments[0];
      quals = arguments[1];
      mesg = arguments[2];

      if ((quals & (Juliet.QUALIFIER_PUBLIC | Juliet.QUALIFIER_PROTECTED | Juliet.QUALIFIER_PRIVATE)) == 0) {
        // default to protected
        quals |= Juliet.QUALIFIER_PROTECTED;
      }

      name = must_read_id(mesg);
      type = {token:t.type,
              kind:'definition',
              qualifiers:quals,
              name:name};

      Juliet.parser._type_names.push(name);
      Juliet.AST.parsed_types[name] = type;

      // parametrized types
      // template type (Jog implements templates instead of generics).
      if (consume(Juliet.TOKEN_LT)) {
        type.placeholder_types = [parse_placeholder_type()];
        while(consume(Juliet.TOKEN_COMMA)) {
          type.placeholder_types.push(parse_placeholder_type());
        }
        must_consume(Juliet.TOKEN_GT, 'Expected >.');

        // Set a mark to ensure that all the tokens are buffered, parse
        // in the class, and collect the buffered tokens to use for
        // implementing the template later on.
        set_mark();

        parse_type_declaration(t, type);

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

      parse_type_declaration(t, type);

      return type;
    } else if (arguments.length == 2) {
      t = arguments[0];
      type = arguments[1];

      if (consume(Juliet.TOKEN_EXTENDS)) type.base_class = parse_data_type(true);

      t2 = peek();
      if (consume(Juliet.TOKEN_IMPLEMENTS)) {
        if (is_interface(type)) throw t.error('Interface cannot implement another.');
        type.interfaces = [parse_data_type(true)];
        while (consume(Juliet.TOKEN_COMMA)) {
          type.interfaces.push(parse_data_type(true));
        }
      }

      // make one empty static initializer for setting up initial class
      // property values
      if (is_class(type) && !is_template(type)) {
        type.static_initializers = [{token:t.type,
                                     kind:'static-initializer',
                                     qualifiers:Juliet.QUALIFIER_STATIC,
                                     // TODO: type_context:type,
                                     return_type:null,
                                     name:'static'}];
      }

      must_consume(Juliet.TOKEN_LCURLY, 'Expected {.');

      while (true) {
        set_mark();
        try {
          result = parse_member(type);
          clear_mark();
          if (!result) break;
        } catch (e) {
          rewind_to_mark();
          try {
            if (!parse_type_declaration()) throw e;
          } catch (e) { throw e; }
        }
      }

      must_consume(Juliet.TOKEN_RCURLY, 'Expected }.');
    }
  }

  var parse_placeholder_type = function() {
    if (Juliet.options.trace) print('parse_placeholder_type');
    var placeholder_type = parse_data_type(true);
    return placeholder_type;
  }

  // 8.1.1
  // ClassModifiers:
  //   ClassModifier
  //   ClassModifiers ClassModifier
  //
  // ClassModifier: one of
  //   Annotation public protected private abstract static final strictfp
  //
  // 9.1.1
  // InterfaceModifiers:
  //   InterfaceModifier
  //   InterfaceModifiers InterfaceModifier
  //
  // InterfaceModifier: one of
  //   Annotation public protected private abstract static strictfp
  //
  // TODO: Annotations
  // Comment: Interface and Class modifiers differ only in the 'final' keyword.
  //   We check that interfaces don't have this keyword in parse_type_declaration() 
  //   after we call this function and after we determine if we are parsing a
  //   class or an interface.

  var parse_type_modifiers = function() {
    if (Juliet.options.trace) print('parse_type_modifiers');
    var quals = 0;
    var t = null;

    while (true) {
      t = peek();

      if (consume(Juliet.TOKEN_ABSTRACT)) {
        quals |= Juliet.QUALIFIER_ABSTRACT;
        if (quals & (Juliet.QUALIFIER_FINAL)) {
          throw t.error('Cannot be abstract if final.');
        }
        continue;
      }

      if (consume(Juliet.TOKEN_PUBLIC)) {
        quals |= Juliet.QUALIFIER_PUBLIC;
        if (quals & (Juliet.QUALIFIER_PROTECTED | Juliet.QUALIFIER_PRIVATE)) {
          throw t.error('Cannot be public if protected or private.');
        }
        continue;
      }

      if (consume(Juliet.TOKEN_PROTECTED)) {
        quals |= Juliet.QUALIFIER_PROTECTED;
        if (quals & (Juliet.QUALIFIER_PUBLIC | Juliet.QUALIFIER_PRIVATE)) {
          throw t.error('Cannot be protected if public or private.');
        }
        continue;
      }

      if (consume(Juliet.TOKEN_PRIVATE)) {
        quals |= Juliet.QUALIFIER_PRIVATE;
        if (quals & (Juliet.QUALIFIER_PUBLIC | Juliet.QUALIFIER_PROTECTED)) {
          throw t.error('Cannot be private if public or protected.');
        }
        continue;
      }

      if (consume(Juliet.TOKEN_FINAL)) {
        quals |= Juliet.QUALIFIER_FINAL;
        if (quals & (Juliet.QUALIFIER_ABSTRACT)) {
          throw t.error('Cannot be final if abstract.');
        }
        continue;
      }

      if (consume(Juliet.TOKEN_STRICTFP)) {
        quals |= Juliet.QUALIFIER_STRICTFP;
        continue;
      }

      return quals;
    }
  }

  // 8.3.1
  // FieldModifiers:
  //   FieldModifier
  //   FieldModifiers FieldModifier
  //
  // FieldModifier: one of
  //   Annotation public protected private static final transient volatile
  //
  // 8.4.3
  // MethodModifiers:
  //   MethodModifier
  //   MethodModifiers MethodModifier
  //
  // MethodModifier: one of
  //   Annotation public protected private abstract static final synchronized native strictfp
  //
  // Comment: Methods (but not fields) can be abstract, synchronized, native or strictp.
  //   Fields (but not methods) can be transient or volatile.  We check these in parse_member().

  var parse_member_qualifiers = function() {
    if (Juliet.options.trace) print('parse_member_qualifiers');
    var quals = 0;
    var t = null;

    while(true) {
      t = peek();

      if (consume(Juliet.TOKEN_ABSTRACT)) {
        quals |= Juliet.QUALIFIER_ABSTRACT;
        continue;
      }

      if (consume(Juliet.TOKEN_PUBLIC)) {
        quals |= Juliet.QUALIFIER_PUBLIC;
        if (quals & (Juliet.QUALIFIER_PROTECTED | Juliet.QUALIFIER_PRIVATE)) {
          throw t.error('Cannot be public if protected or private.');
        }
        continue;
      }

      if (consume(Juliet.TOKEN_PROTECTED)) {
        quals |= Juliet.QUALIFIER_PROTECTED;
        if (quals & (Juliet.QUALIFIER_PUBLIC | Juliet.QUALIFIER_PRIVATE)) {
          throw t.error('Cannot be protected if public or private.');
        }
        continue;
      }

      if (consume(Juliet.TOKEN_PRIVATE)) {
        quals |= Juliet.QUALIFIER_PRIVATE;
        if (quals & (Juliet.QUALIFIER_PUBLIC | Juliet.QUALIFIER_PROTECTED)) {
          throw t.error('Cannot be private if public or protected.');
        }
        continue;
      }

      if (consume(Juliet.TOKEN_STATIC)) {
        quals |= Juliet.QUALIFIER_STATIC;
        continue;
      }

      if (consume(Juliet.TOKEN_FINAL)) {
        quals |= Juliet.QUALIFIER_FINAL;
        continue;
      }

      if (consume(Juliet.TOKEN_TRANSIENT)) {
        quals |= Juliet.QUALIFIER_TRANSIENT;
        continue;
      }

      if (consume(Juliet.TOKEN_VOLATILE)) {
        quals |= Juliet.QUALIFIER_VOLATILE;
        continue;
      }

      if (consume(Juliet.TOKEN_SYNCHRONIZED)) {
        quals |= Juliet.QUALIFIER_SYNCRONIZED;
        continue;
      }

      if (consume(Juliet.TOKEN_NATIVE)) {
        quals |= Juliet.QUALIFIER_NATIVE;
        continue;
      }

      if (consume(Juliet.TOKEN_STRICTFP)) {
        quals |= Juliet.QUALIFIER_STRICTFP;
        continue;
      }

      return quals;
    }
  }

  // 8.1.6
  // ClassMemberDeclaration:
  //   FieldDeclaration
  //   MethodDeclaration
  //   ClassDeclaration
  //   InterfaceDeclaration
  //   ;
  //
  // 8.3
  // FieldDeclaration
  //
  // 8.4
  // MethodDeclaration

  var parse_member = function(type) {
    if (Juliet.options.trace) print('parse_member');
    if (next_is(Juliet.TOKEN_RCURLY)) return false;

    var t = peek();
    var quals = parse_member_qualifiers();
    var t2 = peek();
    var m = null;
    var stm = null;
    var name_t = null;
    var name = '';
    var first = true;

    // static initializer
    if (quals == Juliet.QUALIFIER_STATIC && next_is(Juliet.TOKEN_LCURLY)) {
      if (Juliet.options.trace) print('static initiaizer');
      if (is_interface(type)) {
        throw t.error('Static initialization block not allowed here.');
      }

      m = {token:t.type,
           kind:'static-initializer',
           qualifiers:quals,
           //type:type,
           return_type:null,
           name:'static'};
      this_method = m;
      if (!type.static_initializers) type.static_initializers = [];
      type.static_initializers.push(m);

      read();
      while (!next_is(Juliet.TOKEN_RCURLY)) {
        stm = parse_statement(true);
        push_statement(m, stm);
      }
      must_consume(Juliet.TOKEN_RCURLY, 'Expected }');
      if (next_is(Juliet.TOKEN_SEMICOLON)) read();
      return true;
    }

    // instance initializer
    if (quals == 0 && next_is(Juliet.TOKEN_LCURLY)) {
      if (Juliet.options.trace) print('instance initializer');
      if (is_interface(type)) {
        throw t.error('Instance initialization block not allowed here.');
      }

      m = {token:t.type,
           kind:'instance-initializer',
           qualifiers:quals,
           //type:type,
           return_type:null,
           name:'instance'};
      this_method = m;
      if (!type.instance_initializers) type.instance_initializers = [];
      type.instance_initializers.push(m);

      read();
      while (!next_is(Juliet.TOKEN_RCURLY)) {
        stm = parse_statement(true);
        push_statement(m, stm);
      }
      must_consume(Juliet.TOKEN_RCURLY, 'Expected }');
      if (next_is(Juliet.TOKEN_SEMICOLON)) read();
      return true;
    }

    data_type = parse_data_type(true);

    // constructor
    if (next_is(Juliet.TOKEN_LPAREN)) {
      if (Juliet.options.trace) print('constructor');
      if (data_type.name == type.name) {
        if (quals & Juliet.QUALIFIER_STATIC) {
          throw t.error('Constructor cannot be static.');
        }
        if (is_interface(type)) {
          throw t.error('Constructor not allowed here.');
        }

        quals |= Juliet.QUALIFIER_CONSTRUCTOR;
        m = {token:t.type,
             kind:'constructor',
             qualifiers:quals,
             //type:type, // TODO:
             return_type: null,
             name:'<init>'};
        this_method = m;
        parse_params(m);
        if (!type.methods) type.methods = [];
        type.methods.push(m);

        must_consume(Juliet.TOKEN_LCURLY, 'Expected {.');
        while (!next_is(Juliet.TOKEN_RCURLY)) {
          stm = parse_statement(true);
          push_statement(m, stm);
        }
        must_consume(Juliet.TOKEN_RCURLY, 'Expected }.');

        return true;
      } else {
        throw t.error('Method missing return type.');
      }
    }

    name_t = peek();
    name = must_read_id('Expected identifier after type.');

    // Method
    if (next_is(Juliet.TOKEN_LPAREN)) {
      if (Juliet.options.trace) print('method');
      if (name == type.name) {
        throw t.error('Constructors cannot specify a return type.');
      }

      if (quals & Juliet.QUALIFIER_TRANSIENT) {
        throw t.error('Methods cannot be transient.');
      }

      if (quals & Juliet.QUALIFIER_VOLATILE) {
        throw t.error('Methods cannot be volatile.');
      }

      if (is_interface(type)) quals |= Juliet.QUALIFIER_ABSTRACT;

      m = {token:t.type,
           kind:'method',
           qualifiers:quals,
           // TODO: type:type,
           return_type:data_type,
           name:name};

      if (is_interface(type) && is_static(m)) {
        throw t.error('Interface method cannot be static.');
      }

      this_method = m;
      parse_params(m);

      if (is_static(m)) {
        if (!type.class_methods) type.class_methods = [];
        type.class_methods.push(m);
      } else {
        if (!type.methods) type.methods = [];
        type.methods.push(m);
      }

      if (quals & Juliet.QUALIFIER_NATIVE) {
        if (is_interface(m)) {
          throw t.error('Interface method cannot be native.');
        }

        // literal javascript
        if (next_is(Juliet.LITERAL_JAVASCRIPT)) {
          var t2 = read();
          m.statements = {
            token:t2.type,
            kind:'literal',
            value:t2.content};
        } else {
          must_consume(Juliet.TOKEN_SEMICOLON, 'Expected ;.');
        }

      } else if (consume(Juliet.TOKEN_SEMICOLON)) {
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

        must_consume(Juliet.TOKEN_LCURLY, 'Expected {.');
        while (!next_is(Juliet.TOKEN_RCURLY)) {
          stm = parse_statement(true);
          push_statement(m, stm);
        }
        must_consume(Juliet.TOKEN_RCURLY, 'Expected }.');
      }
    } else {
      // property
      if (Juliet.options.trace) print('property');

      if (data_type == null) {
        throw t.error('void cannot be use as property type.');
      }
      if (quals & Juliet.QUALIFIER_ABSTRACT) {
        throw t.error('Fields cannot be abstract.');
      }
      if (quals & Juliet.QUALIFIER_SYNCHRONIZED) {
        throw t.error('Fields cannot be synchronized.');
      }
      if (quals & Juliet.QUALIFIER_STRICTP) {
        throw t.error('Fields cannot be strictp.');
      }
      if (quals & Juliet.QUALIFIER_NATIVE) {
        throw t.error('Fields cannot be native.');
      }

      if (is_interface(type)) {
        // TODO: interfaces can in fact have field declarations, however
        // *every* field declaration in the body of an interface is
        // implicitly public, static, and final. As such, each field in
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
      } while (consume(Juliet.TOKEN_COMMA));

      must_consume_semicolon(t);
    }

    return true;
  };

  // 8.4.1
  // FormalParameterList:
  //   LastFormalParameter
  //   FormalParameters , LastFormalParameter
  //
  // FormalParameters:
  //   FormalParameter
  //   FormalParameters , FormalParameter
  //
  // FormalParameter:
  //   VariableModifiers(opt) Type VariableDeclaratorId
  //
  // VariableModifiers:
  //   VariableModifier
  //   VariableModifiers VariableModifier
  //
  // VariableModifier: one of
  //   Annotation final
  //
  // LastFormalParameter:
  //   VariableModifiers(opt) Type... VariableDeclaratorId
  //   FormalParameter
  //
  // TODO: Annotations, final, variadic arguments

  var parse_params = function(m) {
    if (Juliet.options.trace) print('parse_params');
    var t = null;
    var type = null;
    var name = '';

    must_consume(Juliet.TOKEN_LPAREN, 'Expected (.');

    if (!consume(Juliet.TOKEN_RPAREN)) {
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
      } while (consume(Juliet.TOKEN_COMMA));
      must_consume(Juliet.TOKEN_RPAREN, 'Expected ).');
    }
  };

  // 4.1
  // Type
  //   PrimitiveType
  //   ReferenceType
  //
  // 4.2
  // PrimitiveType: one of
  //   byte short int long char float double boolean
  //
  // 4.3
  // ReferenceType:
  //   TypeDeclSpecifier TypeArguments(opt)  // classes/interfaces
  //   Type [ ]  // arrays
  //   Identifier
  //
  // TypeDeclSpecifier:
  //   TypeName  
  //   ClassOrInterfaceType . Identifier
  //
  // TypeName:
  //   Identifier
  //   TypeName . Identifier
  //
  // 4.5.1
  // TypeArguments:
  //   < TypeArgumentList >
  //
  // TypeArgumentList: 
  //   TypeArgument
  //   TypeArgumentList , TypeArgument
  //
  // TypeArgument:
  //   ReferenceType
  //   Wildcard
  //
  // Wildcard:
  // ? WildcardBounds(opt)
  //
  // WildcardBounds:
  //   extends ReferenceType
  //   super ReferenceType

  var generic_depth = [];
  var parse_data_type = function(parse_brackets, parse_wildcards) {
    if (Juliet.options.trace) print('parse_data_type');
    var t = peek();
    var name = '';

    // primitive
    if (consume([Juliet.TOKEN_CHAR, Juliet.TOKEN_BYTE, Juliet.TOKEN_SHORT, Juliet.TOKEN_INT, Juliet.TOKEN_LONG, Juliet.TOKEN_FLOAT, Juliet.TOKEN_DOUBLE, Juliet.TOKEN_STRING, Juliet.TOKEN_BOOLEAN])) {
      name = t.content;
    }

    // identifier
    if (!name) {
      try {
        name = must_read_id('Expected type.');
      } catch (e) {
        if (!parse_wildcards) throw e;
        must_consume(Juliet.TOKEN_QUESTIONMARK, 'Expected ?.');
        name = name + '?';
        if (consume(Juliet.TOKEN_EXTENDS)) {
          name = name + ' extends ';
          name = name + must_read_id('Expected type.');
        } else if (consume(Juliet.TOKEN_SUPER)) {
          name = name + ' super ';
          name = name + must_read_id('Expected type.');
        }
      }
    }

    // templates for generics
    if (consume(Juliet.TOKEN_LT)) {
      generic_depth.push(Juliet.TOKEN_LT);

      name = name + '<';
      var subst_type = parse_data_type(true, true);
      name = name + subst_type.name;

      while (consume(Juliet.TOKEN_COMMA)) {
        name = name + ',';
        subst_type = parse_data_type(true, true);
        name = name + subst_type.name;
      }

      if (generic_depth.length > 0) {
        try {
          must_consume(Juliet.TOKEN_GT, 'Expected >.');
          if (generic_depth.pop() != Juliet.TOKEN_LT)
            throw t.error('Syntax error.');
          name = name + '>';
        } catch (e) {
          try {
            must_consume(Juliet.TOKEN_SHR, 'Expected >>.');
            if (generic_depth.pop() != Juliet.TOKEN_LT)
              throw t.error('Syntax error.');
            if (generic_depth.pop() != Juliet.TOKEN_LT)
              throw t.error('Syntax error.');
            name = name + '>>';
          } catch (e) {
            try {
              must_consume(Juliet.TOKEN_SHRX, 'Expected >>>.');
              if (generic_depth.pop() != Juliet.TOKEN_LT)
                throw t.error('Syntax error.');
              if (generic_depth.pop() != Juliet.TOKEN_LT)
                throw t.error('Syntax error.');
              if (generic_depth.pop() != Juliet.TOKEN_LT)
                throw t.error('Syntax error.');
              name = name + '>>>';
            } catch (e) { throw e; }
          }
        }
      }
    }

    // subscript
    if (parse_brackets) {
      while (consume(Juliet.TOKEN_LBRACKET)) {
        name = name + '[]';
        must_consume(Juliet.TOKEN_RBRACKET, 'Expected ] (Error#).');
      }
    }

    // TODO: add type to type table
    return {token:t.type,
            kind:'type',
            name:name};
  };

  var parse_initial_value = function(of_type) {
    if (Juliet.options.trace) print('parse_initial_value');
    if (consume(Juliet.TOKEN_ASSIGN)) {
      if (next_is(Juliet.TOKEN_LCURLY)) {
        return parse_literal_array(of_type);
      } else {
        return parse_expression();
      }
    } else {
      return null;
    }
  };

  var parse_statement = function(require_semicolon) {
    if (Juliet.options.trace) print('parse_statement');
    if (require_semicolon && consume(Juliet.TOKEN_SEMICOLON)) return null;
    else if (next_is(Juliet.TOKEN_RPAREN)) return null;

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

    if (consume(Juliet.TOKEN_LCURLY)) {
      while (!consume(Juliet.TOKEN_RCURLY)) {
        stm = parse_statement(true);
        if (stm) {
          block.push(stm);
        }
      }
      return {kind:'block', statements:block};
    }

    if (consume(Juliet.TOKEN_RETURN)) {
      if (consume(Juliet.TOKEN_SEMICOLON)) {
        if (this_method && this_method.return_type) {
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

    if (consume(Juliet.TOKEN_THROW)) {
      if (consume(Juliet.TOKEN_SEMICOLON)) {
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

    if (consume(Juliet.TOKEN_IF)) {
      must_consume(Juliet.TOKEN_LPAREN, 'Expected (.');
      conditional = {token:t.type,
                     kind:'if',
                     expression:parse_expression()};
      must_consume(Juliet.TOKEN_RPAREN, 'Expected ).');

      if (next_is(Juliet.TOKEN_SEMICOLON)) {
        throw t.error('Unexpected ;.');
      }

      conditional.body = parse_statement(true);
      if (consume(Juliet.TOKEN_ELSE)) {
        if (next_is(Juliet.TOKEN_SEMICOLON)) {
          throw t.error('Unexpected ;.');
        }
        conditional.else_body = parse_statement(true);
      }
      return conditional;
    }

    // TODO: Juliet.TOKEN_DO

    if (consume(Juliet.TOKEN_WHILE)) {
      must_consume(Juliet.TOKEN_LPAREN, 'Expected (.');
      loop = {token:t.type,
              kind:'while',
              expression:parse_expression()};
      must_consume(Juliet.TOKEN_RPAREN, 'Expected ).');
      if (next_is(Juliet.TOKEN_SEMICOLON)) {
        throw t.error('Unexpected ;.');
      }
      loop.body = parse_statement(true);
      return loop;
    }

    if (consume(Juliet.TOKEN_FOR)) {
      must_consume(Juliet.TOKEN_LPAREN, 'Expected (.');

      set_mark();
      init_expr = parse_statement(false);
      if (next_is(Juliet.TOKEN_COLON)) {
        rewind_to_mark();
        local_type = parse_data_type(true);
        local_name = must_read_id('Expected identifier.');

        must_consume(Juliet.TOKEN_COLON, 'Expected :.');
        iterable_expr = parse_expression();
        must_consume(Juliet.TOKEN_RPAREN, 'Expected ).');

        loop = {token:t.type,
                kind:'for-each',
                type:local_type,
                name:local_name,
                iterable:iterable_expr};
        if (next_is(Juliet.TOKEN_SEMICOLON)) {
          throw t.error('Unexpected ;.');
        }
        loop.body = parse_statement(true);
        return loop;
      } else {
        clear_mark();
        must_consume(Juliet.TOKEN_SEMICOLON,  'Expected ;.');
      }

      if (consume(Juliet.TOKEN_SEMICOLON)) {
        condition = {token:t.type,
                     kind:'conditional',
                     expression:true};
      } else {
        condition = parse_expression();
        must_consume(Juliet.TOKEN_SEMICOLON, 'Expected ;.');
      }
      var_mod = parse_statement(false);
      must_consume(Juliet.TOKEN_RPAREN, 'Expected ).');
      loop = {token:t.type,
              kind:'for',
              initialization:init_expr,
              condition:condition,
              var_mod:var_mod};
      if (next_is(Juliet.TOKEN_SEMICOLON)) {
        throw t.error('Unexpected ;.');
      }
      loop.body = parse_statement(true);
      return loop;
    }

    if (consume(Juliet.TOKEN_BREAK)) {
      cmd = {token:t.type,
             kind:'abrupt'};
      // TODO: [Identifier]
      if (require_semicolon) must_consume_semicolon(t);
      return cmd;
    }

    if (consume(Juliet.TOKEN_CONTINUE)) {
      cmd = {token:t.type,
             kind:'abrupt'};
      // TODO: [Identifier]
      if (require_semicolon) must_consume_semicolon(t);
      return cmd;
    }

    if (consume(Juliet.TOKEN_ASSERT)) {
      must_consume(Juliet.TOKEN_LPAREN, 'Expected (.');
      cmd = {token:t.type,
             kind:'assert',
             expression:parse_expression()};
      if (consume(Juliet.TOKEN_COMMA)) {
        if (peek().type != Juliet.LITERAL_STRING) {
          throw t.error('Expected string literal.');
        }
        cmd.message = read().content;
      }
      must_consume(Juliet.TOKEN_RPAREN, 'Expected ).');
      return cmd;
    }

    // TODO: try
    // TODO: switch
    // TODO: synchronized
    // TODO: empty statement ';'
    // TODO: labled statements

    expr = parse_expression();
    if (next_is(Juliet.TOKEN_ID)) {
      var var_type = reinterpret_as_type(expr);
      return parse_local_var_decl(expr.token, var_type, require_semicolon);
    }

    if (require_semicolon) must_consume_semicolon(t);

    return expr; // TODO: discarding_result
  };

  var parse_local_var_decl = function(t, var_type, req_semi) {
    if (Juliet.options.trace) print('parse_local_var_decl');
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
    } while (consume(Juliet.TOKEN_COMMA));

    if (req_semi) must_consume_semicolon(t);

    return locals;
  };

  var parse_expression = function() {
    if (Juliet.options.trace) print('parse_expression');
    var cmd = parse_assignment();
    return cmd;
  };

  var parse_assignment = function() {
    if (Juliet.options.trace) print('parse_assignment');
    var expr = parse_conditional();
    var t = peek();
    if (consume(Juliet.TOKEN_ASSIGN)) {
      expr = {token:t.type,
              kind:'assignment',
              location:expr,
              new_value:parse_assignment()};
    } else if (consume(Juliet.TOKEN_ADD_ASSIGN)) {
      expr = {token:t.type,
              kind:'assignment',
              location:expr,
              new_value:parse_assignment()};
    } else if (consume(Juliet.TOKEN_SUB_ASSIGN)) {
      expr = {token:t.type,
              kind:'assignment',
              location:expr,
              new_value:parse_assignment()};
    } else if (consume(Juliet.TOKEN_MUL_ASSIGN)) {
      expr = {token:t.type,
              kind:'assignment',
              location:expr,
              new_value:parse_assignment()};
    } else if (consume(Juliet.TOKEN_DIV_ASSIGN)) {
      expr = {token:t.type,
              kind:'assignment',
              location:expr,
              new_value:parse_assignment()};
    } else if (consume(Juliet.TOKEN_MOD_ASSIGN)) {
      expr = {token:t.type,
              kind:'assignment',
              location:expr,
              new_value:parse_assignment()};
    } else if (consume(Juliet.TOKEN_AND_ASSIGN)) {
      expr = {token:t.type,
              kind:'assignment',
              location:expr,
              new_value:parse_assignment()};
    } else if (consume(Juliet.TOKEN_OR_ASSIGN)) {
      expr = {token:t.type,
              kind:'assignment',
              location:expr,
              new_value:parse_assignment()};
    } else if (consume(Juliet.TOKEN_XOR_ASSIGN)) {
      expr = {token:t.type,
              kind:'assignment',
              location:expr,
              new_value:parse_assignment()};
    } else if (consume(Juliet.TOKEN_SHL_ASSIGN)) {
      expr = {token:t.type,
              kind:'assignment',
              location:expr,
              new_value:parse_assignment()};
    } else if (consume(Juliet.TOKEN_SHRX_ASSIGN)) {
      expr = {token:t.type,
              kind:'assignment',
              location:expr,
              new_value:parse_assignment()};
    } else if (consume(Juliet.TOKEN_SHR_ASSIGN)) {
      expr = {token:t.type,
              kind:'assignment',
              location:expr,
              new_value:parse_assignment()};
    }
    return expr;
  };

  var parse_conditional = function() {
    if (Juliet.options.trace) print('parse_conditional');
    var expr = parse_logical_or();
    var t = peek();
    var true_value = null;
    var false_value = null;
    if (consume(Juliet.TOKEN_QUESTIONMARK)) {
      true_value = parse_conditional();
      must_consume(Juliet.TOKEN_COLON, 'Expected :.');
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
    if (Juliet.options.trace) print('parse_logical_or');
    var t = null;
    if (lhs === undefined) {
      return parse_logical_or(parse_logical_and());
    } else {
      t = peek();
      if (consume(Juliet.TOKEN_LOGICAL_OR)) {
        return parse_logical_or({token:t.type,
                                 kind:'binary',
                                 lhs:lhs,
                                 rhs:parse_logical_and()});
      }
      return lhs;
    }
  }

  var parse_logical_and = function(lhs) {
    if (Juliet.options.trace) print('parse_logical_and');
    var t = null;
    if (lhs === undefined) {
      return parse_logical_and(parse_bitwise_or());
    } else {
      t = peek();
      if (consume(Juliet.TOKEN_LOGICAL_AND)) {
        return parse_logical_and({token:t.type,
                                  kind:'binary',
                                  lhs:lhs,
                                  rhs:parse_bitwise_or()});
      }
      return lhs;
    }
  }

  var parse_bitwise_or = function(lhs) {
    if (Juliet.options.trace) print('parse_bitwise_or');
    var t = null;
    if (lhs === undefined) {
      return parse_bitwise_or(parse_bitwise_xor());
    } else {
      t = peek();
      if (consume(Juliet.TOKEN_PIPE)) {
        return parse_bitwise_or({token:t.type,
                                 kind:'binary',
                                 lhs:lhs,
                                 rhs:parse_bitwise_xor()});
      }
      return lhs;
    }
  }

  var parse_bitwise_xor = function(lhs) {
    if (Juliet.options.trace) print('parse_bitwise_xor');
    var t = null;
    if (lhs === undefined) {
      return parse_bitwise_xor(parse_bitwise_and());
    } else {
      t = peek();
      if (consume(Juliet.TOKEN_CARET)) {
        return parse_bitwise_xor({token:t.type,
                                  kind:'binary',
                                  lhs:lhs,
                                  rhs:parse_bitwise_and()});
      }
      return lhs;
    }
  }

  var parse_bitwise_and = function(lhs) {
    if (Juliet.options.trace) print('parse_bitwise_and');
    var t = null;
    if (lhs === undefined) {
      return parse_bitwise_and(parse_equality());
    } else {
      t = peek();
      if (consume(Juliet.TOKEN_AMPERSAND)) {
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
    if (Juliet.options.trace) print('parse_shift');
    if (lhs === undefined) return parse_shift(parse_translate());
    var t = peek();
    if (consume(Juliet.TOKEN_SHL))
      return parse_shift({token:t.type,
                          kind:'binary',
                          lhs:lhs,
                          rhs:parse_translate()});
    if (consume(Juliet.TOKEN_SHR))
      return parse_shift({token:t.type,
                          kind:'binary',
                          lhs:lhs,
                          rhs:parse_translate()});
    if (consume(Juliet.TOKEN_SHRX))
      return parse_shift({token:t.type,
                          kind:'binary',
                          lhs:lhs,
                          rhs:parse_translate()});
    return lhs;
  };

  // <, <=, >, >=, instanceof
  var parse_relational = function(lhs) {
    if (Juliet.options.trace) print('parse_relational');
    if (lhs === undefined)
      return parse_relational(parse_shift());
    var t = peek();
    if (consume(Juliet.TOKEN_LT))
      return parse_relational({token:t.type,
                               kind:'binary',
                               lhs:lhs,
                               rhs:parse_shift()});
    if (consume(Juliet.TOKEN_LE))
      return parse_relational({token:t.type,
                               kind:'binary',
                               lhs:lhs,
                               rhs:parse_shift()});
    if (consume(Juliet.TOKEN_GT))
      return parse_relational({token:t.type,
                               kind:'binary',
                               lhs:lhs,
                               rhs:parse_shift()});
    if (consume(Juliet.TOKEN_GE))
      return parse_relational({token:t.type,
                               kind:'binary',
                               lhs:lhs,
                               rhs:parse_shift()});
    if (consume(Juliet.TOKEN_INSTANCEOF))
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
    if (consume(Juliet.TOKEN_EQ))
      return parse_equality({token:t.type,
                             kind:'binary',
                             lhs:lhs,
                             rhs:parse_relational()});
    if (consume(Juliet.TOKEN_NE))
      return parse_equality({token:t.type,
                             kind:'binary',
                             lhs:lhs,
                             rhs:parse_relational()});
    return lhs;
  };


  // +, -
  var parse_translate = function(lhs) {
    if (Juliet.options.trace) print('parse_translate');
    if (lhs === undefined)
      return parse_translate(parse_scale());
    var t = peek();
    if (consume(Juliet.TOKEN_PLUS))
      return parse_translate({token:t.type,
                              kind:'binary',
                              lhs:lhs,
                              rhs:parse_scale()});
    if (consume(Juliet.TOKEN_MINUS))
      return parse_translate({token:t.type,
                              kind:'binary',
                              lhs:lhs,
                              rhs:parse_scale()});
    return lhs;
  };


  // *, /
  var parse_scale = function(lhs) {
    if (Juliet.options.trace) print('parse_scale');
    if (lhs === undefined)
      return parse_scale(parse_prefix_unary());
    var t = peek();
    if (consume(Juliet.TOKEN_STAR))
      return parse_scale({token:t.type,
                          kind:'binary',
                          lhs:lhs,
                          rhs:parse_prefix_unary()});
    if (consume(Juliet.TOKEN_SLASH))
      return parse_scale({token:t.type,
                          kind:'binary',
                          lhs:lhs,
                          rhs:parse_prefix_unary()});
    if (consume(Juliet.TOKEN_PERCENT))
      return parse_scale({token:t.type,
                          kind:'binary',
                          lhs:lhs,
                          rhs:parse_prefix_unary()});
    return lhs;
  };

  // (cast), new, ++, --, +, -, !, ~
  var parse_prefix_unary = function() {
    if (Juliet.options.trace) print('parse_prefix_unary');
    var t = peek();
    var to_type = null;
    var result = null;
    var of_type = null;
    var args = null;
    if (next_is(Juliet.TOKEN_LPAREN)) {
      // MIGHT have a cast
      set_mark();
      read();
      if (next_is([Juliet.TOKEN_ID, Juliet.TOKEN_CHAR, Juliet.TOKEN_BYTE, Juliet.TOKEN_SHORT, Juliet.TOKEN_INT, Juliet.TOKEN_LONG, Juliet.TOKEN_FLOAT, Juliet.TOKEN_DOUBLE, Juliet.TOKEN_STRING, Juliet.TOKEN_BOOLEAN])) {
        // Casts are ambiguous syntax - assume this is indeed a cast and
        // just try it.
        try {
          to_type = parse_data_type(true);
          must_consume(Juliet.TOKEN_RPAREN, 'Expected ).');
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
    if (consume(Juliet.TOKEN_NEW)) {
      of_type = parse_data_type(false);
      if (next_is(Juliet.TOKEN_LBRACKET)) {
        return parse_array_decl(t, of_type);
      } else {
        args = parse_args(true);
        return {token:t.type,
                kind:'new',
                type:of_type,
                args:args};
      }
    }
    if (consume(Juliet.TOKEN_INCREMENT))
      return {token:t.type,
              kind:'prefix',
              operand:parse_prefix_unary()};
    if (consume(Juliet.TOKEN_DECREMENT))
      return {token:t.type,
              kind:'prefix',
              operand:parse_prefix_unary()};
    // discard '+a' and just keep 'a'.
    if (consume(Juliet.TOKEN_PLUS))
      return parse_prefix_unary();
    if (consume(Juliet.TOKEN_MINUS))
      return {token:t.type,
              kind:'prefix',
              operand:parse_prefix_unary()};
    if (consume(Juliet.TOKEN_BANG))
      return {token:t.type,
              kind:'prefix',
              operand:parse_prefix_unary()};
    if (consume(Juliet.TOKEN_TILDE))
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
    while (consume(Juliet.TOKEN_LBRACKET)) {
      if (consume(Juliet.TOKEN_RBRACKET)) {
        saw_empty = true;
        dim_expr.push(null);
      } else {
        if (saw_empty) {
          throw t.error('Must provide proceeding dimension.');
        }
        dim_specified = true;
        dim_expr.push(parse_expression());
        must_consume(Juliet.TOKEN_RBRACKET, 'Expected ].');
      }
    }

    base_name = array_type.name;
    array_type = {token:array_type.token,
                  kind:'type',
                  name:base_name,
                  length:dim_expr.length};

    if (!dim_specified) {
      if (!next_is(Juliet.TOKEN_LCURLY)) {
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
    if (Juliet.options.trace) print('parse_postfix_unary');
    var op_type = null;
    var new_name = '';
    var index = null;
    if (operand === undefined)
      return parse_postfix_unary(parse_term());
    var t = peek();
    if (consume(Juliet.TOKEN_INCREMENT)) {
      return parse_postfix_unary({token:t.type,
                                  kind:'postfix',
                                  operand:operand});
    } else if (consume(Juliet.TOKEN_DECREMENT)) {
      return parse_postfix_unary({token:t.type,
                                  kind:'postfix',
                                  operand:operand});
    } else if (consume(Juliet.TOKEN_PERIOD)) {
      cmd = parse_postfix_unary({token:t.type,
                                 kind:'postfix',
                                 operand:operand,
                                 term:parse_term()});
      return cmd;
    } else if (consume(Juliet.TOKEN_LBRACKET)) {
      if (next_is(Juliet.TOKEN_RBRACKET)) {
        op_type = reinterpret_as_type(operand);
        if (op_type == null) {
          throw t.error('Expected datatype.');
        }
        new_name = (op_type.name) ? op_type.name : op_type.value;
        must_consume(Juliet.TOKEN_RBRACKET, 'Expected ] (Error2).');
        new_name = new_name + '[]';
        while (consume(Juliet.TOKEN_LBRACKET)) {
          must_consume(Juliet.TOKEN_RBRACKET, 'Expected ] (Error3).');
          new_name = new_name + '[]';
        }
        return parse_local_var_decl(t,
                                    {token:op_type.token,
                                     name:new_name},
                                    false);
      } else {
        index = parse_expression();
        must_consume(Juliet.TOKEN_RBRACKET, 'Expected ] (Error4).');
        return parse_postfix_unary({token:t.type,
                                    kind:'postfix',
                                    operand:operand,
                                    expression:index});
      }
    }

    return operand;
  };

  var parse_construct = function() {
    if (Juliet.options.trace) print('parse_construct');
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
    if (Juliet.options.trace) print('parse_args');
    var t = peek();
    var args = [];

    if (!consume(Juliet.TOKEN_LPAREN)) {
      if (required) {
        throw t.error('Expected (.');
      }
      return null;
    }

    if (!consume(Juliet.TOKEN_RPAREN)) {
      do {
        args.push(parse_expression());
      } while(consume(Juliet.TOKEN_COMMA));
      must_consume(Juliet.TOKEN_RPAREN, 'Expected ).');
    }

    return args;
  }

  var parse_literal_array = function(of_type) {
    if (Juliet.options.trace) print('parse_literal_array');
    var t = read();
    var first = true;
    var terms = [];
    var element_type_name = '';
    var element_type = null;

    if (!consume(Juliet.TOKEN_RCURLY)) {
      first = true;
      while (first || consume(Juliet.TOKEN_COMMA)) {
        first = false;
        if (next_is(Juliet.TOKEN_LCURLY)) {
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
      must_consume(Juliet.TOKEN_RCURLY, 'Expected , or }.');
    }

    return {token:t.type,
            kind:'array',
            type:of_type,
            terms:terms};
  }

  var parse_term = function() {
    if (Juliet.options.trace) print('parse_term');
    var p = null;
    var t = null;
    var expr = null;
    var args = null;
    var name = '';

    p = peek();
    if (Juliet.options.trace) Juliet.util.print_token(p.type);

    switch (p.type) {
    case Juliet.LITERAL_DOUBLE:
      t = read();
      return {token:t.type,
              kind:'literal',
              value:t.content};
    case Juliet.LITERAL_FLOAT:
      t = read();
      return {token:t.type,
              kind:'literal',
              value:t.content};
    case Juliet.LITERAL_INT:
      t = read();
      return {token:t.type,
              kind:'literal',
              value:t.content};
    case Juliet.LITERAL_LONG:
      t = read();
      return {token:t.type,
              kind:'literal',
              value:t.content};
    case Juliet.LITERAL_CHAR:
      t = read();
      return {token:t.type,
              kind:'literal',
              value:t.content};
    case Juliet.LITERAL_STRING:
      t = read();
      return {token:t.type,
              kind:'literal',
              value:t.content};
      // case Juliet.TOKEN_FALSE:
      //   t = read();
      //   return {token:t.type, value:t.content};
      // case Juliet.TOKEN_TRUE:
      //   t = read();
      //   return {token:t.type, value:t.content};
    case Juliet.LITERAL_BOOLEAN:
      t = read();
      return {token:t.type,
              kind:'literal',
              value:t.content};
    case Juliet.TOKEN_LPAREN:
      read();
      expr = parse_expression();
      must_consume(Juliet.TOKEN_RPAREN, 'Expected ).');
      return expr;
    case Juliet.TOKEN_SUPER:
      if (peek(2).type == Juliet.TOKEN_LPAREN) {
        t = read();
        if (this_method && !is_constructor(this_method)) {
          throw t.error('Use "super.methodname" to call superclass method.');
        }
        if (this_method && this_method.statements) {
          if(this_method.statements.length) {
            throw t.error('Call to superclass constructor must be the first statement.');
          }
        }
        args = parse_args(true);
        if (this_method)
          this_method.calls_super_constructor = true;
        return {token:t.type,
                kind:'super',
                args:args};
      } else {
        t = read();
        must_consume(Juliet.TOKEN_PERIOD, 'Expected ".".');
        name = must_read_id('Expected method or property name.');
        args = parse_args(false);
        return {token:t.type,
                kind:'super',
                name:name,
                args:args};
      }
    case Juliet.TOKEN_CHAR:
    case Juliet.TOKEN_BYTE:
    case Juliet.TOKEN_SHORT:
    case Juliet.TOKEN_INT:
    case Juliet.TOKEN_LONG:
    case Juliet.TOKEN_FLOAT:
    case Juliet.TOKEN_DOUBLE:
    case Juliet.TOKEN_STRING:
    case Juliet.TOKEN_BOOLEAN:
    case Juliet.TOKEN_ID:
      if (Juliet.options.trace) print(p.content);
      return parse_construct();
    case Juliet.TOKEN_NULL:
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

  return {
    init: function () {

    },

    parse: function () {
      if (Juliet.options.trace) print('parse');
      Juliet.parser._type_names = [];

      parse_compilation_unit();

      var ret = Juliet.parser._type_names;
      delete Juliet.parser._type_names;
      return ret;
    },

    /*
     * Used for testing the parser.
     */
    parseStatement: function() {
      return parse_statement(false);
    }
  };
}();
