SHELL = /bin/sh

clean:
	rm -f .eslintrc.json
	rm -f .stylelintrc.json

linters: 
	ln -s node_modules/@dltg/gulp-build/templates/eslintrc.json .eslintrc.json
	ln -s node_modules/@dltg/gulp-build/templates/stylelintrc.json .stylelintrc.json