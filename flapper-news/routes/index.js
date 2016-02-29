var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload' });


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');


//Here we define different REST actions, so the user can interact with server, via the front end
//Map each user actions with the db, to its approp http verb

//0. a. Generic param function for post by ID
//This param function will be executed first before any other routes above
//Therefore, this is good pre-processing, for rest of the operation that has VERB /post/<ID>
router.param('post', function(req, res, next, id){ //this gets the params in the http request for all post
  var query = Post.findById(id);

  query.exec(function(err, post){
    if (err) {return next(err);}
    if(!post) { return next(new Error('cant find that post!')); }

    //now save it as part of the request, so other routing that has 'post' in the
    //parameter can find the approp post (got from the DB)
    req.post = post;
    return next(); //lets it call other routes
  });
});

//0. b. Generic param function for comment by ID
router.param('comment', function(req, res, next, id){ //gets the params in the http request for all comment by id
  var query = Comment.findById(id);

  query.exec(function(err, comment){
    if (err) {return next(err);}
    if(!comment) { return next(new Error('cant find that comment!')); }

    //now save it as part of the request, so other routing that has 'post' in the
    //parameter can find the approp post (got from the DB)
    req.comment = comment;
    return next(); //this will let it call the other routes
  });
});

//0. c. Routing for registering a user
router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }
  var user = new User();
  user.username = req.body.username;
  user.setPassword(req.body.password)
  user.save(function (err){
    if(err){ return next(err); }
    return res.json({token: user.generateJWT()})
  });
});

//0. d. Routing for logging in a user
router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }
  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }
    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

//GET ALL POSTS
//1. User needs to see a list of posts = GET /posts
//Test: curl http://localhost:3000/posts
router.get('/posts', function(req, res, next){
  Post.find(function(err, posts) {
    if (err) {return next(err);}

    res.json(posts);
  });
});

//CREATE A POST
//2. The user needs to be able to create a post = POST /posts
//Test: curl --data 'title=test&link=http://test.com' http://localhost:3000/posts
router.post('/posts', auth, function(req, res, next){
  var post = new Post(req.body);
  //Save into mongoDB
  post.save(function(err, post){
    if (err) {return next(err);}

    res.json(post);
  });
});

//GET POST BY ID - GET INDIVIDUAL POSTS
//3. User needs to be able to get each post = GET /posts/:id <- will include comments associated by REF
//Test: curl http://localhost:3000/posts/<ID>
router.get('/posts/:post', function(req, res) {
  req.post.populate('comments', function(err, post) { //this will list the comments associated too
    if (err) { return next(err); }

    res.json(post);
  });});

//UPVOTE A POST
//4. The user needs to be able to upvote a post = PUT /post/:id
//Test: curl -X PUT http://localhost:3000/posts/<POST ID>/upvote
router.put('/posts/:post/upvote', auth, function(req, res, next){
  req.post.upvote(function(err, post){
    if(err) {return next(err);}

    res.json(post);
  });
});

//POST A COMMENT
//5. The user needs to be able to post a comment = POST /posts/:id/comments
//Test: curl --data 'body=blahblah&author=joe' http://localhost:3000/posts/<ID>/comments
router.post('/posts/:post/comments', auth, function(req, res, next){
  //Need to save it to db
  var comment = new Comment(req.body);
  comment.post = req.post; //We have this thanks to the preprocessing param function
  comment.author = req.payload.username; //Now, we can actually add username to everything

  comment.save(function(err, comment){
    if(err) { return next(err); }

    //Else, go ahead and save the comment to the post too
    req.post.comments.push(comment);
    req.post.save(function(err, post){
      if(err) { return next(err); }

      res.json(comment);
    });
  });

});

//UPVOTE A COMMENT
//6. User needs to be able to upvote a comment = PUT /posts/:id/comments/:comment
//Test: curl -X PUT http://localhost:3000/posts/<POST-ID>/comments/<COMMENT-ID>/upvote
router.put('/posts/:post/comments/:comment/upvote', auth, function(req, res, next){
  req.comment.upvote(function(err, comment){
    if(err) {return next(err);}

    res.json(comment);
  });
});

//DISPLAY A COMMENT
//Not really necessary, but to display just one comment
router.get('/posts/:post/comments/:comment', function(req, res){

  res.json(req.comment);
});

module.exports = router;
