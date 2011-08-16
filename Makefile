lint:
	gjslint --nojsdoc --custom_jsdoc_tags 'augments, returns' *.js

test:
	sh tests/test.sh
	@echo ""
	sh tests/scope/scope.sh
