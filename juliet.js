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

Juliet = function() {
  return {
    source: '',

    options: {
      trace: false
    },

    tokens: [
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
    ],

    QUALIFIER_PUBLIC:          1,
    QUALIFIER_PROTECTED:       2,
    QUALIFIER_PRIVATE:         4,
    QUALIFIER_STATIC:          8,
    QUALIFIER_NATIVE:         16,
    QUALIFIER_CLASS:          32,
    QUALIFIER_INTERFACE:      64,
    QUALIFIER_PRIMITIVE:     128,
    QUALIFIER_CONSTRUCTOR:   256,
    QUALIFIER_ABSTRACT:      512,
    QUALIFIER_FINAL:        1024,
    QUALIFIER_STRICTFP:     2048,
    QUALIFIER_TRANSIENT:    4096,
    QUALIFIER_VOLATILE:     8192,
    QUALIFIER_SYNCRONIZED: 16384,

    QUALIFIER_REFERENCE: (this.QUALIFIER_CLASS | this.QUALIFIER_INTERFACE),

    init: function() {
      for (var i = 0; i < this.tokens.length; i++) {
        this[this.tokens[i]] = i;
      }
      return this;
    }
  };
}().init();

if (typeof(load) !== 'undefined') {
  load('src/util.js');
  load('src/platform.js');
  load('src/lexer.js');
  load('src/parser.js');
  load('src/compiler.js');
  load('src/runtime.js');
  load('src/stdlib.js');
  load('src/runner.js');
  if (typeof(noMain) === 'undefined') {
    load('src/main.js');
  }
} else {
  include('src/util.js');
  include('src/lexer.js');
  include('src/parser.js');
  include('src/compiler.js');
  include('src/runtime.js');
  include('src/stdlib.js');
  include('src/runner.js');
}
