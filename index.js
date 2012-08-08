var fs = require('fs'),
	path = require('path'),
	_ = require('underscore'),
	build = require('./lib/build'),
	project = require('./lib/project'),
	preview = require('./lib/preview'),
	Dependencies = require('./lib/Dependencies'),
	defaults = require('./lib/default.config');

var PACKAGING = ['global', 'amd'];

//read the command line arguments
var opts = require('optimist')
	.usage('\nUsage: $0 build|preview')
	.options({
		'o' : {
			alias: 'output',
			describe: 'the filename of the compiled script\n' +
					  'default: ./uncommon.js'
		},
		'p':{
			alias: 'port',
			describe: '',
			'default': 8888 //TODO maybe use newline at the end of describe to keep consistent with other options
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
			boolean: true,
			describe: ''
		},
		'global': {
			boolean: true,
			describe: ''
		},
		'amd': {
			boolean: true,
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
	dependencies = new Dependencies(config.dependencies || defaults.dependencies),
	port 		 = argv.port;
	
//process commands
if(cmd === 'build') {
	var modules = project.create(main, dependencies);
	fs.writeFileSync(output, build(name, modules, dependencies));
}
else if(cmd === 'preview') {
	preview.createServer()
		.on('depend', function(file) { console.log(' + Watching "' + file + '" for changes')})
		.on('modified', function(file) { console.log(' * The file "' + file + '" has been modified')})
		.on('undepend', function(file) { console.log(' - Removing "' + file + '" from the watch list')})
		.on('startBuild', function() { console.log('Building...')})
		.on('endBuild', function(file) { console.log('Successfully built "' + file + '"')})
		.on('error', function(err) { console.error(err) })
		.listen(port);
}
else {
	console.error('Unkown command "' + cmd + '"');
	opts.showHelp();
}
