var lib = {},
	util = require('util'),
	fs = require('fs'),
	path = require('path'),
	http = require('http'),
	url = require('url'),
	_ = require('underscore'),
	watchr = require('watchr');

lib.config = require('./config');
lib.project = require('./project');
lib.build = require('./build');

function PreviewServer(pathToProject) {
	http.Server.call(this);
	
	this.pathToProject = pathToProject || '.';
	this.file = { name:  'uncommon.js', content: '' };
	this.watchers = null;
	this.watched_paths = [];
	
	var self = this;
	
	this.on('listening', function() { self.rebuild() });
	
	//server definition
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
		if(self.watchers !== null) {
			_.each(self.watchers, function(watcher) { watcher.close() });
			self.watchers = null;
		}
	});
}

util.inherits(PreviewServer, http.Server);

PreviewServer.prototype.rebuild = function() {
	//load config
	var config = {}, project = [], src = "";
	this.emit('startBuild');
	
	try {
		//build project
		config = lib.config.create(this.pathToProject);
		project = lib.project.create(config.main, config.dependencies);
		src = lib.build(config.name, project, config.dependencies);
		
		this.updateWatchers(project);
		
		this.file.name = path.basename(config.output);
		this.file.content = src;
		
		this.emit('endBuild', this.file.name);
	}
	catch(err) {
		this.emit('failBuild');
		this.emit('error', err);
	}
};

PreviewServer.prototype.updateWatchers = function(project) {
	var toWatch = _.map(project, function(module) { return path.join(module.dir, module.filename) });
	toWatch.push(path.resolve(this.pathToProject, './uncommon.config.json'));

	var removed = _.difference(this.watched_paths, toWatch),
		added   = _.difference(toWatch, this.watched_paths),
		throttledRebuild = _.debounce(this.rebuild.bind(this), 100),
		self = this;
	
	if(added.length > 0 || removed.length > 0) {
		try {
			var still_watching = [];
			if(this.watchers) {
				_.each(this.watchers, function(watcher) {
					if(!_.contains(toWatch, watcher.path)) {
						watcher.close(); 
						self.emit('undepend', path); 
					}
					else
						still_watching.push(watcher);
				});
			}
			
			this.watchers = still_watching.concat(watchr.watch({
				paths: added,
				listener: function(event, filepath) {
					self.emit('modified', filepath);
					throttledRebuild();
				}
			}));
			
			_.each(added, function(path) { self.emit('depend', path) });
			
			Array.prototype.splice.apply(this.watched_paths, [0, this.watched_paths.length].concat(toWatch));
		}
		catch(error) {
			this.emit('error', error);
		}
	}
};

module.exports.Server = PreviewServer;
module.exports.createServer = function(pathToProject) { return new PreviewServer(pathToProject) };
