var util = require('util'),
	fs = require('fs'),
	path = require('path'),
	http = require('http'),
	url = require('url'),
	_ = require('underscore'),
	projectlib = require('./project'), //TODO make this project.create()
	build = require('./build'),
	Dependencies = require('./Dependencies'),
	defaults = require('./default.config');

function PreviewServer() {
	http.Server.call(this);
	
	this.file = {
		name:  'uncommon.js',
		content: ''
	}
	
	this.watchers = {};
	
	var self = this;
	
	this.on('listening', function() { self.rebuild() });
	
	//
	this.on('request', function(request, response) {
		//the server was accessed using the current output name (minus any path information)
		var filename = path.basename(url.parse(request.url).pathname);	
		if(this.file.name === filename && request.method === 'GET') {
			response.writeHead(200, {
				"Content-Type": "text/javascript",
				"Pragma": "no-cache",
				"Cache-Control": "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0",
				"Expires": 0
			});
			response.write(this.file.content);
			response.end();
		}
		//favicon.ico
		else if('favicon.ico' ===  filename) {
			response.writeHead(200, { "Content-Type": "image/x-icon" });
			//TODO include a real favicon in ./lib ?
			response.end();
		}
		//any other request results in a 404
		else {
			response.writeHead(404, {
				"Content-Type": "text/plain"
			});
			response.write("404 Not Found\n");
			response.end();
		}
	});
	
	//close all active file watchers
	this.on('close', function() {
		_.each(self.watchers, function(filename, watcher) { 
			watcher.close(); 
		});
	});
}

util.inherits(PreviewServer, http.Server);

PreviewServer.prototype.rebuild = function() {
	//load config
	var config = {}, project = [], src = "";
	
	this.emit('startBuild');
	
	try {
		//read config
		if(fs.existsSync('./uncommon.config.json')) 
			config = JSON.parse(fs.readFileSync('./uncommon.config.json'));

		_.defaults(config, defaults);
		config.dependencies = new Dependencies(config.dependencies);
	
		//build project
		project = projectlib.create(config.main, config.dependencies);
		src = build(config.name, project, config.dependencies);
		
		this.updateWatchers(project);
		
		this.file.name = path.basename(config.output);
		this.file.content = src;
		
		this.emit('endBuild', this.file.name);
	}
	catch(err) {
		this.emit('failBuild');
		this.emit('error', err);
		return;
	}
};

PreviewServer.prototype.updateWatchers = function(project) {
	var modules = _.map(project, function(module) { return path.join(module.dir, module.filename) });
	
	if(fs.existsSync('./uncommon.config.json'))
		modules.push(path.resolve('./uncommon.config.json'));
	else {} //TODO set it up to periodically poll for the addition of configuration file
	
	var watchedModules = _.keys(this.watchers),
		toAdd = _.difference(modules, watchedModules),
		toRemove = _.difference(watchedModules, modules),
		self = this;
	
	function removeWatch(module) {
		var watcher = self.watchers[module];
		delete self.watchers[module];
		self.emit('undepend', module);
		watcher.close();	
	}
	_.each(toRemove, removeWatch);
	
	var throttledRebuild = _.debounce(self.rebuild.bind(self), 100);
	_.each(toAdd, function(module) { 
		try {
			self.watchers[module] = fs.watch(module, function(event, filename) {
				if('change' == event) {
					self.emit('modified', filename);
					throttledRebuild();
				}
				else if('rename' == event) {
					self.emit('modified', filename);
					removeWatch(module);
					throttledRebuild();
				}
			});
			self.emit('depend', module);
		}
		catch(err) {
			self.emit('error', err);
		}
		
	});
};

module.exports.Server = PreviewServer;
module.exports.createServer = function() { return new PreviewServer() };
