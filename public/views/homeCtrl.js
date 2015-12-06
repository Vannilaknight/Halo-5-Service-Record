angular.module('app').controller('homeCtrl', function ($scope, $location) {
    $scope.search = function (search) {
        $location.path("/" + search);
    }
});