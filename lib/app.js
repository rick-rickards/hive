var hive = require('./hive'),
	form = require('connect-form'),
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

// if session is enabled, use session support
if(hive.config.session && hive.config.session.enabled) {	
  app.use(express.session({
	secret: hive.config.session.secret,
	key: hive.config.name.replace('-', '.').replace(' ', '.') + '.sid'
  }));
}

// export
module.exports = app;