/**
 * Created by kprasad on 2/27/16.
 */
var app = angular.module('flapperNews', []);

app.controller('MainCtrl', [
    '$scope',
    function($scope){
        $scope.test = 'Hello world!';

        $scope.posts = [
            {title: 'post 1', upvotes: 5},
            {title: 'post 2', upvotes: 2},
            {title: 'post 3', upvotes: 15},
            {title: 'post 4', upvotes: 9},
            {title: 'post 5', upvotes: 4}
        ];


    }]);



//Notes:
//1. You can spin off a simple web server for testing by typing 'python -m SimpleHTTPServer 8888'
//2. then point the browser at localhost:8888