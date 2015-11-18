var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    logger = require('angri');

module.exports = function(app, config) {
    app.set('views', 'server/views');
    app.set('view engine', 'jade');
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(session({
        secret: 'Im wearing ladies underwear',
        name: 'RealTeam6',
        resave: true,
        saveUninitialized: true
    }));
    app.use(express.static(config.rootPath + '/public'));
};