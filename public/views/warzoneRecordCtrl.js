angular.module('app').controller('warzoneRecordCtrl', function ($scope, $http, $routeParams, $location) {

    Chart.types.Doughnut.extend({
        name: "DoughnutWL",
        draw: function () {
            Chart.types.Doughnut.prototype.draw.apply(this, arguments);
            this.chart.ctx.font = '14pt Helvetica';
            this.chart.ctx.fillStyle = chroma.scale(['green', 'red'])((this.segments[0].value / (this.segments[0].value + this.segments[1].value))).hex();
            this.chart.ctx.fillText(((this.segments[0].value / (this.segments[0].value + this.segments[1].value)) * 100).toFixed(2) + "%", 100 - 30, 100, 200);
        }
    });

    Chart.types.Doughnut.extend({
        name: "DoughnutKD",
        draw: function () {
            Chart.types.Doughnut.prototype.draw.apply(this, arguments);
            this.chart.ctx.font = '14pt Helvetica';
            this.chart.ctx.fillStyle = chroma.scale(['red', 'green'])(this.segments[0].value / this.segments[2].value).hex();
            this.chart.ctx.fillText((this.segments[0].value / this.segments[2].value).toFixed(2), 100 - 20, 100, 200);
        }
    });

    var winlossCTX = document.getElementById("winloss").getContext("2d");
    var kdaCTX = document.getElementById("kda").getContext("2d");
    var killsCTX = document.getElementById("kills").getContext("2d");

    var winLossChart;
    var kdaChart;
    var killsChart;

    var options = {
        segmentShowStroke: true,
        segmentStrokeColor: "#000",
        segmentStrokeWidth: 2,
        percentageInnerCutout: 50, // This is 0 for Pie charts
        animationSteps: 100,
        animationEasing: "easeOutBounce",
        animateRotate: true,
        animateScale: false
    };

    var allTimes = [];

    $scope.hasResult = false;
    $scope.hasError = false;
    $scope.gamertag = '';
    $scope.rank = 0;
    $scope.XP = 0;
    $scope.spartanImage = '';
    $scope.swatCSR = '';
    $scope.playlistStats = [];
    $scope.totalWins = 0;
    $scope.totalLosses = 0;
    $scope.wl = "0%";
    $scope.totalKills = 0;
    $scope.totalAssists = 0;
    $scope.totalDeaths = 0;
    $scope.kd = 0.0;
    $scope.favoriteWeapon = '';
    $scope.totalPlaytime = '';

    var gameRate;
    var kda;
    var kills;

    $scope.getSearchClass = function () {
        if ($scope.hasError) {
            return 'has-error';
        } else {
            if ($scope.hasResult) {
                return 'shrink-search';
            } else {
                return '';
            }
        }
    };

    $scope.search = function (gamertag) {
        $http({
            method: 'GET',
            url: '/serviceRecord/' + gamertag
        }).then(function successCallback(res) {
            var serviceRecord = res.data;
            if (serviceRecord.ResultCode > 0) {
                $scope.hasError = true;
                $scope.hasResult = false;
            } else {
                $scope.hasError = false;
                $scope.hasResult = true;
                assignVars(serviceRecord.Result);
            }
        }, function errorCallback(res) {
            console.error(res);
        });
    };

    function assignVars(serviceRecord) {
        console.log(serviceRecord);
        $http({
            method: 'GET',
            url: '/profile/' + serviceRecord.PlayerId.Gamertag
        }).then(function successCallback(res) {
            $scope.spartanImage = res.data;
        }, function errorCallback(res) {
            console.error(res);
        });
        $scope.gamertag = serviceRecord.PlayerId.Gamertag;
        $scope.rank = serviceRecord.SpartanRank;
        $scope.XP = serviceRecord.Xp;
        $scope.totalWins = serviceRecord.WarzoneStat.TotalGamesWon;
        $scope.totalLosses = serviceRecord.WarzoneStat.TotalGamesLost;
        $scope.wl = (($scope.totalWins / ($scope.totalWins + $scope.totalLosses)) * 100).toFixed(2) + "%";
        $scope.totalKills = serviceRecord.WarzoneStat.TotalKills;
        $scope.totalAssists = serviceRecord.WarzoneStat.TotalAssists;
        $scope.totalDeaths = serviceRecord.WarzoneStat.TotalDeaths;
        $scope.kd = ($scope.totalKills / $scope.totalDeaths).toFixed(2);
        $scope.assasinations = serviceRecord.WarzoneStat.TotalAssassinations;
        $scope.grenadeKills = serviceRecord.WarzoneStat.TotalGrenadeKills;
        ;
        $scope.groundPoundKills = serviceRecord.WarzoneStat.TotalGroundPoundKills;
        ;
        $scope.spartanKills = serviceRecord.WarzoneStat.TotalSpartanKills;
        $scope.meleeKills = serviceRecord.WarzoneStat.TotalMeleeKills;
        getMostUsedWeapon(serviceRecord.WarzoneStat.WeaponWithMostKills.WeaponId.StockId);

        document.getElementById('wlPercent').style.color = chroma.scale(['green', 'red'])(($scope.totalWins / ($scope.totalWins + $scope.totalLosses))).hex();
        document.getElementById('kdPercent').style.color = chroma.scale(['red', 'green'])($scope.totalKills / $scope.totalDeaths).hex();

        gameRate = [
            {
                value: $scope.totalWins,
                color: "#41BF78",
                highlight: "#45CC80",
                label: "Wins"
            },
            {
                value: $scope.totalLosses,
                color: "#F7464A",
                highlight: "#FF5A5E",
                label: "Losses"
            }
        ];

        kda = [
            {
                value: $scope.totalKills,
                color: "#41BF78",
                highlight: "#45CC80",
                label: "Kills"
            },
            {
                value: $scope.totalAssists,
                color: "#F7C163",
                highlight: "#FFC867",
                label: "Assists"
            },
            {
                value: $scope.totalDeaths,
                color: "#F7464A",
                highlight: "#FF5A5E",
                label: "Deaths"
            }
        ];

        kills = [
            {
                value: $scope.spartanKills,
                color: "#41BF78",
                highlight: "#45CC80",
                label: "Spartan Kills"
            },
            {
                value: $scope.grenadeKills,
                color: "#F7C163",
                highlight: "#FFC867",
                label: "Grenade Kills"
            },
            {
                value: $scope.groundPoundKills,
                color: "#41BFBC",
                highlight: "#4EE5E2",
                label: "Ground Pound Kills"
            },
            {
                value: $scope.assasinations,
                color: "#F7464A",
                highlight: "#FF5A5E",
                label: "Assassinations"
            },
            {
                value: $scope.meleeKills,
                color: "#A788AD",
                highlight: "#DAB1E2",
                label: "Melee Kills"
            }
        ];
    }

    var playlistCount = 0;

    function randomValue() {
        return (Math.random() * 3);
    }

    function getMostUsedWeapon(id) {
        $http({
            method: 'GET',
            url: '/weapon/' + id
        }).then(function successCallback(res) {
            $scope.favoriteWeapon = res.data.name;
            charts(gameRate, kda, kills);
        }, function errorCallback(res) {
            console.error(res);
        });
    }

    function charts(gameRate, kda, kills) {
        $('#kda').remove(); // this is my <canvas> element
        $('#kdaBox').append('<canvas id="kda" height="200" width="200"><canvas>');
        kdaCTX = document.getElementById("kda").getContext("2d");

        $('#winloss').remove(); // this is my <canvas> element
        $('#winlossBox').append('<canvas id="winloss" height="200" width="200"><canvas>');
        winlossCTX = document.getElementById("winloss").getContext("2d");

        $('#kills').remove(); // this is my <canvas> element
        $('#killsBox').append('<canvas id="kills" height="200" width="200"><canvas>');
        killsCTX = document.getElementById("kills").getContext("2d");

        winLossChart = new Chart(winlossCTX).Doughnut(gameRate, options);

        kdaChart = new Chart(kdaCTX).Doughnut(kda, options);

        killsChart = new Chart(killsCTX).Doughnut(kills, options);
    }

    function getMatches(string, regex, index) {
        index || (index = 1); // default to the first capturing group
        var matches = [];
        var match;
        while (match = regex.exec(string)) {
            matches.push(match[index]);
        }
        return matches;
    }

    function haloTimetoDateTime(haloTimeStamp) {
        var myString = haloTimeStamp;
        var myRegexp = /(PT)(\d+H)?(\d+M)?(\d+\.+\d+S)?/g;

        var hour = getMatches(myString, myRegexp, 2);
        var minute = getMatches(myString, myRegexp, 3);
        var second = getMatches(myString, myRegexp, 4);

        console.log(hour);

        if (hour[0]) {
            hour = hour[0].split('H')[0];
        } else {
            hour = 0;
        }

        if (minute[0]) {
            minute = minute[0].split('M')[0];
        } else {
            minute = 0;
        }

        if (second[0]) {
            second = second[0].split('S')[0];
        } else {
            second = 0;
        }

        allTimes.push(hour + '.' + minute + '.' + second + 'hrs');

        return hour + " Hours, " + minute + " Minutes, " + Math.floor(second) + " Seconds";
    }

    var iterated = 0;

    function addtime(start_time, end_time) {
        var total = '';

        var startArr = start_time.replace('hrs', '', start_time).split('.');
        var endArr = end_time.replace('hrs', '', end_time).split('.');

        var d = new Date();
        startArr[0] = (startArr[0]) ? parseInt(startArr[0], 10) : 0;
        startArr[1] = (startArr[1]) ? parseInt(startArr[1], 10) : 0;
        startArr[2] = (startArr[2]) ? parseInt(startArr[2], 10) : 0;
        endArr[0] = (endArr[0]) ? parseInt(endArr[0], 10) : 0;
        endArr[1] = (endArr[1]) ? parseInt(endArr[1], 10) : 0;
        endArr[2] = (endArr[2]) ? parseInt(endArr[2], 10) : 0;

        d.setHours(startArr[0] + endArr[0]);
        d.setMinutes(startArr[1] + endArr[1]);
        d.setSeconds(startArr[2] + endArr[2]);

        var hours = d.getHours();
        var minutes = d.getMinutes();
        var seconds = d.getSeconds();

        total = hours + '.' + minutes + '.' + seconds + 'hrs';

        iterated++;

        if (iterated != allTimes.length) {
            return addtime(total, allTimes[iterated]);
        } else {
            return hours + 'h ' + minutes + 'm ' + seconds + 's';
        }

    }

    $scope.searchPlayer = function (gamertag) {
        $location.path("/" + gamertag);
    };

    $scope.search($routeParams.gamertag);
});