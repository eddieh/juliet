var test_parse = function() {
  var tests = [
    ['3.14', {token:LITERAL_DOUBLE, value:3.14}],
    ['42', {token:LITERAL_INT, value:42}],
    ['\'a\'', {token:LITERAL_CHAR, value:'a'}],
    ['"hello"', {token:LITERAL_STRING, value:'hello'}],
    ['false', {token:LITERAL_BOOLEAN, value:false}],
    ['true', {token:LITERAL_BOOLEAN, value:true}],
    ['null', {token:TOKEN_NULL, value:'null'}],
    ['a = b', {
      token:TOKEN_ASSIGN,
      location:{token:TOKEN_ID, name:'a'},
      new_value:{token:TOKEN_ID, name:'b'}}],
    ['a += b', {
      token:TOKEN_ADD_ASSIGN,
      location:{token:TOKEN_ID, name:'a'},
      new_value:{token:TOKEN_ID, name:'b'}}],
    ['a -= b', {
      token:TOKEN_SUB_ASSIGN,
      location:{token:TOKEN_ID, name:'a'},
      new_value:{token:TOKEN_ID, name:'b'}}],
    ['a *= b', {
      token:TOKEN_MUL_ASSIGN,
      location:{token:TOKEN_ID, name:'a'},
      new_value:{token:TOKEN_ID, name:'b'}}],
    ['a /= b', {
      token:TOKEN_DIV_ASSIGN,
      location:{token:TOKEN_ID, name:'a'},
      new_value:{token:TOKEN_ID, name:'b'}}],
    ['a %= b', {
      token:TOKEN_MOD_ASSIGN,
      location:{token:TOKEN_ID, name:'a'},
      new_value:{token:TOKEN_ID, name:'b'}}],
    ['a &= b', {
      token:TOKEN_AND_ASSIGN,
      location:{token:TOKEN_ID, name:'a'},
      new_value:{token:TOKEN_ID, name:'b'}}],
    ['a |= b', {
      token:TOKEN_OR_ASSIGN,
      location:{token:TOKEN_ID, name:'a'},
      new_value:{token:TOKEN_ID, name:'b'}}],
    ['a ^= b', {
      token:TOKEN_XOR_ASSIGN,
      location:{token:TOKEN_ID, name:'a'},
      new_value:{token:TOKEN_ID, name:'b'}}],
    ['a <<= b', {
      token:TOKEN_SHL_ASSIGN,
      location:{token:TOKEN_ID, name:'a'},
      new_value:{token:TOKEN_ID, name:'b'}}],
    ['a >>>= b', {
      token:TOKEN_SHRX_ASSIGN,
      location:{token:TOKEN_ID, name:'a'},
      new_value:{token:TOKEN_ID, name:'b'}}],
    ['a >>= b', {
      token:TOKEN_SHR_ASSIGN,
      location:{token:TOKEN_ID, name:'a'},
      new_value:{token:TOKEN_ID, name:'b'}}],
    ['true ? "true" : "false"', {
      token:TOKEN_QUESTIONMARK,
      expression:{
        token:LITERAL_BOOLEAN,
        value:true
      },
      true_value:{
        token:LITERAL_STRING,
        value:'true'
      },
      false_value:{
        token:LITERAL_STRING,
        value:'false'
      }
    }],
    ['a = true || false;', {
      token:TOKEN_ASSIGN,
      location:{token:TOKEN_ID, name:'a'},
      new_value:{token:TOKEN_LOGICAL_OR,
                 lhs:{token:LITERAL_BOOLEAN, value:true},
                 rhs:{token:LITERAL_BOOLEAN, value:false}}}],
    ['a = true && false;', {
      token:TOKEN_ASSIGN,
      location:{token:TOKEN_ID, name:'a'},
      new_value:{token:TOKEN_LOGICAL_AND,
                 lhs:{token:LITERAL_BOOLEAN, value:true},
                 rhs:{token:LITERAL_BOOLEAN, value:false}}}],
    ['a = 1 | 0;', {
      token:TOKEN_ASSIGN,
      location:{token:TOKEN_ID, name:'a'},
      new_value:{token:TOKEN_PIPE,
                 lhs:{token:LITERAL_INT, value:1},
                 rhs:{token:LITERAL_INT, value:0}}}],
    ['a = 1 ^ 0;', {
      token:TOKEN_ASSIGN,
      location:{token:TOKEN_ID, name:'a'},
      new_value:{token:TOKEN_CARET,
                 lhs:{token:LITERAL_INT, value:1},
                 rhs:{token:LITERAL_INT, value:0}}}],
    ['a = 1 & 0;', {
      token:TOKEN_ASSIGN,
      location:{token:TOKEN_ID, name:'a'},
      new_value:{token:TOKEN_AMPERSAND,
                 lhs:{token:LITERAL_INT, value:1},
                 rhs:{token:LITERAL_INT, value:0}}}],
    ['a = 1 << 0;', {
      token:TOKEN_ASSIGN,
      location:{token:TOKEN_ID, name:'a'},
      new_value:{token:TOKEN_SHL,
                 lhs:{token:LITERAL_INT, value:1},
                 rhs:{token:LITERAL_INT, value:0}}}],
    ['a = 1 >> 0;', {
      token:TOKEN_ASSIGN,
      location:{token:TOKEN_ID, name:'a'},
      new_value:{token:TOKEN_SHR,
                 lhs:{token:LITERAL_INT, value:1},
                 rhs:{token:LITERAL_INT, value:0}}}],
    ['a = 1 >>> 0;', {
      token:TOKEN_ASSIGN,
      location:{token:TOKEN_ID, name:'a'},
      new_value:{token:TOKEN_SHRX,
                 lhs:{token:LITERAL_INT, value:1},
                 rhs:{token:LITERAL_INT, value:0}}}],
    ['a = 1 < 0;', {
      token:TOKEN_ASSIGN,
      location:{token:TOKEN_ID, name:'a'},
      new_value:{token:TOKEN_LT,
                 lhs:{token:LITERAL_INT, value:1},
                 rhs:{token:LITERAL_INT, value:0}}}],
    ['a = 1 <= 0;', {
      token:TOKEN_ASSIGN,
      location:{token:TOKEN_ID, name:'a'},
      new_value:{token:TOKEN_LE,
                 lhs:{token:LITERAL_INT, value:1},
                 rhs:{token:LITERAL_INT, value:0}}}],
    ['a = 1 > 0;', {
      token:TOKEN_ASSIGN,
      location:{token:TOKEN_ID, name:'a'},
      new_value:{token:TOKEN_GT,
                 lhs:{token:LITERAL_INT, value:1},
                 rhs:{token:LITERAL_INT, value:0}}}],
    ['a = 1 >= 0;', {
      token:TOKEN_ASSIGN,
      location:{token:TOKEN_ID, name:'a'},
      new_value:{token:TOKEN_GE,
                 lhs:{token:LITERAL_INT, value:1},
                 rhs:{token:LITERAL_INT, value:0}}}],
    ['a = b instanceof c;', {
      token:TOKEN_ASSIGN,
      location:{token:TOKEN_ID, name:'a'},
      new_value:{token:TOKEN_INSTANCEOF,
                 lhs:{token:TOKEN_ID, name:'b'},
                 rhs:{token:TOKEN_ID, name:'c'}}}],
    ['a = 1 == 0;', {
      token:TOKEN_ASSIGN,
      location:{token:TOKEN_ID, name:'a'},
      new_value:{token:TOKEN_EQ,
                 lhs:{token:LITERAL_INT, value:1},
                 rhs:{token:LITERAL_INT, value:0}}}],
    ['a = 1 != 0;', {
      token:TOKEN_ASSIGN,
      location:{token:TOKEN_ID, name:'a'},
      new_value:{token:TOKEN_NE,
                 lhs:{token:LITERAL_INT, value:1},
                 rhs:{token:LITERAL_INT, value:0}}}],
    ['a = 1 + 0;', {
      token:TOKEN_ASSIGN,
      location:{token:TOKEN_ID, name:'a'},
      new_value:{token:TOKEN_PLUS,
                 lhs:{token:LITERAL_INT, value:1},
                 rhs:{token:LITERAL_INT, value:0}}}],
    ['a = 1 - 0;', {
      token:TOKEN_ASSIGN,
      location:{token:TOKEN_ID, name:'a'},
      new_value:{token:TOKEN_MINUS,
                 lhs:{token:LITERAL_INT, value:1},
                 rhs:{token:LITERAL_INT, value:0}}}],
    ['a = 1 * 0;', {
      token:TOKEN_ASSIGN,
      location:{token:TOKEN_ID, name:'a'},
      new_value:{token:TOKEN_STAR,
                 lhs:{token:LITERAL_INT, value:1},
                 rhs:{token:LITERAL_INT, value:0}}}],
    ['a = 1 / 1;', {
      token:TOKEN_ASSIGN,
      location:{token:TOKEN_ID, name:'a'},
      new_value:{token:TOKEN_SLASH,
                 lhs:{token:LITERAL_INT, value:1},
                 rhs:{token:LITERAL_INT, value:1}}}],
    ['(int)a', {
      token:TOKEN_LPAREN,
      operand:{token:TOKEN_ID, name:'a'},
      to_type:{token:TOKEN_INT, name:'int'}}],
    ['(Object)a', {
      token:TOKEN_LPAREN,
      operand:{token:TOKEN_ID, name:'a'},
      to_type:{token:TOKEN_ID, name:'Object'}}],
    ['new Object()', {
      token:TOKEN_NEW,
      type:{token:TOKEN_ID, name:'Object'},
      args:[]}],
    ['new Object(a, b)', {
      token:TOKEN_NEW,
      type:{token:TOKEN_ID, name:'Object'},
      args:[
        {token:TOKEN_ID, name:'a'},
        {token:TOKEN_ID, name:'b'}
      ]
    }],
    ['new int[10]', {
      token:TOKEN_NEW,
      type:{token:TOKEN_INT, name:'int', length:1},
      length:{token:LITERAL_INT, value:10}}],
    ['new int[10][3]', {
      token:TOKEN_NEW,
      type:{token:TOKEN_INT, name:'int', length:2},
      length:{token:LITERAL_INT, value:10},
      element_expr:{
        token:TOKEN_NEW,
        type:{token:LITERAL_INT, name:'int', length:1},// TODO: <- seems wrong!
        expression:{token:LITERAL_INT, value:3}}}],
    ['++a', {
      token:TOKEN_INCREMENT,
      operand:{token:TOKEN_ID, name:'a'}}],
    ['--a', {
      token:TOKEN_DECREMENT,
      operand:{token:TOKEN_ID, name:'a'}}],
    ['+a', {
      token:TOKEN_ID, name:'a'}],
    ['-a', {
      token:TOKEN_MINUS,
      operand:{token:TOKEN_ID, name:'a'}}],
    ['!a', {
      token:TOKEN_BANG,
      operand:{token:TOKEN_ID, name:'a'}}],
    ['~a', {
      token:TOKEN_TILDE,
      operand:{token:TOKEN_ID, name:'a'}}],
    ['a++', {
      token:TOKEN_INCREMENT,
      operand:{token:TOKEN_ID, name:'a'}}],
    ['a--', {
      token:TOKEN_DECREMENT,
      operand:{token:TOKEN_ID, name:'a'}}],
    ['a.b', {
      token:TOKEN_PERIOD,
      operand:{token:TOKEN_ID, name:'a'},
      term:{token:TOKEN_ID, name:'b'}}],
    ['int[] a', [{
      token:TOKEN_ID,
      type:{token:TOKEN_INT, name:'int[]'},
      name:'a',
      initial_value:null}]],
    ['Object[] a', [{
      token:TOKEN_ID,
      type:{token:TOKEN_ID, name:'Object[]'},
      name:'a',
      initial_value:null}]],
    ['a[0]', {
      token:TOKEN_LBRACKET,
      operand:{token:TOKEN_ID, name:'a'},
      expression:{token:LITERAL_INT, value:0}}],
    ['a[b]', {
      token:TOKEN_LBRACKET,
      operand:{token:TOKEN_ID, name:'a'},
      expression:{token:TOKEN_ID, name:'b'}}],
    ['a[0][0]', {
      token:TOKEN_LBRACKET,
      operand:{
        token:TOKEN_LBRACKET,
        operand:{token:TOKEN_ID, name:'a'},
        expression:{token:LITERAL_INT, value:0}},
      expression:{token:LITERAL_INT, value:0}}],
    ['var1 |= (true || false);', {
      token:TOKEN_OR_ASSIGN,
      location:{token:TOKEN_ID, name:'var1'},
      new_value:{token:TOKEN_LOGICAL_OR,
                 lhs:{token:LITERAL_BOOLEAN, value:true},
                 rhs:{token:LITERAL_BOOLEAN, value:false}}}],
    ['var1 = (a + b) * c;', {
      token:TOKEN_ASSIGN,
      location:{token:TOKEN_ID, name:'var1'},
      new_value:{token:TOKEN_STAR,
                 lhs:{token:TOKEN_PLUS,
                      lhs:{token:TOKEN_ID, name:'a'},
                      rhs:{token:TOKEN_ID, name:'b'}},
                 rhs:{token:TOKEN_ID, name:'c'}}}],
    ['int num = 1;', [{
      token:TOKEN_ID,
      type:{token:TOKEN_INT, name:'int'},
      name:'num',
      initial_value:{token:LITERAL_INT, value:1}}]],
    ['float num = 1.0, num2 = 6.28;', [{
      token:TOKEN_ID,
      type:{token:TOKEN_FLOAT, name:'float'},
      name:'num',
      initial_value:{token:LITERAL_DOUBLE, value:1.0}},
      {token:TOKEN_ID,
       type:{token:TOKEN_FLOAT, name:'float'},
       name:'num2',
       initial_value:{token:LITERAL_DOUBLE, value:6.28}}]],
    ['Vector<String>', {
      token:TOKEN_ID,
      name:'Vector<String>'}],
    ['Seq<Seq<A>>', {
      token:TOKEN_ID,
      name:'Seq<Seq<A>>'}],
    ['Seq<Seq<Seq<A>>>', {
      token:TOKEN_ID,
      name:'Seq<Seq<Seq<A>>>'}],
    ['Seq<Seq<Seq<Seq<A>>>>', {
      token:TOKEN_ID,
      name:'Seq<Seq<Seq<Seq<A>>>>'}],
    ['Seq<String>.Zipper<Integer>', {
      token:TOKEN_PERIOD,
      operand:{
        token:TOKEN_ID,
        name:'Seq<String>'
      },
      term:{
        token:TOKEN_ID,
        name:'Zipper<Integer>'
      }
    }],
    ['Collection<Integer>', {
      token:TOKEN_ID,
      name:'Collection<Integer>'
    }],
    ['Pair<String,String>', {
      token:TOKEN_ID,
      name:'Pair<String,String>'
    }],
    ['Collection<?>', {
      token:TOKEN_ID,
      name:'Collection<?>'
    }],
    ['Class<?>[]', {
      token:TOKEN_ID,
      name:'Class<?>[]'
    }],
    ['Collection<? extends E>', {
      token:TOKEN_ID,
      name:'Collection<? extends E>'
    }],
    ['Collection<? super E>', {
      token:TOKEN_ID,
      name:'Collection<? super E>'
    }],
    ['Cell x = new Cell<String>("abc");', [{
      token:TOKEN_ID,
      type:{
        token:TOKEN_ID,
        name:'Cell'
      },
      name:'x',
      initial_value:{
        token:TOKEN_NEW,
        type:{
          token:TOKEN_ID,
          name:'Cell<String>'
        },
        args:[
          {
            token:LITERAL_STRING,
            value:'abc'
          }
        ]
      }
    }]],
    ['return;', {
      token:TOKEN_RETURN,
      value:'void'}],
    ['return 1;', {
      token:TOKEN_RETURN,
      expression:{token:LITERAL_INT, value:'1'}}],
    ['{ return; }', [{
      token:TOKEN_RETURN,
      value:'void'
    }]],
    ['{ a = 1; b = 2; }', [
      {
        token:TOKEN_ASSIGN,
        location:{token:TOKEN_ID, name:'a'},
        new_value:{token:LITERAL_INT, value:1}
      },
      {
        token:TOKEN_ASSIGN,
        location:{token:TOKEN_ID, name:'b'},
        new_value:{token:LITERAL_INT, value:2}
      }
    ]],
    ['if (true) {}', {
      token:TOKEN_IF,
      expression:{token:LITERAL_BOOLEAN, value:true},
      body:{}
    }],
    ['if (a) {}', {
      token:TOKEN_IF,
      expression:{token:TOKEN_ID, name:'a'},
      body:{}
    }],
    ['if (a && b) {} else {}', {
      token:TOKEN_IF,
      expression:{
        token:TOKEN_LOGICAL_AND,
        lhs:{token:TOKEN_ID, name:'a'},
        rhs:{token:TOKEN_ID, name:'b'}
      },
      body:{},
      else_body: {}
    }],
    ['if (a != null) { a = null; } else if (b) { a = b; }', {
      token:TOKEN_IF,
      expression:{
        token:TOKEN_NE,
        lhs:{token:TOKEN_ID, name:'a'},
        rhs:{token:TOKEN_NULL, value:'null'}
      },
      body: [{
        token:TOKEN_ASSIGN,
        location:{token:TOKEN_ID, name:'a'},
        new_value:{token:TOKEN_NULL, value:'null'}
      }],
      else_body: {
        token:TOKEN_IF,
        expression:{token:TOKEN_ID, name:'b'},
        body: [{
            token:TOKEN_ASSIGN,
            location:{token:TOKEN_ID, name:'a'},
            new_value:{token:TOKEN_ID, name:'b'}
        }]
      }
    }],
    ['while (a) a = b;', {
      token:TOKEN_WHILE,
      expression:{token:TOKEN_ID, name:'a'},
      body: {
        token:TOKEN_ASSIGN,
        location:{token:TOKEN_ID, name:'a'},
        new_value:{token:TOKEN_ID, name:'b'}
      }
    }],
    ['while (!a) { c = a; a = b; b = a; }', {
      token:TOKEN_WHILE,
      expression:{
        token:TOKEN_BANG,
        operand:{token:TOKEN_ID, name:'a'}
      },
      body: [
        {
          token:TOKEN_ASSIGN,
          location:{token:TOKEN_ID, name:'c'},
          new_value:{token:TOKEN_ID, name:'a'}
        },
        {
          token:TOKEN_ASSIGN,
          location:{token:TOKEN_ID, name:'a'},
          new_value:{token:TOKEN_ID, name:'b'}
        },
        {
          token:TOKEN_ASSIGN,
          location:{token:TOKEN_ID, name:'b'},
          new_value:{token:TOKEN_ID, name:'a'}
        }
      ]
    }],
    ['for (int i = 0; i < len; i++) a *= i;', {
      token:TOKEN_FOR,
      initialization:[{
        token:TOKEN_ID,
        type:{token:TOKEN_INT, name:'int'},
        name:'i',
        initial_value:{token:LITERAL_INT, value:0}
      }],
      condition: {
        token:TOKEN_LT,
        lhs:{token:TOKEN_ID, name:'i'},
        rhs:{token:TOKEN_ID, name:'len'}
      },
      var_mod:{
        token:TOKEN_INCREMENT,
        operand:{token:TOKEN_ID, name:'i'}
      },
      body: {
        token:TOKEN_MUL_ASSIGN,
        location:{token:TOKEN_ID, name:'a'},
        new_value:{token:TOKEN_ID, name:'i'}
      }
    }],
    ['for (Object obj : collection) { obj = null; }', {
      token:TOKEN_FOR,
      type:{token:TOKEN_ID, name:'Object'},
      name:'obj',
      iterable: {token:TOKEN_ID, name:'collection'},
      body:[{
          token:TOKEN_ASSIGN,
          location:{token:TOKEN_ID, name:'obj'},
          new_value:{token:TOKEN_NULL, value:'null'}
      }]
    }],
    ['break;', {token:TOKEN_BREAK}],
    ['continue;', {token:TOKEN_CONTINUE}],
    ['assert(true);', {
      token:TOKEN_ASSERT,
      expression:{token:LITERAL_BOOLEAN, value:true}}],
    ['assert(a != null, "a is null");', {
      token:TOKEN_ASSERT,
      expression:{token:TOKEN_NE,
                  lhs:{token:TOKEN_ID, name:'a'},
                  rhs:{token:TOKEN_NULL, value:'null'}},
      message:'a is null'}],
    ['print();', {
      token:TOKEN_ID,
      name:'print',
      args:[]}],
    ['print("hello");', {
      token:TOKEN_ID,
      name:'print',
      args:[
        {token:LITERAL_STRING, value:'hello'}
      ]}],
    ['int[] a = {};', [{
      token:TOKEN_ID,
      type:{token:TOKEN_INT, name:'int[]'},
      name:'a',
      initial_value:{
        token:TOKEN_LCURLY,
        type:{token:TOKEN_INT, name:'int[]'},
        terms:[]
      }}]],
    ['int[] a = {0, 1};', [{
      token:TOKEN_ID,
      type:{token:TOKEN_INT, name:'int[]'},
      name:'a',
      initial_value:{
        token:TOKEN_LCURLY,
        type:{token:TOKEN_INT, name:'int[]'},
        terms:[
          {token:LITERAL_INT, value:0},
          {token:LITERAL_INT, value:1}
        ]
      }}]],
    ['int[][] a = {{0, 1}, {0, 1}};', [{
      token:TOKEN_ID,
      type:{token:TOKEN_INT, name:'int[][]'},
      name:'a',
      initial_value:{
        token:TOKEN_LCURLY,
        type:{token:TOKEN_INT, name:'int[][]'},
        terms:[
          {
            token:TOKEN_LCURLY,
            type:{token:TOKEN_INT, name:'int[]'},
            terms:[
              {token:LITERAL_INT, value:0},
              {token:LITERAL_INT, value:1}
            ]
          },
          {
            token:TOKEN_LCURLY,
            type:{token:TOKEN_INT, name:'int[]'},
            terms:[
              {token:LITERAL_INT, value:0},
              {token:LITERAL_INT, value:1}
            ]
          }
        ]}}]],
    ['super();', {
      token:TOKEN_SUPER,
      args:[
      ]
    }],
    ['super.x', {
      token:TOKEN_SUPER,
      name:'x',
      args:null
    }],
    ['super.isAwesome();', {
      token:TOKEN_SUPER,
      name:'isAwesome',
      args:[
      ]
    }],
    ['return; // i\'m not here', {
      token:TOKEN_RETURN,
      value:'void'
    }],
    ['/* this is\n' +
     '   ignored */\n' +
     'return;', {
       token:TOKEN_RETURN,
       value:'void'
     }]
  ];

  print('BEGIN TESTS');
  print('');

  var pass_count = 0;
  var fail_count = 0;
  for (i in tests) {
    var t = tests[i];
    print('Testing the parsing of ' + t[0]);
    init();
    data = t[0];

    var stm = parse_statement(false);
    print_ast(stm);
    if (equal(stm, t[1])) {
      print('Passed.');
      pass_count++;
    } else {
      print('FAILED.');
      fail_count++;
    }

    print('');
  }

  print('SUMMARY');
  print('=======');
  print('Passed ' + pass_count + ' tests.');
  print('Failed ' + fail_count + ' tests.');
  print('END TESTS');
}


var test_parse_types = function () {
  var tests = [
    ['class Empty {}', {
      parsed_types: [{
        token:TOKEN_CLASS,
        qualifiers:JOG_QUALIFIER_CLASS | JOG_QUALIFIER_PROTECTED,
        name:'Empty',
        static_initializers:[{
          token: TOKEN_CLASS,
          qualifiers:JOG_QUALIFIER_STATIC,
          // TODO: type_context:,
          return_type:null,
          name:'static'
        }]
      }]
    }],
    ['class Test {' +
     '  Test () {' +
     '    Object obj = "Works";' +
     '    String str = (String)obj;' +
     '    println(str);' +
     '  }' +
     '}', {
       parsed_types: [{
         token:TOKEN_CLASS,
         qualifiers:JOG_QUALIFIER_CLASS | JOG_QUALIFIER_PROTECTED,
         name:'Test',
         static_initializers:[{
           token: TOKEN_CLASS,
           qualifiers:JOG_QUALIFIER_STATIC,
           // TODO: type_context:,
           return_type:null,
           name:'static'
         }],
         methods:[{
           token:TOKEN_ID,
           qualifiers:JOG_QUALIFIER_CONSTRUCTOR,
           return_type: null,
           name:'<init>',
           statements:[[{
             token:TOKEN_ID,
             type:{token:TOKEN_ID, name:'Object'},
             name:'obj',
             initial_value:{token:LITERAL_STRING, value:'Works'}
           }],[{
             token:TOKEN_ID,
             type:{token:TOKEN_STRING, name:'String'},
             name:'str',
             initial_value:{
               token:TOKEN_LPAREN,
               operand:{token:TOKEN_ID, name:'obj'},
               to_type:{token:TOKEN_STRING, name:'String'}}
           }],{
             token:TOKEN_ID,
             name:'println',
             args:[
               {token:TOKEN_ID, name:'str'}
             ]
           }]}],
       }]
     }],
    ['class Test {' +
     '  public class A {' +
     '    public A () {;}' +
     '  }' +
     '}', {
       parsed_types:[{
         token:TOKEN_CLASS,
         qualifiers:JOG_QUALIFIER_CLASS | JOG_QUALIFIER_PROTECTED,
         name:'Test',
         static_initializers:[{
           token:TOKEN_CLASS,
           qualifiers:JOG_QUALIFIER_STATIC,
           // TODO: type_context:,
           return_type:null,
           name:'static'
         }]},{
           token:TOKEN_CLASS,
           qualifiers:JOG_QUALIFIER_CLASS | JOG_QUALIFIER_PUBLIC,
           // TODO: type_context:,
           name:'A',
           static_initializers:[{
             token:TOKEN_CLASS,
             qualifiers:JOG_QUALIFIER_STATIC,
             // TODO: type_context:,
             return_type:null,
             name:'static'
           }],
           methods:[{
             token:TOKEN_PUBLIC,
             qualifiers:JOG_QUALIFIER_CONSTRUCTOR | JOG_QUALIFIER_PUBLIC,
             return_type: null,
             name:'<init>',
             statements:null
           }]
         }]}],
    ['class Test {\n' +
     '  Test ()\n' +
     '  {\n' +
     '    Object obj = "Works";\n' +
     '    String st = (String) obj;\n' +
     '    println( st );\n' +
     '  }\n' +
     '\n' +
     '  public class A {\n' +
     '    public A () {;}\n' +
     '  }\n' +
     '\n' +
     '  public class B {\n' +
     '    public B () {;}\n' +
     '    public A something () {\n' +
     '      if (true) {return null;}\n' +
     '      return (A) new A ();\n' +
     '    }\n' +
     '  }\n' +
     '}', {
       parsed_types:[
         {
           token:TOKEN_CLASS,
           qualifiers:34,
           name:'Test',
           static_initializers:[
             {
               token:TOKEN_CLASS,
               qualifiers:8,
               return_type:null,
               name:'static'
             }
           ],
           methods:[
             {
               token:TOKEN_ID,
               qualifiers:256,
               return_type:null,
               name:'<init>',
               statements:[
                 [
                   {
                     token:TOKEN_ID,
                     type:{
                       token:TOKEN_ID,
                       name:'Object'
                     },
                     name:'obj',
                     initial_value:{
                       token:LITERAL_STRING,
                       value:'Works'
                     }
                   }
                 ],
                 [
                   {
                     token:TOKEN_ID,
                     type:{
                       token:TOKEN_STRING,
                       name:'String'
                     },
                     name:'st',
                     initial_value:{
                       token:TOKEN_LPAREN,
                       operand:{
                         token:TOKEN_ID,
                         name:'obj'
                       },
                       to_type:{
                         token:TOKEN_STRING,
                         name:'String'
                       }
                     }
                   }
                 ],
                 {
                   token:TOKEN_ID,
                   name:'println',
                   args:[
                     {
                       token:TOKEN_ID,
                       name:'st'
                     }
                   ]
                 }
               ]
             }
           ]
         },
         {
           token:TOKEN_CLASS,
           qualifiers:33,
           name:'A',
           static_initializers:[
             {
               token:TOKEN_CLASS,
               qualifiers:8,
               return_type:null,
               name:'static'
             }
           ],
           methods:[
             {
               token:TOKEN_PUBLIC,
               qualifiers:257,
               return_type:null,
               name:'<init>'
             }
           ]
         },
         {
           token:TOKEN_CLASS,
           qualifiers:33,
           name:'B',
           static_initializers:[
             {
               token:TOKEN_CLASS,
               qualifiers:8,
               return_type:null,
               name:'static'
             }
           ],
           methods:[
             {
               token:TOKEN_PUBLIC,
               qualifiers:257,
               return_type:null,
               name:'<init>'
             },
             {
               token:TOKEN_PUBLIC,
               qualifiers:1,
               return_type:{
                 token:TOKEN_ID,
                 name:'A'
               },
               name:'something',
               statements:[
                 {
                   token:TOKEN_IF,
                   expression:{
                     token:LITERAL_BOOLEAN,
                     value:true
                   },
                   body:[
                     {
                       token:TOKEN_RETURN,
                       expression:{
                         token:TOKEN_NULL,
                         value:'null'
                       }
                     }
                   ]
                 },
                 {
                   token:TOKEN_RETURN,
                   expression:{
                     token:TOKEN_LPAREN,
                     operand:{
                       token:TOKEN_NEW,
                       type:{
                         token:TOKEN_ID,
                         name:'A'
                       },
                       args:[
                       ]
                     },
                     to_type:{
                       token:TOKEN_ID,
                       name:'A'
                     }
                   }
                 }
               ]
             }
           ]
         }
       ]
     }],
    ['class Outer<T> {\n' +
     '  T t;\n' +
     '  class Inner {\n' +
     '    T setOuterT(T t1) {t = t1;return t;}\n' +
     '  }\n' +
     '}', {
       parsed_types:[
         {
           token:TOKEN_CLASS,
           qualifiers:34,
           name:'Outer',
           placeholder_types:[
             {
               token:TOKEN_ID,
               name:'T'
             }
           ],
           properties:[
             {
               token:TOKEN_ID,
               qualifiers:0,
               type:{
                 token:TOKEN_ID,
                 name:'T'
               },
               name:'t',
               initial_value:null
             }
           ],
           template_tokens:[
             {
               type:28
             },
             {
               type:1,
               content:'T'
             },
             {
               type:1,
               content:'t'
             },
             {
               type:19
             },
             {
               type:59,
               content:'class'
             },
             {
               type:1,
               content:'Inner'
             },
             {
               type:28
             },
             {
               type:1,
               content:'T'
             },
             {
               type:1,
               content:'setOuterT'
             },
             {
               type:10
             },
             {
               type:1,
               content:'T'
             },
             {
               type:1,
               content:'t1'
             },
             {
               type:11
             },
             {
               type:28
             },
             {
               type:1,
               content:'t'
             },
             {
               type:21,
               content:'='
             },
             {
               type:1,
               content:'t1'
             },
             {
               type:19
             },
             {
               type:84,
               content:'return'
             },
             {
               type:1,
               content:'t'
             },
             {
               type:19
             },
             {
               type:30
             },
             {
               type:30
             },
             {
               type:30
             }
           ]
         },
         {
           token:TOKEN_CLASS,
           qualifiers:34,
           name:'Inner',
           static_initializers:[
             {
               token:TOKEN_CLASS,
               qualifiers:8,
               return_type:null,
               name:'static'
             }
           ],
           methods:[
             {
               token:TOKEN_ID,
               qualifiers:0,
               return_type:{
                 token:TOKEN_ID,
                 name:'T'
               },
               name:'setOuterT',
               parameters:[
                 {
                   token:TOKEN_ID,
                   type:{
                     token:TOKEN_ID,
                     name:'T'
                   },
                   name:'t1'
                 }
               ],
               statements:[
                 {
                   token:TOKEN_ASSIGN,
                   location:{
                     token:TOKEN_ID,
                     name:'t'
                   },
                   new_value:{
                     token:TOKEN_ID,
                     name:'t1'
                   }
                 },
                 {
                   token:TOKEN_RETURN,
                   expression:{
                     token:TOKEN_ID,
                     name:'t'
                   }
                 }
               ]
             }
           ]
         }
       ]
     }],
    ['/* Test class with comments */\n' +
     '/* 1\n' +
     '   2\n' +
     '*/\n' +
      'class Empty {\n' +
      '  // single-line comment\n' +
      '  /* multi-line comment */\n' +
     '}', {
       parsed_types: [{
         token:TOKEN_CLASS,
         qualifiers:JOG_QUALIFIER_CLASS | JOG_QUALIFIER_PROTECTED,
         name:'Empty',
         static_initializers:[{
           token: TOKEN_CLASS,
           qualifiers:JOG_QUALIFIER_STATIC,
           // TODO: type_context:,
           return_type:null,
           name:'static'
         }]
       }]
     }],
    ['package java.lang;', {
      parsed_types:[
      ],
      'package':{
        token:TOKEN_PACKAGE,
        name:'java.lang'
      }
    }],
    ['package java.lang;\n' +
     'import java.io;\n' +
     'import java.error.*;', {
       parsed_types:[
       ],
       'package':{
         token:TOKEN_PACKAGE,
         name:'java.lang'
       },
       imports:[
         {
           token:TOKEN_IMPORT,
           name:'java.io'
         },
         {
           token:TOKEN_IMPORT,
           name:'java.error.*'
         }
       ]
     }],
    ['import java.io;\n' +
     'class Empty {}', {
      parsed_types:[{
        token:TOKEN_CLASS,
        qualifiers:JOG_QUALIFIER_CLASS | JOG_QUALIFIER_PROTECTED,
        name:'Empty',
        static_initializers:[{
          token: TOKEN_CLASS,
          qualifiers:JOG_QUALIFIER_STATIC,
          // TODO: type_context:,
          return_type:null,
          name:'static'
        }]
      }],
      imports:[
        {
          token:TOKEN_IMPORT,
          name:'java.io'
        }
      ]
    }]
  ];

  print('BEGIN TESTS');
  print('');

  var pass_count = 0;
  var fail_count = 0;
  for (i in tests) {
    var t = tests[i];
    print('Testing the parsing of ' + t[0]);
    init();
    init_parser();
    data = t[0];

    parse();
    delete Parser.this_method;

    //print_ast(Parser);
    if (equal(Parser, t[1])) {
      print('Passed.');
      pass_count++;
    } else {
      print('FAILED.');
      fail_count++;
    }

    print('');
  }

  print('SUMMARY');
  print('=======');
  print('Passed ' + pass_count + ' tests.');
  print('Failed ' + fail_count + ' tests.');
  print('END TESTS');
}

//test_tokenize();
//test_parse();
//test_parse_types();
