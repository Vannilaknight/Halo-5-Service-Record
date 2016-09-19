angular.module('app').controller('mainCtrl', function ($scope, $location) {
    $scope.searchPlayer = function (gamertag) {
        $location.path("/" + gamertag);
    };
});
