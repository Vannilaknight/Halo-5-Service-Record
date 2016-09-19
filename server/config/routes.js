var HaloAPI = require("haloapi");
var weapons = require('./weapons.json');
var playlists = require('./playlists.json');
var csr = require('./csr.json');

module.exports = function (app, config) {

    var api = new HaloAPI({
        apiKey: 'fa7882da90374c968afb65cfd645377a'
    });

    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    app.get('/partials/*', function (req, res) {
        res.render('../../public/' + req.params[0]);
    });

    app.get('/serviceRecord/:gamerTag', function (req, res) {
        api.stats.serviceRecordArena(req.params.gamerTag)
            .then(function (data) {
                res.send(data);
            }).catch(function (error) {
                res.send(error);
            });

    });

    app.get('/profile/:gamerTag', function (req, res) {
        api.profile.spartanImage(req.params.gamerTag).then(function (data) {
            res.send(data);
        }).catch(function (error) {
            res.send(error)
        });
    });

    app.get('/csr', function(req, res) {
        res.send(csr);
    });

    app.get('/playlists', function (req, res) {
        res.send(playlists);
    });

    app.get('/weapons', function (req, res) {
        res.send(weapons);
    });

    app.get('*', function (req, res) {
        res.render('index');
    });
};
