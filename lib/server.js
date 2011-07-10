var hive = require('./hive'),
	server,
	repl = hive.config.clusterize && hive.config.clusterize.repl,
	cluster = hive.config.clusterize ? require('cluster') : undefined;

if(cluster) {
	server = cluster(__dirname + '/app'); //require.resolve(__dirname + '/app')
	if(repl) {
		server
			.use(cluster.stats())
			.use(cluster.repl(repl));
	}
}

if(server) {
	module.exports = server;
} else {
	throw new Error('Could not clusterize hive. Failed to create server.');
}
