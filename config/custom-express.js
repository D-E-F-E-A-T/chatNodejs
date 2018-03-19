var express = require('express');
var load = require('express-load');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var session = require('express-session');

module.exports = function(){
	var app = express();

	app.use(express.static('./app/public'));
	app.set('view engine', 'ejs');
	app.set('views', './app/views');

	app.use(session({
		secret: 's3Cur3',
		name: 'sessionId',
		resave: false,
		saveUninitialized: true
	}));

	app.use(bodyParser.urlencoded({extended: true}))
	app.use(bodyParser.json());
	app.use(expressValidator());

	load('routes', {cwd: 'app'})
	.then('infra')
	.then('services')
	.into(app);

	app.use(function(req, resp, next){
		resp.status(400).render('erros/404');
		next();
	});

	app.use(function(error, req, resp, next){
		if(process.env.NODE_ENV == 'production'){
			resp.status(500).render('erros/500');
			return;
		}

		next(error);
	});


	return app;
}