/**
 * libretto.js
 *
 * A combination script loader and script concatenator.
 *
 * (c) Copyright 2011, Eddie Hillenbrand
 *
 * Licnsed under the MIT License at:
 *  <http://creativecommons.org/licenses/MIT>
 *
 */

(function () {
  var environment = this;
  var include_directive = 'include';
  // var require_directive = 'require';
  var app_entry = null;

  var head = (function () {
    var ret = environment.document.getElementsByTagName('head')[0];
    if (!ret) ret = environment.document.documentElement;
    return ret;
  })();

  environment.addEventListener('load', function (evt) {
    if (!app_entry) {
      app_entry = environment['main'];
    }

    if (app_entry) {
      app_entry();
    } else {
      console.warn('Libretto could not find a main function.');
    }
  });

  environment[include_directive] = function (dep) {

    function isScript(dep) {
      return typeof(dep) === 'string' && !(new RegExp('\\\.css$')).test(dep);
    };

    function isCSS(dep) {
      return typeof(dep) === 'string' && (new RegExp('\\\.css$')).test(dep);
    };

    function addScript(src) {
      function isLoaded(src) {
        var scripts = document.getElementsByTagName('script');
        var base = null, s = null, i = 0, charIdx = 0, normalizedSrc = null;
        for (i = 0; i < scripts.length; i++) {
          s = scripts[i];
          base = s.baseURI;
          charIdx = base.lastIndexOf('/');
          normalizedSrc = base.slice(0, charIdx) + '/' + src;

          if (s.src === normalizedSrc) {
            return true;
          }
        }
        return false;
      };
      if (isLoaded(src)) return;

      var script = document.createElement('script');
      script.src = src;

      head.insertBefore(script, head.firstChild);
    }

    function addCSS(href) {
      var link = document.createElement('link');
      link.href = href;
      link.rel = 'stylesheet';
      link.type = 'text/css';

      head.insertBefore(link, head.firstChild);
    }

    if (isScript(dep)) {
      addScript(dep);
    } else {
      addCSS(dep);
    }
  };

  // environment[require_directive] = function () {};
})();
