const validator = require("email-validator");
const { findOne } = require("../models/authorModel");
const authorModel = require("../models/authorModel");
const blogModel = require("../models/blogsModel");
const jwt = require("jsonwebtoken");
const moment = require("moment")
var date= Date.now()
// console.log(validator.validate(".dgsg@gmail.com"))

const createAuthor = async function (req, res) {
    try {
        let data = req.body;
        let email = data.email;
        // let email1= email.trim();
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
            res.status(400).send("AUthorId is Mandatory")
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
        let body = req.query;
        body.isDeleted = false;
        body.isPublished = true;
        let result = await blogModel.find(body);
        if (!result) {
            res.status(404).send("Error---> no Document Found");
            return;   // without this return, change in query params will cause error-->Cannot set headers after they are sent to the client
        }
        res.status(200).send({ data: result })
    } catch (err) {
        res.status(500).send(err)
    }
}



const updateBlog = async function (req, res) {
    try {
        if (req.validate.userId != req.query.authorId) {
            return res.status(401).send({ status: false, msg: "User not Authorized"});
        }
        let blogId = req.params.blogId;
        let data = req.body;
        if (!blogId) {
            res.status(400).send({ msg: "BlogId is Mandatory" });
            return
        }
        if (data.isDeleted) {
            res.status(400).send({ status: false, msg: "blog is Deleted" });
            return
        }
        let updateBlog = await blogModel.findById(blogId);
        if (!updateBlog) {
            return res.status(404).send({ status: false, msg: "No Documnet found" });
        }
        if (updateBlog.isDeleted == true) {
            return res.send({ msg: "This blog is deleted" });
        }
        if (data) {
            if (data.title) {
                updateBlog.title = data.title;
            }
            if(data.body){
                updateBlog.body=data.body;
            }
            if(data.tags){
                updateBlog.tags.push(data.tags);
            }
            if(data.subcategory){
                updateBlog.subcategory.push(data.subcategory);
            }
            updateBlog.save()
        }else{
            return res.send({status:false,msg:"Please provide data to update"})
        }
        res.send({data:updateBlog})

    } catch (err) {

        res.status(400).send(err)
    }
}
const deleteBlog = async function (req, res) {
    try {
        let blogId = req.params.blogId
        //validate
        if (req.validate.userId != req.query.authorId) {
            return res.status(401).send({ status: false, msg: "User not Authorized"});
        }
        if (!blogId) {
            return res.status(400).send({ status: false, msg: "blogId required" });
        }
        let blogIdValidation = await blogModel.findById(blogId);
        if (!blogIdValidation) {
            return res.status(404).send({ status: false, msg: "blogId not valid" });
        }
        if (blogIdValidation.isDeleted) {
            return res.status(400).send({ status: false, msg: "Blog is already Deleted" });
        }
        let deletedBlog = await blogModel.findByIdAndUpdate(blogId, { $set: { isDeleted: true, deleteAt: date } }, { new: true })
        return res.status(201).send({ status: true, msg: deletedBlog })
    }
    catch (err) {

        res.status(500).send({ status: false, msg: err.message })
    }
}
const queryParamsDelete = async function (req, res) {
    try {
        let conditions ={isPublished:false};
        let data=req.query;
        if(data.authorId){
            conditions.authorId=data.authorId;
        }
        if(data.category){
            conditions.category=data.category;
        }
        if(data.tags){
            conditions.tags=data.tags;
        }
        if(data.subcategory){
            conditions.subcategory=data.subcategory;
        }
        if (!conditions) {
            return res.status(404).send({ status: false, msg: "Query is Mandatory to delete Blog" })
        }
        let dataToDelete = await blogModel.find(conditions) //.updateMany({ $set: { isDeleted: true } }, { new: true });
        if (!dataToDelete) {
            return res.status(404).send({ status: false, msg: "No such Blog Found" })
        }
        dataToDelete.isDeleted=true;
        dataToDelete.save();
        res.status(201).send({ data: dataToDelete })

    }

    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}
// Author Login

const login = async function (req, res) {
    let data = req.body;
    let emailId = data.email;
    let password = data.password;
    let result = await authorModel.findOne({ email: emailId, password: password })
    if (!result) {
        return res.status(404).send({ status: false, msg: "Invalid User Credentials,please Check..!!" })
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
module.exports.getFilteredBlogs = getFilteredBlogs;
module.exports.updateBlog = updateBlog;
module.exports.deleteBlog = deleteBlog;
module.exports.queryParamsDelete = queryParamsDelete;
module.exports.login = login;
