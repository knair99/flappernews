/**
 * Created by kprasad on 2/27/16.
 */
/**
 * Created by kprasad on 2/27/16.
 */
var mongoose = require('mongoose');


var CommentSchema = new mongoose.Schema({
    body: String,
    author: String,
    upvotes: {type: Number, default: 0},
    //and cross reference with comments Schema
    post: [{type: mongoose.Schema.Types.ObjectId, ref:'Posts'}]
});

mongoose.model('Comments', CommentSchema);