/**
 * Created by kprasad on 2/27/16.
 */
var mongoose = require('mongoose');


var PostSchema = new mongoose.Schema({
    title: String,
    link: String,
    upvotes: {type: Number, default: 0},
    //and cross reference with comments Schema
    comments: [{type: mongoose.Schema.Types.ObjectId, ref:'Comment'}]
});

//Upvote function for the post schema
//If a user wants to put in an upvote via a PUT request
//the call back is to get back the errors
PostSchema.methods.upvote = function (cb){
    this.upvotes += 1;
    this.save(cb);
};

mongoose.model('Post', PostSchema);