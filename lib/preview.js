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
	this.configWatcher = undefined;
	this.src = "";
	
	//watch the configuration file
	if(fs.existsSync('./uncommon.config.json')) {
		var self = this;
		this.configWatcher = fs.watch('./uncommon.config.json', function(curr, prev) {
			if(curr.mtime > prev.mtime)
				self.rebuild();
		});
	}
	//TODO add interval polling to detect the addition of a configuration file if one does not exist
	
	//preview server
	http.createServer(function(request, response) {
		var uri = url.parse(request.url).pathname;
		
	})
	//stop watching files when the server closes
	.on('close', function() {
		_.each(this.watchers, function(filename, watcher) { 
			watcher.close(); 
		});
		if(this.configWatcher)
			this.configWatcher.close();
	})
	.listen(8888);
}

PreviewServer.prototype.rebuild = _.throttle(_.bind(PreviewServer.prototype, function() {
	//TODO load configuration
	//TODO create project
	//TODO rebuild project (swap out source if build is successful)
	//TODO update watchers
}), 100);

PreviewServer.prototype.updateWatchers = function(project) {
	var modules = _.map(project, function(module) { return path.join(module.dir + module.filename) }),
		watchedModules = _.keys(watchers),
		toAdd = _.difference(modules, watchedModules),
		toRemove = _.difference(watchedModules, modules);
	
	//remove files that no longer need to be watched
	_.each(toRemove, function(module) {
		var watcher = this.watchers[module];
		delete this.watchers[module];
		watcher.close(); 		
	});
	
	//add files that are not being watched
	_.each(toAdd, function(module) { 
		this.watchers[module] = fs.watch(module, function(curr, prev) {
			if(curr.mtime > prev.mtime)
				rebuild();
		});
	});
}

module.exports.Server = PreviewServer;