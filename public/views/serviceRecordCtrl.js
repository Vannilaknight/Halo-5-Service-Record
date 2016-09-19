angular.module('app').controller('serviceRecordCtrl', function ($scope, $rootScope, $http, $routeParams, $location, $q) {
    var weapons;
    var playlists;
    var csrs;
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

    function mapServiceRecord(serviceRecord, image) {
        //console.log(serviceRecord);
        var stats = serviceRecord.ArenaStats;
        var newObject = {
            gamertag: serviceRecord.PlayerId.Gamertag,
            spartanRank: serviceRecord.SpartanRank,
            totalXP: serviceRecord.Xp,
            spartanImage: image,
            totalKills: stats.TotalKills,
            totalDeaths: stats.TotalDeaths,
            totalAssists: stats.TotalAssists,
            totalAssassinations: stats.TotalAssassinations,
            fastestGameWin: haloTimetoDateTime(stats.FastestMatchWin),
            totalWins: stats.TotalGamesWon,
            totalLosses: stats.TotalGamesLost,
            arenaStats: []
        };

        newObject.percentOfAssassinations = (newObject.totalAssassinations / newObject.totalKills).toFixed(2);

        playlists.forEach(function(playlist){
            stats.ArenaPlaylistStats.forEach(function(PlaylistStat){
                if(playlist.id == PlaylistStat.PlaylistId){
                    newObject.arenaStats.push({
                        playlist: PlaylistStat,
                        playlistName: playlist.name
                    })
                }
            });
        });

        weapons.forEach(function (weapon) {
            if (weapon.id == stats.WeaponWithMostKills.WeaponId.StockId) {
                newObject.favoriteWeapon = weapon;
                newObject.favoriteWeapon.kills = stats.WeaponWithMostKills.TotalKills;
                console.log(weapon)
            }
        });

        newObject.arenaStats.forEach(function(arenaStat){
            var playlist = arenaStat.playlist;

            playlist.TotalTimePlayed = haloTimetoDateTime(playlist.TotalTimePlayed);

            csrs.forEach(function(csr){
                if(playlist.Csr) {
                    if (csr.id == playlist.Csr.DesignationId) {
                        csr.tiers.forEach(function (tier) {
                            if (tier.id == playlist.Csr.Tier) {
                                playlist.Csr.image = tier.iconImageUrl;
                            }
                        })
                    }
                } else {
                    if(csr.id == 0){
                        csr.tiers.forEach(function (tier) {
                            if (tier.id == playlist.MeasurementMatchesLeft) {
                                playlist.Csr = {};
                                playlist.Csr.image = tier.iconImageUrl;
                            }
                        })
                    }
                }
            });
        });

        console.log(newObject.arenaStats);
        return newObject
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

        return hour + " Hour, " + minute + " Min, " + Math.floor(second) + " Sec";
    }

    $scope.search = function (gamertag) {
        var getRecord = $http({method: 'GET', url: '/serviceRecord/' + gamertag});
        var getImage = $http({method: 'GET', url: '/profile/' + gamertag});
        var getWeapons = $http({method: 'GET', url: '/weapons'});
        var getPlaylists = $http({method: 'GET', url: '/playlists'});
        var getCsrs = $http({method: 'GET', url: '/csr'});
        $q.all([getRecord, getImage, getWeapons, getPlaylists, getCsrs]).then(function (data) {
            if(data[0].data.Result.PlayerId.Gamertag) {
                weapons = data[2].data;
                playlists = data[3].data;
                csrs = data[4].data;
                $rootScope.serviceRecord = mapServiceRecord(data[0].data.Result, data[1].data)
            } else {
                $location.path('/pnf')
            }
        })
    };

    $scope.search($routeParams.gamertag);
});
