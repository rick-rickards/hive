var hive		= exports = module.exports = {};
var _			= require('underscore');
var fs			= require('fs');

// classes
hive.Model 	    = require('./model');
hive.File	    = require('./file');
hive.Dir	    = require('./dir');
hive.Query	    = require('./query');
hive.Http	    = require('./http')

// config
hive.config = {
	template: 'haml',
	debug: false,
	port: 3000,
	host: 'localhost'
};

// proc identity
hive.isMaster = process.env.CLUSTER_MASTER_PID
 	? (process.env.CLUSTER_MASTER_PID === process.pid)
	: true;

// app
hive.app 		= require('./app');

// util
hive.log 	    = require('./util/console').log;
hive.hash		= require('./util/hash');
hive.require	= require('./util/require');
require('./util/cli');

// global error handling
process.on('uncaughtException', function(err) {
	hive.log('**Uncaught Exception**', err.stack);
	hive.log('**Uncaught Exception**', err.message);
});

function listen(port, host) {
	if(hive.config.clusterize) {
		hive.server = require('./server');
		//hive.server.listen(port, host);
		var cluster = require('cluster');
		cluster(__dirname + '/app').listen(port);
	} else {
		hive.app.listen(port, host);
	}
}

hive.init = function(path) {
	
	hive.path = path;
	
	// load config
	var configFilePath = path + '/config.json';
	var config = new hive.File({path: configFilePath});
	config.bind('success', function() {
		var data = config.get('data');
		if(data) {
			var json = JSON.parse(data, false);
			hive.config = _.extend(hive.config, json);
		}
		init(path);
	});
	config.bind('error', function() {
		cli.clear()
		.write('Could not find or open ' + configFilePath)
	});
	config.fetch();
}

// boot
function init(path) {
	var shouldPrint = !hive.config.clusterize || hive.isMaster;
	hive.Controller = require('./controller');
	hive.sync = require('./sync');
	
	if(shouldPrint) {
		cli.clear();
		cli.color('cyan')
		.write(hiveART)
		.color('white');
		load('views',       path, null, true);
		load('models',      path);
		load('queries',     path);
		load('controllers', path);
		cli
		.write('[')
		.color('green')
		.write('All Hive files loaded!')
		.color('white')
		.write(']\r\n\r\n');
	}
	
	// start up the server
	listen(hive.config.port, hive.config.host);
	
	if(shouldPrint) {
		cli
		.write('[')
		.color('cyan')
		.write('Hive is listening at ')
		.color('green')
		.write('http://' + hive.config.host + ':' + hive.config.port)
		.color('white')
		.write(']\r\n\r\n');
	}
	if('function' === typeof hive.ready) hive.ready();
}

// load all files of type at path
function load(type, path, target, refOnly) {
	target = target || hive;
	target[type] = {};
	var files,
		path = path + '/' + type;
	try {
		files = fs.readdirSync(path);
		files.forEach(function(file) {
			var name = file.replace('.js', '').replace('.haml', ''),
				isDir = name == file;
			try {
				if(isDir) {
					load(file, path, target[type], refOnly);
				} else {
					var binding = {};
					binding[name] = target[type];
					refOnly
						?
						target[type][name] = {}
						:
						target[type][name] = hive.require(path + '/' + file, binding);
					target[type][name]._name = name;
				}
			} catch(e) {
				cli.clear()
				.color('red')
				.write('\r\nError\r\n')
				.color('white')
				.write('An error has occured while loading Hive ')
				.color('cyan')
				.write(type)
				.color('white')
				.write('\r\n')
				.write('Hive could not load ')
				.color('red')
				.write(file)
				.color('white')
				.write(' located at \r\n')
				.color('yellow')
				.write(path + '/' + file)
				.color('red')
				.write('\r\n\r\nReason\r\n')
				.color('white');
				hive.log(e.stack.toString());
				cli
				.confirm('\r\nDo you want to open this file? y/n', function(answer) {
					if(answer) cli.exec('open ' + path + '/' + file);
				});
				throw 'Init failed';
				return false;
			}	
			cli.write('[')
			.color('cyan')
			.write(type)
			.color('white')
			.write(']')
			.fwd(20 - type.length)
			.write('Loaded ')
			.color('green')
			.write(name)
			.color('white')
			.write('!\r\n');
		});
	} catch(e) {
		if(e == 'Init failed') throw 'Init failed'
	}
}



var hiveART = ''
+ ' _   _         \r\n'
+ '| |_|_|_ _ ___ \r\n'
+ '|   | | | | -_|\r\n'
+ '|_|_|_|\\_/|___|\r\n'
+ '\r\n';







