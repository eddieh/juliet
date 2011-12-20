V8=vendor/v8/d8
NODE=node
RHINO=rhino

JS=$(V8)

lint:
	gjslint --nojsdoc --custom_jsdoc_tags 'augments, returns' *.js

bootstrap:
	mkdir -p vendor
	cd vendor && svn checkout http://v8.googlecode.com/svn/trunk/ v8
	cd vendor/v8 && scons console=readline d8

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

clean:
	-cd test && rm *.class
	-cd test/scope && rm *.class
	-cd test/assignments && rm *.class
	-cd test/typechecks && rm *.class
