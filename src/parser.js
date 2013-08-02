// http://docs.oracle.com/javase/specs/jls/se7/html/jls-18.html
// http://docs.oracle.com/javase/specs/jls/se7/html/index.html

Juliet.parser = function() {

  function hasAnother() {
    if (peek() == null) return false;
    return (peek().type != Juliet.TOKEN_EOF);
  }

  function read() {
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
  }

  function peek(num_ahead) {
    var t = null;
    if (num_ahead !== undefined) {
      if (num_ahead <= 1) return peek();

      setMark();
      while (--num_ahead) read();
      t = peek();
      rewindMark();
      return t;
    }

    var len = Juliet.lexer.pending.length;
    if (len) {
      return Juliet.lexer.pending[len - 1];
    } else if (Juliet.lexer.tokenize() == false) {
      return null;
    }

    return peek();
  }

  function setMark() {
    Juliet.lexer.marks.push(0);
  }

  function clearMark() {
    Juliet.lexer.marks.pop();
  }

  function rewindMark() {
    var depth = Juliet.lexer.marks.pop();
    for (var i = 0; i < depth; i++) {
      Juliet.lexer.pending.push(Juliet.lexer.processed.pop());
    }
  }

  function nextIs(token_type) {
    var t = peek();

    if (Juliet.util.isArray(token_type) && t) {
      return token_type.some(function(tok) {
        return this == tok;
      },t.type);
    }

    return (t) ? (t.type == token_type) : false;
  }

  function consume(token_type) {
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
  }

  function mustConsume(token_type, error_message) {
    if (consume(token_type)) return;
    throw new Error(error_message);
  }

  // We use this function to handle the ambiguities between:
  // > Juliet.TOKEN_GT
  // >> Juliet.TOKEN_SHR
  // >>> Juliet.TOKEN_SHRX
  //
  // in the case of type arguments.  We do this by borrowing '>' from
  // the >> or >>>.  Note that trying to setMark or rewind during a
  // borrow may lead to odd/wrong results.

  function mustConsumeGT() {
    if (consume(Juliet.TOKEN_GT)) {
      return;
    }
    if (nextIs(Juliet.TOKEN_SHR)) {
      var t = peek();
      if (t.borrow == 1) {
        t.borrow = 0;
        read();
      } else {
        t.borrow = 1;
      }
      return;
    }
    if (nextIs(Juliet.TOKEN_SHRX)) {
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
  }

  function mustConsumeSemicolon() {
    var t = peek();
    if (!consume(Juliet.TOKEN_SEMICOLON)) {
      throw t.error('Syntax error: expected ;.');
    }
  }

  function mustReadId(error_message) {
    var t = peek();
    var result = '';

    if (t.type != Juliet.TOKEN_ID) {
      throw t.error(error_message);
    }

    result = read().content;
    return result;
  }

  function union() {
    for (var i = 0; i < arguments.length; i++) {
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
    setMark();
    for (var i = 0; i < arguments.length; i++) {
      var v = arguments[i]();
      if (!v) {
        rewindMark();
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

  function matchToken(v) {
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
      var spaces = new Array(tstack.length * 4 + 1).join(' ');
      print(spaces + 'BEGIN: ' + name);
    }
    tstack.push(name);
    return name;
  }

  function tend(td, result) {
    var name = tstack.pop();
    if (name != td) {
      s = '';
      for (var i = 0; i < tstack.length; i++) {
        s += ' : ' + tstack[i];
      }
      if (Juliet.options.trace)
        print(s);
      throw 'Error: Expecting ' + td + ' but found  ' + name + ' on the stack.';
    }
    if (Juliet.options.trace) {
      var spaces = new Array(tstack.length * 4 + 1).join(' ');
      print(spaces + 'END: ' + name + ' => ' + result);
    }
    return result;
  }

  // Identifier:
  //   IDENTIFIER

  function parse_Identifier() {
    var t = peek();
    if (!t) {
      return null;
    }
    if (consume(Juliet.TOKEN_ID)) {
      return {
        token: t.type,
        kind: 'id',
        name: t.content
      };
    }
    return null;
  }

  // QualifiedIdentifier:
  //   Identifier (. Identifier){0,*}

  function parse_QualifiedIdentifier() {
    if (!nextIs(Juliet.TOKEN_ID)) {
      return null;
    }
    var lst = [parse_Identifier()];
    while (consume(Juliet.TOKEN_PERIOD)) {
      lst.push(expect(parse_Identifier(), 'Expected identifier.'));
    }
    return lst;
  }

  // QualifiedIdentifierList:
  //   QualifiedIdentifier (, QualifiedIdentifier){0,*}

  function parse_QualifiedIdentifierList() {
    var identifiers = [parse_QualifiedIdentifier()];
    while (consume(Juliet.TOKEN_COMMA)) {
      identifiers.push(expect(parse_QualifiedIdentifier(),
                              'Expected identifier.'));
    }
    return identifiers;
  }

  // CompilationUnit:
  //   PackageDeclaration{0,1} ImportDeclarations{0,*} TypeDeclaration{0,*}
  //
  // See Also JLS 7.3

  function parse_CompilationUnit() {

    var unit = {
      package: null,
      imports: [],
      types: []
    };

    if (_ast = parse_PackageDeclaration()) {
      unit.package = _ast;
    }

    if (unit.package == null) {
      unit.package = [{
        name: '$default',
        token: null,
        kind: 'id'}];
    }

    while (_ast = parse_ImportDeclaration()) {
      unit.imports.push(_ast);
    }

    while (_ast = parse_TypeDeclaration()) {
      unit.types.push(_ast);
    }

    if (hasAnother()) {
      throw peek().error('class, interface, or enum expected.');
    }

    return unit;

  }

  // PackageDeclaration:
  //   Annotation{0,*} package QualifiedIdentifier ;
  //
  // See Also JLS 7.4

  function parse_PackageDeclaration() {

    var t = peek();
    if (!consume(Juliet.TOKEN_PACKAGE)) {
      return null;
    }

    var name = expect(parse_QualifiedIdentifier(),
                      'Expected identifier.');

    mustConsumeSemicolon();

    return name;
  }

  // ImportDeclaration:
  //   import static{0,1} Identifier (.Identifier){0,*} (.*){0,1}
  //
  // See Also JLS 7.5

  function parse_ImportDeclaration() {

    var t = peek();
    if (!consume(Juliet.TOKEN_IMPORT)) {
      return null;
    }

    if (consume(Juliet.TOKEN_STATIC)) {
      // TODO: We shouldn't ignore handle static package imports.
    }

    var name = [expect(parse_Identifier(), ('Expected package or type name.'))];
    while (consume(Juliet.TOKEN_PERIOD)) {
      var t2 = peek();
      if (consume(Juliet.TOKEN_STAR)) {
        name.push({
          name: '*',
          token: t2.type,
          kind: 'id'
        });
        break;
      }
      name.push(expect(parse_Identifier(), 'Expected identifier.'));
    }

    mustConsumeSemicolon();

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
  // See Also JLS 7.6.

  function parse_TypeDeclaration() {
    return parse_ClassOrInterfaceDeclaration();
  }

  // ClassOrInterfaceDeclaration:
  //   Modifier{0,*} ClassDeclaration
  //   Modifier{0,*} InterfaceDeclaration

  function parse_ClassOrInterfaceDeclaration() {

    var debug = tstart('parse_ClassOrInterfaceDeclaration');

    var modifiers = parse_Modifiers();

    var type = union(parse_ClassDeclaration,
                     parse_InterfaceDeclaration);

    if (!type) return tend(debug, null);

    type.modifiers |= modifiers;

    if ((type.modifiers & (Juliet.MODIFIER_PUBLIC |
                           Juliet.MODIFIER_PROTECTED |
                           Juliet.MODIFIER_PRIVATE)) == 0) {
      type.modifiers |= Juliet.MODIFIER_PROTECTED;
    }

    return tend(debug, type);
  }

  // ClassDeclaration:
  //   NormalClassDeclaration
  //   EnumDeclaration

  function parse_ClassDeclaration() {
    var debug = tstart('parse_ClassDeclaration');
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
    var debug = tstart('parse_InterfaceDeclaration');
    return tend(debug, union(parse_NormalInterfaceDeclaration,
                             parse_AnnotationTypeDeclaration));
  }

  // NormalClassDeclaration:
  //   class Identifier TypeParameters{0,1} (extends Type){0,1}
  //     (implements TypeList){0,1} ClassBody

  function parse_NormalClassDeclaration() {
    var debug = tstart('parse_NormalClassDeclaration');

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
      interfaces: [],
      superclass: null
    };

    var name = expect(parse_Identifier(),
                      'Expected class name.');
    type.name = name.name;

    var typeParameters = parse_TypeParameters();

    if (typeParameters) {
      type.parameters = typeParameters;
    }

    if (consume(Juliet.TOKEN_EXTENDS)) {
      type.superclass = expect(parse_Type(),
                               'Expected class type to extend.');
    }

    if (consume(Juliet.TOKEN_IMPLEMENTS)) {
      type.interfaces = parse_TypeList();
    }

    parse_ClassBody(type);

    return tend(debug, type);
  }

  // EnumDeclaration:
  //   enum Identifier (implements TypeList){0,1} EnumBody

  function parse_EnumDeclaration() {
    var debug = tstart('parse_EnumDeclaration');

    var t = peek();
    if (!consume(Juliet.TOKEN_ENUM)) {
      return tend(debug, null);
    }

    var type = {
      token: t.type,
      kind: 'definition',
      members: [],
      interfaces: [],
      superclass: null
    };

    type.name = expect(parse_Identifier(),
                       'Expected enum name.');

    if (consume(Juliet.TOKEN_IMPLEMENTS)) {
      type.interfaces = parse_TypeList();
    }

    type.body = expect(parse_EnumBody(),
                       'Expected enum body.');

    return tend(debug, type);

  }

  // NormalInterfaceDeclaration:
  //   interface Identifier (TypeParameters){0,1} (extends TypeList){0,1}
  //     InterfaceBody

  function parse_NormalInterfaceDeclaration() {
    var debug = tstart('parse_NormalInterfaceDeclaration');
    var t = peek();
    if (!consume(Juliet.TOKEN_INTERFACE)) {
      return tend(debug, null);
    }

    var type = {
      token: t.type,
      kind: 'definition',
      members: [],
      interfaces: [],
      superclass: null
    };

    type.name = expect(parse_Identifier(),
                       'Expected interface name.');

    if (consume(Juliet.TOKEN_IMPLEMENTS)) {
      type.interfaces = parse_TypeList();
    }

    type.body = expect(parse_InterfaceBody(),
                       'Expected interface body.');

    return tend(debug, type);
  }

  // AnnotationTypeDeclaration:
  //   @ interface Identifier AnnotationTypeBody

  function parse_AnnotationTypeDeclaration() {
    var debug = tstart('parse_AnnotationTypeDeclaration');
    // TODO: Implement parse_AnnotationTypeDeclaration
    return tend(debug, null);
  }

  // Type:
  //   BasicType ([]){0,*}
  //   ReferenceType ([]){0,*}

  function parse_Type() {
    var debug = tstart('parse_Type');
    var v = union(parse_BasicType,
                  parse_ReferenceType);

    if (!v) return tend(debug, null);

    while (consume(Juliet.TOKEN_LBRACKET)) {
      v.name += '[]';
      mustConsume(Juliet.TOKEN_RBRACKET, 'Expected ].');
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
        kind: 'basic_type',
        name: t.content
      };
    }
    return null;
  }

  // VoidType:
  //   void

  function parse_VoidType() {
    var t = peek();
    if (consume(Juliet.TOKEN_VOID)) {
      return {
        token: t.type,
        kind: 'basic_type',
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
      };
    }

    setMark();

    var name = '';
    var i = 0;
    do {

      var id = parse_Identifier();
      if (!id) {
        rewindMark();
        return null;
      }
      if (i > 0) name += '.';
      name += id.name;
      i++;

      var ta = parse_TypeArguments();
      if (ta) {
        name += '<';
        for (var i = 0; i < ta.length; i++) {
          if (i != 0) name += ',';
          name += ta[i].name;
        }
        name += '>';
      }
    } while (consume(Juliet.TOKEN_PERIOD));

    clearMark();
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
    mustConsumeGT();
    return lst;
  }

  // TypeArgument:
  //   ReferenceType
  //   ? extends ReferenceType
  //   ? super ReferenceType
  //   ?

  function parse_TypeArgument() {
    var t = peek();
    var prefix = '';
    if (consume(Juliet.TOKEN_QUESTIONMARK)) {
      if (consume(Juliet.TOKEN_EXTENDS)) {
        prefix = '? extends ';
      } else if (consume(Juliet.TOKEN_SUPER)) {
        prefix = '? super ';
      } else {
        return {
          token: t.type,
          kind: 'type',
          name: '?'
        };
      }
    }
    var o = parse_ReferenceType();
    if (!o && prefix != '') {
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
    mustConsumeGT();
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
    setMark();
    if (consume(Juliet.TOKEN_LT) &&
        consume(Juliet.TOKEN_GT)) {
      clearMark();
      return [];
    }
    rewindMark();
    return parse_TypeArguments();
  }

  // NonWildcardTypeArgumentsOrDiamond:
  //   < >
  //   NonWildcardTypeArguments

  function parse_NonWildcardTypeArgumentsOrDiamond() {
    setMark();
    if (consume(Juliet.TOKEN_LT) &&
        consume(Juliet.TOKEN_GT)) {
      clearMark();
      return [];
    }
    rewindMark();
    return parse_NonWildcardTypeArguments();
  }

  // TypeParameters:
  //   < TypeParameter (, TypeParameter){0,*} >

  function parse_TypeParameters() {
    var debug = tstart('parse_TypeParameters');

    if (!consume(Juliet.TOKEN_LT)) {
      return tend(debug, null);
    }
    var lst = [expect(parse_TypeParameter(),
                      'Expected type parameter.')];
    while (consume(Juliet.TOKEN_COMMA)) {
      lst.push(expect(parse_ReferenceType(),
                      'Expected type.'));
    }
    mustConsumeGT();
    return tend(debug, lst);
  }

  // TypeParameter:
  //   Identifier [extends Bound]
  //
  // Bound:
  //   ReferenceType (& ReferenceType){0,*}

  function parse_TypeParameter() {
    var debug = tstart('parse_NormalClassDeclaration');
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
  // Comment: Interface and Class modifiers differ only in the 'final'
  //   keyword. We check that interfaces don't have this keyword in
  //   parse_TypeDeclaration() after we call this function and after
  //   we determine if we are parsing a class or an interface.
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
        if (modifiers & (Juliet.MODIFIER_PROTECTED |
                         Juliet.MODIFIER_PRIVATE)) {
          throw t.error('Cannot be public if protected or private.');
        }
        continue;
      }

      if (consume(Juliet.TOKEN_PROTECTED)) {
        if (modifiers & Juliet.MODIFIER_PROTECTED) {
          throw t.error('Entity is already protected.');
        }
        modifiers |= Juliet.MODIFIER_PROTECTED;
        if (modifiers & (Juliet.MODIFIER_PUBLIC |
                         Juliet.MODIFIER_PRIVATE)) {
          throw t.error('Cannot be protected if public or private.');
        }
        continue;
      }

      if (consume(Juliet.TOKEN_PRIVATE)) {
        if (modifiers & Juliet.MODIFIER_PRIVATE) {
          throw t.error('Entity is already private.');
        }
        modifiers |= Juliet.MODIFIER_PRIVATE;
        if (modifiers & (Juliet.MODIFIER_PUBLIC |
                         Juliet.MODIFIER_PROTECTED)) {
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
  //   @ QualifiedIdentifier [ ([AnnotationElement] ) ]

  function parse_Annotation() {
    // TODO: Implement parse_Annotation
  }

  // AnnotationElement:
  //   ElementValuePairs
  //   ElementValue
  //
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

  function parse_AnnotationElement() {
    // TODO: Implement parse_AnnotationElement
  }

  //  ClassBody:
  //   { (ClassBodyDeclaration){0,*} }

  function parse_ClassBody(type) {
    var debug = tstart('parse_ClassBody');

    mustConsume(Juliet.TOKEN_LCURLY,
                'Expected {.');

    while (member = parse_ClassBodyDeclaration()) {
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
      }
    }

    mustConsume(Juliet.TOKEN_RCURLY,
                'Expected }.');

    return tend(debug, true);
  }

  // ClassBodyDeclaration:
  //   ;
  //   Modifiers MemberDecl
  //   (static){0,1} Block

  function parse_ClassBodyDeclaration() {

    var debug = tstart('parse_ClassBodyDeclaration');

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
  //   ConstructorDecl
  //   ClassDeclaration
  //   InterfaceDeclaration

  function parse_MemberDecl() {

    var debug = tstart('parse_MemberDecl');
    return tend(
      debug,
      union(
        parse_MethodDecl,
        parse_FieldDecl,
        parse_ConstructorDecl,
        parse_ClassDeclaration,
        parse_InterfaceDeclaration));
  }

  // MethodDecl:
  //   TypeParameters{0,1} (Type | void) Identifier FormalParameters ([]){0,*}
  //     (throws QualifiedIdentifierList){0,1} (Block | ;)

  function parse_MethodDecl() {
    var debug = tstart('parse_MethodDecl');
    setMark();

    var type_parameters = parse_TypeParameters();


    var t = union(parse_Type,
                  parse_VoidType);
    if (!t) {
      rewindMark();
      return tend(debug, null);
    }

    var id = parse_Identifier();
    if (!id) {
      rewindMark();
      return tend(debug, null);
    }

    if (!nextIs(Juliet.TOKEN_LPAREN)) {
      rewindMark();
      return tend(debug, null);
    }

    var method = {
      name: id.name,
      token: id.token,
      return_type: t,
      kind: 'method',
      parameters: expect(parse_FormalParameters(),
                         'Invalid method parameters.')
    };

    if (type_parameters)
      method.type_parameters = type_parameters;

    var cnt = parse_Dims();
    concat(matchToken(Juliet.TOKEN_THROWS),
           parse_QualifiedIdentifierList);

    method.block = union(parse_Block,
                         matchToken(Juliet.TOKEN_SEMICOLON));

    if (!method.block) {
      rewindMark();
      return tend(debug, null);
    }

    clearMark();
    return tend(debug, method);
  }

  // FieldDecl:
  //   Type VariableDeclarators ;

  function parse_FieldDecl() {
    var debug = tstart('parse_FieldDecl');
    setMark();

    var t = parse_Type();
    if (!t) {
      clearMark();
      return tend(debug, null);
    }

    var lst = parse_VariableDeclarators();
    if (lst) {
      mustConsume(Juliet.TOKEN_SEMICOLON, 'Expected ;.');
      clearMark();

      for (var i = 0; i < lst.length; i++) {
        lst[i].kind = 'field';
        lst[i].type = t;
      }

      return tend(debug, lst);
    }
    rewindMark();
    return tend(debug, null);
  }

  // Dims:
  //   ( '[' ']' ){0,*}
  //
  // This function differs from most parse functions in that it
  // returns an integer count of the number of dims matched.

  function parse_Dims() {
    var cnt = 0;
    while (consume(Juliet.TOKEN_LBRACKET)) {
      cnt++;
      mustConsume(Juliet.TOKEN_RBRACKET, 'Expected ] (Error#).');
    }
    return cnt;
  }

  // DimExprs:
  //   ( '[' Expression ']' ){0,*}

  function parse_DimExprs() {
    var lst = [];
    while (nextIs(Juliet.TOKEN_LBRACKET)) {
      var la = peek(2);
      if (la.type == Juliet.TOKEN_RBRACKET) {
        return lst;
      }
      read();
      lst.push(expect(parse_Expression(),
                      'Expected expression.'));
      mustConsume(Juliet.TOKEN_RBRACKET, 'Expected ] (Error#).');
    }
    return lst;
  }

  // ConstructorDecl:
  //   TypeParameters{0,1} Identifier FormalParameters
  //     [throws QualifiedIdentifierList] Block

  function parse_ConstructorDecl() {
    var o = parse_Identifier();
    if (!o) return null;
    if (!nextIs(Juliet.TOKEN_LPAREN)) return null;
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
  }

  // InterfaceBody:
  //   ({ InterfaceBodyDeclaration }){0,*}

  function parse_InterfaceBody() {
    var debug = tstart('parse_InterfaceBody');
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
    var debug = tstart('parse_InterfaceBodyDeclaration');
    return tend(debug, union(
      matchToken(Juliet.TOKEN_SEMICOLON),
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
    var debug = tstart('parse_InterfaceMemberDecl');
    return tend(debug, union(
      parse_InterfaceMethodOrFieldDecl,
      _concat(
        matchToken(Juliet.TOKEN_VOID),
        parse_Identifier,
        parse_VoidInterfaceMethodDeclaratorRest),
      parse_InterfaceGenericMethodDecl,
      parse_ClassDeclaration,
      parse_InterfaceDeclaration));
  }

  // InterfaceMethodOrFieldDecl:
  //   Type Identifier InterfaceMethodOrFieldRest

  function parse_InterfaceMethodOrFieldDecl() {
    var debug = tstart('parse_InterfaceMethodOrFieldDecl');
    return tend(debug, concat(
      parse_Type,
      parse_Identifier,
      parse_InterfaceMethodOrFieldRest));
  }

  // InterfaceMethodOrFieldRest:
  //   ConstantDeclaratorsRest ;
  //   InterfaceMethodDeclaratorRest

  function parse_InterfaceMethodOrFieldRest() {
    var debug = tstart('parse_InterfaceMethodOrFieldRest');
    return tend(debug, union(
      _concat(
        parse_ConstantDeclaratorsRest,
        matchToken(Juliet.TOKEN_SEMICOLON)),
      parse_InterfaceMethodDeclaratorRest));
  }

  // ConstantDeclaratorsRest:
  //   ConstantDeclaratorRest { , ConstantDeclarator }

  function parse_ConstantDeclaratorsRest() {
    var debug = tstart('parse_ConstantDeclaratorRest');
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
    var debug = tstart('parse_ConstantDeclaratorRest');
    return tend(debug, concat(
      parse_Dims,
      matchToken(Juliet.TOKEN_EQ),
      parse_VariableInitializer));
  }

  // ConstantDeclarator:
  //   Identifier ConstantDeclaratorRest

  function parse_ConstantDeclarator() {
    var debug = tstart('parse_ConstantDeclarator');
    return tend(debug, union(parse_Identifier,
                             parse_ConstantDeclaratorRest));
  }

  // InterfaceMethodDeclaratorRest:
  //   FormalParameters {[]} [throws QualifiedIdentifierList] ;

  function parse_InterfaceMethodDeclaratorRest() {
    var debug = tstart('parse_InterfaceMethodDeclaratorRest');
    parse_FormalParameters();
    parse_Dims();
    if (consume(Juliet.TOKEN_THROWS)) {
      parse_QualifiedIdentifierList();
    }
    mustConsume(Juliet.TOKEN_SEMICOLON);
    return tend(debug, null);
  }

  // VoidInterfaceMethodDeclaratorRest:
  //   FormalParameters [throws QualifiedIdentifierList] ;

  function parse_VoidInterfaceMethodDeclaratorRest() {
    var debug = tstart('parse_VoidInterfaceMethodDeclaratorRest');
    parse_FormalParameters();
    if (consume(Juliet.TOKEN_THROWS)) {
      parse_QualifiedIdentifierList();
    }
    mustConsume(Juliet.TOKEN_SEMICOLON);
    return tend(debug, null);
  }

  // InterfaceGenericMethodDecl:
  //   TypeParameters (Type | void) Identifier InterfaceMethodDeclaratorRest

  function parse_InterfaceGenericMethodDecl() {
    var debug = tstart('parse_InterfaceGenericMethodDecl');
    parse_TypeParameters();
    if (!consume(Juliet.TOKEN_VOID)) {
      parse_Type();
    }
    parse_Identifier();
    parse_InterfaceMethodDeclaratorRest();
    return tend(debug, null);
  }

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
    var debug = tstart('parse_FormalParameterList');

    var t = null;
    var type = null;
    var name = '';

    mustConsume(Juliet.TOKEN_LPAREN, 'Expected (.');

    var parameters = [];

    if (!consume(Juliet.TOKEN_RPAREN)) {
      do {
        t = peek();
        type = parse_Type(true);
        if (!type) {
          throw t.error('void cannot be parameter type');
        }

        name = mustReadId('Expected identifier.');
        parameters.push({token: t.type,
                         kind: 'parameter',
                         type: type,
                         name: name});
      } while (consume(Juliet.TOKEN_COMMA));
      mustConsume(Juliet.TOKEN_RPAREN, 'Expected ).');
    }
    return tend(debug, parameters);
  };

  // VariableModifier:
  //   final
  //   Annotation

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
    var debug = tstart('parse_NonWildTypeArguments');
    if (nextIs(Juliet.TOKEN_LT)) {
      var args = [];
      args.push(parse_ReferenceType());
      while (consume(Juliet.TOKEN_COMMA)) {
        args.push(parse_ReferenceType());
      }
      mustConsumeGT();
      return tend(debug, args);
    }
    return tend(debug, null);
  };

  // VariableInitializer:
  //   ArrayInitializer
  //   Expression

  function parse_VariableInitializer() {
    var debug = tstart('parse_VariableInitializer');
    return tend(debug,
                union(
                  parse_ArrayInitializer,
                  parse_Expression));
  }

  // ArrayInitializer:
  //   { [ VariableInitializer { , VariableInitializer } [,] ] }

  function parse_ArrayInitializer() {
    var debug = tstart('parse_ArrayInitializer');
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
    mustConsume(Juliet.TOKEN_RCURLY, 'Expected }.');
    return tend(debug, lst);
  }

  // Block:
  //   { BlockStatements }

  function parse_Block() {
    var debug = tstart('parse_Block');

    if (!consume(Juliet.TOKEN_LCURLY)) {
      return tend(debug, null);
    }
    var lst = [];
    while (v = parse_BlockStatement()) {
      lst.push(v);
    }
    mustConsume(Juliet.TOKEN_RCURLY);
    return tend(debug, lst);
  }

  // BlockStatement:
  //   LocalVariableDeclarationStatement
  //   ClassOrInterfaceDeclaration
  //   [Identifier :] Statement

  function parse_BlockStatement() {
    var debug = tstart('parse_BlockStatement');

    var o = union(
      parse_LocalVariableDeclarationStatement,
      parse_ClassOrInterfaceDeclaration,
      function() {
        setMark();
        var v = parse_Identifier();
        if (v && consume(Juliet.TOKEN_COLON)) {
          clearMark();
        } else {
          rewindMark();
        }
        return parse_Statement();
      });
    return tend(debug, o);
  }

  // VariableDeclarators:
  //   VariableDeclarator (, VariableDeclarator){0,*}

  function parse_VariableDeclarators() {
    var debug = tstart('parse_VariableDeclarator');
    setMark();

    var lst = [];
    do {
      var o = parse_VariableDeclarator();
      if (!o) {
        rewindMark();
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
    var debug = tstart('parse_VariableDeclarator');
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
    var debug = tstart('parse_LocalVariableDeclarationStatement()');
    setMark();
    var modifiers = parse_VariableModifiers();
    var type = parse_Type();
    if (!type) {
      rewindMark();
      return tend(debug, null);
    }

    var o = parse_VariableDeclarator();
    if (!o) {
      rewindMark();
      return tend(debug, null);
    }

    var lst = [o];
    while (consume(Juliet.TOKEN_COMMA)) {
      o = parse_VariableDeclarator();
      if (!o) {
        rewindMark();
        return tend(debug, null);
      }
      lst.push(o);
    }

    for (var i = 0; i < lst.length; i++) {
      lst[i].type = type;
    }

    mustConsume(Juliet.TOKEN_SEMICOLON,
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

    var debug = tstart('parse_Statement');

    var o;
    var t = peek();

    // 14.2 Blocks
    // print('- 14.2');
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
    // print('- 14.6');
    if (consume(Juliet.TOKEN_SEMICOLON)) {
      return tend(debug, {
        token: t.type,
        kind: 'noop'
      });
    }

    // 14.9 IfThenStatement
    // 14.9 IfThenElseStatement

    // print('- 14.9');
    if (consume(Juliet.TOKEN_IF)) {
      var conditional = {
        token: t.type,
        kind: 'if',
        expression: expect(parse_ParExpression(),
                           'Expected  (.')};

      if (nextIs(Juliet.TOKEN_SEMICOLON)) {
        throw t.error('Unexpected ;.');
      }

      conditional.body = parse_Statement();

      if (consume(Juliet.TOKEN_ELSE)) {
        if (nextIs(Juliet.TOKEN_SEMICOLON)) {
          throw t.error('Unexpected ;.');
        }
        conditional.else_body = parse_Statement();
      }
      return tend(debug, conditional);
    }

    // 14.12 WhileStatement

    // print('- 14.12');
    if (consume(Juliet.TOKEN_WHILE)) {
      mustConsume(Juliet.TOKEN_LPAREN, 'Expected (.');
      loop = {token: t.type,
              kind: 'while',
              expression: parse_Expression()};
      mustConsume(Juliet.TOKEN_RPAREN, 'Expected ).');
      if (nextIs(Juliet.TOKEN_SEMICOLON)) {
        throw t.error('Unexpected ;.');
      }
      loop.body = parse_Statement();
      return tend(debug, loop);
    }

    // 14.13 DoStatement

    // TODO: Implement DoStatement

    // ForControl:
    //     {VariableModifier} Type Identifier {[]} : Expression
    //     {VariableModifier} Type VariableDeclarator
    //       { , VariableDeclarator } ; [Expression] ; [ForUpdate]
    //     ForInit ; [Expression] ; [ForUpdate]
    //
    // ForInit:
    // ForUpdate:
    //     StatementExpression { , StatementExpression }
    //
    // See Also: JLS 14.14

    // print('- 14.14');
    if (consume(Juliet.TOKEN_FOR)) {
      mustConsume(Juliet.TOKEN_LPAREN, 'Expected (.');

      var modifiers = parse_Modifiers();

      var init_lst = [];
      var o_type = parse_Type();

      if (!o_type && modifiers) {
        throw peek().error('Modifiers must be applied to a type.');
      }

      if (o_type) {

        function Case1() {
          // {VariableModifier} Type Identifier {[]} : Expression
          setMark();
          var name = parse_Identifier().name;
          if (!name) {
            clearMark();
            return null;
          }
          while (consume(Juliet.TOKEN_LBRACKET)) {
            name += '[]';
            if (!consume(Juliet.TOKEN_RBRACKET)) {
              rewindMark();
              return null;
            }
          }
          if (!consume(Juliet.TOKEN_COLON)) {
            rewindMark();
            return null;
          }
          clearMark();
          var expr = expect(parse_Expression(),
                            'Expected expression.');

          return {
            token: t.type,
            kind: 'for-each',
            name: name,
            type: o_type,
            iterable: expr
          };
        }

        var o = Case1();
        if (o) {
          mustConsume(Juliet.TOKEN_RPAREN, 'Expected ).');
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
        } while (consume(Juliet.TOKEN_COMMA));
      } else {
        // Case 3:
        // ForInit

        do {
          var o = parse_StatementExpression();
          if (!o) {
            throw peek().error('Illegal for loop initialization.');
          }
          init_lst.push(o);
        } while (consume(Juliet.TOKEN_COMMA));

      }

      // Case 2 and Case 3:
      // ; [Expression] ; [ForUpdate]

      mustConsumeSemicolon();

      var condition;
      if (consume(Juliet.TOKEN_SEMICOLON)) {
        condition = {token: t.type,
                     kind: 'conditional',
                     expression: true};
      } else {
        condition = expect(parse_Expression(), 'Expected expression.');
        mustConsumeSemicolon();
      }

      var update_lst = [];
      do {
        var o = parse_StatementExpression();
        if (!o) {
          throw peek().error('Illegal for loop initialization.');
        }
        update_lst.push(o);
      } while (consume(Juliet.TOKEN_COMMA));

      mustConsume(Juliet.TOKEN_RPAREN, 'Expected ).');
      loop = {
        token: t.type,
        kind: 'for',
        initialization: init_lst,
        condition: condition,
        var_mod: update_lst
      };
      if (nextIs(Juliet.TOKEN_SEMICOLON)) {
        throw t.error('Unexpected ;.');
      }
      loop.body = expect(parse_Statement(), 'Expected for loop body.');
      return tend(debug, loop);
    }

    // 14.8 ExpressionStatement

    // print('- 14.8');
    setMark();
    o = parse_StatementExpression();
    if (nextIs(Juliet.TOKEN_SEMICOLON)) {
      clearMark();
      mustConsume(Juliet.TOKEN_SEMICOLON, 'Expected ;.');
      return tend(debug, o);
    } else {
      rewindMark();
    }

    // 14.10 AssertStatement

    // print('- 14.10');
    if (consume(Juliet.TOKEN_ASSERT)) {
      mustConsume(Juliet.TOKEN_LPAREN, 'Expected (.');
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
      mustConsume(Juliet.TOKEN_RPAREN, 'Expected ).');
      return tend(debug, cmd);
    }

    // 14.11 SwitchStatement

    // TODO: Implement switch statement.

    // 14.13 DoStatement

    // TODO: Implement do statement.

    // 14.15 BreakStatement

    // TODO: Implement labeled break statements.

    // print('- 14.15');

    if (consume(Juliet.TOKEN_BREAK)) {
      cmd = {
        token: t.type,
        kind: 'abrupt'
      };
      //if (require_semicolon)
      mustConsumeSemicolon();
      return tend(debug, cmd);
    }

    // 14.16 Continue Statement

    // print('- 14.16');
    // TODO: Implement labeled continues.

    if (consume(Juliet.TOKEN_CONTINUE)) {
      cmd = {
        token: t.type,
        kind: 'abrupt'
      };
      //if (require_semicolon)
      mustConsumeSemicolon();
      return tend(debug, cmd);
    }

    // 14.17 ReturnStatement

    // print('- 14.17');

    if (consume(Juliet.TOKEN_RETURN)) {
      if (consume(Juliet.TOKEN_SEMICOLON)) {
        return tend(debug, {
          token: t.type,
          kind: 'return',
          value: 'void'
        });
      }
      var expr = parse_Expression();
      mustConsumeSemicolon();
      return tend(debug, {
        token: t.type,
        kind: 'return',
        expression: expr
      });
    }

    // 14.19 SynchronizedStatement

    // TODO: Implement SynchronizedStatement

    // 14.18 ThrowStatement

    // print('- 14.18');

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
      mustConsumeSemicolon();
      return tend(debug, cmd);
    }

    // 14.20 TryStatement

    // TODO: Implement TryStatement

    // StatementExpression ;
    o = concat(
      parse_StatementExpression,
      matchToken(Juliet.TOKEN_SEMICOLON));
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
    var debug = tstart('parse_StatementExpression');
    return tend(debug, parse_Expression());
  }

  // 15.10 Array Creation Expressions
  //
  // ArrayCreationExpression:
  //   new PrimitiveType DimExprs Dims_opt
  //   new ClassOrInterfaceType DimExprs Dims_opt
  //   new PrimitiveType Dims ArrayInitializer
  //   new ClassOrInterfaceType Dims ArrayInitializer
  //
  // Comment: We use a simpler version of this rule and then check the
  // constraints:
  //
  // ArrayCreationExpression:
  //   new PrimitiveType JDims ArrayInitializer
  //   new ClassOrInterfaceType JDims ArrayInitializer
  //
  // JDims:
  //   [ Expression_opt ]
  //   JDims [ Expression_opt ]

  function parse_ArrayCreationExpression() {

    var debug = tstart('parse_ArrayCreationExpression');
    setMark();
    var t = read();
    if (t.type != Juliet.TOKEN_NEW) {
      rewindMark();
      return tend(debug, null);
    }

    var array_type = union(parse_PrimitiveType,
                           parse_ClassOrInterfaceType);

    if (!array_type) {
      rewindMark();
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
        mustConsume(Juliet.TOKEN_RBRACKET, 'Expected ] (Error#).');
      }
    }

    var init = parse_ArrayIntializer();

    var r = {
      token: t.type,
      kind: 'array',
      type: array_type
    };

    if (dims && dims[0]) {
      r.length = dims[0];
    }

    return tend(debug, r);

  }

  // Expression:
  //   Expression1 [AssignmentOperator Expression1]

  function parse_Expression() {
    var debug = tstart('parse_Expression');

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
    var debug = tstart('parse_AssignmentOperator');
    var t = peek();
    if (consume(Juliet.TOKEN_ASSIGN) ||
        consume(Juliet.TOKEN_ADD_ASSIGN) ||
        consume(Juliet.TOKEN_SUB_ASSIGN) ||
        consume(Juliet.TOKEN_MUL_ASSIGN) ||
        consume(Juliet.TOKEN_DIV_ASSIGN) ||
        consume(Juliet.TOKEN_MOD_ASSIGN) ||
        consume(Juliet.TOKEN_AND_ASSIGN) ||
        consume(Juliet.TOKEN_OR_ASSIGN) ||
        consume(Juliet.TOKEN_XOR_ASSIGN) ||
        consume(Juliet.TOKEN_SHL_ASSIGN) ||
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
    var debug = tstart('parse_Expression1');

    var expr = parse_ConditionalOrExpression();

    var t = peek();

    if (consume(Juliet.TOKEN_QUESTIONMARK)) {
      var true_value = parse_Expression();
      mustConsume(Juliet.TOKEN_COLON, 'Expected :.');
      var false_value = parse_Expression1();

      return tend(debug, {
        token: t.type,
        kind: 'ternary',
        expression: expr,
        true_value: true_value,
        false_value: false_value});
    }
    return tend(debug, expr);
  }


  var parse_ConditionalOrExpression = function(lhs) {

    var debug = tstart('parse_ConditionalOrExpression');

    // 15.24 Conditional Or

    if (lhs === undefined)
      return tend(
        debug,
        parse_ConditionalOrExpression(parse_ConditionalAndExpression()));

    var t = peek();
    if (consume(Juliet.TOKEN_LOGICAL_OR))
      return tend(
        debug,
        parse_ConditionalOrExpression(
          {token: t.type,
           kind: 'binary',
           lhs: lhs,
           rhs: parse_ConditionalAndExpression()}));

    return tend(debug, lhs);
  };


  var parse_ConditionalAndExpression = function(lhs) {

    // 15.23 Conditional And
    var debug = tstart('parse_ConditionalAndExpression');

    if (lhs === undefined)
      return tend(
        debug,
        parse_ConditionalAndExpression(parse_InclusiveOrExpression()));

    var t = peek();
    if (consume(Juliet.TOKEN_LOGICAL_AND))
      return tend(
        debug,
        parse_ConditionalAndExpression(
          {token: t.type,
           kind: 'binary',
           lhs: lhs,
           rhs: parse_InclusiveOrExpression()}));

    return tend(debug, lhs);
  };


  var parse_InclusiveOrExpression = function(lhs) {

    // 15.22 InclusiveOrExpression

    var debug = tstart('parse_InclusiveOrExpression');

    if (lhs === undefined)
      return tend(
        debug,
        parse_InclusiveOrExpression(parse_ExclusiveOrExpression()));

    var t = peek();
    if (consume(Juliet.TOKEN_PIPE))
      return tend(
        debug,
        parse_InclusiveOrExpression(
          {token: t.type,
           kind: 'binary',
           lhs: lhs,
           rhs: parse_ExclusiveOrExpression()}));

    return tend(debug, lhs);
  };

  function parse_ExclusiveOrExpression(lhs) {

    var debug = tstart('parse_ExclusiveOrExpression');
    // 15.22 ExclusiveOrExpression

    if (lhs === undefined)
      return tend(
        debug,
        parse_ExclusiveOrExpression(parse_AndExpression()));

    var t = peek();
    if (consume(Juliet.TOKEN_CARET))
      return tend(
        debug,
        parse_ExclusiveOrExpression(
          {token: t.type,
           kind: 'binary',
           lhs: lhs,
           rhs: parse_AndExpression()}));

    return tend(debug, lhs);
  };


  var parse_AndExpression = function(lhs) {

    // 15.22 AndExpression

    var debug = tstart('parse_AndExpression');

    if (lhs === undefined)
      return tend(
        debug,
        parse_AndExpression(parse_EqualityExpression()));

    var t = peek();
    if (consume(Juliet.TOKEN_AMPERSAND))
      return tend(
        debug,
        parse_AndExpression(
          {token: t.type,
           kind: 'binary',
           lhs: lhs,
           rhs: parse_EqualityExpression()}));

    return tend(debug, lhs);
  };


  // ==, !=
  var parse_EqualityExpression = function(lhs) {

    var debug = tstart('parse_EqualityExpression');

    // 15.21 EqualityExpression

    if (lhs === undefined)
      return tend(
        debug,
        parse_EqualityExpression(parse_RelationalExpression()));

    var t = peek();

    if (consume(Juliet.TOKEN_EQ))
      return tend(
        debug,
        parse_EqualityExpression(
          {token: t.type,
           kind: 'binary',
           lhs: lhs,
           rhs: parse_RelationalExpression()}));

    if (consume(Juliet.TOKEN_NE))
      return tend(
        debug,
        parse_EqualityExpression(
          {token: t.type,
           kind: 'binary',
           lhs: lhs,
           rhs: parse_RelationalExpression()}));

    return tend(debug, lhs);
  };


  // <<, >>, >>>
  var parse_ShiftExpression = function(lhs) {

    // 15.19 Shift Operators

    var debug = tstart('parse_ShiftExpression');

    if (lhs === undefined)
      return tend(
        debug,
        parse_ShiftExpression(parse_AdditiveExpression()));

    var t = peek();

    if (consume(Juliet.TOKEN_SHL) ||
        consume(Juliet.TOKEN_SHR) ||
        consume(Juliet.TOKEN_SHRX))
      return tend(
        debug,
        parse_ShiftExpression(
          {token: t.type,
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
      return tend(
        debug,
        parse_RelationalExpression(parse_ShiftExpression()));

    var t = peek();

    if (consume(Juliet.TOKEN_LT) ||
        consume(Juliet.TOKEN_LE) ||
        consume(Juliet.TOKEN_GT) ||
        consume(Juliet.TOKEN_GE))
      return tend(
        debug,
        parse_RelationalExpression(
          {token: t.type,
           kind: 'binary',
           lhs: lhs,
           rhs: parse_ShiftExpression()}));

    if (consume(Juliet.TOKEN_INSTANCEOF)) {
      var rhs = parse_Type();
      rhs.kind = 'type';
      return tend(
        debug,
        parse_RelationalExpression(
          {token: t.type,
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
      return tend(
        debug,
        parse_AdditiveExpression(parse_MultiplicativeExpression()));

    var t = peek();

    if (consume(Juliet.TOKEN_PLUS) ||
        consume(Juliet.TOKEN_MINUS))
      return tend(
        debug,
        parse_AdditiveExpression(
          {token: t.type,
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
      return tend(
        debug,
        parse_MultiplicativeExpression(parse_UnaryExpression()));

    var t = peek();

    if (consume(Juliet.TOKEN_STAR) ||
        consume(Juliet.TOKEN_SLASH) ||
        consume(Juliet.TOKEN_PERCENT))
      return tend(
        debug,
        parse_MultiplicativeExpression(
          {token: t.type,
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

    if (nextIs(Juliet.TOKEN_LPAREN)) {
      // MIGHT have a cast
      setMark();
      read();
      if (nextIs([Juliet.TOKEN_ID,
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

          mustConsume(Juliet.TOKEN_RPAREN, 'Expected ).');
          result = {
            token: t.type,
            kind: 'cast',
            operand: parse_UnaryExpression(),
            to_type: to_type
          };
          clearMark();
          return tend(debug, result);
        } catch (e) {
          // Didn't work, not a cast - just proceed.
          while (tstack.length > len) {
            tstack.pop();
          }
        }
      }
      rewindMark();
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


  // ++, --, ., (), []
  function parse_PostfixUnary(operand) {
    var debug = tstart('parse_PostfixUnary');

    var op_type = null;
    var new_name = '';
    var index = null;
    if (operand === undefined)
      return tend(debug, parse_PostfixUnary(parse_Primary()));
    var t = peek();
    if (consume(Juliet.TOKEN_INCREMENT)) {
      return tend(debug, parse_PostfixUnary({
        token: t.type,
        kind: 'postfix',
        operand: operand}));
    } else if (consume(Juliet.TOKEN_DECREMENT)) {
      return tend(debug, parse_PostfixUnary({
        token: t.type,
        kind: 'postfix',
        operand: operand}));
    } else if (consume(Juliet.TOKEN_PERIOD)) {
      cmd = parse_PostfixUnary({
        token: t.type,
        kind: 'postfix',
        operand: operand,
        term: parse_Primary()});
      return tend(debug, cmd);
    } else if (consume(Juliet.TOKEN_LBRACKET)) {
      index = parse_Expression();
      mustConsume(Juliet.TOKEN_RBRACKET, 'Expected ] (Error4).');
      return tend(debug, parse_PostfixUnary({
        token: t.type,
        kind: 'postfix',
        operand: operand,
        expression: index}));
    } else if (nextIs(Juliet.TOKEN_LPAREN)) {
      cmd = parse_PostfixUnary({
        token: t.type,
        kind: 'call',
        operand: operand,
        args: parse_Arguments()});
      return tend(debug, cmd);

    }

    return tend(debug, operand);
  };

  // Primary:
  //   Literal
  //   ParExpression
  //   this [Arguments]
  //   super SuperSuffix
  //   new Creator
  //   NonWildcardTypeArguments (ExplicitGenericInvocationSuffix |
  //     this Arguments)
  //   Identifier { . Identifier } [IdentifierSuffix]
  //   BasicType {[]} . class
  //   void . class
  //
  // See Also: 15.8 Primary Expressions

  function parse_Primary() {

    var debug = tstart('parse_Primary');

    var t;

    // Literal
    // print('Primary: Literal');
    o = parse_Literal();
    if (o) return tend(debug, o);

    // ParExpression
    // print('Primary: ParExpression');
    o = parse_ParExpression();
    if (o) return tend(debug, o);

    // this [Arguments]
    // print('Primary: this');
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

    // print('Primary: super');
    // super SuperSuffix
    o = parse_SuperWithSuffix();
    if (o) return tend(debug, o);

    // print('Primary: creator');
    // new Creator
    o = parse_Creator();
    if (o) return tend(debug, o);

    // NonWildcardTypeArguments (ExplicitGenericInvocationSuffix |
    //   this Arguments)
    //o = parse_NonWildcardTypeArguments();
    //if (o) return o;

    // print('Primary: identifier');
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
          kind: 'postfix',
          operand: expr,
          term: ext
        };
      }

      // IdentifierSuffix:
      //   [ ({[]} . class | Expression) ]
      //   Arguments
      //   . (class | ExplicitGenericInvocation | this | super Arguments |
      //     new [NonWildcardTypeArguments] InnerCreator)

      t = peek();
      if (nextIs(Juliet.TOKEN_LPAREN)) {
        return tend(debug, {
          token: t.type,
          kind: 'call',
          operand: expr,
          args: expect(parse_Arguments(), 'Illegal argument list.')
        });
      }

      return tend(debug, expr);
    }

    //   new Creator
    //   NonWildcardTypeArguments (ExplicitGenericInvocationSuffix |
    //     this Arguments)
    //   BasicType {[]} . class
    //   void . class

    return tend(debug, null);

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
    mustConsume(Juliet.TOKEN_RPAREN, 'Expected ).');
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
    } while (consume(Juliet.TOKEN_COMMA));
    mustConsume(Juliet.TOKEN_RPAREN, 'Expected ).');

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
      return null;
    }

    if (peek().type == Juliet.TOKEN_LPAREN) {
      args = expect(parse_Arguments(),
                    'Expected (.');

      return {
        token: t.type,
        kind: 'super',
        args: args
      };
    } else {
      mustConsume(Juliet.TOKEN_PERIOD, 'Expected \'.\'.');
      name = mustReadId('Expected method or property name.');
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

    var debug = tstart('parse_Creator()');

    var t = peek();
    if (!consume(Juliet.TOKEN_NEW)) {
      return tend(debug, null);
    }

    setMark();
    var a = parse_NonWildcardTypeArguments();

    var CreatedName = union(
      parse_BasicType,
      parse_ReferenceType);

    if (!CreatedName) {
      rewindMark();
      return tend(debug, null);
    }

    var obj = {
      token: t.type,
      kind: 'new',
      type: CreatedName
    };

    var Arguments = parse_Arguments();

    if (Arguments) {

      obj.args = Arguments;

      if (nextIs(Juliet.TOKEN_LBRACE)) {
        obj.body = parse_ClassBody();
      }

      return tend(debug, obj);
    }

    // print('looking at dims..');

    var DimExprs = parse_DimExprs();
    var Dims = parse_Dims();
    var ArrayInitializer = parse_ArrayInitializer();

    // Now check if any of that makes sense!
    if (DimExprs.length > 0 && ArrayInitializer) {
      throw t.error('Can\'t have both dimension expressions and an' +
                    'array initializer.');
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
    init: function() {

    },

    parse: function() {
      tstack = [];
      return parse_CompilationUnit();
    },

    // Only use for testing
    parseStatement: function() {
      tstack = [];
      return parse_Statement();
    },

    // Only use for testing
    parseBlockStatement: function() {
      tstack = [];
      return parse_BlockStatement();
    },

    // Only use for testing
    parseExpression: function() {
      tstack = [];
      return parse_Expression();
    },

    // Only use for testing
    parseTypeDeclaration: function() {
      tstack = [];
      return parse_TypeDeclaration();
    }

  };
}();
