#!/usr/bin/env node
var fs = require('fs');

var lib = {}, program = require('commander');

lib.config = require('../lib/config');
lib.project = require('../lib/project');
lib.build = require('../lib/build');
lib.preview = require('../lib/preview');

program.version('0.0.1')
	   .option('-p, --port', 'Specify the port for the preview server.  Default: 8888');

program.command('build')
	   .description('build the uncommon project in the specified directory')
	   .action(function(pathToProject) {
	   		var config = lib.config.create(pathToProject),
	   			project = lib.project.create(config.main, config.dependencies),
	   			source = lib.build(config.name, project, config.dependencies);
	   			
	   		fs.writeFileSync(config.output, source);
	   });
	   
program.command('preview')
	   .description('Create a preview server of the uncommon project in the specified directory.  ' +
	   			    'The hosted project will be rebuilt whenever changes occur')
	   .action(function(pathToProject) {
	   		var port = program.port || 8888;
	   	
	   		lib.preview.createServer(pathToProject)
				.on('depend', function(file) { console.log(' + Watching "' + file + '" for changes')})
				.on('modified', function(file) { console.log(' * "' + file + '" has been modified')})
				.on('undepend', function(file) { console.log(' - Removing "' + file + '" from the watch list')})
				.on('startBuild', function() { console.log('Building...')})
				.on('endBuild', function(file) { console.log('Successfully built http://localhost:' + port + '/' + file)})
				.on('error', function(err) { console.error(err) })
				.listen(port);
	   });
	   
program.parse(process.argv);