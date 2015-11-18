module.exports = function (app) {

    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    app.get('/partials/*', function (req, res) {
        res.render('../../public/' + req.params[0]);
    });



    app.get('*', function (req, res) {
        res.render('index');
    });
};