if (typeof(load) === 'undefined') {
  if (typeof(require) !== 'undefined') {
    nodeRequire = require;
    load = function(filename) {
      var fs = require('fs');
      var script = fs.readFileSync(filename, 'utf8');
      var evalGlobal = eval.bind(this);
      evalGlobal(script);
    };
  }
}

load('src/platform.js');
load('src/juliet.js');
load('src/util.js');
load('src/lexer.js');
load('src/parser.js');

Juliet.options.trace = true;

var test_parse = function() {
  var tests = [
    ['3.14', {
      token:Juliet.LITERAL_DOUBLE,
      kind:'literal',
      value:3.14},
     'Expression'],
    ['42', {
      token:Juliet.LITERAL_INT,
      kind:'literal',
      value:42},
     'Expression'],
    ['\'a\'', {
      token:Juliet.LITERAL_CHAR,
      kind:'literal',
      value:'a'}, 'Expression'],
    ['"hello"', {
      token:Juliet.LITERAL_STRING,
      kind:'literal',
      value:'hello'}, 'Expression'],
    ['false', {
      token:Juliet.LITERAL_BOOLEAN,
      kind:'literal',
      value:false}, 'Expression'],
    ['true', {
      token:Juliet.LITERAL_BOOLEAN,
      kind:'literal',
      value:true}, 'Expression'],
    ['null', {
      token:Juliet.TOKEN_NULL,
      kind:'literal',
      value:'null'}, 'Expression'],
    ['a = b;', {
      token:Juliet.TOKEN_ASSIGN,
      kind:'assignment',
      location:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'},
      new_value:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'b'}}, 'BlockStatement'],
    ['a += b;', {
      token:Juliet.TOKEN_ADD_ASSIGN,
      kind:'assignment',
      location:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'},
      new_value:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'b'}}, 'BlockStatement'],
    ['a -= b;', {
      token:Juliet.TOKEN_SUB_ASSIGN,
      kind:'assignment',
      location:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'},
      new_value:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'b'}}, 'BlockStatement'],
    ['a *= b;', {
      token:Juliet.TOKEN_MUL_ASSIGN,
      kind:'assignment',
      location:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'},
      new_value:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'b'}}, 'BlockStatement'],
    ['a /= b;', {
      token:Juliet.TOKEN_DIV_ASSIGN,
      kind:'assignment',
      location:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'},
      new_value:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'b'}}, 'BlockStatement'],
    ['a %= b;', {
      token:Juliet.TOKEN_MOD_ASSIGN,
      kind:'assignment',
      location:{token:Juliet.TOKEN_ID, kind:'construct', name:'a'},
      new_value:{token:Juliet.TOKEN_ID, kind:'construct', name:'b'}}, 'BlockStatement'],
    ['a &= b;', {
      token:Juliet.TOKEN_AND_ASSIGN,
      kind:'assignment',
      location:{token:Juliet.TOKEN_ID, kind:'construct', name:'a'},
      new_value:{token:Juliet.TOKEN_ID, kind:'construct', name:'b'}}, 'BlockStatement'],
    ['a |= b;', {
      token:Juliet.TOKEN_OR_ASSIGN,
      kind:'assignment',
      location:{token:Juliet.TOKEN_ID, kind:'construct', name:'a'},
      new_value:{token:Juliet.TOKEN_ID, kind:'construct', name:'b'}}, 'BlockStatement'],
    ['a ^= b;', {
      token:Juliet.TOKEN_XOR_ASSIGN,
      kind:'assignment',
      location:{token:Juliet.TOKEN_ID, kind:'construct', name:'a'},
      new_value:{token:Juliet.TOKEN_ID, kind:'construct', name:'b'}}, 'BlockStatement'],
    ['a <<= b;', {
      token:Juliet.TOKEN_SHL_ASSIGN,
      kind:'assignment',
      location:{token:Juliet.TOKEN_ID, kind:'construct', name:'a'},
      new_value:{token:Juliet.TOKEN_ID, kind:'construct', name:'b'}}, 'BlockStatement'],
    ['a >>>= b;', {
      token:Juliet.TOKEN_SHRX_ASSIGN,
      kind:'assignment',
      location:{token:Juliet.TOKEN_ID, kind:'construct', name:'a'},
      new_value:{token:Juliet.TOKEN_ID, kind:'construct', name:'b'}}, 'BlockStatement'],
    ['a >>= b;', {
      token:Juliet.TOKEN_SHR_ASSIGN,
      kind:'assignment',
      location:{token:Juliet.TOKEN_ID, kind:'construct', name:'a'},
      new_value:{token:Juliet.TOKEN_ID, kind:'construct', name:'b'}}, 'BlockStatement'],
    ['true ? "true" : "false"', {
      token:Juliet.TOKEN_QUESTIONMARK,
      kind:'ternary',
      expression:{
        token:Juliet.LITERAL_BOOLEAN,
        kind:'literal',
        value:true
      },
      true_value:{
        token:Juliet.LITERAL_STRING,
        kind:'literal',
        value:'true'
      },
      false_value:{
        token:Juliet.LITERAL_STRING,
        kind:'literal',
        value:'false'
      }
    }, 'Expression'],
    [';', {
      kind:'noop',
      token:Juliet.TOKEN_SEMICOLON
    }, 'BlockStatement'],
    ['a = true || false;', {
      token:Juliet.TOKEN_ASSIGN,
      kind:'assignment',
      location:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'},
      new_value:{
        token:Juliet.TOKEN_LOGICAL_OR,
        kind:'binary',
        lhs:{
          token:Juliet.LITERAL_BOOLEAN,
          kind:'literal',
          value:true},
        rhs:{
          token:Juliet.LITERAL_BOOLEAN,
          kind:'literal',
          value:false}}}, 'Expression'],
    ['a = true && false;', {
      token:Juliet.TOKEN_ASSIGN,
      kind:'assignment',
      location:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'},
      new_value:{
        token:Juliet.TOKEN_LOGICAL_AND,
        kind:'binary',
        lhs:{
          token:Juliet.LITERAL_BOOLEAN,
          kind:'literal',
          value:true},
        rhs:{
          token:Juliet.LITERAL_BOOLEAN,
          kind:'literal',
          value:false}}}, 'Expression'],
    ['a = 1 | 0;', {
      token:Juliet.TOKEN_ASSIGN,
      kind:'assignment',
      location:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      },
      new_value:{
        token:Juliet.TOKEN_PIPE,
        kind:'binary',
        lhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:1
        },
        rhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:0
        }
      }
    }, 'Expression'],
    ['a = 1 ^ 0;', {
      token:Juliet.TOKEN_ASSIGN,
      kind:'assignment',
      location:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      },
      new_value:{
        token:Juliet.TOKEN_CARET,
        kind:'binary',
        lhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:1
        },
        rhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:0
        }
      }
    }, 'Expression'],
    ['a = 1 & 0;', {
      token:Juliet.TOKEN_ASSIGN,
      kind:'assignment',
      location:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      },
      new_value:{
        token:Juliet.TOKEN_AMPERSAND,
        kind:'binary',
        lhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:1
        },
        rhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:0
        }
      }
    }, 'Expression'],
    ['a = 1 << 0;', {
      token:Juliet.TOKEN_ASSIGN,
      kind:'assignment',
      location:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      },
      new_value:{
        token:Juliet.TOKEN_SHL,
        kind:'binary',
        lhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:1
        },
        rhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:0
        }
      }
    }, 'Expression'],
    ['a = 1 >> 0;', {
      token:Juliet.TOKEN_ASSIGN,
      kind:'assignment',
      location:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      },
      new_value:{
        token:Juliet.TOKEN_SHR,
        kind:'binary',
        lhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:1
        },
        rhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:0
        }
      }
    }, 'Expression'],
    ['a = 1 >>> 0;', {
      token:Juliet.TOKEN_ASSIGN,
      kind:'assignment',
      location:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      },
      new_value:{
        token:Juliet.TOKEN_SHRX,
        kind:'binary',
        lhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:1
        },
        rhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:0
        }
      }
    }, 'Expression'],
    ['a = 1 < 0;', {
      token:Juliet.TOKEN_ASSIGN,
      kind:'assignment',
      location:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      },
      new_value:{
        token:Juliet.TOKEN_LT,
        kind:'binary',
        lhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:1
        },
        rhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:0
        }
      }
    }, 'Expression'],
    ['a = 1 <= 0;', {
      token:Juliet.TOKEN_ASSIGN,
      kind:'assignment',
      location:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      },
      new_value:{
        token:Juliet.TOKEN_LE,
        kind:'binary',
        lhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:1
        },
        rhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:0
        }
      }
    }, 'Expression'],
    ['a = 1 > 0;', {
      token:Juliet.TOKEN_ASSIGN,
      kind:'assignment',
      location:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      },
      new_value:{
        token:Juliet.TOKEN_GT,
        kind:'binary',
        lhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:1
        },
        rhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:0
        }
      }
    }, 'Expression'],
    ['a = 1 >= 0;', {
      token:Juliet.TOKEN_ASSIGN,
      kind:'assignment',
      location:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      },
      new_value:{
        token:Juliet.TOKEN_GE,
        kind:'binary',
        lhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:1
        },
        rhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:0
        }
      }
    }, 'Expression'],
    ['a = b instanceof c;', {
      token:Juliet.TOKEN_ASSIGN,
      kind:'assignment',
      location:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      },
      new_value:{
        token:Juliet.TOKEN_INSTANCEOF,
        kind:'binary',
        lhs:{
          token:Juliet.TOKEN_ID,
          kind:'construct',
          name:'b'
        },
        rhs:{
          token:Juliet.TOKEN_ID,
          kind:'type',
          name:'c'
        }
      }
    }, 'Expression'],
    ['a = 1 == 0;', {
      token:Juliet.TOKEN_ASSIGN,
      kind:'assignment',
      location:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      },
      new_value:{
        token:Juliet.TOKEN_EQ,
        kind:'binary',
        lhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:1
        },
        rhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:0
        }
      }
    }, 'Expression'],
    ['a = 1 != 0;', {
      token:Juliet.TOKEN_ASSIGN,
      kind:'assignment',
      location:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      },
      new_value:{
        token:Juliet.TOKEN_NE,
        kind:'binary',
        lhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:1
        },
        rhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:0
        }
      }
    }, 'Expression'],
    ['a = 1 + 0;', {
      token:Juliet.TOKEN_ASSIGN,
      kind:'assignment',
      location:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      },
      new_value:{
        token:Juliet.TOKEN_PLUS,
        kind:'binary',
        lhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:1
        },
        rhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:0
        }
      }
    }, 'Expression'],
    ['a = 1 - 0;', {
      token:Juliet.TOKEN_ASSIGN,
      kind:'assignment',
      location:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      },
      new_value:{
        token:Juliet.TOKEN_MINUS,
        kind:'binary',
        lhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:1
        },
        rhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:0
        }
      }
    }, 'Expression'],
    ['a = 1 * 0;', {
      token:Juliet.TOKEN_ASSIGN,
      kind:'assignment',
      location:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      },
      new_value:{
        token:Juliet.TOKEN_STAR,
        kind:'binary',
        lhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:1
        },
        rhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:0
        }
      }
    }, 'Expression'],
    ['a = 1 / 1;', {
      token:Juliet.TOKEN_ASSIGN,
      kind:'assignment',
      location:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      },
      new_value:{
        token:Juliet.TOKEN_SLASH,
        kind:'binary',
        lhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:1
        },
        rhs:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:1
        }
      }
    }, 'Expression'],
    ['(int)a', {
      token:Juliet.TOKEN_LPAREN,
      kind:'cast',
      operand:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      },
      to_type:{
        token:Juliet.TOKEN_INT,
        kind:'type',
        name:'int'
      }
    }, 'Expression'],
    ['(Object)a', {
      token:Juliet.TOKEN_LPAREN,
      kind:'cast',
      operand:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      },
      to_type:{
        token:Juliet.TOKEN_ID,
        kind:'type',
        name:'Object'
      }
    }, 'Expression'],
    ['new Object()', {
      token:Juliet.TOKEN_NEW,
      kind:'new',
      type:{
        token:Juliet.TOKEN_ID,
        kind:'type',
        name:'Object'
      },
      args:[
      ]
    }, 'Expression'],
    ['new Object(a, b)', {
      token:Juliet.TOKEN_NEW,
      kind:'new',
      type:{
        token:Juliet.TOKEN_ID,
        kind:'type',
        name:'Object'
      },
      args:[
        {
          token:Juliet.TOKEN_ID,
          kind:'construct',
          name:'a'
        },
        {
          token:Juliet.TOKEN_ID,
          kind:'construct',
          name:'b'
        }
      ]
    }, 'Expression'],
    ['new int[10]', {
      token:Juliet.TOKEN_NEW,
      kind:'array',
      type:{
        token:Juliet.TOKEN_INT,
        kind:'type',
        name:'int',
      },
      length:[{
        token:Juliet.LITERAL_INT,
        kind:'literal',
        value:10
      }]
    }, 'Expression'],
    ['new int[10][3]', {
      token:Juliet.TOKEN_NEW,
      kind:'array',
      type:{
        token:Juliet.TOKEN_INT,
        kind:'type',
        name:'int',
      },
      length:[{
        token:Juliet.LITERAL_INT,
        kind:'literal',
        value:10
      },
              {
                token:Juliet.LITERAL_INT,
                kind:'literal',
                value:3
              }]
    }, 'Expression'],
    ['++a', {
      token:Juliet.TOKEN_INCREMENT,
      kind:'prefix',
      operand:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      }
    }, 'Expression'],
    ['--a', {
      token:Juliet.TOKEN_DECREMENT,
      kind:'prefix',
      operand:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      }
    }, 'Expression'],
    ['+a', {
      token:Juliet.TOKEN_ID,
      kind:'construct',
      name:'a'
    }, 'Expression'],
    ['-a', {
      token:Juliet.TOKEN_MINUS,
      kind:'prefix',
      operand:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      }
    }, 'Expression'],
    ['!a', {
      token:Juliet.TOKEN_BANG,
      kind:'prefix',
      operand:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      }
    }, 'Expression'],
    ['~a', {
      token:Juliet.TOKEN_TILDE,
      kind:'prefix',
      operand:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      }
    }, 'Expression'],
    ['a++', {
      token:Juliet.TOKEN_INCREMENT,
      kind:'postfix',
      operand:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      }
    }, 'Expression'],
    ['a--', {
      token:Juliet.TOKEN_DECREMENT,
      kind:'postfix',
      operand:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      }
    }, 'Expression'],
    ['a.b', {
      token:Juliet.TOKEN_PERIOD,
      kind:'postfix',
      operand:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      },
      term:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'b'
      }
    }, 'Expression'],
    ['int[] a;',
     {
       token:Juliet.TOKEN_ID,
       kind:'local',
       type:{
         token:Juliet.TOKEN_INT,
         kind:'type',
         name:'int[]'
       },
       name:'a',
       initial_value:null
     }, 'BlockStatement'],
    ['Object[] a;',
     {
       token:Juliet.TOKEN_ID,
       kind:'local',
       type:{
         token:Juliet.TOKEN_ID,
         kind:'type',
         name:'Object[]'
       },
       name:'a',
       initial_value:null
     }, 'BlockStatement'],
    ['a[0]', {
      token:Juliet.TOKEN_LBRACKET,
      kind:'postfix',
      operand:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      },
      expression:{
        token:Juliet.LITERAL_INT,
        kind:'literal',
        value:0
      }
    }, 'Expression'],
    ['a[b]', {
      token:Juliet.TOKEN_LBRACKET,
      kind:'postfix',
      operand:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      },
      expression:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'b'
      }
    }, 'Expression'],
    ['a[0][0]', {
      token:Juliet.TOKEN_LBRACKET,
      kind:'postfix',
      operand:{
        token:Juliet.TOKEN_LBRACKET,
        kind:'postfix',
        operand:{
          token:Juliet.TOKEN_ID,
          kind:'construct',
          name:'a'
        },
        expression:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:0
        }
      },
      expression:{
        token:Juliet.LITERAL_INT,
        kind:'literal',
        value:0
      }
    }, 'Expression'],
    ['var1 |= (true || false);', {
      token:Juliet.TOKEN_OR_ASSIGN,
      kind:'assignment',
      location:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'var1'
      },
      new_value:{
        token:Juliet.TOKEN_LOGICAL_OR,
        kind:'binary',
        lhs:{
          token:Juliet.LITERAL_BOOLEAN,
          kind:'literal',
          value:true
        },
        rhs:{
          token:Juliet.LITERAL_BOOLEAN,
          kind:'literal',
          value:false
        }
      }
    }, 'BlockStatement'],
    ['var1 = (a + b) * c;', {
      token:Juliet.TOKEN_ASSIGN,
      kind:'assignment',
      location:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'var1'
      },
      new_value:{
        token:Juliet.TOKEN_STAR,
        kind:'binary',
        lhs:{
          token:Juliet.TOKEN_PLUS,
          kind:'binary',
          lhs:{
            token:Juliet.TOKEN_ID,
            kind:'construct',
            name:'a'
          },
          rhs:{
            token:Juliet.TOKEN_ID,
            kind:'construct',
            name:'b'
          }
        },
        rhs:{
          token:Juliet.TOKEN_ID,
          kind:'construct',
          name:'c'
        }
      }
    }, 'BlockStatement'],
    ['int num = 1;',
     {
       token: Juliet.TOKEN_ID,
       kind: 'local',
       type:{
         token: Juliet.TOKEN_INT,
         kind: 'type',
         name: 'int'
       },
       name:'num',
       initial_value:{
         token: Juliet.LITERAL_INT,
         kind: 'literal',
         value: 1
       }
     }, 'BlockStatement'],
    ['float num = 1.0, num2 = 6.28;', [
      {
        token:Juliet.TOKEN_ID,
        kind:'local',
        type:{
          token:Juliet.TOKEN_FLOAT,
          kind:'type',
          name:'float'
        },
        name:'num',
        initial_value:{
          token:Juliet.LITERAL_DOUBLE,
          kind:'literal',
          value:1
        }
      },
      {
        token:Juliet.TOKEN_ID,
        kind:'local',
        type:{
          token:Juliet.TOKEN_FLOAT,
          kind:'type',
          name:'float'
        },
        name:'num2',
        initial_value:{
          token:Juliet.LITERAL_DOUBLE,
          kind:'literal',
          value:6.28
        }
      }
    ], 'BlockStatement'],
    ['Vector<String> x;', 
     {
       token: Juliet.TOKEN_ID, 
       name:'x', 
       initial_value:null, 
       kind:'local', 
       type:{
         token: Juliet.TOKEN_ID, 
         kind:'type', 
         name:'Vector<String>'
       }
     },
     'BlockStatement'],
    ['Seq<Seq<A>> x;',
     {
       token:Juliet.TOKEN_ID, 
       name:'x', 
       initial_value:null, 
       kind:'local', 
       type:{
         token:Juliet.TOKEN_ID, 
         kind:'type', 
         name:'Seq<Seq<A>>'
       }
     },
     'BlockStatement'],
    ['Seq<Seq<Seq<A>>> x;',
     {
       token:Juliet.TOKEN_ID, 
       name:'x', 
       initial_value:null, 
       kind:'local', 
       type:{
         token:Juliet.TOKEN_ID, 
         kind:'type', 
         name:'Seq<Seq<Seq<A>>>'
       }
     }, 
     'BlockStatement'],
    ['Seq<Seq<Seq<Seq<A>>>> x;',
     {
       token:Juliet.TOKEN_ID, 
       name:'x', 
       initial_value:null, 
       kind:'local', 
       type:{
         token:Juliet.TOKEN_ID, 
         kind:'type', 
         name:'Seq<Seq<Seq<Seq<A>>>>'
       }
     },
     'BlockStatement'],
    ['Seq<String>.Zipper<Integer> x;',
     {
       token:Juliet.TOKEN_ID, 
       name:'x', 
       initial_value:null, 
       kind:'local', 
       type:{
         token:Juliet.TOKEN_ID, 
         kind:'type', 
         name:'Seq<String>.Zipper<Integer>'
       }
     }, 
     'BlockStatement'],
    ['Collection<Integer> x;', 
     {
       token:Juliet.TOKEN_ID, 
       name:'x', 
       initial_value:null, 
       kind:'local', 
       type:{
         token:Juliet.TOKEN_ID, 
         kind:'type', 
         name:'Collection<Integer>'
       }
     },
     'BlockStatement'],
    ['Pair<String,String> x;', 
     {
       token:Juliet.TOKEN_ID, 
       name:'x', 
       initial_value:null, 
       kind:'local', 
       type:{
         token:Juliet.TOKEN_ID, 
         kind:'type', 
         name:'Pair<String,String>'
       }
     },
     'BlockStatement'],
    ['Collection<?> x;', 
     {
       token:Juliet.TOKEN_ID, 
       name:'x', 
       initial_value:null, 
       kind:'local', 
       type:{
         token:Juliet.TOKEN_ID, 
         kind:'type', 
         name:'Collection<?>'
       }
     }, 
     'BlockStatement'],
    ['Class<?>[] x;', 
     {
       token:Juliet.TOKEN_ID, 
       name:'x', 
       initial_value:null, 
       kind:'local', 
       type:{
         token:Juliet.TOKEN_ID, 
         kind:'type', 
         name:'Class<?>[]'
       }
     }, 
     'BlockStatement'],
    ['Collection<? extends E> x;', 
     {
       token: Juliet.TOKEN_ID, 
       name:'x', 
       initial_value:null, 
       kind:'local', 
       type:{
         token: Juliet.TOKEN_ID, 
         kind:'type', 
         name:'Collection<? extends E>'
       }
     },
     'BlockStatement'],
    ['Collection<? super E> x;', 
     {
       token: Juliet.TOKEN_ID, 
       name:'x', 
       initial_value:null, 
       kind:'local', 
       type:{
         token: Juliet.TOKEN_ID, 
         kind:'type', 
         name:'Collection<? super E>'
       }
     },
     'BlockStatement'],
    ['Cell x = new Cell<String>("abc");',
     {
       token:Juliet.TOKEN_ID,
       kind:'local',
       type:{
         token:Juliet.TOKEN_ID,
         kind:'type',
         name:'Cell'
       },
       name:'x',
       initial_value:{
         token:Juliet.TOKEN_NEW,
         kind:'new',
         type:{
           token:Juliet.TOKEN_ID,
           kind:'type',
           name:'Cell<String>'
         },
         args:[
           {
             token:Juliet.LITERAL_STRING,
             kind:'literal',
             value:'abc'
           }
         ]
       }
     },
     'BlockStatement'],
    ['return;', 
     {
       token:Juliet.TOKEN_RETURN,
       kind:'return',
       value:'void'
     }, 
     'BlockStatement'],
    ['return 1;',
     {
       token:Juliet.TOKEN_RETURN,
       kind:'return',
       expression:{
         token:Juliet.LITERAL_INT,
         kind:'literal',
         value:1
       }
     }, 
     'BlockStatement'],
    ['{ return; }', {
      kind:'block',
      statements:[
        {
          token:Juliet.TOKEN_RETURN,
          kind:'return',
          value:'void'
        }
      ]
    },
     'BlockStatement'],
    ['{ a = 1; b = 2; }', {
      kind:'block',
      statements:[
        {
          token:Juliet.TOKEN_ASSIGN,
          kind:'assignment',
          location:{
            token:Juliet.TOKEN_ID,
            kind:'construct',
            name:'a'
          },
          new_value:{
            token:Juliet.LITERAL_INT,
            kind:'literal',
            value:1
          }
        },
        {
          token:Juliet.TOKEN_ASSIGN,
          kind:'assignment',
          location:{
            token:Juliet.TOKEN_ID,
            kind:'construct',
            name:'b'
          },
          new_value:{
            token:Juliet.LITERAL_INT,
            kind:'literal',
            value:2
          }
        }
      ]
    }, 'BlockStatement'],
    ['if (true) {}', 
     {
       token:Juliet.TOKEN_IF,
       kind:'if',
       expression:{
         token:Juliet.LITERAL_BOOLEAN,
         kind:'literal',
         value:true
       },
       body:{
         kind:'block',
         statements:[
         ]
       }
     }, 
     'BlockStatement'],
    ['if (a) {}', {
      token:Juliet.TOKEN_IF,
      kind:'if',
      expression:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      },
      body:{
        kind:'block',
        statements:[
        ]
      }
    }, 
     'BlockStatement'],
    ['if (a && b) {} else {}', 
     {
       token:Juliet.TOKEN_IF,
       kind:'if',
       expression:{
         token:Juliet.TOKEN_LOGICAL_AND,
         kind:'binary',
         lhs:{
           token:Juliet.TOKEN_ID,
           kind:'construct',
           name:'a'
         },
         rhs:{
           token:Juliet.TOKEN_ID,
           kind:'construct',
           name:'b'
         }
       },
       body:{
         kind:'block',
         statements:[
         ]
       },
       else_body:{
         kind:'block',
         statements:[
         ]
       }
     }, 
     'BlockStatement'],
    ['if (a != null) { a = null; } else if (b) { a = b; }', 
     {
       token:Juliet.TOKEN_IF,
       kind:'if',
       expression:{
         token:Juliet.TOKEN_NE,
         kind:'binary',
         lhs:{
           token:Juliet.TOKEN_ID,
           kind:'construct',
           name:'a'
         },
         rhs:{
           token:Juliet.TOKEN_NULL,
           kind:'literal',
           value:'null'
         }
       },
       body:{
         kind:'block',
         statements:[
           {
             token:Juliet.TOKEN_ASSIGN,
             kind:'assignment',
             location:{
               token:Juliet.TOKEN_ID,
               kind:'construct',
               name:'a'
             },
             new_value:{
               token:Juliet.TOKEN_NULL,
               kind:'literal',
               value:'null'
             }
           }
         ]
       },
       else_body:{
         token:Juliet.TOKEN_IF,
         kind:'if',
         expression:{
           token:Juliet.TOKEN_ID,
           kind:'construct',
           name:'b'
         },
         body:{
           kind:'block',
           statements:[
             {
               token:Juliet.TOKEN_ASSIGN,
               kind:'assignment',
               location:{
                 token:Juliet.TOKEN_ID,
                 kind:'construct',
                 name:'a'
               },
               new_value:{
                 token:Juliet.TOKEN_ID,
                 kind:'construct',
                 name:'b'
               }
             }
           ]
         }
       }
     },
     'BlockStatement'],
    ['while (a) a = b;', {
      token:Juliet.TOKEN_WHILE,
      kind:'while',
      expression:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      },
      body:{
        token:Juliet.TOKEN_ASSIGN,
        kind:'assignment',
        location:{
          token:Juliet.TOKEN_ID,
          kind:'construct',
          name:'a'
        },
        new_value:{
          token:Juliet.TOKEN_ID,
          kind:'construct',
          name:'b'
        }
      }
    },
     'BlockStatement'],
    ['while (!a) { c = a; a = b; b = a; }',
     {
       token:Juliet.TOKEN_WHILE,
       kind:'while',
       expression:{
         token:Juliet.TOKEN_BANG,
         kind:'prefix',
         operand:{
           token:Juliet.TOKEN_ID,
           kind:'construct',
           name:'a'
         }
       },
       body:{
         kind:'block',
         statements:[
           {
             token:Juliet.TOKEN_ASSIGN,
             kind:'assignment',
             location:{
               token:Juliet.TOKEN_ID,
               kind:'construct',
               name:'c'
             },
             new_value:{
               token:Juliet.TOKEN_ID,
               kind:'construct',
               name:'a'
             }
           },
           {
             token:Juliet.TOKEN_ASSIGN,
             kind:'assignment',
             location:{
               token:Juliet.TOKEN_ID,
               kind:'construct',
               name:'a'
             },
             new_value:{
               token:Juliet.TOKEN_ID,
               kind:'construct',
               name:'b'
             }
           },
           {
             token:Juliet.TOKEN_ASSIGN,
             kind:'assignment',
             location:{
               token:Juliet.TOKEN_ID,
               kind:'construct',
               name:'b'
             },
             new_value:{
               token:Juliet.TOKEN_ID,
               kind:'construct',
               name:'a'
             }
           }
         ]
       }
     }, 
     'BlockStatement'],
    ['for (int i = 0; i < len; i++) a *= i;', 
     {
       token:Juliet.TOKEN_FOR,
       kind:'for',
       initialization:[
         {
           token:Juliet.TOKEN_ID,
           kind:'local',
           type:{
             token:Juliet.TOKEN_INT,
             kind:'type',
             name:'int'
           },
           name:'i',
           initial_value:{
             token:Juliet.LITERAL_INT,
             kind:'literal',
             value:0
           }
         }
       ],
       condition:{
         token:Juliet.TOKEN_LT,
         kind:'binary',
         lhs:{
           token:Juliet.TOKEN_ID,
           kind:'construct',
           name:'i'
         },
         rhs:{
           token:Juliet.TOKEN_ID,
           kind:'construct',
           name:'len'
         }
       },
       var_mod:[{
         token:Juliet.TOKEN_INCREMENT,
         kind:'postfix',
         operand:{
           token:Juliet.TOKEN_ID,
           kind:'construct',
           name:'i'
         }
       }],
       body:{
         token:Juliet.TOKEN_MUL_ASSIGN,
         kind:'assignment',
         location:{
           token:Juliet.TOKEN_ID,
           kind:'construct',
           name:'a'
         },
         new_value:{
           token:Juliet.TOKEN_ID,
           kind:'construct',
           name:'i'
         }
       }
     },
     'BlockStatement'],
    ['for (Object obj : collection) { obj = null; }',
     {
       token:Juliet.TOKEN_FOR,
       kind:'for-each',
       type:{
         token:Juliet.TOKEN_ID,
         kind:'type',
         name:'Object'
       },
       name:'obj',
       iterable:{
         token:Juliet.TOKEN_ID,
         kind:'construct',
         name:'collection'
       },
       body:{
         kind:'block',
         statements:[
           {
             token:Juliet.TOKEN_ASSIGN,
             kind:'assignment',
             location:{
               token:Juliet.TOKEN_ID,
               kind:'construct',
               name:'obj'
             },
             new_value:{
               token:Juliet.TOKEN_NULL,
               kind:'literal',
               value:'null'
             }
           }
         ]
       }
     },
     'BlockStatement'],
    ['break;', {
      token:Juliet.TOKEN_BREAK,
      kind:'abrupt'
    }, 'BlockStatement'],
    ['continue;', {
      token:Juliet.TOKEN_CONTINUE,
      kind:'abrupt'
    }, 'BlockStatement'],
    ['assert(true);', {
      token:Juliet.TOKEN_ASSERT,
      kind:'assert',
      expression:{
        token:Juliet.LITERAL_BOOLEAN,
        kind:'literal',
        value:true
      }
    }, 'BlockStatement'],
    ['assert(a != null, "a is null");', {
      token:Juliet.TOKEN_ASSERT,
      kind:'assert',
      expression:{
        token:Juliet.TOKEN_NE,
        kind:'binary',
        lhs:{
          token:Juliet.TOKEN_ID,
          kind:'construct',
          name:'a'
        },
        rhs:{
          token:Juliet.TOKEN_NULL,
          kind:'literal',
          value:'null'
        }
      },
      message:'a is null'
    }, 'BlockStatement'],
    ['print();',
     {
       token:Juliet.TOKEN_LPAREN, 
       kind:'call', 
       operand:{
         token:Juliet.TOKEN_ID, 
         kind:'construct', 
         name:'print'
       }, 
       args:[
       ]
     },
     'BlockStatement'],
    ['obj.print();',
     {
       token: Juliet.TOKEN_LPAREN, 
       kind:'call', 
       operand:{
         token: Juliet.TOKEN_PERIOD, 
         kind:'postfix', 
         operand:{
           token: Juliet.TOKEN_ID, 
           kind:'construct', 
           name:'obj'
         }, 
         term:{
           token: Juliet.TOKEN_ID, 
           kind:'construct', 
           name:'print'
         }
       }, 
       args:[
       ]
     }, 
     'BlockStatement'],
    ['obj.f().g();',
     {
       token: Juliet.TOKEN_LPAREN, 
       kind:'call', 
       operand:{
         token: Juliet.TOKEN_PERIOD, 
         kind:'postfix', 
         operand:{
           token: Juliet.TOKEN_LPAREN, 
           kind:'call', 
           operand:{
             token: Juliet.TOKEN_PERIOD, 
             kind:'postfix', 
             operand:{
               token: Juliet.TOKEN_ID, 
               kind:'construct', 
               name:'obj'
             }, 
             term:{
               token: Juliet.TOKEN_ID, 
               kind:'construct', 
               name:'f'
             }
           }, 
           args:[
           ]
         }, 
         term:{
           token: Juliet.TOKEN_ID, 
           kind:'construct', 
           name:'g'
         }
       }, 
       args:[
       ]
     },
     'BlockStatement'],
    ['int[] a = {};',
     {
       token: Juliet.TOKEN_ID, 
       name:'a', 
       initial_value:[
       ], 
       kind:'local', 
       type:{
         token: Juliet.TOKEN_INT, 
         kind:'type', 
         name:'int[]'
       }
     },
     'BlockStatement'],
    ['int[] a = {0, 1};',
     {
       token: Juliet.TOKEN_ID, 
       name:'a', 
       initial_value:[
         {
           token:Juliet.LITERAL_INT, 
           kind:'literal', 
           value:0
         }, 
         {
           token:Juliet.LITERAL_INT, 
           kind:'literal', 
           value:1
         }
       ], 
       kind:'local', 
       type:{
         token: Juliet.TOKEN_INT, 
         kind:'type', 
         name:'int[]'
       }
     },
     'BlockStatement'],
    ['int[][] a = {{0, 1}, {0, 1}};',
     {
       token: Juliet.TOKEN_ID, 
       name:'a', 
       initial_value:[
         [
           {
             token:Juliet.LITERAL_INT, 
             kind:'literal', 
             value:0
           }, 
           {
             token:Juliet.LITERAL_INT, 
             kind:'literal', 
             value:1
           }
         ], 
         [
           {
             token:Juliet.LITERAL_INT, 
             kind:'literal', 
             value:0
           }, 
           {
             token:Juliet.LITERAL_INT, 
             kind:'literal', 
             value:1
           }
         ]
       ], 
       kind:'local', 
       type:{
         token: Juliet.TOKEN_INT, 
         kind:'type', 
         name:'int[][]'
       }
     },
     'BlockStatement'],
    ['super();', 
     {
       token:Juliet.TOKEN_SUPER,
       kind:'super',
       args:[
       ]
     },
     'BlockStatement'],
    ['super.x',
     {
       token:Juliet.TOKEN_SUPER,
       kind:'super',
       name:'x',
       args:null
     },
     'Expression'],
    ['super.isAwesome();',
     {
       token:Juliet.TOKEN_SUPER,
       kind:'super',
       name:'isAwesome',
       args:[
       ]
     },
     'BlockStatement'],
    ['return; // i\'m not here',
     {
       token:Juliet.TOKEN_RETURN,
       kind:'return',
       value:'void'
     },
     'BlockStatement'],
    ['/* this is\n' +
     '  ignored */\n' +
     'return;', {
       token:Juliet.TOKEN_RETURN,
       kind:'return',
       value:'void'
     },
     'BlockStatement'],
    ['return (A) new A ();',
     {
  token: Juliet.TOKEN_RETURN, 
  kind:'return', 
  expression:{
    token: Juliet.TOKEN_LPAREN, 
    kind:'cast', 
    operand:{
      token: Juliet.TOKEN_NEW, 
      kind:'new', 
      type:{
        token: Juliet.TOKEN_ID, 
        kind:'type', 
        name:'A'
      }, 
      args:[
      ]
    }, 
    to_type:{
      token: Juliet.TOKEN_ID, 
      kind:'type', 
      name:'A'
    }
  }
},
     'BlockStatement']
  ];

  print('BEGIN TESTS');
  print('');

  var pass_count = 0;
  var fail_count = 0;
  for (i in tests) {
    var t = tests[i];
    print('Testing the parsing of ' + t[0]);

    Juliet.lexer.init();
    Juliet.parser.init();

    Juliet.source = t[0];

    var stm;
    if (t[2] == 'BlockStatement') {
      stm = Juliet.parser.parseBlockStatement();
    }
    if (t[2] == 'Statement') {
      stm = Juliet.parser.parseStatement();
    }
    if (t[2] == 'Expression') {
      stm = Juliet.parser.parseExpression();
    }
    
    if (Juliet.util.equal(stm, t[1])) {
      print('Passed.');
      pass_count++;
    } else {
      print('Expected:');
      Juliet.util.print_ast(t[1]);

      print('Actual:');
      Juliet.util.print_ast(stm);

      print('FAILED.');
      fail_count++;
      break;
    }

    print('');
  }

  print('SUMMARY');
  print('=======');
  print('Passed ' + pass_count + ' tests.');
  print('Failed ' + fail_count + ' tests.');
  print('END TESTS');

}();
