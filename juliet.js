/*
  Copyright 2011 James Dean Palmer

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

var JOG_QUALIFIER_REFERENCE = (JOG_QUALIFIER_CLASS | JOG_QUALIFIER_INTERFACE);

var trace = true;

var data = '';
var data_i = 0;
var pending = [];
var processed = [];

var init = function() {
  data = '';
  data_i = 0;
  pending = [];
  processed = [];
  marks = [];
};

var tokenize = function() {
  var buffer = '';
  var next = {};
  if (data_i == data.length) return false;
  while (data[data_i] == ' ') {
    data_i++;
    if (data_i == data.length) return false;
    // TODO, track columns and lines
  }

  var ch = data.charCodeAt(data_i);
  // TODO EOF

  // Parse Identifiers

  // Default to an error unless we prove otherwise
  var TYPE_DEFAULT = TOKEN_ERROR;
  next.type = TYPE_DEFAULT;
  pending.push(next);

  // a-z, A-Z, _, $
  if ((ch >= 97 && ch <= 122) ||
      (ch >= 65 && ch <= 90) ||
      (ch == 95) || (ch == 36)) {
    // a-z, A-Z, _, $, 0-9
    while ((ch >= 97 && ch <= 122) ||
           (ch >= 65 && ch <= 90) ||
           (ch == 95) || (ch == 36) ||
           (ch >= 48 && ch <= 57)) {
      buffer += data[data_i];
      data_i++;
      if (data_i == data.length) break;
      ch = data.charCodeAt(data_i);
    }
    if (buffer in keywords) {
      next.type = keywords[buffer];
      next.content = buffer;
    } else {
      next.type = TOKEN_ID;
      next.content = buffer;
    }
    if (data_i != data.length) {
      if (token_seperator[data[data_i]] == null) {
        print('Improper token termination: ' + data[data_i]);
        next.type = TOKEN_ERROR;
        return false;
      }
    }
    if (keywords[next.content] != undefined) {
      next.type = keywords[next.content];
      if (next.type == TOKEN_TRUE) {
        next.type = LITERAL_BOOLEAN;
        next.content = true;
      }
      else if (next.type == TOKEN_FALSE) {
        next.type = LITERAL_BOOLEAN;
        next.content = false;
      }
    }
    return true;
  }

  //
  // NUMBERS: Try to parse the token as a number
  //

  var is_negative = false;
  var ch2;
  if ((ch == 45) && (data_i < data.length - 1)) {
    ch2 = data.charCodeAt(data_i + 1);
    if ((ch2 >= 48 && ch2 <= 57) || (ch2 == 46)) {
      is_negative = true;
      data_i++;
      ch = ch2;
    }
  }

  var begins_with_decimal = false;
  var ch3;
  if ((ch == 46) && (data_i < data.length - 1)) {
    ch3 = data.charCodeAt(data_i + 1);
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
            ((data.charCodeAt(data_i - 1) == 69) ||
             (data.charCodeAt(data_i - 1) == 101))) {
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
        else if (!underscore_neighbor(data.charCodeAt(data_i - 1))) {
          valid_underscore = false;
        }
        else if (data_i == data.length - 1) {
          valid_underscore = false;
        }
        else if (!underscore_neighbor(data.charCodeAt(data_i + 1))) {
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
          buffer += data[data_i];
        } else if (base_syntax == 1) {
          buffer = '';
          buffer += data[data_i];
        } else {
          buffer = '';
        }
        i++;
      }
      data_i++;
      if (data_i == data.length) break;
      ch = data.charCodeAt(data_i);
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
      var z = parseInt(buffer, base);
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
      next.content = z;
    }

    if (data_i != data.length) {
      if (token_seperator[data[data_i]] == null) {
        print('Improper token termination: ' + data[data_i]);
        next.type = TOKEN_ERROR;
        return false;
      }
    }
    return true;
  }

  var handle_character_code = function() {
    if (data[data_i] == 'u') {
      var buffer = '';
      for (var i = 0; i < 4; i++) {
        data_i++;
        if (data_i == data.length) {
          // ERROR
          print('Incomplete character literal.');
          return false;
        }
        var ch = data.charCodeAt(data_i);
        if ((ch >= 48 && ch <= 57) ||
            ((ch >= 65) && (ch <= 70)) ||
            ((ch >= 97) && (ch <= 102))) { // 0-9, a-f, A-F
          buffer += data[data_i];
        } else {
          print('Malformed character literal.');
          return false;
        }
      }
      next.content = eval('\'\\u' + buffer + '\'');
      print(next.content);
    } else if (data[data_i] == 'n') next.content = '\n';
    else if (data[data_i] == 't') next.content = '\t';
    else if (data[data_i] == 'b') next.content = '\b';
    else if (data[data_i] == 'f') next.content = '\f';
    else if (data[data_i] == 'r') next.content = '\r';
    else if (data[data_i] == '\'') next.content = '\'';
    else if (data[data_i] == '\"') next.content = '\"';
    else if (data[data_i] == '\\') next.content = '\\';
    else {
      // ERROR
      print('Malformed character literal.');
      return false;
    }

    return true;
  };

  // qualified name
  if (ch == '46') {
    // must be proceeded by an identifier
    if (pending && pending.length > 1) {
      if (pending[pending.length - 2].type == TOKEN_ID) {
        next.type = TOKEN_PERIOD;
        next.content = '.'
        data_i++;
        return true;
      }
    }
    if (processed && processed.length > 0) {
      if (processed[processed.length - 1].type == TOKEN_ID) {
        next.type = TOKEN_PERIOD;
        next.content = '.';
        data_i++;
        return true;
      }
    }
    print('Illegal expression.');
    next.type = TOKEN_ERROR;
    return false;
  }

  // Parse Operators
  for (var i = 4; i > 0; i--) {
    if (data_i + i > data.length) continue;
    var buffer = data.substring(data_i, data_i + i);
    if (malformed_operators[buffer] != null) {
      print('Malformed operator: ' + buffer);
      next.type = TOKEN_ERROR;
      return false;
    }
    if (operators[buffer] != undefined) {
      next.type = operators[buffer];
      next.content = buffer;
      data_i += buffer.length;
      return true;
    }
  }

  if (structure[data[data_i]] != undefined) {
    next.type = structure[data[data_i]];
    data_i++;
    return true;
  }

  // 'a'
  if (ch == 39) {
    data_i++;
    if (data_i == data.length) {
      // ERROR
      print('Incomplete character literal.');
      return false;
    }
    if (data[data_i] == '\\') {
      data_i++;
      if (data_i == data.length) {
        // ERROR
        print('Incomplete character literal.');
        return false;
      }

      if (!handle_character_code()) return false;

    } else {
      next.content = data[data_i];
    }
    data_i++;
    if (data_i == data.length) {
      // ERROR
      print('Incomplete character literal.');
      return false;
    }
    ch = data.charCodeAt(data_i);
    if (ch != 39) {
      // ERROR
      print('Malformed character literal.');
      return false;
    }
    data_i++;
    next.type = LITERAL_CHAR;
    if (data_i != data.length) {
      if (token_seperator[data[data_i]] == null) {
        print('Improper token termination: ' + data[data_i]);
        next.type = TOKEN_ERROR;
        return false;
      }
    }
    return true;
  }

  // 'str'
  if (ch == 34) {
    var buffer = '';
    data_i++;
    while (true) {
      if (data[data_i] == '\\') {
        data_i++;
        if (data_i == data.length) {
          print('Malformed string literal.');
          return false;
          // ERROR
        }

        if (!handle_character_code()) return false;
        buffer += next.content;

      }
      else if (data[data_i] == '"') {
        data_i++;
        break;
      } else {
        buffer += data[data_i];
      }
      data_i++;
      if (data_i == data.length) {
        print('Malformed string literal.');
        return false;
        // ERROR
      }
    }
    next.content = buffer;
    next.type = LITERAL_STRING;
    if (data_i != data.length) {
      if (token_seperator[data[data_i]] == null) {
        print('Improper token termination: ' + data[data_i]);
        next.type = TOKEN_ERROR;
        return false;
      }
    }
    return true;
  }

  return false;
};

var consume_ws = function() {
};

var has_another = function() {
  return (peek().type != TOKEN_EOF);
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

  var len = pending.length;
  if (len) {
    return pending[len - 1];
  } else if (tokenize() == false) {
    return null;
  }

  return peek();
};

var read = function() {
  var t = null;
  if (pending.length) {
    t = pending.pop();
  } else {
    if (tokenize() == false) return false;
    t = read();
  }

  processed.push(t);
  if (marks.length > 0) {
    for (var i = 0, len = marks.length; i < len; i++) {
      marks[i]++;
    }
  }

  return t;
};

var set_mark = function() {
  marks.push(0);
};

var clear_mark = function() {
  marks.pop();
};

var rewind_to_mark = function() {
  var depth = marks.pop();
  for (var i = 0; i < depth; i ++) {
    pending.push(processed.pop());
  }
};

var next_is = function(token_type) {
  var t = peek();

  if (isArray(token_type) && t) {
    return token_type.some(function(tok) {
      return this == tok;
    },t.type);
  }

  return (t) ? (t.type == token_type) : false;
};

var consume = function(token_type) {
  var p = peek();

  if (isArray(token_type) && p) {
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

var must_consume_semicolon = function(t) {
  if (!consume(TOKEN_SEMICOLON)) {
    throw new Error('Syntax error: expected ;.');
    // TODO: complete semicolon handling
  }
};

var must_read_id = function(error_message) {
  if (trace) print('must_read_id');
  var t = peek();
  var result = '';

  if (t.type != TOKEN_ID) {
    throw new Error(error_message);
  }

  result = read().content;
  return result;
};

var cmd = function(op, t, lhs, rhs) {
};

var Parser = {
  this_method: null,
  parsed_types: [],
};

var parse = function() {
  var type = parser.parse_type_def();
  while (type) {
    type = parser.parse_type_def();
  }

  type = null;
  for (var i = 0, len = paser.parsed_types.count; i < len; i++) {
    type = parser.parsed_types[i];
    if (type.is_template()) continue;

    parsed_types.push(type);
  }
}

var parse_type_def = function() {
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
      return parse_type_def(t, quals | JOG_QUALIFIER_CLASS , "Class name expected.");
    } else if (consume(TOKEN_INTERFACE)) {
      return parse_type_def(t, quals | JOG_QUALIFIER_INTERFACE | JOG_QUALIFIER_ABSTRACT, "Interface name expected.");
    } else {
      if (quals) throw new Error("Expected class or interface.");
    }

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
    type = {token:t.type, qualifiers:quals, name:name};
    Parser.parsed_types.push(type);

    // TODO: Template type (Jog implements templates instead of generics).
    if (consume(TOKEN_LT)) {
      throw new Error('Java generics are not implemented');
    }

    parse_type_def(t, type);

    return type;
  } else if (arguments.length == 2) {
    t = arguments[0];
    type = arguments[1];

    if (consume(TOKEN_EXTENDS)) type.base_class = parse_data_type();

    t2 = peek();
    if (consume(TOKEN_IMPLEMENTS)) {
      if (is_interface(type)) throw new Error('Interface cannot implement another.');
      type.interfaces = [parse_data_type()];
      while (consume(TOKEN_COMMA)) {
        type.interfaces.push(parse_data_type());
      }
    }

    // make one empty static initializer for setting up initial class
    // property values
    if (is_class() && !is_template()) {
      type.static_initializers = [{token:t.type,
                                   qualifiers:JOG_QUALIFIER_STATIC,
                                   type:type,
                                   notsure:null,
                                   notsure2:'static'}];
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
        } finally { throw e; }
      }
    }

    must_consume(TOKEN_RCURLY, 'Expected }.');
  }
}

var parse_placeholder_type = function() {
  var placeholder_type = parse_data_type();
  return placeholder_type;
}

var parse_type_qualifiers = function() {
  var quals = 0;
  var t = null;

  while (true) {
    t = peek();

    if (consume(TOKEN_ABSTRACT)) {
      quals |= JOG_QUALIFIER_ABSTRACT;
      continue;
    }

    if (consume(TOKEN_PUBLIC)) {
      quals |= JOG_QUALIFIER_PUBLIC;
      if (quals & (JOG_QUALIFIER_PROTECTED | JOG_QUALIFIER_PRIVATE)) {
        throw new Error('Cannot be public if protected or private.');
      }
      continue;
    }

    if (consume(TOKEN_PROTECTED)) {
      quals |= JOG_QUALIFIER_PROTECTED;
      if (quals & (JOG_QUALIFIER_PUBLIC | JOG_QUALIFIER_PRIVATE)) {
        throw new Error('Cannot be protected if public or private.');
      }
      continue;
    }

    if (consume(TOKEN_PRIVATE)) {
      quals |= JOG_QUALIFIER_PRIVATE;
      if (quals & (JOG_QUALIFIER_PUBLIC | JOG_QUALIFIER_PROTECTED)) {
        throw new Error('Cannot be private if public or protected.');
      }
      continue;
    }

    if (consume(TOKEN_STATIC)) {
      quals |= JOG_QUALIFIER_STATIC;
      continue;
    }

    if (consume(TOKEN_NATIVE)) {
      quals |= JOG_QUALIFIER_NATIVE;
      continue;
    }

    return quals;
  }
}

var parse_member_qualifiers = function() {
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
        throw new Error('Cannot be public if protected or private.');
      }
      continue;
    }

    if (consume(TOKEN_PROTECTED)) {
      quals |= JOG_QUALIFIER_PROTECTED;
      if (quals & (JOG_QUALIFIER_PUBLIC | JOG_QUALIFIER_PRIVATE)) {
        throw new Error('Cannot be protected if public or private.');
      }
      continue;
    }

    if (consume(TOKEN_PRIVATE)) {
      quals |= JOG_QUALIFIER_PRIVATE;
      if (quals & (JOG_QUALIFIER_PUBLIC | JOG_QUALIFIER_PROTECTED)) {
        throw new Error('Cannot be private if public or protected.');
      }
      continue;
    }

    if (consume(TOKEN_STATIC)) {
      quals |= JOG_QUALIFIER_STATIC;
      continue;
    }

    if (cosume(TOKEN_NATIVE)) {
      quals |= JOG_QUALIFIER_NATIVE;
      continue;
    }

    return quals;
  }
}

var parse_member = function(type) {
  if (next_is(TOKEN_RCURLY)) return false;

  var t = peek();
  var quals = parse_member_qualifiers();
  var t2 = peek();
  var m = null;
  var stm = null;
  var name_t = null;
  var name = '';
  var first = true;

  // static initiaizer
  if (quals == JOG_QUALIFIER_STATIC && next_is(TOKEN_LCURLY)) {
    if (is_interface(type)) {
      throw new Error('Static initialization block not allowed here.');
    }

    m = {token:t.type,
         qualifiers:quals,
         type:type,
         return_type:null,
         name:'static'};
    Parser.this_method = m;
    if (!type.static_initializers) type.static_initializers = [];
    type.static_initializers.push(m);

    read();
    while (!next_is(TOKEN_RCURLY)) {
      stm = parse_statement();
      if (stm) {
        if (!m.statements) m.statements = [];
        m.push(stm);
      }
    }
    must_consume(TOKEN_RCURLY, 'Expected }');
    return true;
  }

  data_type = parse_data_type();

  // constructor
  if (next_is(TOKEN_LPAREN)) {
    if (data_type.name == type.name) {
      if (quals & JOG_QUALIFIER_STATIC) {
        throw new Error('Constructor cannot be static.');
      }
      if (is_interface(type)) {
        throw new Error('Constructor not allowed here.');
      }

      quals |= JOG_QUALIFIER_CONSTRUCTOR;
      m = {token:t.type,
           qualifiers:quals,
           type:type,
           return_type: null,
           name:'<init>'};
      Parser.this_method = m;
      parse_params(m);
      if (!type.methods) type.methods = [];
      type.methods.push(m);

      must_consume(TOKEN_LCURLY, 'Expected {.');
      while (!next_is(TOKEN_RCURLY)) {
        stm = parse_statement();
        if (stm) {
          if (!m.statements) m.statements = [];
          m.statements.push(stm);
        }
      }
      must_consume(TOKEN_RCURLY, 'Expected }.');
      return true;
    } else {
      throw new Error('Method missing return type.');
    }
  }

  name_t = peek();
  name = must_read_id('Expected identifier after type.');

  // Method
  if (next_is(TOKEN_LPAREN)) {
    if (name == type.name) {
      throw new Error('Constructors cannot specify a return type.');
    }

    if (is_interface(type)) quals |= JOG_QUALIFIER_ABSTRACT;

    m = {token:t.type,
         qualifiers:quals,
         type:type,
         return_type:data_type,
         name:name};

    if (is_interface(type) && is_static(m)) {
      throw new Error('Interface method cannot be static.');
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
        throw new Error('Interface method cannot be native.');
      }
      must_consume(TOKEN_SEMICOLON, 'Expexted ;.');
    } else if (consume(TOKEN_SEMICOLON)) {
      if (!is_abstract(m)) {
        throw new Error('Method missing body.');
      }
      if (!is_abstract(m)) {
        throw new Error('Abstract method not allowed in non-abstract class.');
      }
    } else {
      if (is_abstract(m)) {
        throw new Error('Abstract method cannot have body.');
      }

      must_consume(TOKEN_LCURLY, 'Expected {.');
      while (next_is(TOKEN_RCURLY)) {
        stm = parse_statement();
        if (stm) {
          if (!m.statements) m.statements = [];
          m.statements.push(stm);
        }
      }
      must_consume(TOKEN_RCURLY, 'Expected }.');
    }
  } else {
    if (data_type == null) {
      throw new Error('void cannot be use as property type.');
    }
    if (quals & JOG_QUALIFIER_NATIVE) {
      throw new Error('native qualifier cannot be used for properties.');
    }
    if (is_interface(type)) {
      throw new Error('Interface cannot have properties.');
    }

    // property
    first = true;
    do {
      if (first) first = false;
      else {
        name_t = peek();
        name = must_read_id('Expected identifier.');
      }

      p = {token:name_t,
           qualifiers:quals,
           type_context:type,
           type:data_type,
           name:name,
           initial_value:parse_initial_value(data_type)};
      if (is_static(p)) {
        if (!type.class_propertis) type.class_properties = [];
        type.class_propertis.push(p);
      } else {
        if (!type.properties) type.properties = [];
        type.properties.push(p);
      }
    }

    while (consume(TOKEN_COMMA));

    must_consume_semicolon(t);
  }

  return true;
};

var parse_params = function(m) {
  var t = null;
  var type = null;
  var name = '';

  must_consume(TOKEN_LPAREN, 'Expected (.');

  if (!consume(TOKEN_RPAREN)) {
    do {
      t = peek();
      type = parse_data_type();
      if (!type) {
        throw new Error('void cannot be parameter type');
      }

      name = must_read_id('Expected identifier.');
      if (!m.parameters) m.parameters = [];
      m.parameters.push({token:t.type, type:type, name:name});
    } while (consume(TOKEN_COMMA));
    must_consume(TOKEN_RPAREN, 'Expected ).');
  }
};

var parse_data_type = function() {
  if (trace) print('parse_data_type');
  var t = peek();

  // primitive
  if (consume([TOKEN_CHAR, TOKEN_BYTE, TOKEN_SHORT, TOKEN_INT, TOKEN_LONG, TOKEN_FLOAT, TOKEN_DOUBLE, TOKEN_STRING, TOKEN_BOOLEAN])) {
    return {token:t.type, value:t.content};
  }

  // identifier
  var name = must_read_id('Expected type');
  name = name.substr(0);

  // TODO: generics

  // TODO: subscript

  // TODO: add type to type table
  return {token:t.type, name:name};
};

var parse_initial_value = function(of_type) {
  if (trace) print('parse_initial_value');
  if (consume(TOKEN_ASSIGN)) {
    if (next_is(TOKEN_LCURLY)) {
      // TODO: parse literal array
      throw new Error('literal array not implemented');
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
  var block = {};
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
        if (!block.statements) block.statements = [];
        block.statements.push(stm);
      }
    }
    return block;
  }

  if (consume(TOKEN_RETURN)) {
    if (consume(TOKEN_SEMICOLON)) {
      if (Parser.this_method && Parser.this_method.return_type) {
        throw new Error('Missing return value.');
      }
      return {token:t.type, value:'void'};
    }

    cmd = {token:t.type, expression:parse_expression()};
    if (require_semicolon) must_consume_semicolon(t);
    return cmd;
  }

  if (consume(TOKEN_IF)) {
    must_consume(TOKEN_LPAREN, 'Expected (.');
    conditional = {token:t.type, expression:parse_expression()};
    must_consume(TOKEN_RPAREN, 'Expected ).');

    if (next_is(TOKEN_SEMICOLON)) {
      throw new Error('Unexpected ;.');
    }

    conditional.body = parse_statement();
    if (consume(TOKEN_ELSE)) {
      if (next_is(TOKEN_SEMICOLON)) {
        throw new Error('Unexpected ;.');
      }
      conditional.else_body = parse_statement();
    }
    return conditional;
  }

  if (consume(TOKEN_WHILE)) {
    must_consume(TOKEN_LPAREN, 'Expected (.');
    loop = {token:t.type, expression:parse_expression()};
    must_consume(TOKEN_RPAREN, 'Expected ).');
    if (next_is(TOKEN_SEMICOLON)) {
      throw new Error('Unexpected ;.');
    }
    loop.body = parse_statement();
    return loop;
  }

  if (consume(TOKEN_FOR)) {
    must_consume(TOKEN_LPAREN, 'Expected (.');

    set_mark();
    init_expr = parse_statement(false);
    if (next_is(TOKEN_COLON)) {
      rewind_to_mark();
      local_type = parse_data_type();
      local_name = must_read_id('Expected identifier.');

      must_consume(TOKEN_COLON, 'Expected :.');
      iterable_expr = parse_expression();
      must_consume(TOKEN_RPAREN, 'Expected ).');

      loop = {token:t.type,
              type:local_type,
              name:local_name,
              iterable:iterable_expr};
      if (next_is(TOKEN_SEMICOLON)) {
        throw new Error('Unexpected ;.');
      }
      loop.body = parse_statement();
      return loop;
    } else {
      clear_mark();
      must_consume(TOKEN_SEMICOLON,  'Expected ;.');
    }

    if (consume(TOKEN_SEMICOLON)) {
      condition = {token:t.type, expression:true};
    } else {
      condition = parse_expression();
      must_consume(TOKEN_SEMICOLON, 'Expected ;.');
    }
    var_mod = parse_statement(false);
    must_consume(TOKEN_RPAREN, 'Expected ).');
    loop = {token:t.type,
            initialization:init_expr,
            condition:condition,
            var_mod:var_mod};
    if (next_is(TOKEN_SEMICOLON)) {
      throw new Error('Unexpected ;.');
    }
    loop.body = parse_statement();
    return loop;
  }

  if (consume(TOKEN_BREAK)) {
    cmd = {token:t.type};
    if (require_semicolon) must_consume_semicolon(t);
    return cmd;
  }

  if (consume(TOKEN_CONTINUE)) {
    cmd = {token:t.type};
    if (require_semicolon) must_consume_semicolon(t);
    return cmd;
  }

  if (consume(TOKEN_ASSERT)) {
    must_consume(TOKEN_LPAREN, 'Expected (.');
    cmd = {token:t.type, expression:parse_expression()};
    if (consume(TOKEN_COMMA)) {
      if (peek().type != LITERAL_STRING) {
        throw new Error('Expected string literal.');
      }
      cmd.message = read().content;
    }
    must_consume(TOKEN_RPAREN, 'Expected ).');
    return cmd;
  }

  expr = parse_expression();
  print(to_str(expr));
  if (next_is(TOKEN_ID)) {
    var var_type = reinterpret_as_type(expr);
    return parse_local_var_decl( expr.token, var_type, require_semicolon);
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
    throw new Error('Expected datatype.');
  }

  do {
    t2 = peek();
    name = must_read_id('Expected identifier');
    decl = {token:t2.type,
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
    expr = {token:t.type, location:expr, new_value:parse_assignment()};
  } else if (consume(TOKEN_ADD_ASSIGN)) {
    expr = {token:t.type, location:expr, new_value:parse_assignment()};
  } else if (consume(TOKEN_SUB_ASSIGN)) {
    expr = {token:t.type, location:expr, new_value:parse_assignment()};
  } else if (consume(TOKEN_MUL_ASSIGN)) {
    expr = {token:t.type, location:expr, new_value:parse_assignment()};
  } else if (consume(TOKEN_DIV_ASSIGN)) {
    expr = {token:t.type, location:expr, new_value:parse_assignment()};
  } else if (consume(TOKEN_MOD_ASSIGN)) {
    expr = {token:t.type, location:expr, new_value:parse_assignment()};
  } else if (consume(TOKEN_AND_ASSIGN)) {
    expr = {token:t.type, location:expr, new_value:parse_assignment()};
  } else if (consume(TOKEN_OR_ASSIGN)) {
    expr = {token:t.type, location:expr, new_value:parse_assignment()};
  } else if (consume(TOKEN_XOR_ASSIGN)) {
    expr = {token:t.type, location:expr, new_value:parse_assignment()};
  } else if (consume(TOKEN_SHL_ASSIGN)) {
    expr = {token:t.type, location:expr, new_value:parse_assignment()};
  } else if (consume(TOKEN_SHRX_ASSIGN)) {
    expr = {token:t.type, location:expr, new_value:parse_assignment()};
  } else if (consume(TOKEN_SHR_ASSIGN)) {
    expr = {token:t.type, location:expr, new_value:parse_assignment()};
  }
  return expr;
};

var parse_conditional = function() {
  if (trace) print('parse_conditional');
  var expr = parse_logical_or();
  var t = peek();
  if (consume(TOKEN_QUESTIONMARK)) {
    // TODO: ternary conditional
    throw new Error('Ternary not implemented.');
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
      return parse_logical_or({token:t.type, lhs:lhs, rhs:parse_logical_and()});
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
      return parse_logical_and({token:t.type, lhs:lhs, rhs:parse_bitwise_or()});
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
      return parse_bitwise_or({token:t.type, lhs:lhs, rhs:parse_bitwise_xor()});
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
      return parse_bitwise_xor({token:t.type, lhs:lhs, rhs:parse_bitwise_and()});
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
      return parse_bitwise_and({token:t.type, lhs:lhs, rhs:parse_equality()});
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
    return parse_shift({token:t.type, lhs:lhs, rhs:parse_translate()});
  if (consume(TOKEN_SHR))
    return parse_shift({token:t.type, lhs:lhs, rhs:parse_translate()});
  if (consume(TOKEN_SHRX))
    return parse_shift({token:t.type, lhs:lhs, rhs:parse_translate()});
  return lhs;
};

// <, <=, >, >=, instanceof
var parse_relational = function(lhs) {
  if (trace) print('parse_relational');
  if (lhs === undefined)
    return parse_relational(parse_shift());
  var t = peek();
  if (consume(TOKEN_LT))
    return parse_relational({token:t.type, lhs:lhs, rhs:parse_shift()});
  if (consume(TOKEN_LE))
    return parse_relational({token:t.type, lhs:lhs, rhs:parse_shift()});
  if (consume(TOKEN_GT))
    return parse_relational({token:t.type, lhs:lhs, rhs:parse_shift()});
  if (consume(TOKEN_GE))
    return parse_relational({token:t.type, lhs:lhs, rhs:parse_shift()});
  if (consume(TOKEN_INSTANCEOF))
    return parse_relational({token:t.type, lhs:lhs, rhs:parse_data_type()});
  return lhs;
};


// ==, !=
var parse_equality = function(lhs) {
  if (lhs === undefined)
    return parse_equality(parse_relational());
  var t = peek();
  if (consume(TOKEN_EQ))
    return parse_equality({token:t.type, lhs:lhs, rhs:parse_relational()});
  if (consume(TOKEN_NE))
    return parse_equality({token:t.type, lhs:lhs, rhs:parse_relational()});
  return lhs;
};


// +, -
var parse_translate = function(lhs) {
  if (trace) print('parse_translate');
  if (lhs === undefined)
    return parse_translate(parse_scale());
  var t = peek();
  if (consume(TOKEN_PLUS))
    return parse_translate({token:t.type, lhs:lhs, rhs:parse_scale()});
  if (consume(TOKEN_MINUS))
    return parse_translate({token:t.type, lhs:lhs, rhs:parse_scale()});
  return lhs;
};


// *, /
var parse_scale = function(lhs) {
  if (trace) print('parse_scale');
  if (lhs === undefined)
    return parse_scale(parse_prefix_unary());
  var t = peek();
  if (consume(TOKEN_STAR))
    return parse_scale({token:t.type, lhs:lhs, rhs:parse_prefix_unary()});
  if (consume(TOKEN_SLASH))
    return parse_scale({token:t.type, lhs:lhs, rhs:parse_prefix_unary()});
  if (consume(TOKEN_PERCENT))
    return parse_scale({token:t.type, lhs:lhs, rhs:parse_prefix_unary()});
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
        to_type = parse_data_type();
        must_consume(TOKEN_RPAREN, 'Expected ).');
        result = {token:t.type, operand:parse_prefix_unary(), to_type:to_type};
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
      return {token:t.type, type:of_type, args:args};
    }
  }
  if (consume(TOKEN_INCREMENT))
    return {token:t.type, operand:parse_prefix_unary()};
  if (consume(TOKEN_DECREMENT))
    return {token:t.type, operand:parse_prefix_unary()};
  // discard '+a' and just keep 'a'.
  if (consume(TOKEN_PLUS))
    return parse_prefix_unary();
  if (consume(TOKEN_MINUS))
    return {token:t.type, operand:parse_prefix_unary()};
  if (consume(TOKEN_BANG))
    return {token:t.type, operand:parse_prefix_unary()};
  if (consume(TOKEN_TILDE))
    return {token:t.type, operand:parse_prefix_unary()};
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
      dim_expr.add(null);
    } else {
      if (saw_empty) {
        throw new Error('Must provide proceeding dimension.');
      }
      dim_specified = true;
      dim_expr.push(parse_expression());
      must_consume(TOKEN_RBRACKET, 'Expected ].');
    }
  }

  base_name = array_type.name;
  array_type = {token:array_type.token,
                name:base_name,
                length:dim_expr.length};

  if (!dim_specified) {
    if (next_is(TOKEN_LCURLY)) {
      throw new Error('Expected literal array.');
    }
    return parse_literal_array(array_type);
  }

  new_array = {token:t.type,
               type:array_type,
               length:dim_expr[0]};
  if (dim_expr.length > 1) {
    cur = new_array;
    for (var i = 1; i < dim_expr.length; ++i) {
      if (dim_expr[i] == null) break;
      element_type = {token:dim_expr[i].token,
                      name:base_name,
                      length:dim_expr.length-i};
      element_expr = {token:t.type,
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
    return parse_postfix_unary({token:t.type, operand:operand});
  } else if (consume(TOKEN_DECREMENT)) {
    return parse_postfix_unary({token:t.type, operand:operand});
  } else if (consume(TOKEN_PERIOD)) {
    cmd = parse_postfix_unary({token:t.type, operand:operand, term:parse_term()});
    return cmd;
  } else if (consume(TOKEN_LBRACKET)) {
    if (next_is(TOKEN_RBRACKET)) {
      op_type = reinterpret_as_type(operand);
      if (op_type == null) {
        throw new Error('Expected datatype.');
      }
      new_name = (op_type.name) ? op_type.name : op_type.value;
      must_consume(TOKEN_RBRACKET, 'Expected ].');
      new_name = new_name + '[]';
      while (next_is(TOKEN_LBRACKET)) {
        must_consume(TOKEN_RBRACKET, 'Expected ].');
        new_name = new_name + '[]';
      }
      return parse_local_var_decl(t, {token:op_type.token, name:new_name}, false);
    } else {
      index = parse_expression();
      must_consume(TOKEN_RBRACKET, 'Expected ].');
      return parse_postfix_unary({token:t.type,
                                  context:operand,
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

  if (name[-1] != '>') args = parse_args(false);

  if (args == null) return {token:t.type, name:name};

  return {token:t.type, name:name, args:args};
};

var parse_args = function(required) {
  if (trace) print('parse_args');
  var t = peek();
  var args = {};

  if (!consume(TOKEN_LPAREN)) {
    if (required) {
      throw new Error('Expected (.');
    }
    return null;
  }

  if (!consume(TOKEN_RPAREN)) {
    do {
      if (!args['arguments']) args['arguments'] = [];
      args['arguments'].push(parse_expression());
    } while(consume(TOKEN_COMMA));
    must_consume(TOKEN_RPAREN, 'Expected ).');
  }

  return args;
}

var parse_literal_array = function(of_type) {
  var t = read();
  var t2 = null;
  var first = true;
  var terms = [];
  var element_type_name = '';
  var element_type = null;

  if (!consume(TOKEN_RCURLY)) {
    first = true;
    while (first || consume(TOKEN_COMMA)) {
      first = false;
      if (next_is(TOKEN_LCURLY)) {
        element_type_name = of_type.name;
        t2 = peek();
        if (element_type_name.charAt(-3) != ']') {
          throw new Error('Array type does not support this many dimensions.');
        }
        element_type = {token:t.type2, name:element_type_name};
        terms.push(parse_literal_array(element_type));
      } else {
        terms.push(parse_expression());
      }
    }
    must_consume(TOKEN_RCURLY, 'Expected , or }.');
  }

  return {token:t.type, type:of_type, terms:terms};
}

var parse_term = function() {
  if (trace) print('parse_term');
  var t = null;
  var expr = null;
  var args = null;
  var name = '';

  switch (peek().type) {
  case LITERAL_DOUBLE:
    t = read();
    return {token:t.type, value:t.content};
  case LITERAL_FLOAT:
    t = read();
    return {token:t.type, value:t.content};
  case LITERAL_INT:
    t = read();
    return {token:t.type, value:t.content};
  case LITERAL_CHAR:
    t = read();
    return {token:t.type, value:t.content};
  case LITERAL_STRING:
    t = read();
    return {token:t.type, value:t.content};
  // case TOKEN_FALSE:
  //   t = read();
  //   return {token:t.type, value:t.content};
  // case TOKEN_TRUE:
  //   t = read();
  //   return {token:t.type, value:t.content};
  case LITERAL_BOOLEAN:
    t = read();
    return {token:t.type, value:t.content};
  case TOKEN_LPAREN:
    read();
    expr = parse_expression();
    must_consume(TOKEN_RPAREN, 'Expected ).');
    return expr;
  case TOKEN_SUPER:
    // TODO
    print('super');
  case TOKEN_ID:
    return parse_construct();
  case TOKEN_NULL:
    t = read();
    return {token:t.type, value:t.content};
  }

  // TODO: ???
  t = read();
  return {token:t.type, value:t.content};

  throw new Error('Something really bad!');
};



var is_token =  function(a) { return typeof(a) == 'number' }
var token_str = function(token) {
  var ret = token_name_table[token];
  //ret = ret.replace('TOKEN_', '');
  //ret = ret.replace('LITERAL_', '');
  //if ('content' in token) ret = ret + ' ' + token.content;
  return ret;
};
var print_token = function(token) {
  print(token_str(token));
};
var print_pending = function() {
  for (var i in pending) {
    print_term(pending[i]);
  }
}

var is_data_type = function(a) { return ('token' in a) && ('name' in a); };
var data_type_str = function(data_type) {
  return '[' + token_str(data_type.token) + ' ' + data_type.name + ']';
};
var print_data_type = function(data_type) {
  print(data_type_str(data_type));
};

var is_statement = function(a) {
  return ('token' in a) && ('expression' in a);
};
var statement_str = function(stm) {
  return '[' + token_str(stm.token) + ' ' + to_str(stm.expression) + ']';
};
var print_statement = function(stm) {
  print(statement_str(stm));
};

var is_assignment = function(a) {
  return ('token' in a) && ('location' in a) && ('new_value' in a);
};
var assignment_str = function(assign) {
  return '['
      + token_str(assign.token)
      + ' ' + to_str(assign.location)
      + ' ' + to_str(assign.new_value)
      + ']';
};
var print_assignment = function(assign) {
  print(assignment_str(assign));
};

var is_expression = function(a) {
  return ('token' in a) && ('lhs' in a) && ('rhs' in a);
};
var expression_str = function(expr) {
  return '['
      + token_str(expr.token)
      + ' ' + to_str(expr.lhs)
      + ' ' + to_str(expr.rhs)
      + ']';
};
var print_expr = function(expr) {
  print(expression_str(expr));
};

var is_unary = function(a) {
  return ('token' in a) && ('operand' in a);
};
var unary_str = function(unary) {
  return '[' + token_str(unary.token) + ' ' + to_str(unary.operand) + ']';
};
var print_unary = function(unary) {
  print(unary_str(unary));
};

var is_term = function(a) {
  return ('token' in a) && ('value' in a);
};
var term_str = function(term) {
  return '[' + token_str(term.token) + ' ' + term.value + ']';
};
var print_term = function(term) {
  print(term_str(term));
};

/*
  static initializer, constructor, method
  m = {token:t.type,
    qualifiers:quals,
    type:type,
    return_type:null,
    name:'static'};
*/
var is_method = function(a) {};

/*
   {token:name_t,
     qualifiers:quals,
     type_context:type,
     type:data_type,
     name:name,
     initial_value:parse_initial_value(data_type)};
*/
var is_property = function(a) {};

// {token:t2.type,
//  type:var_type,
//  name:name,
//  initial_value:parse_initial_value(var_type)};
var is_var_decl = function(a) {
  return (('token' in a)
      && ('type' in a)
      && ('name' in a)
      && ('initial_value' in a));
};
var var_decl_str = function(var_decl) {
  return '['
      + token_str(var_decl.token)
      + ' ' + to_str(var_decl.type)
      + ' ' + var_decl.name
      + ' ' + to_str(var_decl.initial_value)
      + ']';
};
var is_var_decls = function (a) {
  return (isArray(a) && is_var_decl(a[0]));
}
var var_decls_str = function(a) {
  var str = '[';
  for (var i = 0, len = a.length; i < len; i++) {
    str = str + var_decl_str(a[i]) + ' ';
  }
  return str + ']';
}

var is_block = function(a) {
  return ('statements' in a);
};
var block_str = function(block) {
  var str = '{\n';
  for (var i = 0, len = block.statements.length; i < len; i++) {
    str = str + '  ' + to_str(block.statements[i]) + '\n';
  }
  return str + '}';
}

var to_str = function(a) {
  if (a == null) return '';
  if (is_token(a)) return token_str(a);
  if (is_data_type(a)) return data_type_str(a);
  if (is_statement(a)) return statement_str(a);
  if (is_assignment(a)) return assignment_str(a);
  if (is_expression(a)) return expression_str(a);
  if (is_unary(a)) return unary_str(a);
  if (is_term(a)) return term_str(a);
  if (is_var_decl(a)) return var_decl_str(a);
  if (is_var_decls(a)) return var_decls_str(a);
  if (is_block(a)) return block_str(a);
  if (isArray(a)) {
    var str = '[';
    for (var i = 0, len = a.length; i < len; i++) {
      str = str + to_str(a[i]) + ' ';
    }
    return str + ']';
  }
  return a;
}

var reinterpret_as_type = function(a) {
  return a;
}

// TODO: Built in lint.

var tests = [
  ['123', LITERAL_INT, 123],
  ['123l', LITERAL_LONG, 123],
  ['123L', LITERAL_LONG, 123],
  ['1.23f', LITERAL_FLOAT, 1.23],
  ['1.23F', LITERAL_FLOAT, 1.23],
  ['1.23', LITERAL_DOUBLE, 1.23],
  ['1.23d', LITERAL_DOUBLE, 1.23],
  ['1.23D', LITERAL_DOUBLE, 1.23],
  ['1.23e10', LITERAL_DOUBLE, 1.23e10],
  ['1.23e-10', LITERAL_DOUBLE, 1.23e-10],
  ['1.23e+10', LITERAL_DOUBLE, 1.23e10],
  ['1.23e+10.3', TOKEN_ERROR],
  ['1.23e10e3', TOKEN_ERROR],
  ['1_.23e10', TOKEN_ERROR],
  ['1._23e10', TOKEN_ERROR],
  ['5____2', LITERAL_INT, 52],
  ['52_', TOKEN_ERROR],
  ['2147483647', LITERAL_INT, 2147483647],
  ['2147483648', TOKEN_ERROR], // Too large
  ['0x_52', TOKEN_ERROR],
  ['0_x52', TOKEN_ERROR],
  ['0x5_a', LITERAL_INT, 0x5a],
  ['26', LITERAL_INT, 26],
  ['032', LITERAL_INT, 26],
  ['0b11010', LITERAL_INT, 26],
  ['0b11310', TOKEN_ERROR],
  ['039', TOKEN_ERROR],
  ['093', TOKEN_ERROR],
  ['0000032', LITERAL_INT, 26],
  ['0x00005a', LITERAL_INT, 0x5a],
  ['0.3', LITERAL_DOUBLE, 0.3],
  ['0.3d', LITERAL_DOUBLE, 0.3],
  ['0.3D', LITERAL_DOUBLE, 0.3],
  ['0.3f', LITERAL_FLOAT, 0.3],
  ['.3', LITERAL_DOUBLE, 0.3],
  ['.3e10', LITERAL_DOUBLE, 0.3e10],
  ['0.e10', LITERAL_DOUBLE, 0.0e10],
  ['.0e10', LITERAL_DOUBLE, 0.0e10],
  ['.e10', TOKEN_ERROR],
  ['2e5000', TOKEN_ERROR],
  ['00.03', LITERAL_DOUBLE, 0.03],
  ['03e2', LITERAL_DOUBLE, 3e2],
  ['1.23fz', TOKEN_ERROR],
  ['999_99_9999L', LITERAL_LONG, 999999999],
  ['3.14_15F', LITERAL_FLOAT, 3.1415],
  ['0xFF_EC_DE_5E', TOKEN_ERROR],
  ['0xCAFE_BABE', TOKEN_ERROR], // Too large
  ['0b0010_0101', LITERAL_INT, 37],
  ['-42', LITERAL_INT, -42],
  ['-0x0001', LITERAL_INT, -1],
  ['-0b0001', LITERAL_INT, -1],
  ['-01', LITERAL_INT, -1],
  ['-0.42', LITERAL_DOUBLE, -0.42],
  ['-.42', LITERAL_DOUBLE, -0.42],
  ['-.42e-2', LITERAL_DOUBLE, -0.42e-2],
  ['\'a\'', LITERAL_CHAR, 'a'],
  ['\'Z\'', LITERAL_CHAR, 'Z'],
  ['\'0\'', LITERAL_CHAR, '0'],
  ['\'9\'', LITERAL_CHAR, '9'],
  ['\'\\n\'', LITERAL_CHAR, '\n'],
  ['\'\\\"\'', LITERAL_CHAR, '\"'],
  ['\'\\\'\'', LITERAL_CHAR, '\''],
  ['\'\\\\\'', LITERAL_CHAR, '\\'],
  ['\'\\z\'', TOKEN_ERROR],
  ['\'\\u0061\'', LITERAL_CHAR, 'a'],
  ["'a", TOKEN_ERROR],
  ['\'aaa\'', TOKEN_ERROR],
  ['abc', TOKEN_ID, 'abc'],
  ['ab_c', TOKEN_ID, 'ab_c'],
  ['ab123', TOKEN_ID, 'ab123'],
  ['$abc', TOKEN_ID, '$abc'],
  ['"abc"', LITERAL_STRING, 'abc'],
  ['"abc",', LITERAL_STRING, 'abc'],
  ['"abc"z', TOKEN_ERROR],
  ['\'c\'z', TOKEN_ERROR],
  ['\'c\'\'', TOKEN_ERROR],
  ['\'c\'\"', TOKEN_ERROR],
  ['\'c\',', LITERAL_CHAR, 'c'],
  ['77\'', TOKEN_ERROR],
  ['77\"', TOKEN_ERROR],
  ['77a', TOKEN_ERROR],
  ['<', TOKEN_LT],
  ['>', TOKEN_GT],
  ['<54', TOKEN_LT],
  ['+++3', TOKEN_ERROR],
  ['---3', TOKEN_ERROR],
  ['--3', TOKEN_DECREMENT],
  ['""', LITERAL_STRING, ''],
  ['while', TOKEN_WHILE],
  ['while()',
   [TOKEN_WHILE, TOKEN_LPAREN, TOKEN_RPAREN]],
  ['while ()',
   [TOKEN_WHILE, TOKEN_LPAREN, TOKEN_RPAREN]],
  ['while ( ) ',
   [TOKEN_WHILE, TOKEN_LPAREN, TOKEN_RPAREN]],
  ['while() {}',
   [TOKEN_WHILE, TOKEN_LPAREN, TOKEN_RPAREN, TOKEN_LCURLY, TOKEN_RCURLY]],
  ['int a = 7;',
   [TOKEN_INT, TOKEN_ID, TOKEN_ASSIGN, LITERAL_INT, TOKEN_SEMICOLON]],
  ['int[] a = new int[77];',
   [TOKEN_INT, TOKEN_LBRACKET, TOKEN_RBRACKET, TOKEN_ID, TOKEN_ASSIGN,
    TOKEN_NEW, TOKEN_INT, TOKEN_LBRACKET, LITERAL_INT, TOKEN_RBRACKET,
    TOKEN_SEMICOLON]],
  ['"\\n"', LITERAL_STRING, '\n'],
  ['"\\u77"', TOKEN_ERROR],
  ['"Hello\\nWorld"', LITERAL_STRING, 'Hello\nWorld'],
  ['"abc', TOKEN_ERROR],
  ['int a = 1 + 2;', [TOKEN_INT, TOKEN_ID, TOKEN_ASSIGN, LITERAL_INT,
                      TOKEN_PLUS, LITERAL_INT, TOKEN_SEMICOLON]],
  ['int a = b + c;', [TOKEN_INT, TOKEN_ID, TOKEN_ASSIGN, TOKEN_ID,
                      TOKEN_PLUS, TOKEN_ID, TOKEN_SEMICOLON]],
  ['int a = 1 << 2;', [TOKEN_INT, TOKEN_ID, TOKEN_ASSIGN, LITERAL_INT,
                      TOKEN_SHL, LITERAL_INT, TOKEN_SEMICOLON]],
  ['a.b', [TOKEN_ID, TOKEN_PERIOD, TOKEN_ID]],
  ['a . b', [TOKEN_ID, TOKEN_PERIOD, TOKEN_ID]],
  ['a. b', [TOKEN_ID, TOKEN_PERIOD, TOKEN_ID]],
  ['a .b', [TOKEN_ID, TOKEN_PERIOD, TOKEN_ID]],
  ['Foo.e10', [TOKEN_ID, TOKEN_PERIOD, TOKEN_ID]],
  ['Foo .e10', [TOKEN_ID, TOKEN_PERIOD, TOKEN_ID]],
  // ['Foo (.e10)', TOKEN_ERROR],
  // ['(Foo).e10', TOKEN_ERROR],
  // ['(Foo) .e10', TOKEN_ERROR],
  ['. 1', TOKEN_ERROR],
  ['.', TOKEN_ERROR]

];

print('BEGIN TESTS');
print('');

var isArray = function(obj) {
  if (obj.constructor.toString().indexOf('Array') == -1)
    return false;
  else
    return true;
};


var equal = function(a, b) {
  print('a ' + to_str(a));
  print('b ' + to_str(b));
  for (var prop in a) {
    print(prop);
    //print('a[' + prop + '] ' + a[prop]);
    //print('b[' + prop + '] ' + b[prop]);
    if (a.hasOwnProperty(prop) && b.hasOwnProperty(prop)) {
      if (typeof(a[prop]) !== 'object') {
        if (a[prop] != b[prop]) return false;
      } else {
        var r = equal(a[prop], b[prop]);
        if (!r) return false;
      }
    } else {
      //print('doesn\'t share ' + prop + '!');
      return false;
    }
  }
  return true;
};

var test_tokenize = function () {
var pass_count = 0;
var fail_count = 0;
for (i in tests) {
  var t = tests[i];
  print('Testing the tokenization of ' + t[0]);
  init();
  data = t[0];

  if (isArray(t[1])) {
    for (var i = 0; i < t[1].length; i++) {
      tokenize();
      if (pending[i].type == t[1][i]) {
        pass_count++;
        print(i + '. Type passed.');
      } else {
        fail_count++;
        print(i + '. Type FAILED:' + pending[i].type);
      }
    }
  } else {
    tokenize();
    if (pending[0].type == t[1]) {
      pass_count++;
      print('Type passed.');
    } else {
      fail_count++;
      print('Type FAILED. ***************');
    }
  }
  if ((t.length > 2) && (pending[0].type != TOKEN_ERROR)) {
    if (pending[0].content == t[2]) {
      print('Value passed.');
      pass_count++;
    }
    else {
      fail_count++;
      print('Value FAILED. ***************');
    }
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
      to_type:{token:TOKEN_INT, value:'int'}}],
    ['(Object)a', {
      token:TOKEN_LPAREN,
      operand:{token:TOKEN_ID, name:'a'},
      to_type:{token:TOKEN_ID, name:'Object'}}],
    ['new Object()', {
      token:TOKEN_NEW,
      type:{token:TOKEN_ID, name:'Object'},
      args:{}}],
    ['new Object(a, b)', {
      token:TOKEN_NEW,
      type:{token:TOKEN_ID, name:'Object'},
      args:{
        'arguments':[
          {token:TOKEN_ID, name:'a'},
          {token:TOKEN_ID, name:'b'}
        ]
      }}],
    ['new int[10]', {
      token:TOKEN_NEW,
      type:{token:TOKEN_INT, name:undefined, length:1},
      length:{token:LITERAL_INT, value:10}}],
    ['new int[10][3]', {
      token:TOKEN_NEW,
      type:{token:TOKEN_INT, name:undefined, length:2},
      length:{token:LITERAL_INT, value:10},
      element_expr:{
        token:TOKEN_NEW,
        type:{token:LITERAL_INT, name:undefined, length:1}, // <- seems wrong!
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
      context:{token:TOKEN_ID, name:'a'},
      expression:{token:LITERAL_INT, value:0}}],
    ['a[b]', {
      token:TOKEN_LBRACKET,
      context:{token:TOKEN_ID, name:'a'},
      expression:{token:TOKEN_ID, name:'b'}}],
    ['a[0][0]', {
      token:TOKEN_LBRACKET,
      context:{
        token:TOKEN_LBRACKET,
        context:{token:TOKEN_ID, name:'a'},
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
      type:{token:TOKEN_INT, value:'int'},
      name:'num',
      initial_value:{token:LITERAL_INT, value:1}}]],
    ['float num = 1.0, num2 = 6.28;', [{
      token:TOKEN_ID,
      type:{token:TOKEN_FLOAT, value:'float'},
      name:'num',
      initial_value:{token:LITERAL_DOUBLE, value:1.0}},
      {token:TOKEN_ID,
       type:{token:TOKEN_FLOAT, value:'float'},
       name:'num2',
       initial_value:{token:LITERAL_DOUBLE, value:6.28}}]],
    ['return;', {
      token:TOKEN_RETURN,
      value:'void'}],
    ['return 1;', {
      token:TOKEN_RETURN,
      expression:{token:LITERAL_INT, value:'1'}}],
    ['{ return; }', {
      statements:[{
        token:TOKEN_RETURN,
        value:'void'}]}],
    ['{ a = 1; b = 2; }', {
      statements:[
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
      ]}],
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
      body: {
        statements: [{
          token:TOKEN_ASSIGN,
          location:{token:TOKEN_ID, name:'a'},
          new_value:{token:TOKEN_NULL, value:'null'}
        }],
      },
      else_body: {
        token:TOKEN_IF,
        expression:{token:TOKEN_ID, name:'b'},
        body: {
          statements: [{
            token:TOKEN_ASSIGN,
            location:{token:TOKEN_ID, name:'a'},
            new_value:{token:TOKEN_ID, name:'b'}
          }]
        }
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
      body: {
        statements: [
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
      }
    }],
    ['for (int i = 0; i < len; i++) a *= i;', {
      token:TOKEN_FOR,
      initialization:[{
        token:TOKEN_ID,
        type:{token:TOKEN_INT, value:'int'},
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
      body:{
        statements: [{
          token:TOKEN_ASSIGN,
          location:{token:TOKEN_ID, name:'obj'},
          new_value:{token:TOKEN_NULL, value:'null'}
        }]
      }
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
      args:{}}],
    ['print("hello");', {
      token:TOKEN_ID,
      name:'print',
      args:{'arguments':[
        {token:LITERAL_STRING, value:'hello'}
      ]}}]

  ];

  var pass_count = 0;
  var fail_count = 0;
  for (i in tests) {
    var t = tests[i];
    print('Testing the parsing of ' + t[0]);
    init();
    data = t[0];

    var stm = parse_statement();
    //print(to_str(stm));
    //print(to_str(t[1]));
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
test_parse();

// TODO:
// Negative Numbers
// Numbers that begin with .

// Notes:
// 03e2 is an ugly number.  Is it a malformed octal number or a
// scientific notation double?  Java parses it as scientific but
// I don't like it.
// float = double
// byte = int = long
// One <Two> z
// One <Two<Three>> z - this remains ambiguous until you know if
// One Two or Three are classes.
