lint:
	gjslint --nojsdoc --custom_jsdoc_tags 'augments, returns' *.js

bootstrap:
	cd vendor && svn checkout http://v8.googlecode.com/svn/trunk/ v8
	cd vendor/v8 && scons console=readline d8

test:
	vendor/v8/d8 tests/tests.js

clean:
	-cd tests && rm *.class
	-cd tests/scope && rm *.class
	-cd tests/assignments && rm *.class
