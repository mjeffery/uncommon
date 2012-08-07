var fs = require('fs'),
	path = require('path'),
	http = require('http'),
	url = require('url'),
	_ = require('underscore'),
	createProject = require('./project'),
	build = require('./build'),
	defaults = require('./default.config');

var PreviewServer = function() {
	this.watchers = {};
	this.src = "";
	
	http.createServer(function(request, response) {
		var uri = url.parse(request.url).pathname;
		
	})
	.on('close', function() {
		_.each(this.watchers, function(filename, watcher) { 
			watcher.close(); 
		});
	})
	.listen(8080);
}

PreviewServer.prototype.rebuild = _.throttle(_.bind(PreviewServer.prototype, function() {
	
	
}), 100);

PreviewServer.prototype.updateWatchers = function(project) {
	
}

function updateWatchers(project) {
	var modules = _.map(project, function(module) { return path.join(module.dir + module.filename) }),
		watchedModules = _.keys(watchers),
		toAdd = _.difference(modules, watchedModules),
		toRemove = _.difference(watchedModules, modules);
	
	_.each(toRemove, function(module) {
		var watcher = this.watchers[module] 		
	});
	
	_.each(toAdd, function(module) { 
		this.watchers[module] = fs.watch(module, function(curr, prev) {
			if(curr.mtime > prev.mtime)
				rebuild();
		});
	});
}

var preview = function(project) {
	var watchers = updateWatchers(project, {}), src;
	
	
}
