lint:
	gjslint --nojsdoc --custom_jsdoc_tags 'augments, returns' *.js

bootstrap:
	cd vendor && svn checkout http://v8.googlecode.com/svn/trunk/ v8
	cd vendor/v8 && scons console=readline d8

test:
	sh tests/test.sh
	@echo ""
	sh tests/scope/scope.sh
