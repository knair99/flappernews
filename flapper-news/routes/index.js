var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

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


//1. User needs to see a list of posts = GET /posts
//Test: curl http://localhost:3000/posts
router.get('/posts', function(req, res, next){
  Post.find(function(err, posts) {
    if (err) {return next(err);}

    res.json(posts);
  });
});

//2. The user needs to be able to post a post = POST /posts
//Test: curl --data 'title=test&link=http://test.com' http://localhost:3000/posts
router.post('/posts', function(req, res, next){
  var post = new Post(req.body);
  //Save into mongoDB
  post.save(function(err, post){
    if (err) {return next(err);}

    res.json(post);
  });
});


//3. User needs to be able to get each post = GET /posts/:id <- will include comments associated by REF
//Test: curl http://localhost:3000/posts/<ID>
router.get('/posts/:post', function(req, res) {
  res.json(req.post);
});

//4. The user needs to be able to upvote a post = PUT /post/:id
//Test: curl -X PUT http://localhost:3000/posts/<POST ID>/upvote
router.put('/posts/:post/upvote', function(req, res, next){
  req.post.upvote(function(err, post){
    if(err) {return next(err);}

    res.json(post);
  });
});

//5. The user needs to be able to post a comment = POST /posts/:id/comments
//Test: curl --data 'body=blahblah&author=joe' http://localhost:3000/posts/<ID>/comments
router.post('/posts/:post/comments', function(req, res, next){
  //Need to save it to db
  var comment = new Comment(req.body);
  comment.post = req.post; //We have this thanks to the preprocessing param function

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

//6. User needs to be able to upvote a comment = PUT /posts/:id/comments/:comment
//Test: curl -X PUT http://localhost:3000/posts/<POST-ID>/comments/<COMMENT-ID>/upvote
router.put('/posts/:post/comments/:comment/upvote', function(req, res, next){
  req.comment.upvote(function(err, comment){
    if(err) {return next(err);}

    res.json(comment);
  });
});

//Not really necessary, but to display just one comment
router.get('/posts/:post/comments/:comment', function(req, res){

  res.json(req.comment);
});

module.exports = router;
