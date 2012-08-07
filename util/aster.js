#!/usr/bin/env node
var fs = require('fs'),
	util = require('util'),
	esprima = require('esprima'),
	argv = require('optimist')
		.usage('Convert a Javascript file into a JSON representation of its AST\nUsage: $0 filename')
		.alias('o', 'output')
		.describe('o', 'name of the output file')
		.demand(1)
		.argv,
	filename = argv._,
	ast = esprima.parse(String(fs.readFileSync(filename))),
	ast_json = util.inspect(ast, false, null);

if(!argv.output)
	console.log(ast_json);
else 
	fs.writeFileSync(argv.output, ast_json);