var fs = require('fs'),
	path = require('path');

function Module(home, cwd, file) {
	if(path.extname(file) === '') file += '.js';
	file = path.resolve(cwd, file);
	
	this.id = path.relative(home, file);
	this.dir = path.dirname(file);
	this.filename = path.basename(file);
	this._src;
};

Object.defineProperty(Module.prototype, 'src', {
	get: function() {
		if(!this._src) {
			try {
				var filename = path.join(this.dir, this.filename);
				//console.log('loading module "' + this.id + ' from "' + filename + '"');
				this._src = fs.readFileSync(filename).toString();
			}
			catch(err) {
				throw new Error('Failed to load module "' + this.id + '"', err);
			}
		}
		return this._src;
	},
	set: function(src) { this._src = String(src); }
});

module.exports = Module;