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
var LITERAL_INTEGER = next_token++;
var LITERAL_LONG = next_token++;
var LITERAL_FLOAT = next_token++;
var LITERAL_DOUBLE = next_token++;
var LITERAL_STRING = next_token++;
var LITERAL_BOOLEAN = next_token++;

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
  ']': true
};

// No commas..
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
  '*': TOKEN_STAR,
  '*=': TOKEN_MUL_ASSIGN,
  '/=': TOKEN_DIV_ASSIGN,
  '/': TOKEN_SLASH,
  '&&': TOKEN_LOGICAL_AND,
  '||': TOKEN_LOGICAL_OR,
  '&': TOKEN_AMPERSAND,
  '&=': TOKEN_XOR_ASSIGN,
  '%': TOKEN_PERCENT
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

var data = '';
var data_i = 0;
var pending = [];
var processed = [];

var init = function() {
  data = '';
  data_i = 0;
  pending = [];
  processed = [];
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

  // The sequence begins with a character ranging from 0-9
  if ((ch >= 48 && ch <= 57) || (ch == 46)) {
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
          print('Invalid number.');
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
          print('Invalid number.');
          next.type = TOKEN_ERROR;
          return false;
        }
      } else if (ch2 == 56 || ch2 == 57) {
        has_decimal_digits = true;
        if (base < 10) {
          print('Invalid number.');
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
          print('Invalid number.');
          next.type = TOKEN_ERROR;
          return false;
        }
      } else if (((ch2 >= 65) && (ch2 <= 70)) ||
                 ((ch2 >= 97) && (ch2 <= 102))) { // a-f, A-F
        if (base < 16) {
          print('Invalid number.');
          next.type = TOKEN_ERROR;
          return false;
        }
      } else {
        // ERROR
        print('Invalid number.');
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
      if (next.type == TYPE_DEFAULT) next.type = LITERAL_INTEGER;
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


var consume = function(token_type) {
  if (pending.length == 0) {
    if (tokenize() == false) return false;
  }
  if ((token_type === undefined) ||
      (pending[pending.length - 1].type == token_type)) {
    processed.push(pending.pop());
    return true;
  }
  return false;
};

var cmd = function(op, t, lhs, rhs) {
};

var parse_expression = function() {
  return parse_assignment();
};

var _pax = {};
for (var i in [TOKEN_ASSIGN,
               TOKEN_ADD_ASSIGN,
               TOKEN_SUB_ASSIGN,
               TOKEN_MUL_ASSIGN,
               TOKEN_DIV_ASSIGN,
               TOKEN_MOD_ASSIGN,
               TOKEN_AND_ASSIGN,
               TOKEN_OR_ASSIGN,
               TOKEN_XOR_ASSIGN,
               TOKEN_SHL_ASSIGN,
               TOKEN_SHR_ASSIGN,
               TOKEN_SHRX_ASSIGN]) {
  _pax[i] = i;
}

var parse_assignment = function() {
  var expr = parse_conditional();
  var t = peek();
  if (_pax[t.type] != undefined) {
    consume(t.type);
    expr = cmd(t.type, t, expr, parse_assignment());
  }
  return expr;
};

var _psx = {};
for (var i in [TOKEN_SHL,
               TOKEN_SHR,
               TOKEN_SHRX]) {
  _psx[i] = i;
}
// <<, >>, >>>
var parse_shift = function(lhs) {
  if (lhs === undefined) return parse_shift(parse_translate());
  if (scanner.consume(TOKEN_SHL))
    return JogCmdSHL.alloc(t, lhs, parse_translate());
  if (scanner.consume(TOKEN_SHR))
    return JogCmdSHR.alloc(t, lhs, parse_translate());
  if (scanner.consume(TOKEN_SHRX))
    return JogCmdSHRX.alloc(t, lhs, parse_translate());
  return lhs;
};

// <, <=, >, >=, instanceof
var parse_relational = function(lhs) {
  if (lhs === undefined)
    return parse_relational(parse_shift());
  var t = scanner.peek();
  if (scanner.consume(TOKEN_LT))
    return JogCmdLT.alloc(t, lhs, parse_shift());
  if (scanner.consume(TOKEN_LE))
    return JogCmdLE.alloc(t, lhs, parse_shift());
  if (scanner.consume(TOKEN_GT))
    return JogCmdGT.alloc(t, lhs, parse_shift());
  if (scanner.consume(TOKEN_GE))
    return JogCmdGE.alloc(t, lhs, parse_shift());
  if (scanner.consume(TOKEN_INSTANCEOF))
    return JogCmdInstanceOf.alloc(t, lhs, parse_data_type());
  return lhs;
};


// ==, !=
var parse_equality = function(lhs) {
  if (lhs === undefined)
    return parse_relational(parse_shift());
  if (scanner.consume(TOKEN_EQ))
    return JogCmdEQ.alloc(t, lhs, parse_shift());
  if (scanner.consume(TOKEN_NE))
    return JogCmdNE.alloc(t, lhs, parse_shift());
  return lhs;
};


// +, -
var parse_translate = function(lhs) {
  if (lhs === undefined)
    return parse_translate(parse_scale());
  if (scanner.consume(TOKEN_PLUS))
    return JogCmdEQ.alloc(t, lhs, parse_scale());
  if (scanner.consume(TOKEN_MINUS))
    return JogCmdNE.alloc(t, lhs, parse_scale());
  return lhs;
};


// *, /
var parse_scale = function(lhs) {
  if (lhs === undefined)
    return parse_scale(parse_prefix_unary());
  if (scanner.consume(TOKEN_STAR))
    return JogCmdEQ.alloc(t, lhs, parse_prefix_unary());
  if (scanner.consume(TOKEN_SLASH))
    return JogCmdEQ.alloc(t, lhs, parse_prefix_unary());
  if (scanner.consume(TOKEN_PERCENT))
    return JogCmdEQ.alloc(t, lhs, parse_prefix_unary());
  return lhs;
};

// (cast), new, ++, --, +, -, !, ~
var parse_prefix_unary = function() {
  // (cast) - TODO
  // new - TODO
  if (scanner.consume(TOKEN_INCREMENT))
    return JogCmdIncrement.alloc(t, parse_prefix_unary());
  if (scanner.consume(TOKEN_DECREMENT))
    return JogCmdDecrement.alloc(t, parse_prefix_unary());
  // discard '+a' and just keep "a"."
  if (scanner.consume(TOKEN_PLUS))
    return parse_prefix_unary();
  if (scanner.consume(TOKEN_MINUS))
    return JogCmdNegate.alloc(t, parse_prefix_unary());
  if (scanner.consume(TOKEN_BANG))
    return JogCmdLogicalNot.alloc(t, parse_prefix_unary());
  if (scanner.consume(TOKEN_TILDE))
    return JogCmdBitwiseNot.alloc(t, parse_prefix_unary());
  return parse_postfix_unary();
};

// ++, --, ., (), []
var parse_postfix_unary = function(operand) {
  if (operand === undefined)
    return parse_postfix_unary(parse_term());
  return operand;
};

var parse_term = function() {
  switch (scanner.nextType()) {
  case TOKEN_LITERAL_DOUBLE:
    return JogLiteralDouble(t);
  case TOKEN_LITERAL_FLOAT:
    return JogLiteralFloat(t);
  case TOKEN_LITERAL_INT:
    return JogLiteralInt(t);
  case TOKEN_LITERAL_CHAR:
    return JogLiteralChar(t);
  case TOKEN_STRING:
    return JogLiteralString(t);
  case TOKEN_FALSE:
    return JogLiteralBoolean(t);
  case TOKEN_TRUE:
    return JogLiteralBoolean(t);
  case TOKEN_NULL:
    return JogLiteralNull(t);
  case TOKEN_LPAREN:
    // TODO
  case TOKEN_SUPER:
    // TODO
  case TOKEN_ID:
    return parse_construct();
    // TODO
  }
};









// TODO: Built in lint.

var tests = [
  ['123', LITERAL_INTEGER, 123],
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
  ['5____2', LITERAL_INTEGER, 52],
  ['52_', TOKEN_ERROR],
  ['2147483647', LITERAL_INTEGER, 2147483647],
  ['2147483648', TOKEN_ERROR], // Too large
  ['0x_52', TOKEN_ERROR],
  ['0_x52', TOKEN_ERROR],
  ['0x5_a', LITERAL_INTEGER, 0x5a],
  ['26', LITERAL_INTEGER, 26],
  ['032', LITERAL_INTEGER, 26],
  ['0b11010', LITERAL_INTEGER, 26],
  ['0b11310', TOKEN_ERROR],
  ['039', TOKEN_ERROR],
  ['093', TOKEN_ERROR],
  ['0000032', LITERAL_INTEGER, 26],
  ['0x00005a', LITERAL_INTEGER, 0x5a],
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
  ['0b0010_0101', LITERAL_INTEGER, 37],
  ['-42', LITERAL_INTEGER, -42],
  ['-0x0001', LITERAL_INTEGER, -1],
  ['-0b0001', LITERAL_INTEGER, -1],
  ['-01', LITERAL_INTEGER, -1],
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
   [TOKEN_INT, TOKEN_ID, TOKEN_ASSIGN, LITERAL_INTEGER, TOKEN_SEMICOLON]],
  ['int[] a = new int[77];',
   [TOKEN_INT, TOKEN_LBRACKET, TOKEN_RBRACKET, TOKEN_ID, TOKEN_ASSIGN,
    TOKEN_NEW, TOKEN_INT, TOKEN_LBRACKET, LITERAL_INTEGER, TOKEN_RBRACKET,
    TOKEN_SEMICOLON]],
  ['"\\n"', LITERAL_STRING, '\n'],
  ['"\\u77"', TOKEN_ERROR],
  ['"Hello\\nWorld"', LITERAL_STRING, 'Hello\nWorld'],
  ['"abc', TOKEN_ERROR]
];

print('BEGIN TESTS');
print('');

var isArray = function(obj) {
  if (obj.constructor.toString().indexOf('Array') == -1)
    return false;
  else
    return true;
};

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
