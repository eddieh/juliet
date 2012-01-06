Juliet.lexer = function() {

  /* Pivates */
  var data_i = 0;
  var line_i = 1;
  var col_i = 1;

  var token_separator = {
    ' ': true,
    '\t': true,
    '\n': true,
    '\r': true,
    ',': true,
    ')': true,
    '(': true,
    '+': true,
    '-': true,
    '*': true,
    '/': true,
    '|': true,
    '=': true,
    ':': true,
    ';': true,
    '^': true,
    '!': true,
    '<': true,
    '>': true,
    '{': true,
    '}': true,
    '?': true,
    '[': true,
    ']': true,
    '.': true
  };

  // Symbol combination (prefixes) that are not valid
  var malformed_operators = {
    '!<': true,
    '!>': true,
    '!-': true,
    '!+': true,
    '!*': true,
    '!/': true,
    '+++': true,
    '++<': true,
    '++>': true,
    '++!': true,
    '++=': true,
    '++&': true,
    '++|': true,
    '++-': true,
    '+-': true,
    '+<': true,
    '+>': true,
    '+&': true,
    '+|': true,
    '---': true,
    '--<': true,
    '-->': true,
    '--!': true,
    '--=': true,
    '--&': true,
    '--|': true,
    '--+': true,
    '-+': true,
    '-<': true,
    '->': true,
    '-&': true,
    '-|': true
  };

  var structure = {
    '(': Juliet.TOKEN_LPAREN,
    ')': Juliet.TOKEN_RPAREN,
    '[': Juliet.TOKEN_LBRACKET,
    ']': Juliet.TOKEN_RBRACKET,
    '{': Juliet.TOKEN_LCURLY,
    '}': Juliet.TOKEN_RCURLY,
    ';': Juliet.TOKEN_SEMICOLON
  };

  var keywords = {
    '???': Juliet.TOKEN_UNKNOWN,
    'EOF': Juliet.TOKEN_EOF,
    'EOL': Juliet.TOKEN_EOL,
    'Identifier': Juliet.TOKEN_IDENTIFIER,
    'char': Juliet.TOKEN_CHAR,
    'double': Juliet.TOKEN_DOUBLE,
    'float': Juliet.TOKEN_FLOAT,
    'long': Juliet.TOKEN_LONG,
    'int': Juliet.TOKEN_INT,
    //'#2^31', '#2^63', // Abe had these for something..
    'String': Juliet.TOKEN_STRING,
    'abstract': Juliet.TOKEN_ABSTRACT,
    'assert': Juliet.TOKEN_ASSERT,
    'break': Juliet.TOKEN_BREAK,
    'case': Juliet.TOKEN_CASE,
    'catch': Juliet.TOKEN_CATCH,
    'class': Juliet.TOKEN_CLASS,
    'const': Juliet.TOKEN_CONST,
    'continue': Juliet.TOKEN_CONTINUE,
    'default': Juliet.TOKEN_DEFAULT,
    'do': Juliet.TOKEN_DO,
    'else': Juliet.TOKEN_ELSE,
    'enum': Juliet.TOKEN_ENUM,
    'extends': Juliet.TOKEN_EXTENDS,
    'false': Juliet.TOKEN_FALSE,
    'final': Juliet.TOKEN_FINAL,
    'finally': Juliet.TOKEN_FINALLY,
    'for': Juliet.TOKEN_FOR,
    'goto': Juliet.TOKEN_GOTO,
    'if': Juliet.TOKEN_IF,
    'implements': Juliet.TOKEN_IMPLEMENTS,
    'import': Juliet.TOKEN_IMPORT,
    'instanceof': Juliet.TOKEN_INSTANCEOF,
    'interface': Juliet.TOKEN_INTERFACE,
    'native': Juliet.TOKEN_NATIVE,
    'new': Juliet.TOKEN_NEW,
    'null': Juliet.TOKEN_NULL,
    'package': Juliet.TOKEN_PACKAGE,
    'private': Juliet.TOKEN_PRIVATE,
    'protected': Juliet.TOKEN_PROTECTED,
    'public': Juliet.TOKEN_PUBLIC,
    'return': Juliet.TOKEN_RETURN,
    'static': Juliet.TOKEN_STATIC,
    'strictfp': Juliet.TOKEN_STRICTFP,
    'super': Juliet.TOKEN_SUPER,
    'switch': Juliet.TOKEN_SWITCH,
    'synchronized': Juliet.TOKEN_SYNCHRONIZED,
    'throw': Juliet.TOKEN_THROW,
    'throws': Juliet.TOKEN_THROWS,
    'transient': Juliet.TOKEN_TRANSIENT,
    'true': Juliet.TOKEN_TRUE,
    'try': Juliet.TOKEN_TRY,
    'volatile': Juliet.TOKEN_VOLATILE,
    'while': Juliet.TOKEN_WHILE,
    '???': Juliet.TOKEN_UNKNOWN
  };

  var operators = {
    '!': Juliet.TOKEN_BANG,
    '!=': Juliet.TOKEN_NE,
    '<': Juliet.TOKEN_LT,
    '<=': Juliet.TOKEN_LE,
    '<<': Juliet.TOKEN_SHL,
    '<<=': Juliet.TOKEN_SHL_ASSIGN,
    '>': Juliet.TOKEN_GT,
    '>=': Juliet.TOKEN_GE,
    '>>': Juliet.TOKEN_SHR, // This is ambiguous
    '>>=': Juliet.TOKEN_SHR_ASSIGN,
    '>>>': Juliet.TOKEN_SHRX, // This is ambiguous
    '>>>=': Juliet.TOKEN_SHRX_ASSIGN,
    '=': Juliet.TOKEN_ASSIGN,
    '==': Juliet.TOKEN_EQ,
    '-': Juliet.TOKEN_MINUS,
    '--': Juliet.TOKEN_DECREMENT,
    '-=': Juliet.TOKEN_SUB_ASSIGN,
    '+': Juliet.TOKEN_PLUS,
    '++': Juliet.TOKEN_INCREMENT,
    '+=': Juliet.TOKEN_ADD_ASSIGN,
    ',': Juliet.TOKEN_COMMA,
    ':': Juliet.TOKEN_COLON,
    '*': Juliet.TOKEN_STAR,
    '*=': Juliet.TOKEN_MUL_ASSIGN,
    '/=': Juliet.TOKEN_DIV_ASSIGN,
    '/': Juliet.TOKEN_SLASH,
    '&&': Juliet.TOKEN_LOGICAL_AND,
    '||': Juliet.TOKEN_LOGICAL_OR,
    '&': Juliet.TOKEN_AMPERSAND,
    '|=': Juliet.TOKEN_OR_ASSIGN,
    '&=': Juliet.TOKEN_AND_ASSIGN,
    '^=': Juliet.TOKEN_XOR_ASSIGN,
    '%': Juliet.TOKEN_PERCENT,
    '%=': Juliet.TOKEN_MOD_ASSIGN,
    '|': Juliet.TOKEN_PIPE,
    '^': Juliet.TOKEN_CARET,
    '~': Juliet.TOKEN_TILDE,
    '?': Juliet.TOKEN_QUESTIONMARK
  };

  return {
    pending: [],
    processed: [],
    marks: [],

    init: function() {
      data_i = 0;
      line_i = 1;
      col_i = 1;

      this.pending = [];
      this.processed = [];
      this.marks = [];
    },

    operatorStr: function(a) {
      for (op in operators) {
        if (a == operators[op]) return op;
      }
      print(Juliet.util.token_str(a) + ' not an operator or assignment.');
      quit();
    },

    tokenize: function() {
      var buffer = '';
      var next = {};
      next.error = function(error_message) {
        var token = null;
        var loc = '';
        if (this.line) loc = loc + ':' + this.line;
        if (this.col) loc = loc + ':' + this.col;
        if (this.length) loc = loc + ':' + this.length;
        if (this.type) token = this.type;
        //print(Juliet.util.token_str(token) + loc);
        return new Error(error_message);
      };

      while(true) {
        var ch = Juliet.source.charCodeAt(data_i);

        //
        // White space
        //
        while (ch == 32 || ch == 9) {
          data_i++;
          ch = Juliet.source.charCodeAt(data_i);
          col_i++;
        }

        if (ch == 10) {
          if (Juliet.options.trace) print('newline');
          data_i++
          col_i = 1;
          line_i++
          continue;
        }

        if (!ch) {
          if (Juliet.options.trace) print('EOF');
          return false; // EOF
        }

        //
        // Comments
        //
        if (ch == 47) {
          if (Juliet.source[data_i + 1] == '/') {
            if (Juliet.options.trace) print('single-line comment');
            // Discard single-line comment
            data_i = data_i + 2;
            ch = Juliet.source.charCodeAt(data_i);
            while (ch && ch != 10) {
              data_i++;
              ch = Juliet.source.charCodeAt(data_i);
            }
            data_i++;
            continue;
          } else if (Juliet.source[data_i + 1] == '*') {
            // multi-line comments begin with: /*
            // literal javascript begins with: /*-{
            var literal_js = false;
            if (Juliet.source[data_i + 2] == '-') {
              if (Juliet.source[data_i + 3] == '{') {
                if (Juliet.options.trace) print('literal javascript');
                data_i = data_i + 4;
                literal_js = true;
                next.line = line_i;
                next.col = col_i;
              }
            } else {
              if (Juliet.options.trace) print('multi-line comment');
              // Discard multi-line comment
              data_i = data_i + 2;
            }

            ch = Juliet.source.charCodeAt(data_i);
            while (ch) {
              if (ch == 10) line_i++;

              // terminate multi-line comment or literal javascript
              // multi-line comments end with: */
              // literal javascript ends with: }-*/
              if (literal_js) {
                if (ch == 125) {
                  if (Juliet.source[data_i + 1] == '-') {
                    if (Juliet.source[data_i + 2] == '*') {
                      if (Juliet.source[data_i + 3] == '/') {
                        data_i = data_i + 4;
                        break;
                      }
                    }
                  }
                }
              } else {
                if (ch == 42 && Juliet.source[data_i + 1] == '/') {
                  data_i = data_i + 2;
                  break;
                }
              }

              if (literal_js) {
                buffer += Juliet.source[data_i];
              }

              data_i++;
              ch = Juliet.source.charCodeAt(data_i);
            }

            if (literal_js) {
              next.content = buffer;
              next.type = Juliet.LITERAL_JAVASCRIPT;
              next.length = buffer.length;
              this.pending.push(next);
              return true;
            }

            continue;
          }
        }

        //
        // Parse Identifiers
        //

        // Default to an error unless we prove otherwise
        var TYPE_DEFAULT = Juliet.TOKEN_ERROR;
        next.type = TYPE_DEFAULT;

        next.line = line_i;
        next.col = col_i;
        next.length = 0;

        this.pending.push(next);

        // a-z, A-Z, _, $
        if ((ch >= 97 && ch <= 122) ||
            (ch >= 65 && ch <= 90) ||
            (ch == 95) || (ch == 36)) {
          // a-z, A-Z, _, $, 0-9
          while ((ch >= 97 && ch <= 122) ||
                 (ch >= 65 && ch <= 90) ||
                 (ch == 95) || (ch == 36) ||
                 (ch >= 48 && ch <= 57)) {
            buffer += Juliet.source[data_i];
            data_i++;
            if (data_i == Juliet.source.length) break;
            ch = Juliet.source.charCodeAt(data_i);
          }
          if (buffer in keywords) {
            next.type = keywords[buffer];
            next.content = buffer;
            next.length = buffer.length;
          } else {
            next.type = Juliet.TOKEN_ID;
            next.content = buffer;
            next.length = buffer.length;
          }
          if (data_i != Juliet.source.length) {
            if (token_separator[Juliet.source[data_i]] == null) {
              print('Improper token termination: ' + Juliet.source[data_i]);
              next.type = Juliet.TOKEN_ERROR;
              return false;
            }
          }
          if (keywords[next.content] != undefined) {
            next.type = keywords[next.content];
            if (next.type == Juliet.TOKEN_TRUE) {
              next.type = Juliet.LITERAL_BOOLEAN;
              next.content = true;
              next.length = 4;
            }
            else if (next.type == Juliet.TOKEN_FALSE) {
              next.type = Juliet.LITERAL_BOOLEAN;
              next.content = false;
              next.length = 4;
            }
          }
          next.line = line_i;
          next.col = col_i;
          col_i = col_i + next.lenght;
          return true;
        }

        //
        // NUMBERS: Try to parse the token as a number
        //

        var is_negative = false;
        var ch2;
        if ((ch == 45) && (data_i < Juliet.source.length - 1)) {
          ch2 = Juliet.source.charCodeAt(data_i + 1);
          if ((ch2 >= 48 && ch2 <= 57) || (ch2 == 46)) {
            is_negative = true;
            data_i++;
            ch = ch2;
          }
        }

        var begins_with_decimal = false;
        var ch3;
        if ((ch == 46) && (data_i < Juliet.source.length - 1)) {
          ch3 = Juliet.source.charCodeAt(data_i + 1);
          if (ch3 >= 48 && ch3 <= 57) {
            begins_with_decimal = true;
            ch = ch3;
          }
        }

        // The sequence begins with a character ranging from 0-9,
        // or begins with a decimal immediately followed by a digit.
        if (ch >= 48 && ch <= 57) {
          var base = 10;
          var underscore_neighbor = function(c) {
            if (c == 95) return true;
            if (base == 2) {
              if (c > 49) return false;
              if (c < 48) return false;
            }
            if (base == 8) {
              if (c > 55) return false;
              if (c < 48) return false;
            }
            if (base == 10) {
              if (c > 57) return false;
              if (c < 48) return false;
            }
            if (base == 16) {
              if (c > 102) return false;
              if ((c > 70) && (c < 97)) return false;
              if ((c > 57) && (c < 64)) return false;
              if (c < 48) return false;
            }
            return true;
          };

          // Add valid characters (0-9, a-z, A-Z, _, ., -, +) to the buffer
          var valid_underscore = true;
          var i = 0;

          if (begins_with_decimal) ch = 46;

          while ((ch >= 48 && ch <= 57) ||
                 (ch >= 97 && ch <= 122) ||
                 (ch >= 65 && ch <= 90) ||
                 (ch == 95) || (ch == 46) ||
                 (ch == 45) || (ch == 43)) {

            // +,- can prefix the exponent
            if ((ch == 45) || (ch == 43)) {
              if ((base == 10) && (i > 0) &&
                  ((Juliet.source.charCodeAt(data_i - 1) == 69) ||
                   (Juliet.source.charCodeAt(data_i - 1) == 101))) {
                // If the previous character was an 'e' or an 'E' then this is a
                // sign used in the exponent.
              } else {
                // Otherwise this symbol is a delimeter and forms part of the
                // next token
                break;
              }
            }

            // Handle or ignore underscores
            if (ch == 95) {
              // Java SE7 says underscores must be *between* digits
              if (data_i == 0) {
                valid_underscore = false;
              }
              else if (!underscore_neighbor(Juliet.source.charCodeAt(data_i - 1))) {
                valid_underscore = false;
              }
              else if (data_i == Juliet.source.length - 1) {
                valid_underscore = false;
              }
              else if (!underscore_neighbor(Juliet.source.charCodeAt(data_i + 1))) {
                valid_underscore = false;
              }
            } else {
              var base_syntax = 0;
              if ((base == 10) && (i == 1)) {
                // The number starts with a zero which could indicate a different
                // base. Java supports 4 numeric bases with 3 different syntaxes:
                // 123 - Decimal (Syntax 0)
                // 0123 - Octal (Syntax 1)
                // 0x05F - Hexadecimal (Syntax 2)
                // 0b010 - Binary (Syntax 2)
                if (buffer[0] == '0') {
                  // Binary (b or B in SE7)
                  if ((ch == 98) || (ch == 66)) {
                    base = 2;
                    base_syntax = 2;
                  }
                  // Octal (0 followed by digit)
                  else if ((ch <= 57) && (ch >= 48)) {
                    var i = data_i;
                    var ch2 = Juliet.source.charCodeAt(i);
                    var decimal = false;
                    while ((ch2 >= 48 && ch2 <= 57) ||
                           (ch2 == 69) || (ch2 == 101) ||
                           (ch2 == 95) || (ch2 == 46) ||
                           (ch2 == 45) || (ch2 == 43)) {
                      // Octal numbers don't have exponents or decimal points
                      if ((ch2 == 69) || (ch2 == 101) || (ch2 == 46)) {
                        decimal = true;
                        break;
                      }
                      i++;
                      if (i >= Juliet.source.length) break;
                      var ch2 = Juliet.source.charCodeAt(i);
                    }
                    if (!decimal) {
                      base = 8;
                      base_syntax = 1;
                    }
                  }
                  // Hexadecimal (x or X)
                  else if ((ch == 120) || (ch == 88)) {
                    base = 16;
                    base_syntax = 2;
                  }
                }
              }
              if (base_syntax == 0) {
                buffer += Juliet.source[data_i];
              } else if (base_syntax == 1) {
                buffer = '';
                buffer += Juliet.source[data_i];
              } else {
                buffer = '';
              }
              i++;
            }
            data_i++;
            if (data_i == Juliet.source.length) break;
            ch = Juliet.source.charCodeAt(data_i);
          }

          // Default to buffer contents
          next.content = buffer;

          if (!valid_underscore) {
            print('Invalid underscore placement in number.');
            return false;
          }

          // Determine type from the final character in the buffer
          var ch2 = buffer.charCodeAt(buffer.length - 1);
          if ((ch2 == 76) || (ch2 == 108)) { // L or l
            next.type = Juliet.LITERAL_LONG;
            buffer = buffer.substring(0, buffer.length - 1);
          }
          else if (base == 10) {
            if ((ch2 == 70) || (ch2 == 102)) { // F or f
              next.type = Juliet.LITERAL_FLOAT;
              buffer = buffer.substring(0, buffer.length - 1);
            }
            else if ((ch2 == 68) || (ch2 == 100)) { // D or d
              next.type = Juliet.LITERAL_DOUBLE;
              buffer = buffer.substring(0, buffer.length - 1);
            }
          }

          // Validate the digits.
          var state = 0;
          var has_decimal_digits = false;
          for (var i = 0; i < buffer.length; i++) {
            var ch2 = buffer.charCodeAt(i);
            if (buffer[i] == '.') {

              if (base != 10) {
                // ERROR
                print('Invalid number (Error1).');
                next.type = Juliet.TOKEN_ERROR;
                return false;
              }
              if (state != 0) {
                // ERROR
                print('Invalid decimal point position.');
                next.type = Juliet.TOKEN_ERROR;
                return false;
              }
              state = 1;
              // It must be a double
              if (next.type == TYPE_DEFAULT) next.type = Juliet.LITERAL_DOUBLE;
            } else if (ch2 == 48 || ch2 == 49) {
              // digits 0-1 are always valid
              has_decimal_digits = true;
            } else if (ch2 >= 50 && ch2 <= 55) {
              has_decimal_digits = true;
              // digits 2-7 are valid for octal or better
              if (base < 8) {
                print('Invalid number (Error2).');
                next.type = Juliet.TOKEN_ERROR;
                return false;
              }
            } else if (ch2 == 56 || ch2 == 57) {
              has_decimal_digits = true;
              if (base < 10) {
                print('Invalid number (Error3).');
                next.type = Juliet.TOKEN_ERROR;
                return false;
              }
            } else if ((ch2 == 43) || (ch2 == 45)) { // + or -
              // correct position && number already checked..
            } else if ((ch2 == 69) || (ch2 == 101)) { // e or E
              if (base == 10) {
                // E provides an exponent
                if ((state > 1) || (has_decimal_digits == false)) {
                  // ERROR
                  print('Invalid E position.');
                  next.type = Juliet.TOKEN_ERROR;
                  return false;
                }
                state = 2;
                if (next.type == TYPE_DEFAULT) next.type = Juliet.LITERAL_DOUBLE;
              }
              if (base < 10) {
                print('Invalid number (Error4).');
                next.type = Juliet.TOKEN_ERROR;
                return false;
              }
            } else if (((ch2 >= 65) && (ch2 <= 70)) ||
                       ((ch2 >= 97) && (ch2 <= 102))) { // a-f, A-F
                  if (base < 16) {
                    print('Invalid number (Error5).');
                    next.type = Juliet.TOKEN_ERROR;
                    return false;
                  }
            } else {
              // ERROR
              print('Invalid number (Error6).');
              next.type = Juliet.TOKEN_ERROR;
              return false;
            }
          }

          if ((next.type == Juliet.LITERAL_DOUBLE) || (next.type == Juliet.LITERAL_FLOAT)) {
            if (is_negative) buffer = '-' + buffer;
            var z = parseFloat(buffer);
            if (z == Number.POSITIVE_INFINITY) {
              print('Floating point value too large.');
              next.type = Juliet.TOKEN_ERROR;
              return false;
            }
            if (z == Number.NEGATIVE_INFINITY) {
              print('Floating point value too small.');
              next.type = Juliet.TOKEN_ERROR;
              return false;
            }
            if (z == Number.NaN) {
              print('Internal error.  Please report this as a bug.');
              next.type = Juliet.TOKEN_ERROR;
              return false;
            }
            next.content = z;
          } else {
            if (next.type == TYPE_DEFAULT) next.type = Juliet.LITERAL_INT;
            if (is_negative) buffer = '-' + buffer;
            // TODO: properly handle longs
            var z = parseInt(buffer, base);
            if(next.type == Juliet.LITERAL_INT) {
              if (z > 2147483647) {
                print('Integer value too large.');
                next.type = Juliet.TOKEN_ERROR;
                return false;
              }
              if (z < -2147483648) {
                print('Integer value too small.');
                next.type = Juliet.TOKEN_ERROR;
                return false;
              }
            } else if (next.type == Juliet.LITERAL_LONG) {
              if (z > 9223372036854775807) {
                print('Long value too large.');
                next.type = Juliet.TOKEN_ERROR;
                return false;
              }
              if (z < -9223372036854775808) {
                print('Long value to small.');
                next.type = Juliet.TOKEN_ERROR;
                return false;
              }
            }
            next.content = z;
          }

          if (data_i != Juliet.source.length) {
            if (token_separator[Juliet.source[data_i]] == null) {
              print('Improper token termination: ' + Juliet.source[data_i]);
              next.type = Juliet.TOKEN_ERROR;
              return false;
            }
          }
          next.line = line_i;
          next.col = col_i;
          col_i = col_i + buffer.length;
          return true;
        }

        var handle_character_code = function() {
          if (Juliet.source[data_i] == 'u') {
            var buffer = '';
            for (var i = 0; i < 4; i++) {
              data_i++;
              if (data_i == Juliet.source.length) {
                // ERROR
                print('Incomplete character literal.');
                return false;
              }
              var ch = Juliet.source.charCodeAt(data_i);
              if ((ch >= 48 && ch <= 57) ||
                  ((ch >= 65) && (ch <= 70)) ||
                  ((ch >= 97) && (ch <= 102))) { // 0-9, a-f, A-F
                    buffer += Juliet.source[data_i];
              } else {
                print('Malformed character literal.');
                return false;
              }
            }
            next.content = eval('\'\\u' + buffer + '\'');
            if (Juliet.options.trace) print(next.content);

            next.line = line_i;
            next.col = col_i;
            next.length = buffer.length;
            col_i = col_i + buffer.lenght;
            return true;
          }

          if (Juliet.source[data_i] == 'n') next.content = '\n';
          else if (Juliet.source[data_i] == 't') next.content = '\t';
          else if (Juliet.source[data_i] == 'b') next.content = '\b';
          else if (Juliet.source[data_i] == 'f') next.content = '\f';
          else if (Juliet.source[data_i] == 'r') next.content = '\r';
          else if (Juliet.source[data_i] == '\'') next.content = '\'';
          else if (Juliet.source[data_i] == '\"') next.content = '\"';
          else if (Juliet.source[data_i] == '\\') next.content = '\\';
          else {
            // ERROR
            print('Malformed character literal.');
            return false;
          }

          next.line = line_i;
          next.col = col_i;
          next.length = next.content.length;
          col_i = col_i + next.content.lenght;
          return true;
        };

        // qualified name
        if (ch == '46') {
          next.type = Juliet.TOKEN_PERIOD;
          next.content = '.'
          data_i++;
          next.line = line_i;
          next.col = col_i;
          next.length = 1;
          col_i++;
          return true;
        }

        // Parse Operators
        for (var i = 4; i > 0; i--) {
          if (data_i + i > Juliet.source.length) continue;
          var buffer = Juliet.source.substring(data_i, data_i + i);
          if (malformed_operators[buffer] != null) {
            print('Malformed operator: ' + buffer);
            next.type = Juliet.TOKEN_ERROR;
            return false;
          }
          if (operators[buffer] != undefined) {
            next.type = operators[buffer];
            next.content = buffer;
            data_i += buffer.length;
            next.line = line_i;
            next.col = col_i;
            next.length = buffer.length;
            col_i = col_i + buffer.length;
            return true;
          }
        }

        if (structure[Juliet.source[data_i]] != undefined) {
          next.type = structure[Juliet.source[data_i]];
          data_i++;
          next.line = line_i;
          next.col = col_i;
          next.length = 1;
          col_i++;
          return true;
        }

        // 'a'
        if (ch == 39) {
          data_i++;
          if (data_i == Juliet.source.length) {
            // ERROR
            print('Incomplete character literal.');
            return false;
          }
          if (Juliet.source[data_i] == '\\') {
            data_i++;
            if (data_i == Juliet.source.length) {
              // ERROR
              print('Incomplete character literal.');
              return false;
            }

            if (!handle_character_code()) return false;

          } else {
            next.content = Juliet.source[data_i];
          }
          data_i++;
          if (data_i == Juliet.source.length) {
            // ERROR
            print('Incomplete character literal.');
            return false;
          }
          ch = Juliet.source.charCodeAt(data_i);
          if (ch != 39) {
            // ERROR
            print('Malformed character literal.');
            return false;
          }
          data_i++;
          next.type = Juliet.LITERAL_CHAR;
          if (data_i != Juliet.source.length) {
            if (token_separator[Juliet.source[data_i]] == null) {
              print('Improper token termination: ' + Juliet.source[data_i]);
              next.type = Juliet.TOKEN_ERROR;
              return false;
            }
          }
          next.line = line_i;
          next.col = col_i;
          next.length = 1;
          col_i++;
          return true;
        }

        // 'str'
        if (ch == 34) {
          var buffer = '';
          data_i++;
          while (true) {
            if (Juliet.source[data_i] == '\\') {
              data_i++;
              if (data_i == Juliet.source.length) {
                print('Malformed string literal.');
                return false;
                // ERROR
              }

              if (!handle_character_code()) return false;
              buffer += next.content;

            }
            else if (Juliet.source[data_i] == '"') {
              data_i++;
              break;
            } else {
              buffer += Juliet.source[data_i];
            }
            data_i++;
            if (data_i == Juliet.source.length) {
              print('Malformed string literal.');
              return false;
              // ERROR
            }
          }
          next.content = buffer;
          next.type = Juliet.LITERAL_STRING;
          if (data_i != Juliet.source.length) {
            if (token_separator[Juliet.source[data_i]] == null) {
              print('Improper token termination: ' + Juliet.source[data_i]);
              next.type = Juliet.TOKEN_ERROR;
              return false;
            }
          }
          next.line = line_i;
          next.col = col_i;
          next.length = buffer.length;
          col_i = col_i + buffer.length;
          return true;
        }

        return false;
      }
    }
  };
}();

// Notes:
// 03e2 is an ugly number.  Is it a malformed octal number or a
// scientific notation double?  Java parses it as scientific but
// I don't like it.
// float = double
// byte = int = long
