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

Juliet.util = function() {

  return {
    is_token: function(a) { return typeof(a) == 'number' },

    token_str: function(token) {
      var ret = token_name_table[token];
      //ret = ret.replace('TOKEN_', '');
      //ret = ret.replace('LITERAL_', '');
      //if ('content' in token) ret = ret + ' ' + token.content;
      return ret;
    },

    print_token: function(token) {
      print(this.token_str(token));
    },

    print_pending: function() {
      for (var i in pending) {
        print(i + ' ' +
              this.token_str(pending[i].type) + ' ' +
              pending[i].type + ' ' +
              pending[i].content);
      }
    },

    print_processed: function() {
      for (var i in processed) {
        print(i + ' ' +
              this.token_str(processed[i].type) + ' ' +
              processed[i].type + ' ' +
              processed[i].content);
      }
    },

    ast_str: function(a, depth) {
      if (a === undefined) return 'undefined';
      if (depth === undefined) depth = 1;
      var indent = function(d) {
        var ret = '';
        for (var i = 0; i < d; i++) ret = ret + '  ';
        return ret;
      };
      var ret = '';
      if (a === null) ret = ret + 'null';
      else if (this.isArray(a)) {
        ret = ret + '[\n';
        for (var i = 0, len = a.length; i < len; i++) {
          ret = ret + indent(depth) + this.ast_str(a[i], depth + 1);
          if (i < (len - 1)) ret = ret + ', ';
          ret = ret + '\n';
        }
        ret = ret + indent(depth - 1) + ']';
      } else if (typeof(a) === 'object') {
        ret = ret + '{\n';
        var props = [];
        for (p in a) props.push(p);
        for (var i = 0, len = props.length; i < len; i++) {
          ret = ret + indent(depth) + props[i] + ':';
          if (props[i] == 'token') {
            ret = ret + this.token_str(a[props[i]]);
          } else {
            ret = ret + this.ast_str(a[props[i]], depth + 1);
          }
          if (i < (len - 1)) ret = ret + ', ';
          ret = ret + '\n';
        }
        ret = ret + indent(depth - 1) + '}';
      } else if (typeof(a) === 'string') {
        ret = ret + '\'' + a + '\'';
      } else {
        ret = ret + a;
      }
      return ret;
    },

    print_ast: function(a) {
      print(this.ast_str(a));
    },

    // TODO: Built in lint.

    has: function(a, o) {
      return a.some(function(e) {
        return this.equal(e, o);
      });
    },

    copy: function(obj, without) {
      var theCopy = {};
      for (var propKey in obj) {
        if (obj.hasOwnProperty(propKey)) {
          if (without && this.has(without, propKey)) continue;
          if (typeof(obj[propKey]) === 'object') {
            theCopy[propKey] = this.copy(obj[propKey], without);
          } else {
            theCopy[propKey] = obj[propKey];
          }
        }
      }
      return theCopy;
    },

    isArray: function(obj) {
      if (obj.constructor.toString().indexOf('Array') == -1)
        return false;
      else
        return true;
    },

    equal: function(a, b) {
      for (var prop in a) {
        if (a.hasOwnProperty(prop) && b.hasOwnProperty(prop)) {
          if (typeof(a[prop]) !== 'object') {
            if (a[prop] != b[prop]) return false;
          } else {
            var r = this.equal(a[prop], b[prop]);
            if (!r) return false;
          }
        } else {
          return false;
        }
      }
      return true;
    },

    capitalize:function(str) {
      return str.charAt(0).toLocaleUpperCase() + str.slice(1);
    }
  };
}();
