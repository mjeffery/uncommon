#!/usr/bin/env node
var fs = require('fs'),
	util = require('util'),
	escodegen = require('escodegen'),
	argv = require('optimist')
		.usage('Convert a JSON representation of an AST into Javascript\nUsage: $0 filename')
		.alias('o', 'output')
		.describe('o', 'name of the output file')
		.demand(1)
		.argv,
	filename = argv._,
	ast = JSON.parse(fs.readFileSync(filename).toString()),
	code = escodegen.generate(ast);

if(!argv.output)
	console.log(code);
else 
	fs.writeFileSync(argv.output, code);