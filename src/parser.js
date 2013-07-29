// http://docs.oracle.com/javase/specs/jls/se7/html/jls-18.html
// http://docs.oracle.com/javase/specs/jls/se7/html/index.html

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
    if (consume(token_type)) return;
    throw new Error(error_message);
  };

  // We use this function to handle the ambiguities between:
  // > Juliet.TOKEN_GT
  // >> Juliet.TOKEN_SHR
  // >>> Juliet.TOKEN_SHRX
  //
  // in the case of type arguments.  We do this by borrowing '>' from the >> or >>>.  Note that trying to set_mark or rewind during a borrow may lead to odd/wrong results.

  function must_consume_gt() {
    if (consume(Juliet.TOKEN_GT)) {
      return;
    }
    if (next_is(Juliet.TOKEN_SHR)) {
      var t = peek();
      if (t.borrow == 1) {
        t.borrow = 0;
        read();
      } else {
        t.borrow = 1;
      }
      return;
    }
    if (next_is(Juliet.TOKEN_SHRX)) {
      var t = peek();
      if (t.borrow == 2) {
        t.borrow = 0;
        read();
      } else if (t.borrow == 1) {
        t.borrow = 2;
      } else {
        t.borrow = 1;
      }
      return;
    }
    throw new Error('Expected >.');
  };

  var must_consume_semicolon = function(t) {
    if (!consume(Juliet.TOKEN_SEMICOLON)) {
      throw t.error('Syntax error: expected ;.');
      // TODO: complete semicolon handling
    }
  };

  var must_read_id = function(error_message) {
    var t = peek();
    var result = '';

    if (t.type != Juliet.TOKEN_ID) {
      throw t.error(error_message);
    }

    result = read().content;
    return result;
  };

  var is_class = function(a) {
    return a.modifiers & Juliet.MODIFIER_CLASS;
  };

  var is_interface = function(a) {
    return a.modifiers & Juliet.MODIFIER_INTERFACE;
  };

  var is_template = function(a) {
    return a.placeholder_types;
  };

  var is_static = function(a) {
    return a.modifiers & Juliet.MODIFIER_STATIC;
  };

  var is_abstract = function(a) {
    return a.modifiers & Juliet.MODIFIER_ABSTRACT;
  };

  var is_constructor = function(a) {
    return a.modifiers & Juliet.MODIFIER_CONSTRUCTOR;
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

  function union() {
    for (var i=0; i<arguments.length; i++) {
      var v = arguments[i]();
      if (v) {
        return v;
      }
    }
    return null;
  }

  function _union() {
    var a = arguments;
    return function() {
      union.apply(this, a);
    }
  }

  function concat() {
    var vs = [];
    set_mark();
    for (var i=0; i<arguments.length; i++) {
      var v = arguments[i]();
      if (!v) {
        rewind_to_mark();
        return null;
      }
      vs.push(v);
    }
    return v;
  }

  function _concat() {
    var a = arguments;
    return function() {
      _concat.apply(this, a);
    }
  }

  function match_token(v) {
    return function() {
      var p = peek();
      if (p && p.type == v) {
        return read();
      }
      return null;
    }
  }

  function expect(r, error) {
    if (r === null) {
      var t = peek();
      throw t.error(error);
    }
    return r;
  }

  tstack = [];

  function tstart(name) {
    if (Juliet.options.trace) {
      var spaces = new Array( tstack.length * 4 + 1 ).join(" ");
      print(spaces + "BEGIN: " + name);
    }
    tstack.push(name);
    return name;
  }

  function tend(td, result) {
    var name = tstack.pop();
    if (name != td) {
      s = "";
      for (var i=0; i<tstack.length; i++) {
        s += " : " + tstack[i];
      }
      if (Juliet.options.trace)
        print(s);
      throw "Error: Expecting " + td + " but found  " + name + " on the stack.";
    }
    if (Juliet.options.trace) {
      var spaces = new Array( tstack.length * 4 + 1 ).join(" ");
      print(spaces + "END: " + name + " => " + result);
    }
    return result;
  }

  function parse_Identifier() {
    var t = peek();
    if (!t) return null;
    if (consume(Juliet.TOKEN_ID)) {
      return {
        token: t.type,
        kind: 'construct',
        name: t.content
      };
    }
    return null;
  };

  function parse_QualifiedIdentifier() {
    if (peek().type != Juliet.TOKEN_ID) {
      return null;
    }
    var identifier = read().content;
    while (consume(Juliet.TOKEN_PERIOD)) {
      identifier = identifier + '.' + must_read_id('Expected identifier.');
    }
    return identifier;
  };

  function parse_QualifiedIdentifierList() {
    var identifiers = [];
    var identifier = parse_QualifiedIdentifier();
    while (consume(Juliet.TOKEN_COMMA)) {
      identifiers.push(expect(parse_QualifiedIdentifier(),
                              'Expected identifier.'));
    }
    return identifiers;
  }

  // 7.3 Compilation Units
  //
  // CompilationUnit:
  //   PackageDeclaration{0,1} ImportDeclarations{0,*} TypeDeclaration{0,*}

  function parse_CompilationUnit() {
    
    var _ast;

    if (_ast = parse_PackageDeclaration()) {
      Juliet.AST.package = _ast;
    }

    while (_ast = parse_ImportDeclaration()) {
      Juliet.AST.imports.push(_ast);
    }

    while (_ast = parse_TypeDeclaration()) {
    }

  };

  // 7.4 Package Declarations
  //
  // PackageDeclaration:
  //   Annotation{0,*} package QualifiedIdentifier ;
  //
  // TODO: Add annotations to parse_PackageDeclaration.

  var parse_PackageDeclaration = function() {
    if (!consume(Juliet.TOKEN_PACKAGE)) {
      return null;
    }

    var name = expect(parse_QualifiedIdentifier(),
                      "Expected identifier.");

    must_consume_semicolon(t);

    return {
      token: t.type,
      kind: 'package',
      name: name
    };
  };

  // 7.5
  //
  // ImportDeclaration:
  //   import static{0,1} Identifier (.Identifier){0,*} (.*){0,1}

  var parse_ImportDeclaration = function() {

    if (!consume(Juliet.TOKEN_IMPORT)) {
      return null;
    }

    if (consume(Juliet.TOKEN_STATIC)) {
      // TODO: We shouldn't ignore handle static package imports.
    }

    var name = must_read_id('Expected package or type name.');
    while (consume(Juliet.TOKEN_PERIOD)) {
      if (consume(Juliet.TOKEN_STAR)) {
        name += '.*';
        break;
      }
      name += '.' + must_read_id('Expected identifier.');
    }

    must_consume_semicolon(t);

    return {
      token: t.type,
      kind: 'import',
      name: name
    };
  };

  // TypeDeclaration:
  //   ClassOrInterfaceDeclaration
  //   ;
  //
  // See Also 7.6.

  function parse_TypeDeclaration() {
    return parse_ClassOrInterfaceDeclaration();
  }

  // ClassOrInterfaceDeclaration: 
  //   Modifier{0,*} ClassDeclaration
  //   Modifier{0,*} InterfaceDeclaration

  function parse_ClassOrInterfaceDeclaration() {

    var debug = tstart("parse_ClassOrInterfaceDeclaration");   

    var modifiers = parse_Modifiers();

    var type = union(parse_ClassDeclaration,
                     parse_InterfaceDeclaration);

    if (!type) return tend(debug, null);

    type.modifiers |= modifiers;

    if ((type.modifiers & (Juliet.MODIFIER_PUBLIC | Juliet.MODIFIER_PROTECTED | Juliet.MODIFIER_PRIVATE)) == 0) {
      // default to protected
      type.modifiers |= Juliet.MODIFIER_PROTECTED;
    }
    
    return tend(debug, type);
  }



  // ClassDeclaration: 
  //   NormalClassDeclaration
  //   EnumDeclaration

  function parse_ClassDeclaration() {
    var debug = tstart("parse_ClassDeclaration");   
    return tend(
      debug,
      union(
        parse_NormalClassDeclaration,
        parse_EnumDeclaration));
  }

  // InterfaceDeclaration: 
  //   NormalInterfaceDeclaration
  //   AnnotationTypeDeclaration

  function parse_InterfaceDeclaration() {
    var debug = tstart("parse_InterfaceDeclaration");   
    return tend(debug, union(parse_NormalInterfaceDeclaration,
                 parse_AnnotationTypeDeclaration));
  }

  // NormalClassDeclaration:
  //   class Identifier TypeParameters{0,1} (extends Type){0,1} (implements TypeList){0,1} ClassBody

  function parse_NormalClassDeclaration() {
    var debug = tstart("parse_NormalClassDeclaration");   

    var t = peek();
    if (!consume(Juliet.TOKEN_CLASS)) {
      return tend(debug, null);
    }

    var type = {
      token: t.type,
      kind: 'definition',
      modifiers: Juliet.MODIFIER_CLASS,
      members: [],
      types: [],
      _implements: [],
      _extends: null
    };

    var name = expect(parse_Identifier(),
                      'Expected class name.');
    type.name = name.name;

    var typeParameters = parse_TypeParameters();

    if (typeParameters) {
      type.parameters = typeParameters;
    }

    if (consume(Juliet.TOKEN_EXTENDS)) {
      type._extends = expect(parse_Type(),
                             'Expected class type to extend.');
    }

    if (consume(Juliet.TOKEN_IMPLEMENTS)) {
      type._implements = parse_TypeList();
    }

    parse_ClassBody(type);

    return tend(debug, type);
  }

  // EnumDeclaration:
  //   enum Identifier (implements TypeList){0,1} EnumBody

  function parse_EnumDeclaration() {
    var debug = tstart("parse_EnumDeclaration");

    var t = peek();
    if (!consume(Juliet.TOKEN_ENUM)) {
      return tend(debug, null);
    }

    var type = {
      token: t.type,
      kind: 'definition',
      members: [],
      _implements: [],
      _extends: null
    };

    type.name = expect(parse_Identifier(),
                       'Expected enum name.');

    if (consume(Juliet.TOKEN_IMPLEMENTS)) {
      type._implements = parse_TypeList();
    }

    type._body = expect(parse_EnumBody(),
                        'Expected enum body.');

    return tend(debug, type);
    
  }

  // NormalInterfaceDeclaration: 
  //   interface Identifier (TypeParameters){0,1} (extends TypeList){0,1} InterfaceBody

  function parse_NormalInterfaceDeclaration() {
    var debug = tstart("parse_NormalInterfaceDeclaration");
    var t = peek();
    if (!consume(Juliet.TOKEN_INTERFACE)) {
      return tend(debug, null);
    }

    var type = {
      token: t.type,
      kind: 'definition',
      members: [],
      _implements: [],
      _extends: null
    };

    type.name = expect(parse_Identifier(),
                       'Expected interface name.');

    if (consume(Juliet.TOKEN_IMPLEMENTS)) {
      type._implements = parse_TypeList();
    }

    type._body = expect(parse_InterfaceBody(),
                        'Expected interface body.');

    return tend(debug, type);
  }

  // AnnotationTypeDeclaration:
  //   @ interface Identifier AnnotationTypeBody

  function parse_AnnotationTypeDeclaration() {
    var debug = tstart("parse_AnnotationTypeDeclaration");
    // TODO: Implement parse_AnnotationTypeDeclaration
    return tend(debug, null);
  }

  // Type:
  //   BasicType ([]){0,*}
  //   ReferenceType ([]){0,*}

  function parse_Type() {
    var debug = tstart("parse_Type");
    var v = union(parse_BasicType,
                  parse_ReferenceType);

    if (!v) return tend(debug, null);

    while (consume(Juliet.TOKEN_LBRACKET)) {
      v.name += '[]';
      must_consume(Juliet.TOKEN_RBRACKET, 'Expected ].');
    }

    return tend(debug, v);
  }

  // BasicType: 
  //   byte
  //   short
  //   char
  //   int
  //   long
  //   float
  //   double
  //   boolean  

  function parse_BasicType() {
    var t = peek();
    if (consume([Juliet.TOKEN_CHAR,
                 Juliet.TOKEN_BYTE,
                 Juliet.TOKEN_SHORT,
                 Juliet.TOKEN_INT,
                 Juliet.TOKEN_LONG,
                 Juliet.TOKEN_FLOAT,
                 Juliet.TOKEN_DOUBLE,
                 Juliet.TOKEN_BOOLEAN])) {
      return {
        token: t.type,
        kind: 'type',
        name: t.content
      };
    }
    return null;
  }
  
  // ReferenceType:
  //   'String'
  //   Identifier (TypeArguments){0,1} (. Identifier (TypeArguments){0,1}){0,*}

  function parse_ReferenceType() {

    var t = peek();
    if (consume(Juliet.TOKEN_STRING)) {
      return {
        token: t.type,
        kind: 'type',
        name: t.content
      }
    }
    
    set_mark();
    
    var name = "";
    var i = 0;
    do {
      
      var id = parse_Identifier();
      if (!id) {
        rewind_to_mark();
        return null;
      }
      if (i > 0) name += ".";
      name += id.name;
      i++;
      
      var ta = parse_TypeArguments();
      if (ta) {
        name += "<";
        for (var i=0; i<ta.length; i++) {
          if (i != 0) name += ",";
          name += ta[i].name;
        }
        name += ">";
      }
    } while (consume(Juliet.TOKEN_PERIOD));

    clear_mark();
    return {
      token: t.type,
      kind: 'type',
      name: name
    };
  }

  // TypeArguments: 
  //   < TypeArgument (, TypeArgument){0,*} >

  function parse_TypeArguments() {
    if (!consume(Juliet.TOKEN_LT)) {
      return null;
    }
    var lst = [expect(parse_TypeArgument(),
                      'Expected type argument.')];
    while (consume(Juliet.TOKEN_COMMA)) {
      lst.push(expect(parse_TypeArgument(),
                      'Expected type argument.'));
    }
    must_consume_gt();
    return lst;
  }

  // TypeArgument:  
  //   ReferenceType
  //   ? extends ReferenceType
  //   ? super ReferenceType
  //   ?

  function parse_TypeArgument() {
    var t = peek();
    var prefix = "";
    if (consume(Juliet.TOKEN_QUESTIONMARK)) {
      if (consume(Juliet.TOKEN_EXTENDS)) {
        prefix = "? extends ";
      } else if (consume(Juliet.TOKEN_SUPER)) {
        prefix = "? super ";
      } else {
        return {
          token: t.type,
          kind: 'type',
          name: '?'
        };
      }
    }
    var o = parse_ReferenceType();
    if (!o && prefix != "") {
      throw t.error('Expected type argument.');
    }
    if (!o) return null;
    o.name = prefix + o.name;
    return o;
  }

  // NonWildcardTypeArguments:
  //   < TypeList >

  function parse_NonWildcardTypeArguments() {
    if (!consume(Juliet.TOKEN_LT)) {
      return null;
    }
    var lst = parse_TypeList();
    must_consume_gt();
    //expect(consume(Juliet.TOKEN_GT),
    //       'Expecting >.');
    return lst;
  }

  // TypeList:  
  //   ReferenceType (, ReferenceType){0,*}

  function parse_TypeList() {
    var lst = [expect(parse_ReferenceType(),
                      'Expected type.')];
    while (consume(Juliet.TOKEN_COMMA)) {
      lst.push(expect(parse_ReferenceType(),
                      'Expected type.'));
    }
    return lst;
  }

  // TypeArgumentsOrDiamond:
  //   < > 
  //   TypeArguments

  function parse_TypeArgumentsOrDiamond() {
    set_mark();
    if (consume(Juliet.TOKEN_LT) &&
        consume(Juliet.TOKEN_GT)) {
      clear_mark();
      return [];
    }
    rewind_to_mark();
    return parse_TypeArguments();
  }

  // NonWildcardTypeArgumentsOrDiamond:
  //   < >
  //   NonWildcardTypeArguments

  function parse_NonWildcardTypeArgumentsOrDiamond() {
    set_mark();
    if (consume(Juliet.TOKEN_LT) &&
        consume(Juliet.TOKEN_GT)) {
      clear_mark();
      return [];
    }
    rewind_to_mark();
    return parse_NonWildcardTypeArguments();
  }

  // TypeParameters:
  //   < TypeParameter (, TypeParameter){0,*} >

  function parse_TypeParameters() {

    var debug = tstart("parse_TypeParameters");   

    if (!consume(Juliet.TOKEN_LT)) {
      return tend(debug, null);
    }
    var lst = [expect(parse_TypeParameter(),
                      'Expected type parameter.')];
    while (consume(Juliet.TOKEN_COMMA)) {
      lst.push(expect(parse_ReferenceType(),
                      'Expected type.'));
    }
    must_consume_gt();
    //expect(consume(Juliet.TOKEN_GT),
    //'Expected >.');
    return tend(debug, lst);
  }
  
  // TypeParameter:
  //   Identifier [extends Bound]
  //
  // Bound:
  //   ReferenceType (& ReferenceType){0,*}

  function parse_TypeParameter() {
    var debug = tstart("parse_NormalClassDeclaration");   
    var v = parse_Identifier();
    if (!v) return tend(debug, null);
    if (consume(Juliet.TOKEN_EXTENDS)) {
      lst = [expect(parse_ReferenceType(),
                        'Expected type.')];
      while (consume(Juliet.TOKEN_AMPERSAND)) {
        lst.push(expect(parse_ReferenceType(),
                        'Expected type.'));
      }
    }
    // TODO: extends is ignored.
    return tend(debug, v);
  }

  // Modifier: 
  //   Annotation
  //   public
  //   protected
  //   private
  //   static 
  //   abstract
  //   final
  //   native
  //   synchronized
  //   transient
  //   volatile
  //   strictfp
  //
  // See Also 8.1.1, 9.1.1
  //
  // Comment: Interface and Class modifiers differ only in the 'final' keyword.
  //   We check that interfaces don't have this keyword in parse_TypeDeclaration() 
  //   after we call this function and after we determine if we are parsing a
  //   class or an interface.
  // 
  // TODO: Implement Annotations in modifiers.
  
  function parse_Modifiers() {
    var modifiers = 0;
    while (true) {
      var t = peek();

      if (consume(Juliet.TOKEN_ABSTRACT)) {
        modifiers |= Juliet.MODIFIER_ABSTRACT;
        if (modifiers & (Juliet.MODIFIER_FINAL)) {
          throw t.error('Cannot be abstract if final.');
        }
        continue;
      }

      if (consume(Juliet.TOKEN_PUBLIC)) {
        if (modifiers & Juliet.MODIFIER_PUBLIC) {
          throw t.error('Entity is already public.');
        }
        modifiers |= Juliet.MODIFIER_PUBLIC;
        if (modifiers & (Juliet.MODIFIER_PROTECTED | Juliet.MODIFIER_PRIVATE)) {
          throw t.error('Cannot be public if protected or private.');
        }
        continue;
      }

      if (consume(Juliet.TOKEN_PROTECTED)) {
        if (modifiers & Juliet.MODIFIER_PROTECTED) {
          throw t.error('Entity is already protected.');
        }
        modifiers |= Juliet.MODIFIER_PROTECTED;
        if (modifiers & (Juliet.MODIFIER_PUBLIC | Juliet.MODIFIER_PRIVATE)) {
          throw t.error('Cannot be protected if public or private.');
        }
        continue;
      }

      if (consume(Juliet.TOKEN_PRIVATE)) {
        if (modifiers & Juliet.MODIFIER_PRIVATE) {
          throw t.error('Entity is already private.');
        }
        modifiers |= Juliet.MODIFIER_PRIVATE;
        if (modifiers & (Juliet.MODIFIER_PUBLIC | Juliet.MODIFIER_PROTECTED)) {
          throw t.error('Cannot be private if public or protected.');
        }
        continue;
      }

      if (consume(Juliet.TOKEN_STATIC)) {
        if (modifiers & Juliet.MODIFIER_STATIC) {
          throw t.error('Entity is already static.');
        }
        modifiers |= Juliet.MODIFIER_STATIC;
        continue;
      }

      if (consume(Juliet.TOKEN_FINAL)) {
        if (modifiers & Juliet.MODIFIER_FINAL) {
          throw t.error('Entity is already final.');
        }
        modifiers |= Juliet.MODIFIER_FINAL;
        if (modifiers & (Juliet.MODIFIER_ABSTRACT)) {
          throw t.error('Cannot be final if abstract.');
        }
        continue;
      }

      if (consume(Juliet.TOKEN_TRANSIENT)) {
        modifiers |= Juliet.MODIFIER_TRANSIENT;
        continue;
      }

      if (consume(Juliet.TOKEN_VOLATILE)) {
        modifiers |= Juliet.MODIFIER_VOLATILE;
        continue;
      }

      if (consume(Juliet.TOKEN_SYNCHRONIZED)) {
        modifiers |= Juliet.MODIFIER_SYNCRONIZED;
        continue;
      }

      if (consume(Juliet.TOKEN_NATIVE)) {
        modifiers |= Juliet.MODIFIER_NATIVE;
        continue;
      }

      if (consume(Juliet.TOKEN_STRICTFP)) {
        if (modifiers & Juliet.MODIFIER_STRICTFP) {
          throw t.error('Entity is already strictfp.');
        }
        modifiers |= Juliet.MODIFIER_STRICTFP;
        continue;
      }

      return modifiers;
    }
  }

  // Annotations:
  //   Annotation{1,*}
  function parse_Annotations() {
    // TODO: Implement parse_Annotations
  }

  // Annotation:
  //   @ QualifiedIdentifier [ ( [AnnotationElement] ) ]
  function parse_Annotation() {
    // TODO: Implement parse_Annotation
  }

  // AnnotationElement:
  //   ElementValuePairs
  //   ElementValue

  function parse_AnnotationElement() {
    // TODO: Implement parse_AnnotationElement    
  }

  // ElementValuePairs:
  //     ElementValuePair { , ElementValuePair }
  //
  // ElementValuePair:
  //     Identifier = ElementValue
  //
  // ElementValue:
  //     Annotation
  //     Expression1 
  //     ElementValueArrayInitializer
  //
  // ElementValueArrayInitializer:
  //     { [ElementValues] [,] }
  //
  // ElementValues:
  //     ElementValue { , ElementValue }




  //  ClassBody: 
  //   { (ClassBodyDeclaration){0,*} }

  function parse_ClassBody(type) {
    var debug = tstart("parse_ClassBody");   

    must_consume(Juliet.TOKEN_LCURLY,
                 'Expected {.');

    // print(peek().content + ", " + Juliet.tokens[peek().type]);

    while (member = parse_ClassBodyDeclaration()) {
      // print("MEMBER: ", peek().content + ", " + Juliet.tokens[peek().type]);
      var lst;
      if (Juliet.util.isArray(member)) {
        lst = member;
      } else {
        lst = [member];
      }
      for (var i in lst) {
        member = lst[i];
        if (member.kind == 'method' || member.kind == 'field') {
          type.members.push(member);
        }
        if (member.kind == 'definition') {
          type.types.push(member);
        }
        Juliet.util.print_ast(member);
      }
    }
    // print(type.name);
    //print(peek().content + ", " + Juliet.tokens[peek().type], ", " + peek().line + ", " + peek().col);
    //if (!next_is(Juliet.TOKEN_RCURLY)) {
    //read();
      //print(peek().content + ", " + Juliet.tokens[peek().type]);
    //}
    
    must_consume(Juliet.TOKEN_RCURLY,
                 'Expected }.');

    return tend(debug, true);
  }

  // ClassBodyDeclaration:
  //   ; 
  //   Modifiers MemberDecl
  //   (static){0,1} Block

  function parse_ClassBodyDeclaration() {

    var debug = tstart("parse_ClassBodyDeclaration");

    var t = peek();
    if (consume(Juliet.TOKEN_SEMICOLON)) {
      return tend(debug, {
        token: t.type,
        kind: 'noop'
      });
    }
    var modifiers = parse_Modifiers();
    var v = parse_MemberDecl();
    if (v && Juliet.util.isArray(v)) {
      for (var i in v) {
        v[i].modifiers |= modifiers;
      }
      return tend(debug, v);      
    }
    if (v) {
      v.modifiers |= modifiers;
      return tend(debug, v);
    }
    if (consume(Juliet.TOKEN_STATIC)) {
    }
    v = parse_Block();
    if (v) {
      return tend(debug, v);
    }
    return tend(debug, null);
  }

  // MemberDecl:
  //   MethodDecl
  //   FieldDecl
  //   void Identifier VoidMethodDeclaratorRest
  //   Identifier ConstructorDeclaratorRest
  //   GenericMethodOrConstructorDecl
  //   ClassDeclaration
  //   InterfaceDeclaration

  function parse_MemberDecl() {

    var debug = tstart("parse_MemberDecl");
    return tend(
      debug,
      union(
        parse_MethodDecl,
        parse_FieldDecl,
        _concat(
          match_token(Juliet.TOKEN_VOID),
          parse_Identifier,
          parse_VoidMethodDeclaratorRest),
        function() {
          // print("CONSTRUCTOR???:" + peek().content + "," + Juliet.tokens[peek().type]);
          var o = parse_Identifier();
          if (!o) return null;
          if (!next_is(Juliet.TOKEN_LPAREN)) return null;
          return {
            token: o.token,
            name: o.name,
            kind: 'method',
            modifiers: Juliet.MODIFIER_CONSTRUCTOR,
            return_type: null,
            parameters: expect(parse_FormalParameters(),
                               'Expected parameter list.'),
            block: expect(parse_Block(),
                          'Expected block.')
          };
        },
        _concat(
          parse_Identifier,
          parse_ConstructorDeclaratorRest),
        parse_GenericMethodOrConstructorDecl,
        parse_ClassDeclaration,
        parse_InterfaceDeclaration));
  }
  
  // MethodDecl:
  //   Type Identifier FormalParameters ([]){0,*} (throws QualifiedIdentifierList){0,1} (Block | ;)

  function parse_MethodDecl() {
    var debug = tstart("parse_MethodDecl");
    set_mark();
    
    // print("METHOD???:" + peek().content + "," + Juliet.tokens[peek().type]);

    var t = parse_Type();
    if (!t) {
      clear_mark();
      return tend(debug, null);
    }

    var id = parse_Identifier();
    if (!id) {
      rewind_to_mark();
      return tend(debug, null);
    }
    
    if (!next_is(Juliet.TOKEN_LPAREN)) {
      rewind_to_mark();
      return tend(debug, null);
    }

    var method = {
      name: id.name,
      token: id.token,
      return_type: t,
      kind: 'method',
      parameters: expect(parse_FormalParameters(),
                         'Invalid method parameters.')
    }

    var cnt = parse_Dims();
    concat(match_token(Juliet.TOKEN_THROWS),
           parse_QualifiedIdentifierList);

    method.block = union(parse_Block,
                         match_token(Juliet.TOKEN_SEMICOLON));

    if (!method.block) {
      rewind_to_mark();
      return tend(debug, null);
    }

    clear_mark();
    return tend(debug, method);
  }

  // FieldDecl:
  //   Type VariableDeclarators ;

  function parse_FieldDecl() {
    var debug = tstart("parse_FieldDecl");
    set_mark();
    // print("FIELD???:" + peek().content + "," + Juliet.tokens[peek().type]);

    var t = parse_Type();
    if (!t) {
      clear_mark();
      return tend(debug, null);
    }

    var lst = parse_VariableDeclarators();
    if (lst) {
      must_consume(Juliet.TOKEN_SEMICOLON, 'Expected ;.');
      clear_mark();

      for (var i=0; i<lst.length; i++) {
        lst[i].kind = 'field';
      }

      return tend(debug, lst);
 /*     return tend(debug, {
        name: id.name,
        token: id.token,
        type: t,
        kind: 'field',
        lst: lst
      }); */
    }
    rewind_to_mark();
    return tend(debug, null);
  }

/*
  // MethodOrFieldRest:  
  //   FieldDeclaratorsRest ;
  //   MethodDeclaratorRest

  function parse_MethodOrFieldRest() {
    var debug = tstart("parse_MethodOrFieldRest");
    return tend(
      debug,
      union(
        _concat(
          parse_FieldDeclaratorsRest,
          match_token(Juliet.TOKEN_SEMICOLON)),
        parse_MethodDeclaratorRest));
  }
*/

  // FieldDeclaratorsRest:  
  //   VariableDeclaratorRest (, VariableDeclarator){0,*}
  //
  // VariableDeclaratorRest:
  //   {[]} [ = VariableInitializer ]
/*
  function parse_FieldDeclaratorsRest() {
    var debug = tstart("parse_FieldDeclaratorsRest");
    var v = parse_VariableDeclaratorRest();
    if (!v) return tend(debug, null);
    while (consume(Juliet.TOKEN_COMMA)) {
      parse_VariableDeclarator();
    }
    return tend(debug, v);
  }
*/

  // Dims:
  //   ( "[" "]" ){0,*}
  //
  // This function differs from most parse functions in that it
  // returns an integer count of the number of dims matched.

  function parse_Dims() {
    var cnt = 0;
    while (consume(Juliet.TOKEN_LBRACKET)) {
      cnt++;
      must_consume(Juliet.TOKEN_RBRACKET, 'Expected ] (Error#).');
    }
    return cnt;
  }

  // DimExprs:
  //   ( "[" Expression "]" ){0,*}

  function parse_DimExprs() {
    var lst = [];
    while (next_is(Juliet.TOKEN_LBRACKET)) {
      var la = peek(2);
      if (la.type == Juliet.TOKEN_RBRACKET) {
        return lst;
      }
      read();
      lst.push(expect(parse_Expression(),
                      'Expected expression.'));
      must_consume(Juliet.TOKEN_RBRACKET, 'Expected ] (Error#).');
    }
    return lst;
  }

  // MethodDeclaratorRest:
  //   FormalParameters ([]){0,*} (throws QualifiedIdentifierList){0,1} (Block | ;)
/*
  function parse_MethodDeclaratorRest() {
    var debug = tstart("parse_MethodDeclaratorRest");
    set_mark();

    var u = parse_FormalParameters();
    if (!u) {
      rewind_mark();
      return tend(debug, null);
    }

    var cnt = parse_Dims();
    concat(match_token(Juliet.TOKEN_THROWS),
           parse_QualifiedIdentifierList);

    var v = union(parse_Block,
                  match_token(Juliet.TOKEN_SEMICOLON));

    if (!v) {
      rewind_mark();
      return tend(debug, null);
    }

    // TODO: Not done..
    return tend(debug, null);
    
  }
*/

  // VoidMethodDeclaratorRest:
  //   FormalParameters [throws QualifiedIdentifierList] (Block | ;)

  function parse_VoidMethodDeclaratorRest() {
    var debug = tstart("parse_MethodDeclaratorRest");
    set_mark();

    var u = parse_FormalParameters();
    if (!u) {
      rewind_mark();
      return tend(debug, null);
    }

    var v = union(parse_Block,
                  match_token(TOKEN_SEMICOLON));

    if (!v) {
      rewind_mark();
      return tend(debug, null);
    }
    
    // TODO: Not done..
    return tend(debug, null);
  }

  // ConstructorDeclaratorRest:
  //   FormalParameters [throws QualifiedIdentifierList] Block

  function parse_ConstructorDeclaratorRest() {
    var debug = tstart("parse_ConstructorDeclaratorRest");
    set_mark();

    var u = parse_FormalParameters();
    if (!u) {
      rewind_mark();
      return tend(debug, null);
    }

    var v = parse_Block();

    if (!v) {
      rewind_mark();
      return tend(debug, null);
    }
    
    // TODO: Not done..
    return tend(debug, null);
  }

  // GenericMethodOrConstructorDecl:
  //   TypeParameters GenericMethodOrConstructorRest

  function parse_GenericMethodOrConstructorDecl() {
    var debug = tstart("parse_GenericMethodOrConstructorDecl");
    return tend(
      debug,
      concat(
        parse_TypeParameters,
        parse_GenericMethodOrConstructorRest));
  }

  // GenericMethodOrConstructorRest:
  //   (Type | void) Identifier MethodDeclaratorRest
  //   Identifier ConstructorDeclaratorRest

  function parse_GenericMethodOrConstructorRest() {
    var debug = tstart("parse_GenericMethodOrConstructorRest");
    return tend(debug, union(
      _concat(
        _union(parse_Type,
              match_token(Juliet.TOKEN_VOID)),
        parse_Identifier,
        parse_MethodDeclaratorRest),
      _concat(
        parse_Identifier,
        parse_ConstructorDeclaratorRest)));
  }

  // InterfaceBody: 
  //   ({ InterfaceBodyDeclaration }){0,*}

  function parse_InterfaceBody() {
    var debug = tstart("parse_InterfaceBody");
    var lst = [];
    while (v = parse_InterfaceBodyDeclaration()) {
      lst.push(v);
    }
    return tend(debug, lst);
  }

  // InterfaceBodyDeclaration:
  //   ;
  // {Modifier} InterfaceMemberDecl

  function parse_InterfaceBodyDeclaration() {
    var debug = tstart("parse_InterfaceBodyDeclaration");
    return tend(debug, union(
      match_token(Juliet.TOKEN_SEMICOLON),
      _concat(
        parse_Modifiers,
        parse_InterfaceMemberDecl)));
  }

  // InterfaceMemberDecl:
  //   InterfaceMethodOrFieldDecl
  //   void Identifier VoidInterfaceMethodDeclaratorRest
  //   InterfaceGenericMethodDecl
  //   ClassDeclaration
  //   InterfaceDeclaration

  function parse_InterfaceMemberDecl() {
    var debug = tstart("parse_InterfaceMemberDecl");
    return tend(debug, union(
      parse_InterfaceMethodOrFieldDecl,
      _concat(
        match_token(Juliet.TOKEN_VOID),
        parse_Identifier,
        parse_VoidInterfaceMethodDeclaratorRest),
      parse_InterfaceGenericMethodDecl,
      parse_ClassDeclaration,
      parse_InterfaceDeclaration));
  }

  // InterfaceMethodOrFieldDecl:
  //   Type Identifier InterfaceMethodOrFieldRest

  function parse_InterfaceMethodOrFieldDecl() {
    var debug = tstart("parse_InterfaceMethodOrFieldDecl");
    return tend(debug, concat(
      parse_Type,
      parse_Identifier,
      parse_InterfaceMethodOrFieldRest));
  }

  // InterfaceMethodOrFieldRest:
  //   ConstantDeclaratorsRest ;
  //   InterfaceMethodDeclaratorRest

  function parse_InterfaceMethodOrFieldRest() {
    var debug = tstart("parse_InterfaceMethodOrFieldRest");
    return tend(debug, union(
      _concat(
        parse_ConstantDeclaratorsRest,
        match_token(Juliet.TOKEN_SEMICOLON)),
      parse_InterfaceMethodDeclaratorRest));
  }
  
  // ConstantDeclaratorsRest: 
  //   ConstantDeclaratorRest { , ConstantDeclarator }

  function parse_ConstantDeclaratorsRest() {
    var debug = tstart("parse_ConstantDeclaratorRest");
    var v = parse_ConstantDeclaratorRest();
    while (consume(Juliet.TOKEN_COMMA)) {
      parse_ConstantDeclarator();
    }
    // TODO: Not done..
    return tend(debug, null);
  }

  // ConstantDeclaratorRest: 
  //   {[]} = VariableInitializer

  function parse_ConstantDeclaratorRest() {
    var debug = tstart("parse_ConstantDeclaratorRest");
    return tend(debug, concat(
      parse_Dims,
      match_token(Juliet.TOKEN_EQ),
      parse_VariableInitializer));
  }

  // ConstantDeclarator: 
  //   Identifier ConstantDeclaratorRest

  function parse_ConstantDeclarator() {
    var debug = tstart("parse_ConstantDeclarator");
    return tend(debug, union(parse_Identifier,
                      parse_ConstantDeclaratorRest));
  }
  
  // InterfaceMethodDeclaratorRest:
  //   FormalParameters {[]} [throws QualifiedIdentifierList] ; 

  function parse_InterfaceMethodDeclaratorRest() {
    var debug = tstart("parse_InterfaceMethodDeclaratorRest");
    parse_FormalParameters();
    parse_Dims();
    if (consume(Juliet.TOKEN_THROWS)) {
      parse_QualifiedIdentifierList();
    }
    must_consume(Juliet.TOKEN_SEMICOLON);
    return tend(debug, null);
  }

  // VoidInterfaceMethodDeclaratorRest:
  //   FormalParameters [throws QualifiedIdentifierList] ;

  function parse_VoidInterfaceMethodDeclaratorRest() {
    var debug = tstart("parse_VoidInterfaceMethodDeclaratorRest");
    parse_FormalParameters();
    if (consume(Juliet.TOKEN_THROWS)) {
      parse_QualifiedIdentifierList();
    }
    must_consume(Juliet.TOKEN_SEMICOLON);
    return tend(debug, null);
  }

  // InterfaceGenericMethodDecl:
  //   TypeParameters (Type | void) Identifier InterfaceMethodDeclaratorRest
  
  function parse_InterfaceGenericMethodDecl() {
    var debug = tstart("parse_InterfaceGenericMethodDecl");
    parse_TypeParameters();
    if (!consume(Juliet.TOKEN_VOID)) {
      parse_Type();
    }
    parse_Identifier();
    parse_InterfaceMethodDeclaratorRest();
    return tend(debug, null);
  }

  // 8.4.1
  // FormalParameterList:
  //   ()
  //   ( LastFormalParameter )
  //   ( FormalParameters , LastFormalParameter )
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
  // Comment: Our version includes the parens in the list definition.

  function parse_FormalParameters() {
    var debug = tstart("parse_FormalParameterList");

    var t = null;
    var type = null;
    var name = '';

    must_consume(Juliet.TOKEN_LPAREN, 'Expected (.');

    var parameters = [];

    if (!consume(Juliet.TOKEN_RPAREN)) {
      do {
        t = peek();
        type = parse_Type(true);
        if (!type) {
          throw t.error('void cannot be parameter type');
        }

        name = must_read_id('Expected identifier.');
        parameters.push({token:t.type,
                           kind:'parameter',
                           type:type,
                           name:name});
      } while (consume(Juliet.TOKEN_COMMA));
      must_consume(Juliet.TOKEN_RPAREN, 'Expected ).');
    }
    return tend(debug, parameters);
  };
  
  // VariableModifier:
  //   final
  //   Annotation
  //
  // TODO: Support Annotations..

  function parse_VariableModifiers() {
    var modifiers = 0;

    while (true) {
      
      if (consume(Juliet.TOKEN_FINAL)) {
        if (modifiers & Juliet.MODIFIER_FINAL) {
          throw t.error('Entity is already public.');
        }
        modifiers |= Juliet.MODIFIER_FINAL;
      } else {
        break;
      }
      return modifiers;
    }
  }

  // MemberDecl:
  //   MethodOrFieldDecl
  //   void Identifier VoidMethodDeclaratorRest
  //   Identifier ConstructorDeclaratorRest
  //   GenericMethodOrConstructorDecl
  //   ClassDeclaration
  //   InterfaceDeclaration



  // 8.1
  // ClassDeclaration:
  //   NormalClassDeclaration
  //   EnumDeclaration
  //
  //
  // EnumDeclaration:
  //   enum Identifier [implements TypeList] EnumBody
  // 
  //
  // TODO: I find this implementation confusing - specifically the recursion.
  // TODO: Enums

/*
  var parse_TypeDeclaration = function() {
    var debug = tstart('parse_TypeDeclaration');
    var quals = null;
    var t = null;
    var mesg = '';
    var name = '';
    var type = null;
    var t2 = null;

    if (arguments.length == 0) {
      quals = parse_Modifiers();
      t = peek();
      if (consume(Juliet.TOKEN_CLASS)) {
        return tend(debug, parse_TypeDeclaration(t, quals | Juliet.MODIFIER_CLASS , 'Class name expected.'));
      } else if (consume(Juliet.TOKEN_INTERFACE)) {
        if (quals & Juliet.MODIFIER_FINAL) throw t.error('Interfaces can not be final.');
        return tend(debug, parse_TypeDeclaration(t, quals | Juliet.MODIFIER_INTERFACE | Juliet.MODIFIER_ABSTRACT, 'Interface name expected.'));
      } else {
	Juliet.util.print_token(quals);
	Juliet.util.print_token(t);
        if (quals) throw t.error('Expected class or interface.');
      }

      // TODO: enums

      return tend(debug, null);
    } else if (arguments.length == 3) {
      // parse_TypeDeclaration
      t = arguments[0];
      quals = arguments[1];
      mesg = arguments[2];

      if ((quals & (Juliet.MODIFIER_PUBLIC | Juliet.MODIFIER_PROTECTED | Juliet.MODIFIER_PRIVATE)) == 0) {
        // default to protected
        quals |= Juliet.MODIFIER_PROTECTED;
      }

      name = must_read_id(mesg);
      type = {token:t.type,
              kind:'definition',
              modifiers:quals,
              name:name,
	      properties:[],
	      methods:[]};

      Juliet.parser._type_names.push(name);
      Juliet.AST.parsed_types[name] = type;

      // parametrized types
      // template type (Jog implements templates instead of generics).
      if (consume(Juliet.TOKEN_LT)) {
        type.placeholder_types = [parse_Type()];
        while(consume(Juliet.TOKEN_COMMA)) {
          type.placeholder_types.push(parse_Type());
        }
        must_consume_gt();
        //must_consume(Juliet.TOKEN_GT, 'Expected >.');

        // Set a mark to ensure that all the tokens are buffered, parse
        // in the class, and collect the buffered tokens to use for
        // implementing the template later on.
        set_mark();

        parse_TypeDeclaration(t, type);

        var start = Juliet.lexer.processed.length - Juliet.lexer.marks[Juliet.lexer.marks.length - 1];
        for (var i = start, len = Juliet.lexer.processed.length; i < len; i++) {
          if (!type.template_tokens) type.template_tokens = [];
          type.template_tokens.push(Juliet.lexer.processed[i]);
        }
        clear_mark();

        delete type.base_class;
        delete type.interfaces;

        return tend(debug, type);
      }

      parse_TypeDeclaration(t, type);

      return tend(debug, type);
    } else if (arguments.length == 2) {
      // Part of generic
      t = arguments[0];
      type = arguments[1];
      type.methods = [];
      type.properties = [];

      if (consume(Juliet.TOKEN_EXTENDS)) {
	type.base_class = parse_Type(true);
      } else {
	type.base_class = {
	  kind: 'type',
	  name: 'Object'};
      }

      t2 = peek();
      if (consume(Juliet.TOKEN_IMPLEMENTS)) {
        if (is_interface(type)) throw t.error('Interface cannot implement another.');
        type.interfaces = [parse_Type(true)];
        while (consume(Juliet.TOKEN_COMMA)) {
          type.interfaces.push(parse_Type(true));
        }
      }

      // make one empty static initializer for setting up initial class
      // property values
      if (is_class(type) && !is_template(type)) {
        type.static_initializers = [{token:t.type,
                                     kind:'static-initializer',
                                     modifiers:Juliet.MODIFIER_STATIC,
                                     // TODO: type_context:type,
                                     return_type:null,
                                     name:'static'}];
      }

      must_consume(Juliet.TOKEN_LCURLY, 'Expected {.');

      while (true) {
        set_mark();
        try {
          result = parse_ClassMemberDeclaration(type);
          clear_mark();
          if (!result) break;
        } catch (e) {
          rewind_to_mark();
          try {
            if (!parse_TypeDeclaration()) throw e;
          } catch (e) { throw e; }
        }
      }

      must_consume(Juliet.TOKEN_RCURLY, 'Expected }.');
    }
  }

*/

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

  var parse_ClassMemberDeclaration = function(type) {
    if (Juliet.options.trace) print('parse_ClassMemberDeclaration');
    if (next_is(Juliet.TOKEN_RCURLY)) return false;

    var t = peek();
    var modifiers = parse_Modifiers();
    var t2 = peek();
    var m = null;
    var stm = null;
    var name_t = null;
    var name = '';
    var first = true;

    // static initializer
    if (modifiers == Juliet.MODIFIER_STATIC && next_is(Juliet.TOKEN_LCURLY)) {
      if (Juliet.options.trace) print('static initiaizer');
      if (is_interface(type)) {
        throw t.error('Static initialization block not allowed here.');
      }

      m = {token:t.type,
           kind:'static-initializer',
           modifiers:modifiers,
	   statements: [],
           //type:type,
           return_type:null,
           name:'static'};
      this_method = m;
      if (!type.static_initializers) type.static_initializers = [];
      type.static_initializers.push(m);

      read();
      while (!next_is(Juliet.TOKEN_RCURLY)) {
        stm = parse_Statement();
        push_statement(m, stm);
      }
      must_consume(Juliet.TOKEN_RCURLY, 'Expected }');
      if (next_is(Juliet.TOKEN_SEMICOLON)) read();
      return true;
    }

    // instance initializer
    if (modifiers == 0 && next_is(Juliet.TOKEN_LCURLY)) {
      if (Juliet.options.trace) print('instance initializer');
      if (is_interface(type)) {
        throw t.error('Instance initialization block not allowed here.');
      }

      m = {token:t.type,
           kind:'instance-initializer',
           modifiers:modifiers,
	   statements: [],
           //type:type,
           return_type:null,
           name:'instance'};
      this_method = m;
      if (!type.instance_initializers) type.instance_initializers = [];
      type.instance_initializers.push(m);

      read();
      while (!next_is(Juliet.TOKEN_RCURLY)) {
        stm = parse_Statement();
        push_statement(m, stm);
      }
      must_consume(Juliet.TOKEN_RCURLY, 'Expected }');
      if (next_is(Juliet.TOKEN_SEMICOLON)) read();
      return true;
    }

    data_type = parse_Type(true);

    // constructor
    if (next_is(Juliet.TOKEN_LPAREN)) {
      if (Juliet.options.trace) print('constructor');
      if (data_type.name == type.name) {
        if (modifiers & Juliet.MODIFIER_STATIC) {
          throw t.error('Constructor cannot be static.');
        }
        if (is_interface(type)) {
          throw t.error('Constructor not allowed here.');
        }

        modifiers |= Juliet.MODIFIER_CONSTRUCTOR;
        m = {token: t.type,
             kind: 'constructor',
             modifiers: modifiers,
	     statements: [],
             //type:type, // TODO:
             return_type: null,
             name: type.name};
        this_method = m;
        parse_FormalParameterList(m);
        type.methods.push(m);

        must_consume(Juliet.TOKEN_LCURLY, 'Expected {.');
        while (!next_is(Juliet.TOKEN_RCURLY)) {
          stm = parse_Statement();
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

      if (modifiers & Juliet.MODIFIER_TRANSIENT) {
        throw t.error('Methods cannot be transient.');
      }

      if (modifiers & Juliet.MODIFIER_VOLATILE) {
        throw t.error('Methods cannot be volatile.');
      }

      if (is_interface(type)) modifiers |= Juliet.MODIFIER_ABSTRACT;

      m = {token:t.type,
           kind:'method',
           modifiers:modifiers,
	   statements:[],
           // TODO: type:type,
           return_type:data_type,
           name:name};

      if (is_interface(type) && is_static(m)) {
        throw t.error('Interface method cannot be static.');
      }

      this_method = m;
      parse_FormalParameterList(m);

      //if (is_static(m)) {
      //  if (!type.class_methods) type.class_methods = [];
      //  type.class_methods.push(m);
      //} else {
      //  if (!type.methods) type.methods = [];
      type.methods.push(m);
      //}

      if (modifiers & Juliet.MODIFIER_NATIVE) {
        if (is_interface(m)) {
          throw t.error('Interface method cannot be native.');
        }

        // literal javascript
        if (next_is(Juliet.LITERAL_JAVASCRIPT)) {
          var t2 = read();
          m.statements = [{
            token:t2.type,
            kind:'literal',
            value:t2.content}];
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
          stm = parse_Statement();
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
      if (modifiers & Juliet.MODIFIER_ABSTRACT) {
        throw t.error('Fields cannot be abstract.');
      }
      if (modifiers & Juliet.MODIFIER_SYNCHRONIZED) {
        throw t.error('Fields cannot be synchronized.');
      }
      if (modifiers & Juliet.MODIFIER_STRICTP) {
        throw t.error('Fields cannot be strictp.');
      }
      if (modifiers & Juliet.MODIFIER_NATIVE) {
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
             modifiers:modifiers,
             // TODO: type_context:type,
             type:data_type,
             name:name,
             initial_value:parse_initial_value(data_type)};
        //if (is_static(p)) {
        //if (!type.class_properties) type.class_properties = [];
        //type.class_properties.push(p);
        //} else {
        //if (!type.properties) type.properties = [];
        type.properties.push(p);
        //}
      } while (consume(Juliet.TOKEN_COMMA));

      must_consume_semicolon(t);
    }

    return true;
  };


  // 8.8.7.1
  //
  // ExplicitConstructorInvocation:
  //   NonWildTypeArgumentsopt this ( ArgumentList_opt ) ;
  //   NonWildTypeArgumentsopt super ( ArgumentList_opt ) ;
  //   Primary . NonWildTypeArgumentsopt super ( ArgumentList_opt ) ;
  //
  // NonWildTypeArguments:
  //   < ReferenceTypeList >
  //
  // ReferenceTypeList: 
  //   ReferenceType
  //   ReferenceTypeList , ReferenceType

  var parse_NonWildTypeArguments = function() {
    var debug = tstart("parse_NonWildTypeArguments");
    if (next_is(Juliet.TOKEN_LT)) {
      var args = [];
      args.push(parse_ReferenceType());
      while (consume(Juliet.TOKEN_COMMA)) {
        args.push(parse_ReferenceType());
      }
      must_consume_gt();
      //must_consume(Juliet.TOKEN_GT, 'Expected >.');
      return tend(debug, args);
    }
    return tend(debug, null);
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
/*
  var generic_depth = [];
  var parse_Type = function(parse_brackets, parse_wildcards) {
    if (Juliet.options.trace) print('parse_Type');
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
      var subst_type = parse_Type(true, true);
      name = name + subst_type.name;

      while (consume(Juliet.TOKEN_COMMA)) {
        name = name + ',';
        subst_type = parse_Type(true, true);
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
*/

  var parse_initial_value = function(of_type) {
    if (Juliet.options.trace) print('parse_initial_value');
    if (consume(Juliet.TOKEN_ASSIGN)) {
      if (next_is(Juliet.TOKEN_LCURLY)) {
        return parse_literal_array(of_type);
      } else {
        return parse_Expression();
      }
    } else {
      return null;
    }
  };
  

  // VariableInitializer:
  //   ArrayInitializer
  //   Expression

  function parse_VariableInitializer() {
    var debug = tstart("parse_VariableInitializer");
    return tend(debug,
                union(parse_ArrayInitializer,
                      parse_Expression));
  }

  // ArrayInitializer:
  //   { [ VariableInitializer { , VariableInitializer } [,] ] }

  function parse_ArrayInitializer() { 
    var debug = tstart("parse_ArrayInitializer");
    if (!consume(Juliet.TOKEN_LCURLY)) {
      return tend(debug, null);
    }

    if (consume(Juliet.TOKEN_RCURLY)) {
      return tend(debug, lst);
    }
   
    var lst = [];
    do {
      v = parse_VariableInitializer();
      lst.push(v);
    } while (consume(Juliet.TOKEN_COMMA));
    must_consume(Juliet.TOKEN_RCURLY, 'Expected }.');
    return tend(debug, lst);
  }

  // Block: 
  //   { BlockStatements }

  function parse_Block() {
    var debug = tstart("parse_Block");

    if (!consume(Juliet.TOKEN_LCURLY)) {
      return tend(debug, null);
    }
    var lst = [];
    while (v = parse_BlockStatement()) {
      lst.push(v);
    }
    must_consume(Juliet.TOKEN_RCURLY);
    return tend(debug, lst);
  }

  // BlockStatement:
  //   LocalVariableDeclarationStatement
  //   ClassOrInterfaceDeclaration
  //   [Identifier :] Statement

  function parse_BlockStatement() {
    var debug = tstart("parse_BlockStatement");
    
    var o = union(
      parse_LocalVariableDeclarationStatement,
      parse_ClassOrInterfaceDeclaration,
      function() {
        set_mark();
        var v = parse_Identifier();
        if (v && consume(Juliet.TOKEN_COLON)) {
          clear_mark();
        } else {
          rewind_to_mark();
        }
        return parse_Statement();
      });
    //Juliet.util.print_ast(o);
    return tend(debug, o);
  }

  // VariableDeclarators:
  //   VariableDeclarator (, VariableDeclarator){0,*}

  function parse_VariableDeclarators() {
    var debug = tstart("parse_VariableDeclarator");
    set_mark();

    var lst = [];
    do {
      var o = parse_VariableDeclarator();
      if (!o) {
        rewind_to_mark();
        return tend(debug, null);
      }
      lst.push(o);
    } while (consume(Juliet.TOKEN_COMMA));
    
    return tend(debug, lst);
  }

  // VariableDeclarator:
  //   Identifier VariableDeclaratorRest
  //
  // VariableDeclaratorRest:
  //   {[]} [ = VariableInitializer ]
  //
  // VariableInitializer:
  //   ArrayInitializer
  //   Expression

  function parse_VariableDeclarator() {
    var debug = tstart("parse_VariableDeclarator");
    var a = parse_Identifier();
    if (!a) {
      return tend(debug, null);
    }

    var cnt = parse_Dims();

    var b = peek();
    if (consume(Juliet.TOKEN_ASSIGN)) {
      return tend(debug, {
        token: a.token,
        name: a.name,
        initial_value:
          union(parse_ArrayInitializer,
                parse_Expression),
        kind: 'local'
      });
    }

    return tend(debug, {
      token: a.token,
      name: a.name,
      initial_value: null,
      kind: 'local'
    });
  }

  // LocalVariableDeclarationStatement:
  //   { VariableModifier }  Type VariableDeclarators ;

  function parse_LocalVariableDeclarationStatement() {
    var debug = tstart("parse_LocalVariableDeclarationStatement()");
    set_mark();
    var modifiers = parse_VariableModifiers();
    var type = parse_Type();
    if (!type) {
      rewind_to_mark();
      return tend(debug, null);
    }

    var o = parse_VariableDeclarator();
    if (!o) {
      rewind_to_mark();
      return tend(debug, null);
    }

    var lst = [o];
    while (consume(Juliet.TOKEN_COMMA)) {
      o = parse_VariableDeclarator();
      if (!o) {
        rewind_to_mark();
        return tend(debug, null);
      }
      lst.push(o);
    }

    for (var i=0; i<lst.length; i++) {
      lst[i].type = type;
    }

    must_consume(Juliet.TOKEN_SEMICOLON,
                'Expecting ;.');
    if (lst.length == 1) return tend(debug, lst[0]);
    return tend(debug, lst);
  }

  // Statement:
  //   Block
  //   ;
  //   Identifier : Statement
  //   StatementExpression ;
  //   if ParExpression Statement [else Statement] 
  //   assert Expression [: Expression] ;
  //   switch ParExpression { SwitchBlockStatementGroups } 
  //   while ParExpression Statement
  //   do Statement while ParExpression ;
  //   for ( ForControl ) Statement
  //   break [Identifier] ;
  //   continue [Identifier] ;
  //   return [Expression] ;
  //   throw Expression ;
  //   synchronized ParExpression Block
  //   try Block (Catches | [Catches] Finally)
  //   try ResourceSpecification Block [Catches] [Finally]

  function parse_Statement() {

    var debug = tstart("parse_Statement");

    var o;
    var t = peek();

    // 14.2 Blocks
    // print("- 14.2");
    if (consume(Juliet.TOKEN_LCURLY)) {
      var lst = [];
      while (!consume(Juliet.TOKEN_RCURLY)) {
        o = parse_Statement();
        if (o) {
          lst.push(o);
        } else {
          throw peek().error('Bad statement.');
        }
      }
      return tend(debug, {
        kind: 'block',
        statements: lst
      });
    }

    // 14.6 Empty Statements
    // ;
    // print("- 14.6");
    if (consume(Juliet.TOKEN_SEMICOLON)) {
      return tend(debug, {
        token: t.type,
        kind: 'noop'
      })
    }

    // 14.9 IfThenStatement
    // 14.9 IfThenElseStatement
    
    // print("- 14.9");
    if (consume(Juliet.TOKEN_IF)) {
      var conditional = {
        token: t.type,
        kind: 'if',
        expression: expect(parse_ParExpression(),
                          'Expected  (.')};

      if (next_is(Juliet.TOKEN_SEMICOLON)) {
        throw t.error('Unexpected ;.');
      }

      conditional.body = parse_Statement();

      if (consume(Juliet.TOKEN_ELSE)) {
        if (next_is(Juliet.TOKEN_SEMICOLON)) {
          throw t.error('Unexpected ;.');
        }
        conditional.else_body = parse_Statement();
      }
      return tend(debug, conditional);
    }

    // 14.12 WhileStatement

    // print("- 14.12");
    if (consume(Juliet.TOKEN_WHILE)) {
      must_consume(Juliet.TOKEN_LPAREN, 'Expected (.');
      loop = {token:t.type,
              kind:'while',
              expression:parse_Expression()};
      must_consume(Juliet.TOKEN_RPAREN, 'Expected ).');
      if (next_is(Juliet.TOKEN_SEMICOLON)) {
        throw t.error('Unexpected ;.');
      }
      loop.body = parse_Statement();
      return tend(debug, loop);
    }

    // 14.13 DoStatement

    // TODO: Implement DoStatement

    // ForControl:
    //     {VariableModifier} Type Identifier {[]} : Expression
    //     {VariableModifier} Type VariableDeclarator { , VariableDeclarator } ; [Expression] ; [ForUpdate]
    //     ForInit ; [Expression] ; [ForUpdate]
    //
    // ForInit: 
    // ForUpdate:
    //     StatementExpression { , StatementExpression } 
    //
    // See Also: JLS 14.14

    // print("- 14.14");
    if (consume(Juliet.TOKEN_FOR)) {
      must_consume(Juliet.TOKEN_LPAREN, 'Expected (.');

      var modifiers = parse_Modifiers();

      var init_lst = [];
      var o_type = parse_Type();

      if (!o_type && modifiers) {
        throw peek().error('Modifiers must be applied to a type.');
      }

      if (o_type) {

        function Case1() {
          // {VariableModifier} Type Identifier {[]} : Expression
          set_mark();
          var name = parse_Identifier().name;
          if (!name) {
            clear_mark();
            return null;
          }
          while (consume(Juliet.TOKEN_LBRACKET)) {
            name += '[]';
            if (!consume(Juliet.TOKEN_RBRACKET)) {
              rewind_to_mark();
              return null;
            }
          }
          if (!consume(Juliet.TOKEN_COLON)) {
            rewind_to_mark();
            return null;
          }
          clear_mark();
          var expr = expect(parse_Expression(),
                            'Expected expression.');

          return {
            token: t.type,
            kind: 'for-each',
            name: name,
            type: o_type,
            iterable: expr,
          };
        }

        var o = Case1();
        if (o) {
          must_consume(Juliet.TOKEN_RPAREN, 'Expected ).');
          o.body = expect(parse_Statement(), 'For loop body expected.');
          return tend(debug, o);
        }

        // Case 2:
        // {VariableModifier} Type VariableDeclarator { , VariableDeclarator }

        do {
          var o = parse_VariableDeclarator();
          if (!o) {
            if (init_lst.length) {
              throw peek().error('Illegal for loop initialization.');
            }
            // Might be Case 3..
            break;
          }
          o.type = o_type;
          init_lst.push(o);
        } while(consume(Juliet.TOKEN_COMMA));
      } else {
        // Case 3:
        // ForInit

        do {
          var o = parse_StatementExpression();
          if (!o) {
            throw peek().error('Illegal for loop initialization.');
          }
          init_lst.push(o);
        } while(consume(Juliet.TOKEN_COMMA));

      }
      
      // Case 2 and Case 3:
      // ; [Expression] ; [ForUpdate]

      must_consume_semicolon();

      var condition;
      if (consume(Juliet.TOKEN_SEMICOLON)) {
        condition = {token:t.type,
                     kind:'conditional',
                     expression:true};
      } else {
        condition = expect(parse_Expression(), 'Expected expression.');
        must_consume_semicolon();
      }

      var update_lst = [];
      do {
        var o = parse_StatementExpression();
        if (!o) {
          throw peek().error('Illegal for loop initialization.');
        }
        update_lst.push(o);
      } while(consume(Juliet.TOKEN_COMMA));

      must_consume(Juliet.TOKEN_RPAREN, 'Expected ).');
      loop = {
        token: t.type,
        kind: 'for',
        initialization: init_lst,
        condition: condition,
        var_mod: update_lst
      };
      if (next_is(Juliet.TOKEN_SEMICOLON)) {
        throw t.error('Unexpected ;.');
      }
      loop.body = expect(parse_Statement(), 'Expected for loop body.');
      return tend(debug, loop);
    }

    // 14.8 ExpressionStatement

    // print("- 14.8");
    set_mark();
    o = parse_StatementExpression();
    if (next_is(Juliet.TOKEN_SEMICOLON)) {
      clear_mark();
      must_consume(Juliet.TOKEN_SEMICOLON,  'Expected ;.');
      return tend(debug, o);
    } else {
      rewind_to_mark();
    }

    // 14.10 AssertStatement

    // print("- 14.10");
    if (consume(Juliet.TOKEN_ASSERT)) {
      must_consume(Juliet.TOKEN_LPAREN, 'Expected (.');
      cmd = {
        token: t.type,
        kind: 'assert',
        expression: parse_Expression()
      };
      if (consume(Juliet.TOKEN_COMMA)) {
        if (peek().type != Juliet.LITERAL_STRING) {
          throw t.error('Expected string literal.');
        }
        cmd.message = read().content;
      }
      must_consume(Juliet.TOKEN_RPAREN, 'Expected ).');
      return tend(debug, cmd);
    }

    // 14.11 SwitchStatement

    // TODO: Implement switch statement.

    // 14.13 DoStatement

    // TODO: Implement do statement.

    // 14.15 BreakStatement

    // TODO: Implement labeled break statements.

    // print("- 14.15");

    if (consume(Juliet.TOKEN_BREAK)) {
      cmd = {
        token:t.type,
        kind:'abrupt'
      };
      //if (require_semicolon) 
      must_consume_semicolon(t);
      return tend(debug, cmd);
    }

    // 14.16 Continue Statement

    // print("- 14.16");
    // TODO: Implement labeled continues.

    if (consume(Juliet.TOKEN_CONTINUE)) {
      cmd = {
        token: t.type,
        kind: 'abrupt'
      };
      //if (require_semicolon) 
      must_consume_semicolon(t);
      return tend(debug, cmd);
    }

    // 14.17 ReturnStatement

    // print("- 14.17");

    if (consume(Juliet.TOKEN_RETURN)) {
      if (consume(Juliet.TOKEN_SEMICOLON)) {
        if (this_method && this_method.return_type) {
          throw t.error('Missing return value.');
        }
        return tend(debug, {
          token: t.type,
          kind: 'return',
          value: 'void'
        });
      }
      var expr = parse_Expression();
      must_consume_semicolon(t);
      return tend(debug, {
        token: t.type,
        kind: 'return',
        expression: expr
      });
    }

    // 14.19 SynchronizedStatement

    // TODO: Implement SynchronizedStatement

    // 14.18 ThrowStatement

    // print("- 14.18");

    if (consume(Juliet.TOKEN_THROW)) {
      if (consume(Juliet.TOKEN_SEMICOLON)) {
        throw t.error('Missing expression.');
      }
      expr = parse_Expression();
      if (!expr) throw t.error('Missing expression.');
      cmd = {
        token: t.type,
        kind: 'throw',
        expression: expr};
      //if (require_semicolon) 
      must_consume_semicolon(t);
      return tend(debug, cmd);
    }

    // 14.20 TryStatement

    // TODO: Implement TryStatement

    // StatementExpression ;
    o = concat(
      parse_StatementExpression,
      match_token(Juliet.TOKEN_SEMICOLON));
    if (o) {
      return tend(debug, o);
    }

    // Block
    if (o = parse_Block()) {
      return tend(debug, o);
    }

    return tend(debug, null);


  };

  // StatementExpression: 
  //   Expression

  function parse_StatementExpression() {
    var debug = tstart("parse_StatementExpression");
    return tend(debug, parse_Expression());
  }

/*
    var result;
    
    result = parse_Assignment();
    if (result) return result;
    
    result = parse_PreIncrementExpression();
    if (result) return result;
    
    result = parse_PreDecrementExpression();
    if (result) return result;
    
    result = parse_PostIncrementExpression();
    if (result) return result;
    
    result = parse_PostDecrementExpression();
    if (result) return result;
    
    result = parse_MethodInvocation();
    if (result) return result;
    
    result = parse_ClassInstanceCreationExpression();
    if (result) return result;
    
    return null;
  };
*/


  // 15.8 Primary Expressions
  //
  // Primary:
  //   Literal
  //   ParExpression
  //   this [Arguments]
  //   super SuperSuffix
  //   new Creator
  //   NonWildcardTypeArguments (ExplicitGenericInvocationSuffix | this Arguments)
  //   Identifier { . Identifier } [IdentifierSuffix]
  //   BasicType {[]} . class
  //   void . class
  
  //function parse_Primary() {
  //  return union(parse_PrimaryNoNewArray,
  //parse_ArrayCreationExpression);
  //}

  // PrimaryNoNewArray:
  //   Literal
  //   Type . class
  //   void . class
  //   this
  //   ClassName . this
  //   ( Expression )
  //   ClassInstanceCreationExpression
  //   FieldAccess
  //   MethodInvocation
  //   ArrayAccess

  function parse_PrimaryNoNewArray() {

    var debug = tstart("parse_PrimaryNoNewArray");

    return tend(debug, union(parse_Literal,
                 parse_ClassInstanceCreationExpression,
                 parse_MethodInvocation,
                 parse_ArrayAccess,
                 parse_FieldAccess,
                 function() {
                   // ( Expression )
                   var p = peek();
                   if (p.type == Juliet.TOKEN_LPAREN) {
                     read();
                     var expr = parse_Expression();
                     must_consume(Juliet.TOKEN_RPAREN, 'Expected ).');
                     return expr;
                   }
                   return null;
                 },
                 function() {
                   // Type . class
                   var v = concat(parse_Type,
                                  match_token(Juliet.TOKEN_PERIOD),
                                  match_token(Juliet.TOKEN_CLASS));

                   if (!v) return v;

                   return {
                     token: v[1].type,
                     kind: 'postfix',
                     operand: v[0],
                     term: v[2]
                   }
                 },
                 function() {
                   // void . class
                   var v = concat(match_token(Juliet.TOKEN_VOID),
                                  match_token(Juliet.TOKEN_PERIOD),
                                  match_token(Juliet.TOKEN_CLASS));

                   if (!v) return v;

                   return {
                     token: v[1].type,
                     kind: 'postfix',
                     operand: v[0],
                     term: v[2]
                   };
                 },
                 function() {
                   // this
                   var v = match_token(Juliet.TOKEN_THIS);

                   if (!v) return v;

                   return {
                     token: v[1].type,
                     kind: 'construct',
                     operand: v[0],
                     term: v[2]
                   };
                 },
                 function() {
                   // ClassName . this
                   var v = concat(parse_ClassName,
                                  match_token(Juliet.TOKEN_PERIOD),
                                  match_token(Juliet.TOKEN_THIS));
                   return {
                     token: v[1].type,
                     kind: 'postfix',
                     operand: v[0],
                     term: v[2]
                   };
                 }
                ));
  }

  // 15.10 Array Creation Expressions
  //
  // ArrayCreationExpression:
  //   new PrimitiveType DimExprs Dims_opt
  //   new ClassOrInterfaceType DimExprs Dims_opt
  //   new PrimitiveType Dims ArrayInitializer 
  //   new ClassOrInterfaceType Dims ArrayInitializer
  //
  // Comment: We use a simpler version of this rule and then check the constraints:
  //
  // ArrayCreationExpression:
  //   new PrimitiveType JDims ArrayInitializer
  //   new ClassOrInterfaceType JDims ArrayInitializer
  //
  // JDims:
  //   [ Expression_opt ]
  //   JDims [ Expression_opt ]

  function parse_ArrayCreationExpression() {

    var debug = tstart("parse_ArrayCreationExpression");
    set_mark();
    var t = read();
    if (t.type != Juliet.TOKEN_NEW) {
      rewind_to_mark();
      return tend(debug, null);
    }

    var array_type = union(parse_PrimitiveType,
                           parse_ClassOrInterfaceType);

    if (!array_type) {
      rewind_to_mark();
      return tend(debug, null);
    }

    var dims = [];
    while (consume(Juliet.TOKEN_LBRACKET)) {
      if (consume(Juliet.TOKEN_RBRACKET)) {
        dims.push(false);
      } else {
        var x = parse_Expression();
        if (!x) {
          return tend(debug, null);
        }
        dims.push(x);
        must_consume(Juliet.TOKEN_RBRACKET, 'Expected ] (Error#).');
      }
    }

    var init = parse_ArrayIntializer();
    
    var r = {
      token: t.type,
      kind: 'array',
      type: array_type
    };

    if (dims && dims[0]) {
      r.length = dims[0]
    }

    return tend(debug, r);

  }



  // 15.11 Field Access
  //
  // FieldAccess: 
  //     Primary . Identifier
  //     super . Identifier
  //     ClassName . super . Identifier

  var parse_FieldAccess = function() {
    
    set_mark();



  };

  // 15.12 MethodInvocation
  //
  // MethodInvocation:
  //     MethodName ( ArgumentListopt )
  //     Primary . NonWildTypeArguments_opt Identifier ( ArgumentList_opt )
  //     super . NonWildTypeArguments_opt Identifier ( ArgumentList_opt )
  //     ClassName . super . NonWildTypeArguments_opt Identifier ( ArgumentList_opt )
  //     TypeName . NonWildTypeArguments Identifier ( ArgumentList_opt )
  //
  // MethodName:
  //   Identifier
  //   AmbiguousName . Identifier
  //
  // ClassName: ???
  //   Identifier
  //   ClassName . Identifier
  //
  // TypeName:
  //   Identifier
  //   TypeName . Identifier

  var parse_MethodInvocation = function() {
    
    // MethodName JulietArguments
    set_mark();
    var name = parse_MethodName();
    if (name && next_is(Juliet.TOKEN_LPAREN)) {
      return tend(debug, {
        token: t.type,
        kind: 'construct',
        name: name,
        args: parse_Arguments()
      });
    }
    rewind();

    set_mark();
    var primary = parse_Primary();
    var identifier = parse_Identifier();
    
    // TODO!!!

  };

  // 15.14 Postfix Expressions

/*
  var parse_PostfixExpression = function() {
    var primary = parse_Primary();

  };
*/

  // 15.14.2
  //
  // PostIncrementExpression:
  //   PostfixExpression ++

  var parse_PostIncrementExpression = function() {

    var debug = tstart("parse_PostIncrementExpression");
    set_mark();
    var v = parse_PostfixExpression();

    if (v && next_is(Juliet.TOKEN_INCREMENT)) {
      clear_mark();
      var t = read();
      return tend(debug, {
        token: t.type,
        kind: 'postfix',
        operand: v
      });
    }
    rewind();
    return tend(debug, null);

  };

  // 15.14.3
  //
  // PostDecrementExpression:
  //   PostfixExpression --

  var parse_PostDecrementExpression = function() {
    var debug = tstart("parse_PostDecrementExpression");
    set_mark();
    var v = parse_PostfixExpression();

    if (v && next_is(Juliet.TOKEN_DECREMENT)) {
      clear_mark();
      var t = read();
      return tend(debug, {
        token: t.type,
        kind: 'postfix',
        operand: v
      });
    }
    rewind();
    return tend(debug, null);

  };

  // 15.15 PreIncrementExpression

  var parse_PreIncrementExpression = function() {
    
    if (next_is(Juliet.TOKEN_INCREMENT)) {
      var t = read();
      return {
        token: t.type,
        kind: 'prefix',
        operand: parse_UnaryExpression()
      };
    }
    return null;

  };

  // 15.15 PreDecrementExpression

  var parse_PreDecrementExpression = function() {
    
    if (next_is(Juliet.TOKEN_DECREMENT)) {
      var t = read();
      return {
        token: t.type,
        kind: 'prefix',
        operand: parse_UnaryExpression()
      };
    }
    return null;

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
  

  // Expression:
  //   Expression1 [AssignmentOperator Expression1]

  function parse_Expression() {
    var debug = tstart("parse_Expression");

    var a = parse_Expression1();
    if (!a) return tend(debug, null);

    var b = parse_AssignmentOperator();
    if (!b) return tend(debug, a);

    var c = expect(parse_Expression1(),
                   'Expected expression.');

    return tend(debug, {
      token: b.type,
      kind: 'assignment',
      location: a, // TODO: rename location to leftHandSide
      new_value: c // TODO: rename new_value to AssignmentExpression
    });
    
  }

  // AssignmentOperator: one of
  //   = *= /= %= += -= <<= >>= >>>= &= ^= |=

  function parse_AssignmentOperator() {
    var debug = tstart("parse_AssignmentOperator");
    var t = peek();
    if (consume(Juliet.TOKEN_ASSIGN)      ||
	consume(Juliet.TOKEN_ADD_ASSIGN)  ||
	consume(Juliet.TOKEN_SUB_ASSIGN)  ||
	consume(Juliet.TOKEN_MUL_ASSIGN)  ||
	consume(Juliet.TOKEN_DIV_ASSIGN)  ||
	consume(Juliet.TOKEN_MOD_ASSIGN)  ||
	consume(Juliet.TOKEN_AND_ASSIGN)  ||
	consume(Juliet.TOKEN_OR_ASSIGN)   ||
	consume(Juliet.TOKEN_XOR_ASSIGN)  ||
	consume(Juliet.TOKEN_SHL_ASSIGN)  ||
	consume(Juliet.TOKEN_SHRX_ASSIGN) ||
	consume(Juliet.TOKEN_SHR_ASSIGN)) {
      return tend(debug, t);
    }
    return tend(debug, null);
  }

  // Expression1: 
  //   Expression2 [Expression1Rest]
  //
  // Expression1Rest: 
  //   ? Expression : Expression1
  //
  // See Also: 15.25 Conditional Operator
  //
  // ConditionalExpression === Expression1

  function parse_Expression1() {
    var debug = tstart("parse_Expression1");

    var expr = parse_ConditionalOrExpression();

    var t = peek();

    if (consume(Juliet.TOKEN_QUESTIONMARK)) {
      var true_value = parse_Expression();
      must_consume(Juliet.TOKEN_COLON, 'Expected :.');
      var false_value = parse_Expression1();

      return tend(debug, {
        token: t.type,
	kind: 'ternary',
	expression: expr,
	true_value: true_value,
	false_value: false_value});
    };
    return tend(debug, expr);
  }


/*
  var parse_ConditionalExpression = function() {

    if (Juliet.options.trace) print('parse_ConditionalExpression');

    var expr = parse_ConditionalOrExpression();

    var t = peek();

    if (consume(Juliet.TOKEN_QUESTIONMARK)) {
      var true_value = parse_ConditionalExpression();
      must_consume(Juliet.TOKEN_COLON, 'Expected :.');
      var false_value = parse_ConditionalExpression();

      return {token: t.type,
	      kind: 'ternary',
	      expression: expr,
	      true_value: true_value,
	      false_value: false_value};
    }
    return expr;
  };
*/

  var parse_ConditionalOrExpression = function(lhs) {

    var debug = tstart("parse_ConditionalOrExpression");

    // 15.24 Conditional Or

    if (lhs === undefined)
      return tend(debug, parse_ConditionalOrExpression(parse_ConditionalAndExpression()));
    
    var t = peek();
    if (consume(Juliet.TOKEN_LOGICAL_OR))
      return tend(debug, parse_ConditionalOrExpression({token: t.type,
					    kind: 'binary',
					    lhs: lhs,
					    rhs: parse_ConditionalAndExpression()}));

    return tend(debug, lhs);
  };


  var parse_ConditionalAndExpression = function(lhs) {

    // 15.23 Conditional And
    var debug = tstart("parse_ConditionalAndExpression");

    if (lhs === undefined)
      return tend(debug, parse_ConditionalAndExpression(parse_InclusiveOrExpression()));

    var t = peek();
    if (consume(Juliet.TOKEN_LOGICAL_AND))
      return tend(debug, parse_ConditionalAndExpression({token: t.type,
					     kind: 'binary',
					     lhs: lhs,
					     rhs: parse_InclusiveOrExpression()}));

    return tend(debug, lhs);
  };


  var parse_InclusiveOrExpression = function(lhs) {
    
    // 15.22 InclusiveOrExpression
    
    var debug = tstart('parse_InclusiveOrExpression');
    
    if (lhs === undefined)
      return tend(debug, parse_InclusiveOrExpression(parse_ExclusiveOrExpression()));

    var t = peek();
    if (consume(Juliet.TOKEN_PIPE))
      return tend(debug, parse_InclusiveOrExpression({token: t.type,
					  kind: 'binary',
					  lhs: lhs,
					  rhs: parse_ExclusiveOrExpression()}));
    
    return tend(debug, lhs);
  };
  
  function parse_ExclusiveOrExpression(lhs) {
    
    var debug = tstart("parse_ExclusiveOrExpression");
    // 15.22 ExclusiveOrExpression
    
    if (lhs === undefined)
      return tend(debug, parse_ExclusiveOrExpression(parse_AndExpression()));
    
    var t = peek();
    if (consume(Juliet.TOKEN_CARET))
      return tend(debug, parse_ExclusiveOrExpression({token: t.type,
					  kind: 'binary',
					  lhs: lhs,
					  rhs: parse_AndExpression()}));
    
    return tend(debug, lhs);
  };
  

  var parse_AndExpression = function(lhs) {

    // 15.22 AndExpression

    var debug = tstart('parse_AndExpression');

    if (lhs === undefined)
      return tend(debug, parse_AndExpression(parse_EqualityExpression()));

    var t = peek();
    if (consume(Juliet.TOKEN_AMPERSAND))
      return tend(debug, parse_AndExpression({token: t.type,
				  kind: 'binary',
				  lhs: lhs,
				  rhs: parse_EqualityExpression()}));
    
    return tend(debug, lhs);
  };


  // ==, !=
  var parse_EqualityExpression = function(lhs) {

    var debug = tstart("parse_EqualityExpression");

    // 15.21 EqualityExpression
    
    if (lhs === undefined)
      return tend(debug, parse_EqualityExpression(parse_RelationalExpression()));

    var t = peek();

    if (consume(Juliet.TOKEN_EQ))
      return tend(debug, parse_EqualityExpression({token:t.type,
				       kind:'binary',
				       lhs:lhs,
				       rhs:parse_RelationalExpression()}));

    if (consume(Juliet.TOKEN_NE))
      return tend(debug, parse_EqualityExpression({token:t.type,
				       kind:'binary',
				       lhs:lhs,
				       rhs:parse_RelationalExpression()}));

    return tend(debug, lhs);
  };


  // <<, >>, >>>
  var parse_ShiftExpression = function(lhs) {

    // 15.19 Shift Operators

    var debug = tstart('parse_ShiftExpression');

    if (lhs === undefined) return tend(debug, parse_ShiftExpression(parse_AdditiveExpression()));

    var t = peek();

    if (consume(Juliet.TOKEN_SHL) ||
	consume(Juliet.TOKEN_SHR) ||
	consume(Juliet.TOKEN_SHRX))
      return tend(debug, parse_ShiftExpression({token: t.type,
				    kind: 'binary',
				    lhs: lhs,
				    rhs: parse_AdditiveExpression()}));
    return tend(debug, lhs);
  };


  // <, <=, >, >=, instanceof
  function parse_RelationalExpression(lhs) {
    
    // 15.20 Relational Operators
    var debug = tstart('parse_RelationalExpression');

    if (lhs === undefined)
      return tend(debug, parse_RelationalExpression(parse_ShiftExpression()));

    var t = peek();

    if (consume(Juliet.TOKEN_LT) ||
	consume(Juliet.TOKEN_LE) ||
	consume(Juliet.TOKEN_GT) ||
	consume(Juliet.TOKEN_GE))
      return tend(debug, parse_RelationalExpression({token: t.type,
					 kind: 'binary',
					 lhs: lhs,
					 rhs: parse_ShiftExpression()}));

    if (consume(Juliet.TOKEN_INSTANCEOF)) {
      var rhs = parse_Type();
      rhs.kind = 'type';
      return tend(debug, parse_RelationalExpression({token: t.type,
					 kind: 'binary',
					 lhs: lhs,
					 rhs: rhs}));
    }
    return tend(debug, lhs);
  };


  // +, -
  function parse_AdditiveExpression(lhs) {
    
    var debug = tstart('parse_AdditiveExpression');
    if (lhs === undefined)
      return tend(debug, parse_AdditiveExpression(parse_MultiplicativeExpression()));
    
    var t = peek();
    
    if (consume(Juliet.TOKEN_PLUS) ||
	consume(Juliet.TOKEN_MINUS))
      return tend(debug, parse_AdditiveExpression({token: t.type,
				       kind: 'binary',
				       lhs: lhs,
				       rhs: parse_MultiplicativeExpression()}));
    
    return tend(debug, lhs);
  };


  // *, /
  function parse_MultiplicativeExpression(lhs) {

    // 15.17 Multiplicative Operators

    var debug = tstart('parse_MultiplicativeExpression');
    
    if (lhs === undefined)
      return tend(debug, parse_MultiplicativeExpression(parse_UnaryExpression()));

    var t = peek();
    
    if (consume(Juliet.TOKEN_STAR) ||
	consume(Juliet.TOKEN_SLASH) ||
	consume(Juliet.TOKEN_PERCENT))
      return tend(debug, parse_MultiplicativeExpression({token: t.type,
					     kind: 'binary',
					     lhs: lhs,
					     rhs: parse_UnaryExpression()}));
    
    return tend(debug, lhs);
  };

  // (cast), new, ++, --, +, -, !, ~
  var parse_UnaryExpression = function() {
    
    // 15.15 Unary Expressions
    var debug = tstart('parse_UnaryExpression');
    
    var t = peek();
    var to_type = null;
    var result = null;
    var of_type = null;
    var args = null;

    if (next_is(Juliet.TOKEN_LPAREN)) {
      // MIGHT have a cast
      set_mark();
      read();
      if (next_is([Juliet.TOKEN_ID,
                   Juliet.TOKEN_CHAR,
                   Juliet.TOKEN_BYTE,
                   Juliet.TOKEN_SHORT,
                   Juliet.TOKEN_INT,
                   Juliet.TOKEN_LONG,
                   Juliet.TOKEN_FLOAT,
                   Juliet.TOKEN_DOUBLE,
                   Juliet.TOKEN_STRING,
                   Juliet.TOKEN_BOOLEAN])) {
	// Casts are ambiguous syntax - assume this is indeed a cast and
	// just try it.
        var len = tstack.length;
        try {
	  to_type = parse_Type();
          to_type.kind = 'type';
          
	  must_consume(Juliet.TOKEN_RPAREN, 'Expected ).');
	  result = {
            token: t.type,
	    kind: 'cast',
	    operand: parse_UnaryExpression(),
	    to_type: to_type
          };
	  clear_mark();
	  return tend(debug, result);
        } catch (e) {
	  // Didn't work, not a cast - just proceed.
          while (tstack.length > len) {
            tstack.pop();
          }
	}
      }
      rewind_to_mark();
    }

    var o = parse_Creator();
    if (o) return tend(debug, o);

    if (consume(Juliet.TOKEN_INCREMENT) ||
	consume(Juliet.TOKEN_DECREMENT) ||
	consume(Juliet.TOKEN_MINUS) ||
	consume(Juliet.TOKEN_BANG) ||
	consume(Juliet.TOKEN_TILDE))
      return tend(debug, {token: t.type,
	      kind: 'prefix',
	      operand: parse_UnaryExpression()});

    // discard '+a' and just keep 'a'.
    if (consume(Juliet.TOKEN_PLUS))
      return tend(debug, parse_UnaryExpression());

    return tend(debug, parse_PostfixUnary());
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
        dim_expr.push(parse_Expression());
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
  function parse_PostfixUnary(operand) {
    var debug = tstart("parse_PostfixUnary");

    var op_type = null;
    var new_name = '';
    var index = null;
    if (operand === undefined)
      return tend(debug, parse_PostfixUnary(parse_Primary()));
    var t = peek();
    if (consume(Juliet.TOKEN_INCREMENT)) {
      return tend(debug, parse_PostfixUnary({token:t.type,
                                  kind:'postfix',
                                  operand:operand}));
    } else if (consume(Juliet.TOKEN_DECREMENT)) {
      return tend(debug, parse_PostfixUnary({token:t.type,
                                  kind:'postfix',
                                  operand:operand}));
    } else if (consume(Juliet.TOKEN_PERIOD)) {
      cmd = parse_PostfixUnary({token:t.type,
                                 kind:'postfix',
                                 operand:operand,
                                 term:parse_Primary()});
      return tend(debug, cmd);
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
        return tend(debug, parse_local_var_decl(t,
                                    {token:op_type.token,
                                     name:new_name},
                                    false));
      } else {
        index = parse_Expression();
        must_consume(Juliet.TOKEN_RBRACKET, 'Expected ] (Error4).');
        return tend(debug, parse_PostfixUnary({token:t.type,
                                    kind:'postfix',
                                    operand:operand,
                                    expression:index}));
      }
    } else if (next_is(Juliet.TOKEN_LPAREN)) {

      cmd = parse_PostfixUnary({token: t.type,
                                 kind: 'call',
                                 operand: operand,
                                 args: parse_Arguments()});
      return tend(debug, cmd);

    }

    return tend(debug, operand);
  };

  var parse_construct = function() {
    if (Juliet.options.trace) print('parse_construct');
    var t = peek();
    var name = '';
    var type = null;
    var args = null;

    set_mark();
    try {
      type = parse_Type(true);
      name = type.name;
      clear_mark();
    } catch (e) {
      rewind_to_mark();
      name = must_read_id('Identifier expected.');
    }

    if (name[name.length - 1] != '>') args = parse_Arguments();

    if (args == null) return {token:t.type,
                              kind:'construct',
                              name:name};

    return {token:t.type,
            kind:'construct',
            name:name,
            args:args};
  };


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
          terms.push(parse_Expression());
        }
      }
      must_consume(Juliet.TOKEN_RCURLY, 'Expected , or }.');
    }

    return {token:t.type,
            kind:'array',
            type:of_type,
            terms:terms};
  }

  // Primary:
  //   Literal
  //   ParExpression
  //   this [Arguments]
  //   super SuperSuffix
  //   new Creator
  //   NonWildcardTypeArguments (ExplicitGenericInvocationSuffix | this Arguments)
  //   Identifier { . Identifier } [IdentifierSuffix]
  //   BasicType {[]} . class
  //   void . class
  //
  // See Also: 15.8 Primary Expressions

  function parse_Primary() {

    var debug = tstart("parse_Primary");

    var t;

    // Literal
    // print("Primary: Literal");
    o = parse_Literal();
    if (o) return tend(debug, o);

    // ParExpression
    // print("Primary: ParExpression");
    o = parse_ParExpression();
    if (o) return tend(debug, o);

    // this [Arguments]
    // print("Primary: this");
    if (consume(Juliet.TOKEN_THIS)) {
      t = peek();

      p = parse_Arguments();
      if (!p) return tend(debug, {
        token: t.type,
        kind: 'construct',
        name: 'this'
      });

      return tend(debug, {
        token: t.type,
        kind: 'construct',
        name: 'this',
        args: p
      });
    }

    // print("Primary: super");
    // super SuperSuffix
    o = parse_SuperWithSuffix();
    if (o) return tend(debug, o);

    // print("Primary: creator");
    // new Creator
    o = parse_Creator();
    if (o) return tend(debug, o);

    // NonWildcardTypeArguments (ExplicitGenericInvocationSuffix | this Arguments)
    //o = parse_NonWildcardTypeArguments();
    //if (o) return o;

    // print("Primary: identifier");
    // Identifier { . Identifier } [IdentifierSuffix]
    t = peek();
    expr = parse_Identifier();
    if (expr) {
      //???
      return tend(debug, expr);

      t = peek();
      while (consume(Juliet.TOKEN_PERIOD)) {
        var ext = expect(parse_Identifier(), 'Illegal identifier.');
        expr = {
          token: t.type, 
          kind:'postfix',
          operand: expr,
          term: ext
        };
      }

      // IdentifierSuffix:
      //   [ ({[]} . class | Expression) ]
      //   Arguments 
      //   . (class | ExplicitGenericInvocation | this | super Arguments |
      //                               new [NonWildcardTypeArguments] InnerCreator)
      
      t = peek();
      if (next_is(Juliet.TOKEN_LPAREN)) {
        return tend(debug, {
          token: t.type,
          kind: 'call',
          operand: expr,
          args: expect(parse_Arguments(), 'Illegal argument list.'),
        });
      }

      return tend(debug, expr);
    }

    //   new Creator
    //   NonWildcardTypeArguments (ExplicitGenericInvocationSuffix | this Arguments)
    //   BasicType {[]} . class
    //   void . class

    

    return tend(debug, null);

/*
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
      t = read();
    }
*/

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

  // Literal:
  //     IntegerLiteral
  //     FloatingPointLiteral
  //     BooleanLiteral
  //     CharacterLiteral
  //     StringLiteral
  //     NullLiteral
  //
  // See Also: 15.8.1 Lexical Literals
  
  function parse_Literal() {
    var p = peek();
    if (!p) return null;

    switch (p.type) {
    case Juliet.LITERAL_INT:
    case Juliet.LITERAL_LONG:
    case Juliet.LITERAL_FLOAT:
    case Juliet.LITERAL_DOUBLE:
    case Juliet.LITERAL_BOOLEAN:
    case Juliet.LITERAL_CHAR:
    case Juliet.LITERAL_STRING:
    case Juliet.TOKEN_NULL:
      t = read();
      return {
        token: t.type,
        kind: 'literal',
        value: t.content
      };
    }
    return null;
  };

  // ParExpression: 
  //   ( Expression )

  function parse_ParExpression() {
    if (!consume(Juliet.TOKEN_LPAREN)) {
      return null;
    }
    var expr = expect(parse_Expression(),
                      'Expected expression.');
    must_consume(Juliet.TOKEN_RPAREN, 'Expected ).');
    return expr;
  }

  // Arguments:
  //   ( [ Expression { , Expression } ] )

  function parse_Arguments() {
    if (!consume(Juliet.TOKEN_LPAREN)) {
      return null;
    }

    var lst = [];

    if (consume(Juliet.TOKEN_RPAREN)) return lst;

    do {
      lst.push(parse_Expression());
    } while(consume(Juliet.TOKEN_COMMA));
    must_consume(Juliet.TOKEN_RPAREN, 'Expected ).');

    return lst;
  }

  // SuperSuffix: 
  //  Arguments 
  //  . Identifier [Arguments]
  //
  // Comment: Our version includes super:
  //
  // SuperWithSuffix: 
  //   super Arguments 
  //   super . Identifier [Arguments]

  function parse_SuperWithSuffix() {
    var t = peek();

    if (!consume(Juliet.TOKEN_SUPER)) {
      return null
    }

    if (peek().type == Juliet.TOKEN_LPAREN) {
      if (this_method && !is_constructor(this_method)) {
        throw t.error('Use "super.methodname" to call superclass method.');
      }
      if (this_method && this_method.statements) {
        if (this_method.statements.length) {
          throw t.error('Call to superclass constructor must be the first statement.');
        }
      }
      args = expect(parse_Arguments(),
                    'Expected (.');
      
      if (this_method)
        this_method.calls_super_constructor = true;
      
      return {
        token: t.type,
        kind: 'super',
        args: args
      };
    } else {
      must_consume(Juliet.TOKEN_PERIOD, 'Expected ".".');
      name = must_read_id('Expected method or property name.');
      args = parse_Arguments();
      return {
        token: t.type,
        kind: 'super',
        name: name,
        args: args};
    }
  }

  // Creator:
  //   new NonWildcardTypeArguments{0,1} CreatedName Arguments [ClassBody]
  //   new CreatedName DimExprs Dims{0,1}
  //   new CreatedName Dims ArrayInitializer{0,1}
  //
  // CreatedName:
  //   BasicType
  //   ReferenceType
  //
  // The Chapter 18 Creator definition may have some typos with
  // respect to creating arrays (and is just confusing).  This is my
  // definition based on 15.10.

  function parse_Creator() {

    var debug = tstart("parse_Creator()");

    var t = peek();
    if (!consume(Juliet.TOKEN_NEW)) {
      return tend(debug, null);
    }

    set_mark();
    var a = parse_NonWildcardTypeArguments();

    var CreatedName = union(
      parse_BasicType,
      parse_ReferenceType);

    if (!CreatedName) {
      rewind_to_mark();
      return tend(debug, null);
    }

    var obj = {
      token: t.type,
      kind: 'new',
      type: CreatedName,
    };

    var Arguments = parse_Arguments();

    if (Arguments) {

      obj.args = Arguments;

      if (next_is(Juliet.TOKEN_LBRACE)) {
        obj.body = parse_ClassBody();
      }

      return tend(debug, obj);
    }

    // print("looking at dims..");
    
    var DimExprs = parse_DimExprs();
    var Dims = parse_Dims();
    var ArrayInitializer = parse_ArrayInitializer();

    // Now check if any of that makes sense!
    if (DimExprs.length > 0 && ArrayInitializer) {
      throw t.error('Can\'t have both dimension expressions and an array initializer.');
    }
    if (!ArrayInitializer && DimExprs.length == 0) {
      throw t.error('Unspecified outer dimension.');
    }

    return tend(debug, {
      token: t.type,
      kind: 'array',
      type: CreatedName,
      length: DimExprs
    });

  }

  ////////////////////

  return {
    init: function () {

    },
    
    parse: function () {
      if (Juliet.options.trace) print('parse');
      Juliet.parser._type_names = [];

      Juliet.AST.package = null;
      Juliet.AST.imports = [];

      parse_CompilationUnit();

      var ret = Juliet.parser._type_names;
      delete Juliet.parser._type_names;
      return ret;
    },

    /*
     * Used for testing the parser.
     */
    parseStatement: function() {
      tstack = [];
      return parse_Statement();
    },

    parseBlockStatement: function() {
      tstack = [];
      return parse_BlockStatement();
    },

    parseExpression: function() {
      tstack = [];
      return parse_Expression();
    },

    parseTypeDeclaration: function() {
      tstack = [];
      return parse_TypeDeclaration();
    }

  };
}();
