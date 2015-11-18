angular.module('app').controller('imageCtrl', function ($scope, $routeParams) {

    var imageUrl = "https://92afd7d12618bdacf2a48927549dafa95b17ef54.googledrive.com/host/0B9Dq1C8xkwicdnd4VnBhYjBaYjA/image%20(" + $routeParams.imageId + ").jpeg";

    $scope.imageSrc = imageUrl;
});