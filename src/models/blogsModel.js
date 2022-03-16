const mongoose = require('mongoose');
const { stringify } = require('nodemon/lib/utils');

const ObjectId= mongoose.Schema.Types.ObjectId


const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    authorId: { 
        type:ObjectId,
        ref:"projectAuthor" 
    },
    tags: [{type:String}],
    category:[{type:String}],
    subcategory: [{type:String}],
    isDeleted: { type:Boolean, default: false }, 
    isPublished: { type:Boolean, default: false }
},{ timestamps: true });

module.exports = mongoose.model('projectBlog', blogSchema)
