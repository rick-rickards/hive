var hive = require('hive'),
	form = require('connect-form'),
	cluster = hive.config.clusterize ? require('cluster') : undefined,
	express = require('express');

// create an app
var app = express.createServer(
	// TODO stream body parsing
	(express.bodyDecoder || express.bodyParser)(),
	(express.cookieDecoder || express.cookieParser)(),
	// forms
	form({ keepExtensions: true })
);

// make the public folder available as a static file folder
app.use((express.staticProvider || express.static)(hive.path + '/public'));

// enable cookie middleware
app.use(express.cookieParser());

// if session is enabled, use session support
if(hive.config.session && hive.config.session.enabled) {	
  app.use(express.session({
    secret: hive.config.session.secret,
		key: hive.config.name.replace('-', '.').replace(' ', '.') + '.sid'
  }));
}

// wrap in cluster
if(cluster) {
	(app = cluster(app))
	  .use(cluster.logger('logs'))
	  .use(cluster.stats())
	  .use(cluster.pidfiles('pids'))
	  .use(cluster.cli())
	  .use(cluster.repl(8888))
	  .listen(3000);
}

// export
exports = app;