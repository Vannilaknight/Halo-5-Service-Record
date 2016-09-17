var HaloAPI = require("haloapi");
var weapons = require('./weapons.json');

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

    app.get('/playlist/:playlistId', function (req, res) {
        api.metadata.playlists().then(function (playlists) {
            for (var x = 0; x < playlists.length; x++) {
                if (playlists[x].id == req.params.playlistId) {
                    res.send(playlists[x].name);
                }
            }
        });
    });

    app.get('/weapons', function (req, res) {
        res.send(weapons);
    });

    app.get('*', function (req, res) {
        res.render('index');
    });
};