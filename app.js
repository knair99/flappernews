/**
 * Created by kprasad on 2/27/16.
 */
var app = angular.module('flapperNews', []);

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
    'posts', //here
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