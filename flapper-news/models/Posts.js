/**
 * Created by kprasad on 2/27/16.
 */
var mongoose = require('mongoose');


var PostSchema = new mongoose.Schema({
    title: String,
    link: String,
    upvotes: {type: Number, default: 0},
    //and cross reference with comments Schema
    comments: [{type: mongoose.Schema.Types.ObjectId, ref:'Comments'}]
});

mongoose.model('Posts', PostSchema);