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

var test_parse = function() {
  var tests = [
    ['3.14', {
      token:Juliet.LITERAL_DOUBLE,
      kind:'literal',
      value:3.14}],
    ['42', {
      token:Juliet.LITERAL_INT,
      kind:'literal',
      value:42}],
    ['\'a\'', {
      token:Juliet.LITERAL_CHAR,
      kind:'literal',
      value:'a'}],
    ['"hello"', {
      token:Juliet.LITERAL_STRING,
      kind:'literal',
      value:'hello'}],
    ['false', {
      token:Juliet.LITERAL_BOOLEAN,
      kind:'literal',
      value:false}],
    ['true', {
      token:Juliet.LITERAL_BOOLEAN,
      kind:'literal',
      value:true}],
    ['null', {
      token:Juliet.TOKEN_NULL,
      kind:'literal',
      value:'null'}],
    ['a = b', {
      token:Juliet.TOKEN_ASSIGN,
      kind:'assignment',
      location:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'},
      new_value:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'b'}}],
    ['a += b', {
      token:Juliet.TOKEN_ADD_ASSIGN,
      kind:'assignment',
      location:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'},
      new_value:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'b'}}],
    ['a -= b', {
      token:Juliet.TOKEN_SUB_ASSIGN,
      kind:'assignment',
      location:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'},
      new_value:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'b'}}],
    ['a *= b', {
      token:Juliet.TOKEN_MUL_ASSIGN,
      kind:'assignment',
      location:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'},
      new_value:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'b'}}],
    ['a /= b', {
      token:Juliet.TOKEN_DIV_ASSIGN,
      kind:'assignment',
      location:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'},
      new_value:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'b'}}],
    ['a %= b', {
      token:Juliet.TOKEN_MOD_ASSIGN,
      kind:'assignment',
      location:{token:Juliet.TOKEN_ID, kind:'construct', name:'a'},
      new_value:{token:Juliet.TOKEN_ID, kind:'construct', name:'b'}}],
    ['a &= b', {
      token:Juliet.TOKEN_AND_ASSIGN,
      kind:'assignment',
      location:{token:Juliet.TOKEN_ID, kind:'construct', name:'a'},
      new_value:{token:Juliet.TOKEN_ID, kind:'construct', name:'b'}}],
    ['a |= b', {
      token:Juliet.TOKEN_OR_ASSIGN,
      kind:'assignment',
      location:{token:Juliet.TOKEN_ID, kind:'construct', name:'a'},
      new_value:{token:Juliet.TOKEN_ID, kind:'construct', name:'b'}}],
    ['a ^= b', {
      token:Juliet.TOKEN_XOR_ASSIGN,
      kind:'assignment',
      location:{token:Juliet.TOKEN_ID, kind:'construct', name:'a'},
      new_value:{token:Juliet.TOKEN_ID, kind:'construct', name:'b'}}],
    ['a <<= b', {
      token:Juliet.TOKEN_SHL_ASSIGN,
      kind:'assignment',
      location:{token:Juliet.TOKEN_ID, kind:'construct', name:'a'},
      new_value:{token:Juliet.TOKEN_ID, kind:'construct', name:'b'}}],
    ['a >>>= b', {
      token:Juliet.TOKEN_SHRX_ASSIGN,
      kind:'assignment',
      location:{token:Juliet.TOKEN_ID, kind:'construct', name:'a'},
      new_value:{token:Juliet.TOKEN_ID, kind:'construct', name:'b'}}],
    ['a >>= b', {
      token:Juliet.TOKEN_SHR_ASSIGN,
      kind:'assignment',
      location:{token:Juliet.TOKEN_ID, kind:'construct', name:'a'},
      new_value:{token:Juliet.TOKEN_ID, kind:'construct', name:'b'}}],
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
    }],
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
          value:false}}}],
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
          value:false}}}],
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
    }],
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
    }],
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
    }],
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
    }],
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
    }],
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
    }],
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
    }],
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
    }],
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
    }],
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
    }],
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
    }],
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
    }],
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
    }],
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
    }],
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
    }],
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
    }],
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
    }],
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
    }],
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
    }],
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
    }],
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
    }],
    ['new int[10]', {
      token:Juliet.TOKEN_NEW,
      kind:'array',
      type:{
        token:Juliet.TOKEN_INT,
        kind:'type',
        name:'int',
        length:1
      },
      length:{
        token:Juliet.LITERAL_INT,
        kind:'literal',
        value:10
      }
    }],
    ['new int[10][3]', {
      token:Juliet.TOKEN_NEW,
      kind:'array',
      type:{
        token:Juliet.TOKEN_INT,
        kind:'type',
        name:'int',
        length:2
      },
      length:{
        token:Juliet.LITERAL_INT,
        kind:'literal',
        value:10
      },
      element_expr:{
        token:Juliet.TOKEN_NEW,
        kind:'expression',
        type:{
          token:Juliet.LITERAL_INT,
          kind:'element',
          name:'int',
          length:1 // TODO: <- seems wrong!
        },
        expression:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:3
        }
      }
    }],
    ['++a', {
      token:Juliet.TOKEN_INCREMENT,
      kind:'prefix',
      operand:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      }
    }],
    ['--a', {
      token:Juliet.TOKEN_DECREMENT,
      kind:'prefix',
      operand:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      }
    }],
    ['+a', {
      token:Juliet.TOKEN_ID,
      kind:'construct',
      name:'a'
    }],
    ['-a', {
      token:Juliet.TOKEN_MINUS,
      kind:'prefix',
      operand:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      }
    }],
    ['!a', {
      token:Juliet.TOKEN_BANG,
      kind:'prefix',
      operand:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      }
    }],
    ['~a', {
      token:Juliet.TOKEN_TILDE,
      kind:'prefix',
      operand:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      }
    }],
    ['a++', {
      token:Juliet.TOKEN_INCREMENT,
      kind:'postfix',
      operand:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      }
    }],
    ['a--', {
      token:Juliet.TOKEN_DECREMENT,
      kind:'postfix',
      operand:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'a'
      }
    }],
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
    }],
    ['int[] a', [
      {
        token:Juliet.TOKEN_ID,
        kind:'local',
        type:{
          token:Juliet.TOKEN_INT,
          kind:'construct',
          name:'int[]'
        },
        name:'a',
        initial_value:null
      }
    ]],
    ['Object[] a', [
      {
        token:Juliet.TOKEN_ID,
        kind:'local',
        type:{
          token:Juliet.TOKEN_ID,
          kind:'construct',
          name:'Object[]'
        },
        name:'a',
        initial_value:null
      }
    ]],
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
    }],
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
    }],
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
    }],
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
    }],
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
    }],
    ['int num = 1;', [
      {
        token:Juliet.TOKEN_ID,
        kind:'local',
        type:{
          token:Juliet.TOKEN_INT,
          kind:'construct',
          name:'int'
        },
        name:'num',
        initial_value:{
          token:Juliet.LITERAL_INT,
          kind:'literal',
          value:1
        }
      }
    ]],
    ['float num = 1.0, num2 = 6.28;', [
      {
        token:Juliet.TOKEN_ID,
        kind:'local',
        type:{
          token:Juliet.TOKEN_FLOAT,
          kind:'construct',
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
          kind:'construct',
          name:'float'
        },
        name:'num2',
        initial_value:{
          token:Juliet.LITERAL_DOUBLE,
          kind:'literal',
          value:6.28
        }
      }
    ]],
    ['Vector<String>', {
      token:Juliet.TOKEN_ID,
      kind:'construct',
      name:'Vector<String>'
    }],
    ['Seq<Seq<A>>', {
      token:Juliet.TOKEN_ID,
      kind:'construct',
      name:'Seq<Seq<A>>'
    }],
    ['Seq<Seq<Seq<A>>>', {
      token:Juliet.TOKEN_ID,
      kind:'construct',
      name:'Seq<Seq<Seq<A>>>'
    }],
    ['Seq<Seq<Seq<Seq<A>>>>', {
      token:Juliet.TOKEN_ID,
      kind:'construct',
      name:'Seq<Seq<Seq<Seq<A>>>>'
    }],
    ['Seq<String>.Zipper<Integer>', {
      token:Juliet.TOKEN_PERIOD,
      kind:'postfix',
      operand:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'Seq<String>'
      },
      term:{
        token:Juliet.TOKEN_ID,
        kind:'construct',
        name:'Zipper<Integer>'
      }
    }],
    ['Collection<Integer>', {
      token:Juliet.TOKEN_ID,
      kind:'construct',
      name:'Collection<Integer>'
    }],
    ['Pair<String,String>', {
      token:Juliet.TOKEN_ID,
      kind:'construct',
      name:'Pair<String,String>'
    }],
    ['Collection<?>', {
      token:Juliet.TOKEN_ID,
      kind:'construct',
      name:'Collection<?>'
    }],
    ['Class<?>[]', {
      token:Juliet.TOKEN_ID,
      kind:'construct',
      name:'Class<?>[]'
    }],
    ['Collection<? extends E>', {
      token:Juliet.TOKEN_ID,
      kind:'construct',
      name:'Collection<? extends E>'
    }],
    ['Collection<? super E>', {
      token:Juliet.TOKEN_ID,
      kind:'construct',
      name:'Collection<? super E>'
    }],
    ['Cell x = new Cell<String>("abc");', [
      {
        token:Juliet.TOKEN_ID,
        kind:'local',
        type:{
          token:Juliet.TOKEN_ID,
          kind:'construct',
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
      }
    ]],
    ['return;', {
      token:Juliet.TOKEN_RETURN,
      kind:'return',
      value:'void'
    }],
    ['return 1;', {
      token:Juliet.TOKEN_RETURN,
      kind:'return',
      expression:{
        token:Juliet.LITERAL_INT,
        kind:'literal',
        value:1
      }
    }],
    ['{ return; }', {
      kind:'block',
      statements:[
        {
          token:Juliet.TOKEN_RETURN,
          kind:'return',
          value:'void'
        }
      ]
    }],
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
    }],
    ['if (true) {}', {
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
    }],
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
    }],
    ['if (a && b) {} else {}', {
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
    }],
    ['if (a != null) { a = null; } else if (b) { a = b; }', {
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
    }],
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
    }],
    ['while (!a) { c = a; a = b; b = a; }', {
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
    }],
    ['for (int i = 0; i < len; i++) a *= i;', {
      token:Juliet.TOKEN_FOR,
      kind:'for',
      initialization:[
        {
          token:Juliet.TOKEN_ID,
          kind:'local',
          type:{
            token:Juliet.TOKEN_INT,
            kind:'construct',
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
      var_mod:{
        token:Juliet.TOKEN_INCREMENT,
        kind:'postfix',
        operand:{
          token:Juliet.TOKEN_ID,
          kind:'construct',
          name:'i'
        }
      },
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
    }],
    ['for (Object obj : collection) { obj = null; }', {
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
    }],
    ['break;', {
      token:Juliet.TOKEN_BREAK,
      kind:'abrupt'
    }],
    ['continue;', {
      token:Juliet.TOKEN_CONTINUE,
      kind:'abrupt'
    }],
    ['assert(true);', {
      token:Juliet.TOKEN_ASSERT,
      kind:'assert',
      expression:{
        token:Juliet.LITERAL_BOOLEAN,
        kind:'literal',
        value:true
      }
    }],
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
    }],
    ['print();', {
      token:Juliet.TOKEN_ID,
      kind:'construct',
      name:'print',
      args:[
      ]
    }],
    ['print("hello");', {
      token:Juliet.TOKEN_ID,
      kind:'construct',
      name:'print',
      args:[
        {
          token:Juliet.LITERAL_STRING,
          kind:'literal',
          value:'hello'
        }
      ]
    }],
    ['int[] a = {};', [
      {
        token:Juliet.TOKEN_ID,
        kind:'local',
        type:{
          token:Juliet.TOKEN_INT,
          kind:'construct',
          name:'int[]'
        },
        name:'a',
        initial_value:{
          token:Juliet.TOKEN_LCURLY,
          kind:'array',
          type:{
            token:Juliet.TOKEN_INT,
            kind:'construct',
            name:'int[]'
          },
          terms:[
          ]
        }
      }
    ]],
    ['int[] a = {0, 1};', [
      {
        token:Juliet.TOKEN_ID,
        kind:'local',
        type:{
          token:Juliet.TOKEN_INT,
          kind:'construct',
          name:'int[]'
        },
        name:'a',
        initial_value:{
          token:Juliet.TOKEN_LCURLY,
          kind:'array',
          type:{
            token:Juliet.TOKEN_INT,
            kind:'construct',
            name:'int[]'
          },
          terms:[
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
        }
      }
    ]],
    ['int[][] a = {{0, 1}, {0, 1}};', [
      {
        token:Juliet.TOKEN_ID,
        kind:'local',
        type:{
          token:Juliet.TOKEN_INT,
          kind:'construct',
          name:'int[][]'
        },
        name:'a',
        initial_value:{
          token:Juliet.TOKEN_LCURLY,
          kind:'array',
          type:{
            token:Juliet.TOKEN_INT,
            kind:'construct',
            name:'int[][]'
          },
          terms:[
            {
              token:Juliet.TOKEN_LCURLY,
              kind:'array',
              type:{
                token:Juliet.TOKEN_INT,
                kind:'type',
                name:'int[]'
              },
              terms:[
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
            },
            {
              token:Juliet.TOKEN_LCURLY,
              kind:'array',
              type:{
                token:Juliet.TOKEN_INT,
                kind:'type',
                name:'int[]'
              },
              terms:[
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
            }
          ]
        }
      }
    ]],
    ['super();', {
      token:Juliet.TOKEN_SUPER,
      kind:'super',
      args:[
      ]
    }],
    ['super.x', {
      token:Juliet.TOKEN_SUPER,
      kind:'super',
      name:'x',
      args:null
    }],
    ['super.isAwesome();', {
      token:Juliet.TOKEN_SUPER,
      kind:'super',
      name:'isAwesome',
      args:[
      ]
    }],
    ['return; // i\'m not here', {
      token:Juliet.TOKEN_RETURN,
      kind:'return',
      value:'void'
    }],
    ['/* this is\n' +
     '  ignored */\n' +
     'return;', {
       token:Juliet.TOKEN_RETURN,
       kind:'return',
       value:'void'
     }]
  ];

  print('BEGIN TESTS');
  print('');

  //var str = '';

  var pass_count = 0;
  var fail_count = 0;
  for (i in tests) {
    var t = tests[i];
    print('Testing the parsing of ' + t[0]);

    Juliet.lexer.init();
    Juliet.parser.init();

    Juliet.source = t[0];

    var stm = Juliet.parser.parseStatement();

    // str = str + '[\'' + t[0] + '\', ';
    // str = str + Juliet.util.ast_str(stm);
    // str = str + '],\n';

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
    }

    print('');
  }

  print('SUMMARY');
  print('=======');
  print('Passed ' + pass_count + ' tests.');
  print('Failed ' + fail_count + ' tests.');
  print('END TESTS');

  //print(str);
}();
