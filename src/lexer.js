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

// Notes:
// 03e2 is an ugly number.  Is it a malformed octal number or a
// scientific notation double?  Java parses it as scientific but
// I don't like it.
// float = double
// byte = int = long

/* Lexer */
var next_token = 1;

var TOKEN_ID = next_token++;
var TOKEN_ERROR = next_token++;

var TOKEN_EOF = next_token++;
var TOKEN_EOL = next_token++;

var TOKEN_IDENTIFIER = next_token++;
var TOKEN_UNKNOWN = next_token++;
var TOKEN_BANG = next_token++; // !
var TOKEN_PERCENT = next_token++;
var TOKEN_AMPERSAND = next_token++;
var TOKEN_LPAREN = next_token++;
var TOKEN_RPAREN = next_token++;
var TOKEN_STAR = next_token++;
var TOKEN_PLUS = next_token++;
var TOKEN_COMMA = next_token++;
var TOKEN_MINUS = next_token++;
var TOKEN_PERIOD = next_token++;
var TOKEN_SLASH = next_token++;
var TOKEN_COLON = next_token++;
var TOKEN_SEMICOLON = next_token++;
var TOKEN_LT = next_token++;
var TOKEN_ASSIGN = next_token++;
var TOKEN_GT = next_token++;
var TOKEN_QUESTIONMARK = next_token++;
var TOKEN_LBRACKET = next_token++;
var TOKEN_BACKSLASH = next_token++;
var TOKEN_RBRACKET = next_token++;
var TOKEN_CARET = next_token++;
var TOKEN_LCURLY = next_token++;
var TOKEN_PIPE = next_token++;
var TOKEN_RCURLY = next_token++;
var TOKEN_TILDE = next_token++;

var TOKEN_NE = next_token++;
var TOKEN_MOD_ASSIGN = next_token++;
var TOKEN_LOGICAL_AND = next_token++;
var TOKEN_AND_ASSIGN = next_token++;
var TOKEN_MUL_ASSIGN = next_token++;
var TOKEN_ADD_ASSIGN = next_token++;
var TOKEN_INCREMENT = next_token++;
var TOKEN_DECREMENT = next_token++;
var TOKEN_SUB_ASSIGN = next_token++;
var TOKEN_DIV_ASSIGN = next_token++;

var TOKEN_SHL = next_token++;
var TOKEN_SHL_ASSIGN = next_token++;
var TOKEN_LE = next_token++;
var TOKEN_EQ = next_token++;
var TOKEN_GE = next_token++;
var TOKEN_SHRX = next_token++;
var TOKEN_SHRX_ASSIGN = next_token++;
var TOKEN_SHR = next_token++;
var TOKEN_SHR_ASSIGN = next_token++;

var TOKEN_XOR_ASSIGN = next_token++;
var TOKEN_OR_ASSIGN = next_token++;
var TOKEN_LOGICAL_OR = next_token++;

var TOKEN_ABSTRACT = next_token++;
var TOKEN_ASSERT = next_token++;
var TOKEN_BREAK = next_token++;
var TOKEN_CASE = next_token++;
var TOKEN_CATCH = next_token++;
var TOKEN_CLASS = next_token++;
var TOKEN_CONST = next_token++;
var TOKEN_CONTINUE = next_token++;
var TOKEN_DEFAULT = next_token++;
var TOKEN_DO = next_token++;
var TOKEN_ELSE = next_token++;
var TOKEN_ENUM = next_token++;
var TOKEN_EXTENDS = next_token++;
var TOKEN_FALSE = next_token++;
var TOKEN_FINAL = next_token++;
var TOKEN_FINALLY = next_token++;
var TOKEN_FOR = next_token++;
var TOKEN_GOTO = next_token++;
var TOKEN_IF = next_token++;
var TOKEN_IMPLEMENTS = next_token++;
var TOKEN_IMPORT = next_token++;
var TOKEN_INSTANCEOF = next_token++;
var TOKEN_INTERFACE = next_token++;
var TOKEN_NATIVE = next_token++;
var TOKEN_NEW = next_token++;
var TOKEN_NULL = next_token++;
var TOKEN_PACKAGE = next_token++;
var TOKEN_PRIVATE = next_token++;
var TOKEN_PROTECTED = next_token++;
var TOKEN_PUBLIC = next_token++;
var TOKEN_RETURN = next_token++;
var TOKEN_STATIC = next_token++;
var TOKEN_STRICTFP = next_token++;
var TOKEN_SUPER = next_token++;
var TOKEN_SWITCH = next_token++;
var TOKEN_SYNCHRONIZED = next_token++;
var TOKEN_THROW = next_token++;
var TOKEN_THROWS = next_token++;
var TOKEN_TRANSIENT = next_token++;
var TOKEN_TRUE = next_token++;
var TOKEN_TRY = next_token++;
var TOKEN_VOLATILE = next_token++;
var TOKEN_WHILE = next_token++;

var TOKEN_CHAR = next_token++;
var TOKEN_BYTE = next_token++;
var TOKEN_SHORT = next_token++;
var TOKEN_INT = next_token++;
var TOKEN_LONG = next_token++;
var TOKEN_FLOAT = next_token++;
var TOKEN_DOUBLE = next_token++;
var TOKEN_STRING = next_token++;
var TOKEN_BOOLEAN = next_token++;

var LITERAL_CHAR = next_token++;
var LITERAL_BYTE = next_token++;
var LITERAL_SHORT = next_token++;
var LITERAL_INT = next_token++;
var LITERAL_LONG = next_token++;
var LITERAL_FLOAT = next_token++;
var LITERAL_DOUBLE = next_token++;
var LITERAL_STRING = next_token++;
var LITERAL_BOOLEAN = next_token++;

var token_name_table = [
  '???',
  'TOKEN_ID',
  'TOKEN_ERROR',

  'TOKEN_EOF',
  'TOKEN_EOL',

  'TOKEN_IDENTIFIER',
  'TOKEN_UNKNOWN',
  'TOKEN_BANG',
  'TOKEN_PERCENT',
  'TOKEN_AMPERSAND',
  'TOKEN_LPAREN',
  'TOKEN_RPAREN',
  'TOKEN_STAR',
  'TOKEN_PLUS',
  'TOKEN_COMMA',
  'TOKEN_MINUS',
  'TOKEN_PERIOD',
  'TOKEN_SLASH',
  'TOKEN_COLON',
  'TOKEN_SEMICOLON',
  'TOKEN_LT',
  'TOKEN_ASSIGN',
  'TOKEN_GT',
  'TOKEN_QUESTIONMARK',
  'TOKEN_LBRACKET',
  'TOKEN_BACKSLASH',
  'TOKEN_RBRACKET',
  'TOKEN_CARET',
  'TOKEN_LCURLY',
  'TOKEN_PIPE',
  'TOKEN_RCURLY',
  'TOKEN_TILDE',

  'TOKEN_NE',
  'TOKEN_MOD_ASSIGN',
  'TOKEN_LOGICAL_AND',
  'TOKEN_AND_ASSIGN',
  'TOKEN_MUL_ASSIGN',
  'TOKEN_ADD_ASSIGN',
  'TOKEN_INCREMENT',
  'TOKEN_DECREMENT',
  'TOKEN_SUB_ASSIGN',
  'TOKEN_DIV_ASSIGN',

  'TOKEN_SHL',
  'TOKEN_SHL_ASSIGN',
  'TOKEN_LE',
  'TOKEN_EQ',
  'TOKEN_GE',
  'TOKEN_SHRX',
  'TOKEN_SHRX_ASSIGN',
  'TOKEN_SHR',
  'TOKEN_SHR_ASSIGN',

  'TOKEN_XOR_ASSIGN',
  'TOKEN_OR_ASSIGN',
  'TOKEN_LOGICAL_OR',

  'TOKEN_ABSTRACT',
  'TOKEN_ASSERT',
  'TOKEN_BREAK',
  'TOKEN_CASE',
  'TOKEN_CATCH',
  'TOKEN_CLASS',
  'TOKEN_CONST',
  'TOKEN_CONTINUE',
  'TOKEN_DEFAULT',
  'TOKEN_DO',
  'TOKEN_ELSE',
  'TOKEN_ENUM',
  'TOKEN_EXTENDS',
  'TOKEN_FALSE',
  'TOKEN_FINAL',
  'TOKEN_FINALLY',
  'TOKEN_FOR',
  'TOKEN_GOTO',
  'TOKEN_IF',
  'TOKEN_IMPLEMENTS',
  'TOKEN_IMPORT',
  'TOKEN_INSTANCEOF',
  'TOKEN_INTERFACE',
  'TOKEN_NATIVE',
  'TOKEN_NEW',
  'TOKEN_NULL',
  'TOKEN_PACKAGE',
  'TOKEN_PRIVATE',
  'TOKEN_PROTECTED',
  'TOKEN_PUBLIC',
  'TOKEN_RETURN',
  'TOKEN_STATIC',
  'TOKEN_STRICTFP',
  'TOKEN_SUPER',
  'TOKEN_SWITCH',
  'TOKEN_SYNCHRONIZED',
  'TOKEN_THROW',
  'TOKEN_THROWS',
  'TOKEN_TRANSIENT',
  'TOKEN_TRUE',
  'TOKEN_TRY',
  'TOKEN_VOLATILE',
  'TOKEN_WHILE',

  'TOKEN_CHAR',
  'TOKEN_BYTE',
  'TOKEN_SHORT',
  'TOKEN_INT',
  'TOKEN_LONG',
  'TOKEN_FLOAT',
  'TOKEN_DOUBLE',
  'TOKEN_STRING',
  'TOKEN_BOOLEAN',

  'LITERAL_CHAR',
  'LITERAL_BYTE',
  'LITERAL_SHORT',
  'LITERAL_INT',
  'LITERAL_LONG',
  'LITERAL_FLOAT',
  'LITERAL_DOUBLE',
  'LITERAL_STRING',
  'LITERAL_BOOLEAN',
  '???'

];

var token_seperator = {
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

var operators = {
  '!': TOKEN_BANG,
  '!=': TOKEN_NE,
  '<': TOKEN_LT,
  '<=': TOKEN_LE,
  '<<': TOKEN_SHL,
  '<<=': TOKEN_SHL_ASSIGN,
  '>': TOKEN_GT,
  '>=': TOKEN_GE,
  '>>': TOKEN_SHR, // This is ambiguous
  '>>=': TOKEN_SHR_ASSIGN,
  '>>>': TOKEN_SHRX, // This is ambiguous
  '>>>=': TOKEN_SHRX_ASSIGN,
  '=': TOKEN_ASSIGN,
  '==': TOKEN_EQ,
  '-': TOKEN_MINUS,
  '--': TOKEN_DECREMENT,
  '-=': TOKEN_SUB_ASSIGN,
  '+': TOKEN_PLUS,
  '++': TOKEN_INCREMENT,
  '+=': TOKEN_ADD_ASSIGN,
  ',': TOKEN_COMMA,
  ':': TOKEN_COLON,
  '*': TOKEN_STAR,
  '*=': TOKEN_MUL_ASSIGN,
  '/=': TOKEN_DIV_ASSIGN,
  '/': TOKEN_SLASH,
  '&&': TOKEN_LOGICAL_AND,
  '||': TOKEN_LOGICAL_OR,
  '&': TOKEN_AMPERSAND,
  '|=': TOKEN_OR_ASSIGN,
  '&=': TOKEN_AND_ASSIGN,
  '^=': TOKEN_XOR_ASSIGN,
  '%': TOKEN_PERCENT,
  '%=': TOKEN_MOD_ASSIGN,
  '|': TOKEN_PIPE,
  '^': TOKEN_CARET,
  '~': TOKEN_TILDE,
  '?': TOKEN_QUESTIONMARK
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
  '(': TOKEN_LPAREN,
  ')': TOKEN_RPAREN,
  '[': TOKEN_LBRACKET,
  ']': TOKEN_RBRACKET,
  '{': TOKEN_LCURLY,
  '}': TOKEN_RCURLY,
  ';': TOKEN_SEMICOLON
};

var keywords = {
  '???': TOKEN_UNKNOWN,
  'EOF': TOKEN_EOF,
  'EOL': TOKEN_EOL,
  'Identifier': TOKEN_IDENTIFIER,
  'char': TOKEN_CHAR,
  'double': TOKEN_DOUBLE,
  'float': TOKEN_FLOAT,
  'long': TOKEN_LONG,
  'int': TOKEN_INT,
  //'#2^31', '#2^63', // Abe had these for something..
  'String': TOKEN_STRING,
  'abstract': TOKEN_ABSTRACT,
  'assert': TOKEN_ASSERT,
  'break': TOKEN_BREAK,
  'case': TOKEN_CASE,
  'catch': TOKEN_CATCH,
  'class': TOKEN_CLASS,
  'const': TOKEN_CONST,
  'continue': TOKEN_CONTINUE,
  'default': TOKEN_DEFAULT,
  'do': TOKEN_DO,
  'else': TOKEN_ELSE,
  'enum': TOKEN_ENUM,
  'extends': TOKEN_EXTENDS,
  'false': TOKEN_FALSE,
  'final': TOKEN_FINAL,
  'finally': TOKEN_FINALLY,
  'for': TOKEN_FOR,
  'goto': TOKEN_GOTO,
  'if': TOKEN_IF,
  'implements': TOKEN_IMPLEMENTS,
  'import': TOKEN_IMPORT,
  'instanceof': TOKEN_INSTANCEOF,
  'interface': TOKEN_INTERFACE,
  'native': TOKEN_NATIVE,
  'new': TOKEN_NEW,
  'null': TOKEN_NULL,
  'package': TOKEN_PACKAGE,
  'private': TOKEN_PRIVATE,
  'protected': TOKEN_PROTECTED,
  'public': TOKEN_PUBLIC,
  'return': TOKEN_RETURN,
  'static': TOKEN_STATIC,
  'strictfp': TOKEN_STRICTFP,
  'super': TOKEN_SUPER,
  'switch': TOKEN_SWITCH,
  'synchronized': TOKEN_SYNCHRONIZED,
  'throw': TOKEN_THROW,
  'throws': TOKEN_THROWS,
  'transient': TOKEN_TRANSIENT,
  'true': TOKEN_TRUE,
  'try': TOKEN_TRY,
  'volatile': TOKEN_VOLATILE,
  'while': TOKEN_WHILE,
  '???': TOKEN_UNKNOWN
};

var trace = !true;

data = '';

Juliet.lexer = function() {

  /* Pivates */
  var data_i = 0;
  var line_i = 1;
  var col_i = 1;

  return {
    pending: [],
    processed: [],
    marks: [],

    init: function() {
      data = '';
      this.data_ii = 0;
      this.pending = [];
      this.processed = [];
      this.marks = [];
      this.line_i = 1;
      this.col_i = 1;
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
        var ch = data.charCodeAt(this.data_ii);

        //
        // White space
        //
        while (ch == 32 || ch == 9) {
          this.data_ii++;
          ch = data.charCodeAt(this.data_ii);
          this.col_i++;
        }

        if (ch == 10) {
          if (trace) print('newline');
          this.data_ii++
          this.col_i = 1;
          this.line_i++
          continue;
        }

        if (!ch) {
          if (trace) print('EOF');
          return false; // EOF
        }

        //
        // Comments
        //
        if (ch == 47) {
          if (data[this.data_ii + 1] == '/') {
            if (trace) print('single-line comment');
            // Discard single-line comment
            this.data_ii = this.data_ii + 2;
            ch = data.charCodeAt(this.data_ii);
            while (ch && ch != 10) {
              this.data_ii++;
              ch = data.charCodeAt(this.data_ii);
            }
            this.data_ii++;
            continue;
          } else if (data[this.data_ii + 1] == '*') {
            if (trace) print('multi-line comment');
            // Discard multi-line comment
            this.data_ii = this.data_ii + 2;
            ch = data.charCodeAt(this.data_ii);
            while (ch) {
              if (ch == 10) this.line_i++;
              if (ch == 42 && data[this.data_ii + 1] == '/') {
                this.data_ii = this.data_ii + 2;
                break;
              }
              this.data_ii++;
              ch = data.charCodeAt(this.data_ii);
            }
            continue;
          }
        }

        //
        // Parse Identifiers
        //

        // Default to an error unless we prove otherwise
        var TYPE_DEFAULT = TOKEN_ERROR;
        next.type = TYPE_DEFAULT;

        next.line = this.line_i;
        next.col = this.col_i;
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
            buffer += data[this.data_ii];
            this.data_ii++;
            if (this.data_ii == data.length) break;
            ch = data.charCodeAt(this.data_ii);
          }
          if (buffer in keywords) {
            next.type = keywords[buffer];
            next.content = buffer;
            next.length = buffer.length;
          } else {
            next.type = TOKEN_ID;
            next.content = buffer;
            next.length = buffer.length;
          }
          if (this.data_ii != data.length) {
            if (token_seperator[data[this.data_ii]] == null) {
              print('Improper token termination: ' + data[this.data_ii]);
              next.type = TOKEN_ERROR;
              return false;
            }
          }
          if (keywords[next.content] != undefined) {
            next.type = keywords[next.content];
            if (next.type == TOKEN_TRUE) {
              next.type = LITERAL_BOOLEAN;
              next.content = true;
              next.length = 4;
            }
            else if (next.type == TOKEN_FALSE) {
              next.type = LITERAL_BOOLEAN;
              next.content = false;
              next.length = 4;
            }
          }
          next.line = this.line_i;
          next.col = this.col_i;
          this.col_i = this.col_i + next.lenght;
          return true;
        }

        //
        // NUMBERS: Try to parse the token as a number
        //

        var is_negative = false;
        var ch2;
        if ((ch == 45) && (this.data_ii < data.length - 1)) {
          ch2 = data.charCodeAt(this.data_ii + 1);
          if ((ch2 >= 48 && ch2 <= 57) || (ch2 == 46)) {
            is_negative = true;
            this.data_ii++;
            ch = ch2;
          }
        }

        var begins_with_decimal = false;
        var ch3;
        if ((ch == 46) && (this.data_ii < data.length - 1)) {
          ch3 = data.charCodeAt(this.data_ii + 1);
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
                  ((data.charCodeAt(this.data_ii - 1) == 69) ||
                   (data.charCodeAt(this.data_ii - 1) == 101))) {
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
              if (this.data_ii == 0) {
                valid_underscore = false;
              }
              else if (!underscore_neighbor(data.charCodeAt(this.data_ii - 1))) {
                valid_underscore = false;
              }
              else if (this.data_ii == data.length - 1) {
                valid_underscore = false;
              }
              else if (!underscore_neighbor(data.charCodeAt(this.data_ii + 1))) {
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
                    var i = this.data_ii;
                    var ch2 = data.charCodeAt(i);
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
                      if (i >= data.length) break;
                      var ch2 = data.charCodeAt(i);
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
                buffer += data[this.data_ii];
              } else if (base_syntax == 1) {
                buffer = '';
                buffer += data[this.data_ii];
              } else {
                buffer = '';
              }
              i++;
            }
            this.data_ii++;
            if (this.data_ii == data.length) break;
            ch = data.charCodeAt(this.data_ii);
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
            next.type = LITERAL_LONG;
            buffer = buffer.substring(0, buffer.length - 1);
          }
          else if (base == 10) {
            if ((ch2 == 70) || (ch2 == 102)) { // F or f
              next.type = LITERAL_FLOAT;
              buffer = buffer.substring(0, buffer.length - 1);
            }
            else if ((ch2 == 68) || (ch2 == 100)) { // D or d
              next.type = LITERAL_DOUBLE;
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
                next.type = TOKEN_ERROR;
                return false;
              }
              if (state != 0) {
                // ERROR
                print('Invalid decimal point position.');
                next.type = TOKEN_ERROR;
                return false;
              }
              state = 1;
              // It must be a double
              if (next.type == TYPE_DEFAULT) next.type = LITERAL_DOUBLE;
            } else if (ch2 == 48 || ch2 == 49) {
              // digits 0-1 are always valid
              has_decimal_digits = true;
            } else if (ch2 >= 50 && ch2 <= 55) {
              has_decimal_digits = true;
              // digits 2-7 are valid for octal or better
              if (base < 8) {
                print('Invalid number (Error2).');
                next.type = TOKEN_ERROR;
                return false;
              }
            } else if (ch2 == 56 || ch2 == 57) {
              has_decimal_digits = true;
              if (base < 10) {
                print('Invalid number (Error3).');
                next.type = TOKEN_ERROR;
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
                  next.type = TOKEN_ERROR;
                  return false;
                }
                state = 2;
                if (next.type == TYPE_DEFAULT) next.type = LITERAL_DOUBLE;
              }
              if (base < 10) {
                print('Invalid number (Error4).');
                next.type = TOKEN_ERROR;
                return false;
              }
            } else if (((ch2 >= 65) && (ch2 <= 70)) ||
                       ((ch2 >= 97) && (ch2 <= 102))) { // a-f, A-F
                  if (base < 16) {
                    print('Invalid number (Error5).');
                    next.type = TOKEN_ERROR;
                    return false;
                  }
            } else {
              // ERROR
              print('Invalid number (Error6).');
              next.type = TOKEN_ERROR;
              return false;
            }
          }

          if ((next.type == LITERAL_DOUBLE) || (next.type == LITERAL_FLOAT)) {
            if (is_negative) buffer = '-' + buffer;
            var z = parseFloat(buffer);
            if (z == Number.POSITIVE_INFINITY) {
              print('Floating point value too large.');
              next.type = TOKEN_ERROR;
              return false;
            }
            if (z == Number.NEGATIVE_INFINITY) {
              print('Floating point value too small.');
              next.type = TOKEN_ERROR;
              return false;
            }
            if (z == Number.NaN) {
              print('Internal error.  Please report this as a bug.');
              next.type = TOKEN_ERROR;
              return false;
            }
            next.content = z;
          } else {
            if (next.type == TYPE_DEFAULT) next.type = LITERAL_INT;
            if (is_negative) buffer = '-' + buffer;
            // TODO: properly handle longs
            var z = parseInt(buffer, base);
            if(next.type == LITERAL_INT) {
              if (z > 2147483647) {
                print('Integer value too large.');
                next.type = TOKEN_ERROR;
                return false;
              }
              if (z < -2147483648) {
                print('Integer value too small.');
                next.type = TOKEN_ERROR;
                return false;
              }
            } else if (next.type == LITERAL_LONG) {
              if (z > 9223372036854775807) {
                print('Long value too large.');
                next.type = TOKEN_ERROR;
                return false;
              }
              if (z < -9223372036854775808) {
                print('Long value to small.');
                next.type = TOKEN_ERROR;
                return false;
              }
            }
            next.content = z;
          }

          if (this.data_ii != data.length) {
            if (token_seperator[data[this.data_ii]] == null) {
              print('Improper token termination: ' + data[this.data_ii]);
              next.type = TOKEN_ERROR;
              return false;
            }
          }
          next.line = this.line_i;
          next.col = this.col_i;
          this.col_i = this.col_i + buffer.length;
          return true;
        }

        var handle_character_code = function() {
          if (data[this.data_ii] == 'u') {
            var buffer = '';
            for (var i = 0; i < 4; i++) {
              this.data_ii++;
              if (this.data_ii == data.length) {
                // ERROR
                print('Incomplete character literal.');
                return false;
              }
              var ch = data.charCodeAt(this.data_ii);
              if ((ch >= 48 && ch <= 57) ||
                  ((ch >= 65) && (ch <= 70)) ||
                  ((ch >= 97) && (ch <= 102))) { // 0-9, a-f, A-F
                    buffer += data[this.data_ii];
              } else {
                print('Malformed character literal.');
                return false;
              }
            }
            next.content = eval('\'\\u' + buffer + '\'');
            if (trace) print(next.content);
          } else if (data[this.data_ii] == 'n') next.content = '\n';
          else if (data[this.data_ii] == 't') next.content = '\t';
          else if (data[this.data_ii] == 'b') next.content = '\b';
          else if (data[this.data_ii] == 'f') next.content = '\f';
          else if (data[this.data_ii] == 'r') next.content = '\r';
          else if (data[this.data_ii] == '\'') next.content = '\'';
          else if (data[this.data_ii] == '\"') next.content = '\"';
          else if (data[this.data_ii] == '\\') next.content = '\\';
          else {
            // ERROR
            print('Malformed character literal.');
            return false;
          }

          next.line = this.line_i;
          next.col = this.col_i;
          next.length = buffer.length;
          this.col_i = this.col_i + buffer.lenght;
          return true;
        };

        // qualified name
        if (ch == '46') {
          next.type = TOKEN_PERIOD;
          next.content = '.'
          this.data_ii++;
          next.line = this.line_i;
          next.col = this.col_i;
          next.length = 1;
          this.col_i++;
          return true;
        }

        // Parse Operators
        for (var i = 4; i > 0; i--) {
          if (this.data_ii + i > data.length) continue;
          var buffer = data.substring(this.data_ii, this.data_ii + i);
          if (malformed_operators[buffer] != null) {
            print('Malformed operator: ' + buffer);
            next.type = TOKEN_ERROR;
            return false;
          }
          if (operators[buffer] != undefined) {
            next.type = operators[buffer];
            next.content = buffer;
            this.data_ii += buffer.length;
            next.line = this.line_i;
            next.col = this.col_i;
            next.length = buffer.length;
            this.col_i = this.col_i + buffer.length;
            return true;
          }
        }

        if (structure[data[this.data_ii]] != undefined) {
          next.type = structure[data[this.data_ii]];
          this.data_ii++;
          next.line = this.line_i;
          next.col = this.col_i;
          next.length = 1;
          this.col_i++;
          return true;
        }

        // 'a'
        if (ch == 39) {
          this.data_ii++;
          if (this.data_ii == data.length) {
            // ERROR
            print('Incomplete character literal.');
            return false;
          }
          if (data[this.data_ii] == '\\') {
            this.data_ii++;
            if (this.data_ii == data.length) {
              // ERROR
              print('Incomplete character literal.');
              return false;
            }

            if (!handle_character_code()) return false;

          } else {
            next.content = data[this.data_ii];
          }
          this.data_ii++;
          if (this.data_ii == data.length) {
            // ERROR
            print('Incomplete character literal.');
            return false;
          }
          ch = data.charCodeAt(this.data_ii);
          if (ch != 39) {
            // ERROR
            print('Malformed character literal.');
            return false;
          }
          this.data_ii++;
          next.type = LITERAL_CHAR;
          if (this.data_ii != data.length) {
            if (token_seperator[data[this.data_ii]] == null) {
              print('Improper token termination: ' + data[this.data_ii]);
              next.type = TOKEN_ERROR;
              return false;
            }
          }
          next.line = this.line_i;
          next.col = this.col_i;
          next.length = 1;
          this.col_i++;
          return true;
        }

        // 'str'
        if (ch == 34) {
          var buffer = '';
          this.data_ii++;
          while (true) {
            if (data[this.data_ii] == '\\') {
              this.data_ii++;
              if (this.data_ii == data.length) {
                print('Malformed string literal.');
                return false;
                // ERROR
              }

              if (!handle_character_code()) return false;
              buffer += next.content;

            }
            else if (data[this.data_ii] == '"') {
              this.data_ii++;
              break;
            } else {
              buffer += data[this.data_ii];
            }
            this.data_ii++;
            if (this.data_ii == data.length) {
              print('Malformed string literal.');
              return false;
              // ERROR
            }
          }
          next.content = buffer;
          next.type = LITERAL_STRING;
          if (this.data_ii != data.length) {
            if (token_seperator[data[this.data_ii]] == null) {
              print('Improper token termination: ' + data[this.data_ii]);
              next.type = TOKEN_ERROR;
              return false;
            }
          }
          next.line = this.line_i;
          next.col = this.col_i;
          next.length = buffer.length;
          this.col_i = this.col_i + buffer.length;
          return true;
        }

        return false;
      }
    }
  };
}();
