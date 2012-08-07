var fs = require('fs'),
	path = require('path'),
	_ = require('underscore'),
	build = require('./lib/build'),
	createProject = require('./lib/project'),
	Dependencies = require('./lib/Dependencies'),
	defaults = require('./lib/default.config');

var PACKAGING = ['global', 'amd'];

//read the command line arguments
var opts = require('optimist')
	.usage('')
	.options({
		'o' : {
			alias: 'output',
			describe: 'the filename of the compiled script\n' +
					  'default: ./uncommon.js'
		},
		'p':{
			alias: 'packaging',
			describe: '' +
					  '\ndefault: global'
		},
		'main': {
			describe: 'path to the main javascript file.  Only CommonJS modules reachable ' +
					  'from this file will be packaged into the compiled script' +
					  '\ndefault: index.js'
		},
		'name': {
			describe: ''
		},
		'no-conflict': {
			describe: ''
		}
	}),
	argv = opts.argv;

//load the local configuration file if one exists
var config = {};
if(fs.existsSync('./uncommon.config.json')) {
	try {
		config = JSON.parse(fs.readFileSync('./uncommon.config.json'));
	}
	catch(err) {
		//TODO make this error reporting not include a stacktrace
		throw new Error('Unabled to load "' + path.resolve('./uncommon.config.json') + '"', err);
	}
}

//load properties
var cmd 		 = argv._[0] 	  || 'build',
	output       = argv.output    || config.output    || defaults.output,
	main         = argv.main 	  || config.main      || defaults.main,
	name 		 = argv.name	  || config.name	  || defaults.name,
	dependencies = new Dependencies(config.dependencies || defaults.dependencies);
	
//process commands
if(cmd === 'build') {
	var modules = createProject(main, dependencies);
	fs.writeFileSync(output, build(name, modules, dependencies));
}
else if(cmd === 'preview') {
	
}
else {
	console.error('Unkown command "' + cmd + '"');
	opts.showHelp();
}
