V8=vendor/v8/d8
NODE=node
RHINO=rhino

JS=$(V8)

all: juliet-cli.js juliet-browser.js

juliet-cli.js: src/*.js
	java -jar vendor/closure-compiler/compiler.jar --flagfile Build.cli

juliet-browser.js: src/*.js
	java -jar vendor/closure-compiler/compiler.jar --flagfile Build.browser

lint:
	gjslint --nojsdoc --custom_jsdoc_tags 'augments, returns' *.js

bootstrap: vendor/v8/d8 vendor/closure-compiler/compiler.jar

vendor/v8/d8:
	mkdir -p vendor
	cd vendor && svn checkout http://v8.googlecode.com/svn/trunk/ v8
	cd vendor/v8 && scons console=readline d8

vendor/closure-compiler/compiler.jar:
	mkdir -p vendor/closure-compiler
	cd vendor/closure-compiler && curl -O http://closure-compiler.googlecode.com/files/compiler-latest.zip
	cd vendor/closure-compiler && tar xvf compiler-latest.zip

.PHONY: test test-v8 test-node test-all
test:
	$(JS) test/all.js

test-v8:
	$(V8) test/all.js

test-node:
	$(NODE) test/all.js

test-all:
	$(V8) test/all.js -- --summarize
	$(NODE) test/all.js --summarize

test-tokenize:
	$(JS) test/tokenize.js

test-parser:
	$(JS) test/parser.js

clean:
	-rm juliet-cli.js
	-rm juliet-browser.js
	-cd test && rm *.class
	-cd test/scope && rm *.class
	-cd test/assignments && rm *.class
	-cd test/typechecks && rm *.class
