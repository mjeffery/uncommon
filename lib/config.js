var fs = require('fs'),
	path = require('path'),
	_ = require('underscore'),
	Dependencies = require('./dependencies');
	
function configure(pathToConfig) {
	var configPath, config = {};
	
	if(!_.isString(pathToConfig))
		pathToConfig = '.';
	
	//get uncommon configuration file
	configPath = path.resolve(pathToConfig, './uncommon.config.json');
	if(fs.existsSync(configPath)) 
		config = JSON.parse(fs.readFileSync(configPath));
	
	//defaults
	_.defaults(config, {
		name: 'project',
		output: 'project.js',
		main: 'index.js',
		dependencies: {},
		packaging: 'global'
	});
	config.dependencies = new Dependencies(config.dependencies);
	
	//resolve all file paths relative to the specified path
	config.main = path.resolve(pathToConfig, config.main);
	config.output = path.resolve(pathToConfig, config.output);
	config.dependencies.cwd(pathToConfig);
	
	return config;
}

module.exports.create = configure;