var _ = require('underscore');

var Dependencies = function(deps) {
	this._deps = {};

	if(deps instanceof Dependencies)
		this._deps = deps._deps;
	//dependency on a single module (assumes symbol is the same as module id)
	else if(_.isString(deps)) {
		this._deps[deps] = deps;
	}
	//deps defined as an array of module names (assumes symbol is the same as module id)
	else if(_.isArray(deps)) {
		_.each(deps, function(dep) {
			this._deps[dep] = dep;
		});
	}
	//deps are defined as a key/value hash between module id and symbol in the global scope
	else if(_.isObject(deps)) {
		var key, value;
		for(key in deps) {
			value = deps[key];
			if(!deps.hasOwnProperty(key)) continue;
			this._deps[key] = value;
		}
	}
}

Dependencies.prototype.count = function() { return _.size(this._deps) };
Dependencies.prototype.names = function() { return _.keys(this._deps) };
Dependencies.prototype.each = function(iterator) { _.each(this._deps, iterator) };
Dependencies.prototype.contains = function(id) { return this._deps.hasOwnProperty(id) };

module.exports = Dependencies;