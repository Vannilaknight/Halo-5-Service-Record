angular.module('app').controller('homeCtrl', function ($scope) {
    $scope.number = 60;
    $scope.getNumber = function(num) {
        return new Array(num);
    }
});