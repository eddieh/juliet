/* The Java Class Library */

Juliet.stdlib = function() {
  return {
    System: {
      out: {
        println: function(args) {
          print(args);
        }
      }
    }
  };
}();
