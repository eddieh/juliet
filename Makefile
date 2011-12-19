V8=vendor/v8/d8
NODE=node
JS=$(V8)

lint:
	gjslint --nojsdoc --custom_jsdoc_tags 'augments, returns' *.js

bootstrap:
	mkdir -p vendor
	cd vendor && svn checkout http://v8.googlecode.com/svn/trunk/ v8
	cd vendor/v8 && scons console=readline d8

test:
	$(JS) tests/tests.js

clean:
	-cd tests && rm *.class
	-cd tests/scope && rm *.class
	-cd tests/assignments && rm *.class
