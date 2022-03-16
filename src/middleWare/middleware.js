const jwt = require("jsonwebtoken");

const middleware = async function (req, res) {
    //Authorization..
    let authorId=req.body.authorId;
    if(!authorId){
        return authorId=req.query.authorId;
    }
    let tokenData = req.headers["x-auth-token"];
    if (!tokenData) {
        res.status(400).send({ msg: "No token Data" });
    }

    let verifyUser = jwt.verify(tokenData, "secretKeyforAuthor")
    res.send(verifyUser)   //--> Userid of the author
    if (!verifyUser) {
        res.status(400).send({ status: false, msg: "Invalid Token" })
    }
    if(authorId===verifyUser.userId){
    next()
    }else{
        return res.status(400).send({status:false,msg:"Invalid author"})
    }
}

module.exports.middleware = middleware