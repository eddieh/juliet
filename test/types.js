
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
