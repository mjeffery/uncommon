var fs = require('fs'),
	path = require('path'),
	//_ = require('underscore'), //TODO use underscore in traverse function?
	esprima = require('esprima'),
	escodegen = require('escodegen'),
	Module = require('./Module');
	
var traverse = function(node, callback) {
	if(Array.isArray(node)) {
		node.forEach(function(x) {
			traverse(x, callback);
		});
	}
	else if(node && typeof node == 'object') {
		callback(node);
		
		Object.keys(node).forEach(function(key) {
			traverse(node[key], callback);
		});
	}
};

function isRequire (node) {
    return node.type === 'CallExpression'
        && node.callee.type === 'Identifier'
        && node.callee.name === 'require';
}

var createProject = function(mainModule, dependencies) {
	var home, cwd,
		toProcess = [],
		processing = {},
		modules = [];
	
	if(path.extname(mainModule) === '') mainModule += '.js';
	home = cwd = path.dirname(path.resolve(mainModule));
	mainModule = path.basename(mainModule);
	
	toProcess.push(new Module(home, cwd, mainModule));
	processing[toProcess[0].id] = true;
	
	while(toProcess.length > 0) {
		var module = toProcess.shift(),
			src = module.src;

		if(src.indexOf('require') >= 0) {
			var ast = esprima.parse(src);
			
			traverse(ast, function(node) {
				if(!isRequire(node)) return;
				if(node.arguments.length && node.arguments[0].type === 'Literal') {
					var child, name = node.arguments[0].value;
					
					if(dependencies.contains(name)) return;
					
					child = new Module(home, module.dir, name);

					if(!processing[child.id]) {
						processing[child.id] = true;
						toProcess.push(child);
					}
					
					node.arguments[0].value = child.id;
				}
				else
					console.log('Found a call to "require" that does not use a String literal to identify a module');
			});
			
			module.src = escodegen.generate(ast);
		}
		
		modules.push(module);
	}
	
	return modules;
}

module.exports = createProject;