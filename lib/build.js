var fs = require('fs'),
	path = require('path'),
	_ = require('underscore');

var build = function(symbol, modules, dependencies) {	
	var src = fs.readFileSync(path.join(__dirname, 'preamble.txt')).toString(), //TODO change this based on packaging type?
		i, len, module;
	
	//build a list of provided dependencies attached to the root
	dependencies.each(function(symbol, id) {
		//TODO change this based on packaging type 
		src += "\tuncommon.define('"+ id + "', function(require, module) { module.exports = root." + symbol + "; });\n"; 
	});
	if(dependencies.count() > 0) src += '\n';
	
	//assemble modules string
	for(i = 0, len = modules.length; i < len; i++) {
		module = modules[i];
		src += "\tuncommon.define('" + module.id + "', function(require, module) {\n\t\t" + module.src.replace(/\n/g, '\n\t\t') + "\n\t});\n\n";
	}
	
	//TODO change this based on packaging type?
	//export the main module onto the root
	module = _.first(modules);
	src += "\troot." + symbol + " = uncommon('" + module.id + "');\n})(this);";
	
	return src;
}

module.exports = build;