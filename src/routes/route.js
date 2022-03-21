const express = require('express');
const router = express.Router();
const mainController= require("../controller/mainController.js");
const { middleware } = require('../middleWare/middleware.js');

router.post("/authors",mainController.createAuthor);
router.post("/login",mainController.login);


router.post("/blogs",middleware,mainController.createBlog); 
router.get("/getblog",middleware,mainController.getFilteredBlogs);
router.put("/updateBlog/:blogId",middleware,mainController.updateBlog);
router.delete("/deleteblogs/:blogId",middleware,mainController.deleteBlog);
router.delete("/deleteblogsbyquery",middleware, mainController.queryParamsDelete); /// all apis working fine

module.exports=router;
