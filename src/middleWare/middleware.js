const jwt = require("jsonwebtoken");

const middleware = async function (req, res, next) {
    //Authorization..
    try {
        let authorId = req.params.authorId;
        if (!authorId) {
            return authorId = req.query.authorId;
        }
        let tokenData = req.headers["x-auth-token"];
        if (!tokenData) {
            res.status(400).send({ msg: "No token Data" });
        }

        let verifyUser = jwt.verify(tokenData, "secretKeyforAuthor")
        res.send(verifyUser)   //--> Userid of the author
        if (verifyUser) {
            req.validate = verifyUser;
            next()
        }
        else {
            return res.status(400).send({ status: false, msg: "Invalid token" })
        }
    }catch(err){
        res.statsu(500).send({status:false,msg:"Error Found"})
    }
}

module.exports.middleware = middleware