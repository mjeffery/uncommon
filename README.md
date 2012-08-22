# uncommon

Develop modular javascript for the browser without extra frameworks, package managers, or loaders
	
[![Build Status](https://secure.travis-ci.org/mjeffery/uncommon.png)](http://travis-ci.org/mjeffery/uncommon)

## Installation

	$ npm install uncommon
	
Don't have [node.js](http://nodejs.org/) or [npm](https://npmjs.org/) installed? Take a moment to learn about server-side javascript.

## Example

Format your javascript project so it has a main [CommonJS](http://www.commonjs.org/) module:

```javascript
// use relative paths to load other modules in your project
var foo = require('./foo');
var bar = require('../lib/bar');

// or reference an external dependency by name
var $ = require('jquery');

// export the external interface as a module
module.exports = {
	process: function(data) {
		return bar.process(data);
	}
};
module.exports.fnx = foo.fnx;
```

Now create a `uncommon.config.json` file at the root of your project to describe how it should be packaged:

```json
{
	"name": "global_symbol",
	"main": "./path/to/main_module.js",
	"output": "./path/to/output_script.js",
	"dependencies": {
		"module_name": "global_symbol", 
		"underscore": "_",
		"jquery": "$"
	}
}
```

Bundle the project into a single script using the `uncommon build` command:

```
$ uncommon build path/to/project 
```

Or host it on a local server that will rebuild the script as you make changes:

```
$ uncommon preview path/to/project --port 8888
```

`uncommon` will recursively find and package all of your project's required modules and create shims for any external dependencies. Your project is wrapped inside of a self-executing function along with a lightweight runtime (about 30 lines) for building and exporting your public interface.  Your new package can be included like another script by adding `<script src="output_script.js"></script>` to your html file.

## The details

 Modern javascript libraries like [Backbone](http://backbonejs.org/) and [ember.js](http://emberjs.com/) often require lower-level libraries that are very common, heavyweight, or use shared-state configuration.  For example: [underscore](http://underscorejs.org/) or [JQuery](http://jquery.com/). The developers want to provide a single, prebuilt script but won't, can't, or shouldn't include the necessary libraries. `uncommon` is an alternative to the complicated and/or project specific tools used for packaging these scripts without their runtime dependencies. 
 
 With `uncommon` you can write and organize your library or application as simple CommonJS modules and then compile them into a single script.  `uncommon `can import dependencies from the global scope and expose them as modules; allowing your code to depend on shared libraries or legacy scripts that may already be loaded on the page. 'uncommon' can also export your module as a global symbol so legacy or inline scripts can use it without any loaders or modification.  Projects configured for use with 'uncommon' are compatible with other CommonJS runtimes and package managers (such as npm).  

### Compatibility with node.js

`uncommon` requires your project to be defined using the [CommonJS module 1.0 specification](http://wiki.commonjs.org/wiki/Modules/1.0).  As long as your code does not use any browser-only features or scripts it will be compatible with node.js as is, without any modification or build steps.  External dependencies will be loaded in as node modules instead of being bootstraped by the uncommon runtime.  

For packaging existing node modules for the browser, I recommend using [browserify](https://github.com/substack/node-browserify) instead of `uncommon`.  `browserify` has support for node specific features that `uncommon` does not.

### Compatibility with ender

[ender](http://ender.no.de/) is a full-featured package management and build tool for CommonJS projects.  If you are developing a front-end javascript application I strongly recommend using `ender` instead of `uncommon` for building your project.  For libraries and packages that are not meant to stand-alone, `uncommon` can be used within packages or alongside `ender` for building a drop-in ready script that is independent from npm. 

## Usage

`under construction`