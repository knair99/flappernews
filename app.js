/**
 * Created by kprasad on 2/27/16.
 */

//include any external angular modules in the array
var app = angular.module('flapperNews', ['ui.router']);

//I need to route different URLs, and configure my app with services needed
app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider){
        //For the /home requests, route it to a custom template, and use MainCtrl controller
        $stateProvider.state('home', {url:'/home', templateUrl:'/home.html', controller:'MainCtrl'});
        //For everything else, route to home, for now
        $urlRouterProvider.otherwise('home');
    }
]);

//define factory/service here for our controller
//mostly to share code and data between different controllers
app.factory('posts', function(){
    var o = { posts: [] };
    return o;
});

//Now define our controller
//Now inject that factory into our controller
app.controller('MainCtrl', [
    '$scope',
    'posts', //here we give the controller the factory
    function($scope, posts){
        $scope.test = 'Hello world!';

        $scope.posts = posts.posts;

        $scope.addPost = function(){
            if($scope.title === '') {return;}

            $scope.posts.push( { title: $scope.title, link: $scope.link, upvotes: 0});
            $scope.title = "";
            $scope.link = "";
        }

        $scope.incrementUpvotes = function(post){
            console.log("upvoted");
            post.upvotes += 1;
        }
}]);



//Notes:
//1. You can spin off a simple web server for testing by typing 'python -m SimpleHTTPServer 8888'
//2. then point the browser at localhost:8888