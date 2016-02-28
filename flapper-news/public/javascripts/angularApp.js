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
        $stateProvider.state('home', {
            url:'/home',
            templateUrl:'/home.html',
            controller:'MainCtrl',
            resolve: { //the following will make sure this posts is queried before we load anything
                postPromise: ['posts', function(posts){
                    return posts.getAll();
                }]
            }
        });

        //Now route the posts page itself
        $stateProvider.state('posts', {
            url:'/posts/{id}',
            templateUrl:'/posts.html',
            controller:'PostCtrl',
            resolve: {
                post: ['$stateParams', 'posts', function($stateParams, posts) {
                    return posts.get($stateParams.id);
                }]
            }
        });

        //For everything else, route to home, for now
        $urlRouterProvider.otherwise('home');
    }
]);

//define factory/service here for our controller
//mostly to share code and data between different controllers
app.factory('posts', ['$http', function($http){
    var o = { posts: [] };

    //This is for a GET of all posts
    o.getAll = function(){
        return $http.get('/posts').success(function(data){ //This data is from the DB
           angular.copy(data, o.posts);
        });
    }

    //This for a GET on a single post of _id
    o.get = function(id){
        return $http.get('/posts/' + id).then(function(res){ //using a promise here with 'then']
           return res.data;
        });
    }

    //This is for a POST of a new post
    o.create = function(post){
        return $http.post('/posts', post).success(function(data){
            o.posts.push(data);
            //This is for just our front end so it doesn't always go back to the server
        });
    }

    //This is for a PUT for upvoting a post
    //The _id is the actual mongo ID
    o.upvote = function(post){
        $http.put('/posts/' + post._id +'/upvote').success(function(data){
           //and for the front end
            post.upvotes += 1;
        });
    }

    //This is for a POST for adding a comment
    o.addComment = function(id, comment){
      return $http.post('/posts/' + id + '/comments/', comment);
    };

    //This is for a PUT that upvotes a comment
    o.upvoteComment = function(post, comment){
      return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote')
          .success(function(data){ //data back from mongo
              comment.upvotes += 1;
          })
    };


    return o;
}]);

//Now define our controller for home page
//Now inject that factory into our controller
app.controller('MainCtrl', [
    '$scope',
    'posts', //here we give the controller the factory
    function($scope, posts){

        $scope.posts = posts.posts;

        $scope.addPost = function(){
            if($scope.title === '') {return;}

            posts.create( { title: $scope.title, link: $scope.link} );
            $scope.title = "";
            $scope.link = "";
        }

        $scope.incrementUpvotes = function(post){
            posts.upvote(post);
        }
}]);

//define a controller for our posts
app.controller('PostCtrl', [
    '$scope',
    '$stateParams',
    'posts',
    'post',
    function($scope, $stateParams, posts, post){

        $scope.post = post;

        $scope.addComment = function(){
            if($scope.body === '') { return; }
            posts.addComment(post._id, {
                body: $scope.body,
                author: 'user',
            }).success(function(comment) {
                console.log(comment);
                $scope.post.comments.push(comment);
            });
            $scope.body = '';
        };

        $scope.incrementUpvotes = function(comment){
            posts.upvoteComment(post, comment);
        };
    }
]);

//Notes:
//1. You can spin off a simple web server for testing by typing 'python -m SimpleHTTPServer 8888' from the directory
//2. then point the browser at localhost:8888