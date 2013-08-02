Juliet.util = function() {

  return {

    clone: function(obj) {
      // This is a shallow copy!
      if (this.isArray(obj)) {
        return obj.slice(0);
      }

      var newObj = {};
      for (var propKey in obj) {
        if (obj.hasOwnProperty(propKey)) {
          newObj[propKey] = obj[propKey];
        }
      }
      return newObj;
    },

    contains: function(obj, target) {
      var self = this;
      if (obj == null) return false;
      return this.some(obj, function(src) {
        return self.equal(src, target);
      });
    },

    escapeStr: function(str) {
      var ret = '';
      var ch = 0;
      for (var i = 0; i < str.length; i++) {
        ch = str.charCodeAt(i);
        switch (ch) {
          // backspace
        case 8:
          ch = '\\b';
          break;
          // horizontal tab
        case 9:
          ch = '\\t';
          break;
          // newline
        case 10:
          ch = '\\n';
          break;
          // form feed
        case 12:
          ch = '\\f';
          break;
          // carriage return
        case 13:
          ch = '\\r';
          break;
          // single quote
        case 39:
          ch = '\\\'';
          break;
          // backslash
        case 92:
          ch = '\\\\';
          break;
        default:
          ch = str.charAt(i);
        }
        ret = ret + ch;
      }
      return ret;
    },

    equal: function(a, b) {
      if (typeof(a) !== typeof(b)) return false;

      var c1 = a;
      var c2 = b;

      for (var i = 0; i < 2; i++) {
        for (var prop in c1) {
          if (c1 && c2 && c1.hasOwnProperty(prop) && c2.hasOwnProperty(prop)) {
            if (typeof(c1[prop]) !== 'object') {
              if (c1[prop] != c2[prop]) {
                print('Property, ' + prop + ', differs (' + c1[prop] + ',' +
                      c2[prop] + ')');
                return false;
              }
            } else {
              var r = this.equal(c1[prop], c2[prop]);
              if (!r) {
                print('Property, ' + prop + ', differs (' + c1[prop] + ',' +
                      c2[prop] + ')');
                return false;
              }
            }
          } else {
            // print('Property, ' + prop + ' is missing.');
            return false;
          }
        }
        // swap
        c1 = b;
        c2 = a;
      }

      return true;
    },

    extends: function(obj1, obj2) {
      // Extend obj1 w/ obj2 (shallow)
      for (var propKey in obj2) {
        if (obj2.hasOwnProperty(propKey)) {
          obj1[propKey] = obj2[propKey];
        }
      }
      return obj1;
    },

    forEach: function(obj, iterator, context) {

      if (obj == null) return;

      // Use native foreach
      if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
        return obj.forEach(iterator, context);
      }

      // Iterate as an array
      if (Juliet.util.isArray(obj)) {
        for (var i = 0, l = obj.length; i < l; i++) {
          iterator.call(context, obj[i], i, obj);
        }
        return;
      }

      // Iterate as an object
      for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          iterator.call(context, obj[key], key, obj);
        }
      }
      return;
    },

    isArray: Array.isArray || (function(obj) {
      if (!obj) return false;
      return toString.call(obj) == '[object Array]';
    }),

    isNumber: function(obj) {
      return Object.prototype.toString.call(obj) == '[object Number]';
    },

    isObject: function(obj) {
      return obj === Object(obj);
    },

    isString: function(obj) {
      return Object.prototype.toString.call(obj) == '[object String]';
    },

    keys: Object.keys || (function(obj) {
      var keys = [];
      for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) keys.push(key);
      }
      return keys;
    }),

    some: function(obj, iterator, context) {

      var result = false;
      if (obj == null) return result;
      if (Array.prototype.some && obj.some === Array.prototype.some)
        return obj.some(iterator, context);

      // Iterate as an array
      if (this.isArray(obj)) {
        for (var i = 0, l = obj.length; i < l; i++) {
          if (iterator.call(context, obj[i], i, obj)) return;
        }
        return;
      }

      // Iterate as an object
      for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          if (iterator.call(context, obj[key], key, obj)) return;
        }
      }
      return;
    },

    token_str: function(token) {
      var ret = Juliet.tokens[token];
      //ret = ret.replace('TOKEN_', '');
      //ret = ret.replace('LITERAL_', '');
      //if ('content' in token) ret = ret + ' ' + token.content;
      return ret;
    },

    print_token: function(token) {
      print(this.token_str(token));
    },

    print_pending: function() {
      for (var i in Juliet.lexer.pending) {
        print(i + ' ' +
              this.token_str(Juliet.lexer.pending[i].type) + ' ' +
              Juliet.lexer.pending[i].type + ' ' +
              Juliet.lexer.pending[i].content);
      }
    },

    print_processed: function() {
      for (var i in Juliet.lexer.processed) {
        print(i + ' ' +
              this.token_str(Juliet.lexer.processed[i].type) + ' ' +
              Juliet.lexer.processed[i].type + ' ' +
              Juliet.lexer.processed[i].content);
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
    }

  };

}();
