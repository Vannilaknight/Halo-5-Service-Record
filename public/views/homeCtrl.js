angular.module('app').controller('homeCtrl', function ($scope, $http) {

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

    var winLossChart;
    var kdaChart;

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

    var gameRate;
    var kda;

    $scope.getErrorClass = function (hasError) {
        if (hasError) {
            return 'has-error';
        } else {
            return '';
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
        $scope.totalWins = serviceRecord.ArenaStats.TotalGamesWon;
        $scope.totalLosses = serviceRecord.ArenaStats.TotalGamesLost;
        $scope.wl = (($scope.totalWins / ($scope.totalWins + $scope.totalLosses)) * 100).toFixed(2) + "%";
        $scope.totalKills = serviceRecord.ArenaStats.TotalKills;
        $scope.totalAssists = serviceRecord.ArenaStats.TotalAssists;
        $scope.totalDeaths = serviceRecord.ArenaStats.TotalDeaths;
        $scope.kd = ($scope.totalKills / $scope.totalDeaths).toFixed(2);
        getMostUsedWeapon(serviceRecord.ArenaStats.WeaponWithMostKills.WeaponId.StockId);

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
        setArenaPlaylistStats(serviceRecord);
    }

    function setArenaPlaylistStats(serviceRecord) {
        var stats = serviceRecord.ArenaStats.ArenaPlaylistStats;
        $scope.playlistStats = [];
        for (var i = 0; i < stats.length; i++) {
            $scope.playlistStats.push({
                playlistId: stats[i].PlaylistId,
                playlist: "",
                rank: getCSR(stats[i].Csr),
                timePlayed: haloTimetoDateTime(stats[i].TotalTimePlayed)
            });
        }

        for (var k = 0; k < $scope.playlistStats.length; k++) {
            getPlaylist($scope.playlistStats[k].playlistId);
        }

    }

    function randomValue() {
        return (Math.random() * 3);
    }

    function getCSR(CSR) {
        console.log(CSR);
        if (CSR) {
            var CSRID = CSR.DesignationId;
            switch (CSRID) {
                case 1:
                    return 'Bronze';
                case 2:
                    return 'Silver';
                case 3:
                    return 'Gold';
                case 4:
                    return 'Platinum';
                case 5:
                    return 'Diamond';
                case 6:
                    return 'Onyx';
                case 7:
                    return 'Champion';
            }
        } else {
            return "Not Placed";
        }
    }

    function getPlaylist(id) {
        console.log('Getting playlist names: ' + id);
        $http({
            method: 'GET',
            url: '/playlist/' + id
        }).then(function successCallback(res) {
            for (var q = 0; q < $scope.playlistStats.length; q++) {
                if ($scope.playlistStats[q].playlistId == id) {
                    $scope.playlistStats[q].playlist = res.data;
                }
            }
        }, function errorCallback(res) {
            console.error(res);
        });
    }

    function getMostUsedWeapon(id){
        $http({
            method: 'GET',
            url: '/weapon/' + id
        }).then(function successCallback(res) {
            $scope.favoriteWeapon = res.data.name;
            charts(gameRate, kda);
        }, function errorCallback(res) {
            console.error(res);
        });
    }

    function charts(gameRate, kda) {
        $('#kda').remove(); // this is my <canvas> element
        $('#kdaBox').append('<canvas id="kda" height="200" width="200"><canvas>');
        kdaCTX = document.getElementById("kda").getContext("2d");

        $('#winloss').remove(); // this is my <canvas> element
        $('#winlossBox').append('<canvas id="winloss" height="200" width="200"><canvas>');
        winlossCTX = document.getElementById("winloss").getContext("2d");

        winLossChart = new Chart(winlossCTX).Doughnut(gameRate, options);

        kdaChart = new Chart(kdaCTX).Doughnut(kda, options);
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

    function haloTimetoDateTime(haloTimeStamp){
        var myString = haloTimeStamp;
        var myRegexp = /(PT)(\d+H)?(\d+M)?(\d+\.+\d+S)?/g;

        var hour = getMatches(myString, myRegexp, 2);
        var minute = getMatches(myString, myRegexp, 3);
        var second = getMatches(myString, myRegexp, 4);

        console.log(hour);

        if(hour[0]){
            hour = hour[0].split('H')[0];
        } else {
            hour = 0;
        }

        if(minute[0]){
            minute = minute[0].split('M')[0];
        } else {
            minute = 0;
        }

        if(second[0]){
            second = second[0].split('S')[0];
        } else {
            second = 0;
        }

        return hour + " Hours, " + minute + " Minutes, " + Math.floor(second) + " Seconds";
    }
})
;
