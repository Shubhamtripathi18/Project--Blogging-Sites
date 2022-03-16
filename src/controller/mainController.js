const validator = require("email-validator");
const { findOne } = require("../models/authorModel");
const authorModel = require("../models/authorModel");
const blogModel = require("../models/blogsModel");
const jwt = require("jsonwebtoken");
const moment= require("moment")
let date = moment()

// console.log(validator.validate(".dgsg@gmail.com"))

const createAuthor = async function (req, res) {
    try {
        let data = req.body;
        let email = data.email;

        let validateEmail = validator.validate(email);
        if (validateEmail) {
            let result = await authorModel.create(data);
            res.status(200).send({ data: result })

        } else {
            res.status(400).send("Invalid Email")
        }
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
}

const createBlog = async function (req, res) {
    try {
        let body = req.body;
        let authorId = body.authorId;
        let findId = await authorModel.findById(authorId);
        if (!authorId) {
            res.status(4000).send("AUthorId is Mandatory")
        }
        if (!findId) {
            res.status(400).send({ msg: "Author ID is invalid" })
        }

        let result = await blogModel.create(body);
        res.status(201).send({ data: result })

    }
    catch (err) {
        res.status(500).send(err)
    }
}

const getFilteredBlogs = async function (req, res) {
    try {
        let conditions = {
            isDeleted: false,
            isPublished: true,
        
         authorId:req.query.authorId,
         category: req.query.category,
         tags: req.query.tags,
         subcategory:req.query.subcategory
        }
        let result = await blogModel.find(conditions)
        if (result.length == 0) {
            res.status(404).send("Error---> no Document Found");
            return;   // without this return, change in query params will cause error-->Cannot set headers after they are sent to the client
        }
        res.status(200).send({ data: result })
    } catch (err) {
        res.status(400).send(err)
    }
}



const updateBlog = async function (req, res) {
    try {
        let blogId = req.params.blogId;
        let data = req.body;
        let updatetitle=data.title;
        let updatebody= data.body;
        let updatetags=data.tags;
        let updatesubcategory=data.subcategory;
        // let date= Date.now();
        if(!blogId){
            res.status(400).send({msg:"BlogId is Mandatory"});
            return
        }
        // let aggField= await blogModel.aggregate({$addFields:{publishedAt:date}})
        if(data.isDeleted){
            res.status(400).send({status:false,msg:"blog is Deleted"});
            return
        }
        let updateBlog= await blogModel.findByIdAndUpdate(blogId,{title:updatetitle,body:updatebody,isPublished:true,$push:{tags:[updatetags],subcategory:[updatesubcategory]}})
        res.status(201).send({data:updateBlog})

    } catch (err) {

        res.status(400).send(err)
    }
}
const deleteBlog = async function (req, res) {
    try {
        //validate
        let blogId = req.params.blogId
        if (!blogId) {
            return res.status(400).send({ status: false, msg: "blogId required" });
        }
        let blogIdValidation = await blogModel.findById(blogId);
        if (!blogIdValidation) {
            return res.status(404).send({ status: false, msg: "blogId not valid" });
        }
        if(blogIdValidation.isDeleted){
            return res.status(400).send({status:false,msg:"Blog is already Deleted"});
        }
        let deletedBlog = await blogModel.findByIdAndUpdate(blogId, { $set: { isDeleted:true, deleteAt: date } }, { new: true })
        return res.status(201).send({ status: true, msg: deletedBlog })
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}
const queryParamsDelete = async function (req, res) {
    try {
        let conditions={
            authorId:req.query.authorId,
            category:req.query.category,
            subcategory:req.query.subcategory,
            isPublished:true
        }
        if(!conditions){
            return res.status(400).send({status:false,msg:"Query is Mandatory to delete Blog"})
        }
        let dataToDelete= await blogModel.find(conditions).updateMany({$set:{isDeleted:true}},{new:true});
        if(!dataToDelete){
            return res.status(404).send({status:false,msg:"No such Blog Found"})
        }
        res.status(201).send({data:dataToDelete})

    }

    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}
// Author Login

const login = async function  (req, res) {
    let data = req.body;
    let emailId = data.email;
    let password = data.password;
    let result = await authorModel.findOne({ email: emailId, password: password })
    if (!result) {
        return res.send({ status: false, msg: "Invalid User Credentials,please Check..!!" })
    }
    // res.send(result)
    let payload = { userId: result._id };
    let token = jwt.sign(payload, "secretKeyforAuthor");
    res.setHeader("x-auth-token", token);
    res.send({ status: true, msg: "User Successfully LoggedIn", tokenData: token })
}



// module.exports.getBlogs = getBlogs;
module.exports.createBlog = createBlog;
module.exports.createAuthor = createAuthor;
module.exports. getFilteredBlogs =  getFilteredBlogs;
module.exports.updateBlog = updateBlog;
module.exports.deleteBlog = deleteBlog;
module.exports.queryParamsDelete = queryParamsDelete;
module.exports.login = login;
