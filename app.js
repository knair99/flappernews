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

        //Now route the posts page itself
        $stateProvider.state('posts', {url:'/posts/{id}', templateUrl:'/posts.html', controller:'PostCtrl'});

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

//Now define our controller for home page
//Now inject that factory into our controller
app.controller('MainCtrl', [
    '$scope',
    'posts', //here we give the controller the factory
    function($scope, posts){
        $scope.test = 'Hello world!';

        $scope.posts = posts.posts;

        $scope.addPost = function(){
            if($scope.title === '') {return;}

            $scope.posts.push( { title: $scope.title, link: $scope.link, upvotes: 0, comments:[]});
            $scope.title = "";
            $scope.link = "";
        }

        $scope.incrementUpvotes = function(post){
            post.upvotes += 1;
        }
}]);

//define a controller for our posts
app.controller('PostCtrl', [
    '$scope',
    '$stateParams',
    'posts',
    function($scope, $stateParams, posts){

        $scope.addComment = function(){
            if($scope.body === '') {return;}

            //First, get the relevant post
            $scope.post = posts.posts[$stateParams.id];

            //Then add a comments element into a comments array, on the post object
            //A comment looks like this comments = [ {body:sometext, author:text, upvotes:0}]
            $scope.post.comments.push( { body: $scope.body, author: 'user', upvotes: 0} );
            $scope.body = "";
        }
    }
]);

//Notes:
//1. You can spin off a simple web server for testing by typing 'python -m SimpleHTTPServer 8888'
//2. then point the browser at localhost:8888