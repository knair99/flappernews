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

        //Now add a couple more states to our state machine
        //For logins
        $stateProvider.state('login',
            {url: '/login',
            templateUrl: '/login.html',
            controller: 'AuthCtrl',
            //we need onEnter promise because we might transition states to home
            onEnter:[ '$state', 'auth', function($state, auth){
                if(auth.isLoggedIn()){
                    $state.go('home');
                } //change states if logged in - go home
            }]
        });

        //And same thing for register
        $stateProvider.state('register',
            {url: '/register',
                templateUrl: '/register.html',
                controller: 'AuthCtrl',
                //we need onEnter because we might transition states to home
                onEnter:[ '$state', 'auth', function($state, auth){
                    if(auth.isLoggedIn()){
                        $state.go('home');
                    } //change states if logged in - go home
                }]
            });

        //For everything else, route to home, for now
        $urlRouterProvider.otherwise('home');
    }
]);


//Now define our angular authentication mechanism that will interact
//with the server for registering and logging in. Also find out if the session
//is still alive
app.factory('auth', ['$http', '$window', function($http, $window){
    var auth = {};

    //Now we can get and save tokens from the local storage on the client
    auth.saveToken = function (token){
        $window.localStorage['flapper-news-token'] = token;
    };

    auth.getToken = function (){
        return $window.localStorage['flapper-news-token'];
    }

    //Now we can find out if the client is logged in or not
    auth.isLoggedIn = function(){
        var token = auth.getToken();

        if(token){
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.exp > Date.now() / 1000; //check if session has expired
        } else {
            return false;
        }
    };

    //now we can provide basic login, register and logout functionality
    //by interacting with our server
    auth.currentUser = function(){
        if(auth.isLoggedIn()){
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.username;
        }
    };

    //Register by http post to our routes
    auth.register = function(user){ //we haven't defined this user yet, which we will after writing out our HTML later
        return $http.post('/register', user).success(function(data){
            auth.saveToken(data.token);
        });
    };

    //Same thing for login and logout
    auth.logIn = function(user){
        return $http.post('/login', user).success(function(data){
            auth.saveToken(data.token);
        });
    };

    auth.logOut = function(){
        $window.localStorage.removeItem('flapper-news-token'); //clear out the token from local storage
    };

    return auth;
}]);


//define factory/service here for our controller
//mostly to share code and data between different controllers
app.factory('posts', ['$http', 'auth', function($http, auth){
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
        return $http.post('/posts', post, {
            headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
            o.posts.push(data);
            //This is for just our front end so it doesn't always go back to the server
        });
    }

    //This is for a PUT for upvoting a post
    //The _id is the actual mongo ID
    o.upvote = function(post){
        $http.put('/posts/' + post._id +'/upvote', null, {
            headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
           //and for the front end
            post.upvotes += 1;
        });
    }

    //This is for a POST for adding a comment
    o.addComment = function(id, comment){
      return $http.post('/posts/' + id + '/comments/', comment, {
          headers: {Authorization: 'Bearer '+auth.getToken()}
      });
    };

    //This is for a PUT that upvotes a comment
    o.upvoteComment = function(post, comment){
      return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote', null, {
          headers: {Authorization: 'Bearer '+auth.getToken()}
      }).success(function(data){ //data back from mongo
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

//Add an authorization controller
//As always, pass along the auth factory
app.controller('AuthCtrl', [
    '$scope',
    '$state',
    'auth',
    function($scope, $state, auth){
        $scope.user = {};

        //Make sure the factory methods are called for all actions
        $scope.register = function(){
            auth.register($scope.user).error(function(error){
                $scope.error = error;
            }).then(function(){
                $state.go('home');
            });
        };

        $scope.logIn = function(){
            auth.logIn($scope.user).error(function(error){
                $scope.error = error;
            }).then(function(){
                $state.go('home');
            });
        };
}]);


//Add controller for navigation
//As always, pass along the auth factory
app.controller('NavCtrl', [
    '$scope',
    'auth',
    function($scope, auth){
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;
        $scope.logOut = auth.logOut;
}]);


//Notes:
//1. You can spin off a simple web server for testing by typing 'python -m SimpleHTTPServer 8888' from the directory
//2. then point the browser at localhost:8888