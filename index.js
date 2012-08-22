module.exports = {
	config: require('./lib/config'),
	project: require('./lib/project'),
	preview: require('./lib/preview'),
};

module.exports.project.Module = require('./lib/Module');
module.exports.project.Dependenies = require('./lib/Dependencies');
module.exports.project.build = require('./lib/build');