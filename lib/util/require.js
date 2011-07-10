var fs = require('fs');

module.exports = function(path, binding, interval) {
	var _self = this,
		mod = require(path),
		key = binding && Object.keys(binding)[0];
	
	if(binding && key) {
		// ## Bindings
		// a key provides a reference to what should be
		// updated when the file changes
		// ```{'MyModel': hive.models} === hive.models.MyModel```
		
		fs.watchFile(path, { interval: interval || 100 }, function(curr, prev){
			if (curr.mtime > prev.mtime) {
				// remove the cached version of the module
				delete require.cache[require.resolve(path)];
				binding[key] = require(path, _self);
			}
		});
		
	}
	
	return mod;
};